import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Layers, ShieldCheck, Wifi, Copy, Check, Users, User, Mail, Calendar, Award, BookOpen, FileText, Trash2, X, Newspaper } from 'lucide-react';
import { DocumentUploader } from './DocumentUploader';
import { QuizConfigModal } from './QuizConfigModal';
import { QuizPreviewEditor } from './QuizPreviewEditor';
import { ActiveQuizCard } from './ActiveQuizCard';
import { generateQuizWithGemini, generateSmartFallbackQuiz } from '../../services/gemini_quiz_service';
import { createQuizInDB, fetchAdminQuizzes } from '../../services/supabase';
import { getRegisteredStudents, fetchLiveRegisteredStudents } from '../../services/student_service';
import { getUPSCNotes, addUPSCNote, deleteUPSCNote, UPSC_SUBJECTS } from '../../services/notes_service';
import { getCustomCurrentAffairs, addCustomCurrentAffairs, deleteCustomCurrentAffairs } from '../../services/current_affairs_service';

export function AdminDashboard({ onSelectQuizForLeaderboard }) {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkInfo, setNetworkInfo] = useState({ ip: 'localhost', studentUrl: 'http://localhost:5173' });
  const [copiedLink, setCopiedLink] = useState(false);

  // Notes Modal State
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('polity');
  const [newNoteSummary, setNewNoteSummary] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [authorName, setAuthorName] = useState('Admin Faculty (Anish Manhotra)');

  // Current Affairs Modal State
  const [showCAModal, setShowCAModal] = useState(false);
  const [caTitle, setCaTitle] = useState('');
  const [caCategory, setCaCategory] = useState('national');
  const [caSource, setCaSource] = useState('Admin Editorial / PIB');
  const [caSummary, setCaSummary] = useState('');
  const [caContent, setCaContent] = useState('');

  // Flow State
  const [extractedDocText, setExtractedDocText] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [aiGeneratedQuiz, setAiGeneratedQuiz] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const list = await fetchAdminQuizzes();
      setQuizzes(list || []);
    } catch (err) {
      console.error('Failed to load admin quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const liveList = await fetchLiveRegisteredStudents();
      setStudents(liveList || []);
    } catch (err) {
      setStudents(getRegisteredStudents());
    }
  };

  const loadNetworkInfo = async () => {
    try {
      const res = await fetch('/api/network-info');
      if (res.ok) {
        const data = await res.json();
        if (data.studentUrl) setNetworkInfo(data);
      }
    } catch (e) {
      // Fall back to window location
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        setNetworkInfo({
          ip: host,
          studentUrl: `http://${host}:5173`
        });
      }
    }
  };

  const loadNotes = () => {
    setNotes(getUPSCNotes());
  };

  const loadCA = () => {
    setCurrentAffairs(getCustomCurrentAffairs());
  };

  useEffect(() => {
    loadQuizzes();
    loadNetworkInfo();
    loadStudents();
    loadNotes();
    loadCA();

    // Auto-update student directory every 3 seconds when students log in from any device
    const studentPollInterval = setInterval(loadStudents, 3000);

    const handlePrefill = (e) => {
      if (e.detail && e.detail.text) {
        setExtractedDocText(e.detail.text);
        setDocFileName(e.detail.title || 'Extracted Document');
        setShowConfigModal(true);
      }
    };

    window.addEventListener('prefill_quiz_text', handlePrefill);
    return () => {
      clearInterval(studentPollInterval);
      window.removeEventListener('prefill_quiz_text', handlePrefill);
    };
  }, []);

  const handleCASubmit = (e) => {
    e.preventDefault();
    if (!caTitle.trim() || !caContent.trim()) {
      alert('Please enter current affairs title and article text.');
      return;
    }

    addCustomCurrentAffairs({
      title: caTitle.trim(),
      category: caCategory,
      source: caSource.trim(),
      summary: caSummary.trim(),
      content: caContent.trim()
    });

    setCaTitle('');
    setCaSummary('');
    setCaContent('');
    setShowCAModal(false);
    loadCA();
  };

  const handleDeleteCAFromAdmin = (id) => {
    if (window.confirm('Delete this current affairs article from student feed?')) {
      const updated = deleteCustomCurrentAffairs(id);
      setCurrentAffairs(updated);
    }
  };

  const handleCreateNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      alert('Please enter note title and content.');
      return;
    }

    addUPSCNote({
      title: newNoteTitle.trim(),
      subject: newNoteSubject,
      summary: newNoteSummary.trim(),
      content: newNoteContent.trim(),
      author: authorName.trim()
    });

    setNewNoteTitle('');
    setNewNoteSummary('');
    setNewNoteContent('');
    setShowNotesModal(false);
    loadNotes();
  };

  const handleDeleteNoteFromAdmin = (noteId) => {
    if (window.confirm('Delete this UPSC note from student dashboard?')) {
      const updated = deleteUPSCNote(noteId);
      setNotes(updated);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(networkInfo.studentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 1. Text extracted from document -> open config modal
  const handleTextExtracted = (text, fileName) => {
    setExtractedDocText(text);
    setDocFileName(fileName);
    setShowConfigModal(true);
  };

  // 2. Config confirmed -> trigger Gemini API call with smart fallback
  const handleConfigSubmit = async ({ title, numQuestions, difficulty, timeLimitMins }) => {
    setIsGenerating(true);
    try {
      let generated;
      try {
        generated = await generateQuizWithGemini({
          documentText: extractedDocText,
          numQuestions,
          difficulty,
          questionType: 'multiple_choice'
        });
      } catch (geminiErr) {
        console.warn('Gemini generation failed, using Smart Document fallback...', geminiErr);
        generated = generateSmartFallbackQuiz(extractedDocText, numQuestions, difficulty);
      }

      setAiGeneratedQuiz({
        ...generated,
        quiz_title: title || generated.quiz_title,
        time_limit_mins: timeLimitMins
      });

      setShowConfigModal(false);
      setShowPreviewModal(true);
    } catch (err) {
      alert('Error generating quiz from document: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Questions reviewed -> save & publish to database
  const handlePublishQuiz = async ({ title, questions }) => {
    setIsPublishing(true);
    try {
      await createQuizInDB({
        title,
        timeLimitMins: aiGeneratedQuiz.time_limit_mins || 5,
        questions
      });

      setShowPreviewModal(false);
      setExtractedDocText('');
      setAiGeneratedQuiz(null);
      await loadQuizzes();
    } catch (err) {
      alert('Failed to publish quiz: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-indigo)', fontWeight: 600, fontSize: '0.9rem' }}>
            <ShieldCheck size={18} />
            ADMIN CONTROL CENTER
          </div>
          <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Course Quiz Management</h1>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setExtractedDocText('Sample Course Material: Artificial Intelligence, Machine Learning, Neural Networks, Deep Learning, and Natural Language Processing concepts and principles.');
            setDocFileName('Manual_Quiz_Creation.txt');
            setShowConfigModal(true);
          }}
        >
          <Plus size={18} />
          Create Quick Quiz
        </button>
      </div>

      {/* Network Access Sharing Banner */}
      <div className="glass-panel" style={{ 
        padding: '1rem 1.5rem', 
        marginBottom: '2rem', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--primary-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Wifi size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Student Network Live Access
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Share this address with students on your Wi-Fi/local network: <strong style={{ color: 'var(--primary-violet)' }}>{networkInfo.studentUrl}</strong>
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={handleCopyLink} style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}>
          {copiedLink ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
          {copiedLink ? 'Copied Link!' : 'Copy Student Link'}
        </button>
      </div>

      {/* Document Drag-and-Drop Uploader */}
      <DocumentUploader onTextExtracted={handleTextExtracted} />

      {/* Admin UPSC Notes Publishing Center */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <BookOpen color="#f59e0b" size={22} />
            <h2>Admin Published UPSC Notes ({notes.length})</h2>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowNotesModal(true)}
            style={{
              background: 'linear-gradient(135deg, #d97706, #7c3aed)',
              border: 'none',
              padding: '0.65rem 1.25rem',
              fontSize: '0.92rem',
              boxShadow: '0 0 20px rgba(217, 119, 6, 0.35)'
            }}
          >
            <Plus size={16} />
            Upload & Publish UPSC Note
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No notes published yet. Click "Upload & Publish UPSC Note" above to publish your first note!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {notes.map(note => {
                const subObj = UPSC_SUBJECTS.find(s => s.id === note.subject) || {};
                return (
                  <div key={note.id} className="glass-panel" style={{ padding: '1.25rem', borderTop: `3px solid ${subObj.badgeColor || '#f59e0b'}`, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: subObj.badgeColor || '#f59e0b', fontWeight: 800 }}>
                        {note.paperTag || subObj.paperTag || 'GS Paper'} • {note.subjectLabel}
                      </span>
                      <button
                        onClick={() => handleDeleteNoteFromAdmin(note.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                        title="Delete Note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{note.title}</h4>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.85rem' }}>{note.summary}</p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>✍️ {note.author}</span>
                      <span>📅 {note.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Admin Current Affairs Publishing Center */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Newspaper color="var(--accent-cyan)" size={22} />
            <h2>Admin Published Current Affairs ({currentAffairs.length})</h2>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowCAModal(true)}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              border: 'none',
              padding: '0.65rem 1.25rem',
              fontSize: '0.92rem',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Plus size={16} />
            Upload & Publish Current Affairs Article
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
          {currentAffairs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No current affairs articles published yet. Click "Upload & Publish Current Affairs Article" above!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {currentAffairs.map(item => (
                <div key={item.id} className="glass-panel" style={{ padding: '1.25rem', borderTop: '3px solid var(--accent-cyan)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>
                      📰 {item.categoryName || 'General News'}
                    </span>
                    <button
                      onClick={() => handleDeleteCAFromAdmin(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                      title="Delete Article"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.85rem' }}>{item.summary}</p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📰 {item.source}</span>
                    <span>📅 {item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Quizzes Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Layers color="var(--primary-violet)" size={22} />
          <h2>Active Classroom Quizzes ({quizzes.length})</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading active quizzes...
          </div>
        ) : quizzes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Sparkles size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
            <h3>No Active Quizzes Created Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Upload a document above or click "Create Quick Quiz" to generate your first quiz.
            </p>
          </div>
        ) : (
          <div className="active-quizzes-grid">
            {quizzes.map(quiz => (
              <ActiveQuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onViewLeaderboard={onSelectQuizForLeaderboard} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Registered Students Management Directory */}
      <div style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Users color="var(--primary-violet)" size={22} />
            <h2>Live Registered Students Directory ({students.length})</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', padding: '0.35rem 0.85rem', borderRadius: '16px', fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            Real-Time Auto Sync Active
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          {students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No students registered yet. Student profiles automatically appear here live when anyone logs in from any device!
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Email Address</th>
                  <th>Login Device / Platform</th>
                  <th>Joined Date</th>
                  <th>Quiz Attempts</th>
                  <th>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {students.map(std => (
                  <tr key={std.id}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'var(--primary-indigo)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          color: '#ffffff',
                          fontWeight: 800
                        }}>
                          {std.name.charAt(0).toUpperCase()}
                        </div>
                        {std.name}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-violet)', fontWeight: 600 }}>
                        {std.id}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{std.email}</td>
                    <td>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--primary-violet)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        {std.device ? std.device : 'Web Client'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{std.joinedDate}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{std.attemptsCount || 0}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: (std.avgScore || 0) >= 80 ? 'var(--accent-emerald)' : 'var(--text-main)', fontFamily: 'monospace' }}>
                        {std.avgScore || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Configuration */}
      {showConfigModal && (
        <QuizConfigModal
          defaultTitle={docFileName ? `Quiz: ${docFileName.replace(/\.[^/.]+$/, '')}` : ''}
          onGenerate={handleConfigSubmit}
          onClose={() => setShowConfigModal(false)}
          isGenerating={isGenerating}
        />
      )}

      {/* Modal 2: Preview & Question Editor */}
      {showPreviewModal && aiGeneratedQuiz && (
        <QuizPreviewEditor
          initialQuiz={aiGeneratedQuiz}
          onPublish={handlePublishQuiz}
          onClose={() => setShowPreviewModal(false)}
          isPublishing={isPublishing}
        />
      )}

      {/* Modal 3: Upload & Publish UPSC Study Note */}
      {showNotesModal && (
        <div className="modal-backdrop" onClick={() => setShowNotesModal(false)}>
          <div className="modal-card" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            
            <button 
              onClick={() => setShowNotesModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <FileText size={24} color="#f59e0b" />
              <h3>Upload & Publish UPSC Study Note</h3>
            </div>

            <form onSubmit={handleCreateNoteSubmit}>
              <div className="input-group">
                <label className="input-label">Note Title / Topic</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Fundamental Duties (Art 51A) & Swaran Singh Committee"
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">UPSC Subject Category</label>
                  <select
                    className="custom-select"
                    value={newNoteSubject}
                    onChange={e => setNewNoteSubject(e.target.value)}
                  >
                    {UPSC_SUBJECTS.filter(s => s.id !== 'all').map(s => (
                      <option key={s.id} value={s.id}>{s.label} ({s.paperTag})</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Author / Faculty Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Short Summary (1-2 sentences)</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Brief overview of key concepts covered..."
                  value={newNoteSummary}
                  onChange={e => setNewNoteSummary(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Full Detailed Notes Content (Markdown Supported)</label>
                <textarea
                  className="custom-textarea"
                  style={{ height: '180px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  placeholder="Enter detailed headings, bullet points, constitutional articles, or concepts..."
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNotesModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #d97706, #7c3aed)', border: 'none' }}>
                  Publish Note to Students 🚀
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 4: Upload & Publish Current Affairs Article */}
      {showCAModal && (
        <div className="modal-backdrop" onClick={() => setShowCAModal(false)}>
          <div className="modal-card" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            
            <button 
              onClick={() => setShowCAModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Newspaper size={24} color="var(--accent-cyan)" />
              <h3>Upload & Publish Daily Current Affairs</h3>
            </div>

            <form onSubmit={handleCASubmit}>
              <div className="input-group">
                <label className="input-label">Article Headline / Title</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. National Quantum Mission 2026 Guidelines Released"
                  value={caTitle}
                  onChange={e => setCaTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="custom-select"
                    value={caCategory}
                    onChange={e => setCaCategory(e.target.value)}
                  >
                    <option value="national">National Affairs</option>
                    <option value="international">International Relations</option>
                    <option value="economy">Economy & Business</option>
                    <option value="environment">Environment & Climate</option>
                    <option value="science">Science & Tech</option>
                    <option value="sports">Sports & Honors</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">News Source / Author</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={caSource}
                    onChange={e => setCaSource(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Short Summary (1-2 sentences)</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Key takeaways for quick revision..."
                  value={caSummary}
                  onChange={e => setCaSummary(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Full Article / Exam Analysis</label>
                <textarea
                  className="custom-textarea"
                  style={{ height: '180px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  placeholder="Detailed breakdown, background context, and exam relevance..."
                  value={caContent}
                  onChange={e => setCaContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCAModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none' }}>
                  Publish Article to Feed 📰
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
