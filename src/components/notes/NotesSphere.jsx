import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Landmark, Scroll, TrendingUp, Globe, Cpu, ShieldAlert, Scale, 
  Search, Plus, Sparkles, X, FileText, Download, Copy, Check, ArrowLeft, Trash2, Zap, Clock, Award, Star, Bookmark
} from 'lucide-react';
import { getUPSCNotes, addUPSCNote, deleteUPSCNote, UPSC_SUBJECTS } from '../../services/notes_service';

export function NotesSphere({ userRole, onBackToDashboard, onGenerateQuizFromNotes }) {
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note Reader Modal State
  const [activeNote, setActiveNote] = useState(null);
  const [copiedNote, setCopiedNote] = useState(false);

  // Admin Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('polity');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [authorName, setAuthorName] = useState('Anish Manhotra (UPSC Panel)');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const list = getUPSCNotes();
    setNotes(list);
  };

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please fill out the note title and content.');
      return;
    }

    addUPSCNote({
      title: newTitle.trim(),
      subject: newSubject,
      summary: newSummary.trim(),
      content: newContent.trim(),
      author: authorName.trim()
    });

    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setShowUploadModal(false);
    loadNotes();
  };

  const handleDeleteNote = (e, noteId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this UPSC note?')) {
      const updated = deleteUPSCNote(noteId);
      setNotes(updated);
      if (activeNote && activeNote.id === noteId) setActiveNote(null);
    }
  };

  const handleCopyNote = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleDownloadNote = (note) => {
    const element = document.createElement('a');
    const file = new Blob([`${note.title}\n\nSubject: ${note.subjectLabel}\nGS Paper: ${note.paperTag}\nAuthor: ${note.author}\nDate: ${note.date}\n\n${note.content}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSubjectNoteCount = (subjectId) => {
    if (subjectId === 'all') return notes.length;
    return notes.filter(n => n.subject === subjectId).length;
  };

  const filteredNotes = notes.filter(note => {
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    const matchesSearch = searchQuery.trim() === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const renderSubjectIcon = (iconName) => {
    switch (iconName) {
      case 'Landmark': return <Landmark size={18} />;
      case 'Scroll': return <Scroll size={18} />;
      case 'TrendingUp': return <TrendingUp size={18} />;
      case 'Globe': return <Globe size={18} />;
      case 'Cpu': return <Cpu size={18} />;
      case 'ShieldAlert': return <ShieldAlert size={18} />;
      case 'Scale': return <Scale size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out', paddingBottom: '4rem' }}>
      
      {/* Back Button */}
      <button 
        className="btn btn-secondary" 
        onClick={onBackToDashboard}
        style={{ marginBottom: '1.25rem', fontSize: '0.88rem' }}
      >
        <ArrowLeft size={16} /> Back to Portal
      </button>

      {/* Imperial UPSC Hero Banner */}
      <div className="upsc-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.75rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.3))',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '0.4rem 1.1rem',
              borderRadius: '24px',
              fontSize: '0.86rem',
              color: '#fbbf24',
              fontWeight: 800,
              marginBottom: '1.1rem',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)'
            }}>
              <Sparkles size={16} color="#f59e0b" />
              IMPERIAL UPSC CSE REVISION VAULT 🏛️
            </div>
            
            <h1 style={{ fontSize: '2.6rem', lineHeight: '1.2', marginBottom: '0.75rem', fontWeight: 800 }}>
              UPSC CSE <span style={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>General Studies Notes</span>
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px', lineHeight: '1.65' }}>
              Academic revision notes categorized by GS Papers I, II, III & IV. High-yield concept outlines, constitutional analysis, and syllabus takeaways.
            </p>
          </div>

          {/* Admin Upload Notes Button */}
          {userRole === 'admin' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
              style={{
                padding: '0.95rem 1.85rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #d97706, #7c3aed)',
                border: 'none',
                boxShadow: '0 0 30px rgba(217, 119, 6, 0.45)'
              }}
            >
              <Plus size={18} />
              Upload New UPSC Note
            </button>
          )}
        </div>

        {/* Academic Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginTop: '2.25rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(245, 158, 11, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{notes.length} Topics</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Structured Study Modules</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>GS Papers I-IV</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete Syllabus Mapping</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Star size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>High-Yield</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prelims + Mains Focus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter Bar & Search */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.25rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#f59e0b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="custom-input"
              style={{ paddingLeft: '2.8rem', height: '46px', width: '100%', fontSize: '0.95rem', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              placeholder="Search UPSC topics (e.g. Fundamental Rights, Bhakti Movement, MPC, Monsoon, CRISPR)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Imperial Subject Filter Pills Slider */}
          <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '6px' }}>
            {UPSC_SUBJECTS.map(sub => {
              const isActive = selectedSubject === sub.id;
              const count = getSubjectNoteCount(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: '22px',
                    border: '1px solid ' + (isActive ? '#f59e0b' : 'var(--border-light)'),
                    background: isActive ? sub.gradient : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'var(--transition-fast)',
                    boxShadow: isActive ? '0 4px 18px rgba(245, 158, 11, 0.35)' : 'none'
                  }}
                >
                  {renderSubjectIcon(sub.icon)}
                  <span>{sub.label}</span>
                  <span style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(245, 158, 11, 0.15)',
                    color: isActive ? '#ffffff' : '#f59e0b',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Notes Cards Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <BookOpen size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <h3>No Notes Found in Vault</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            No study notes match your search. {userRole === 'admin' ? 'Click "Upload New UPSC Note" above to add notes.' : ''}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {filteredNotes.map(note => {
            const subInfo = UPSC_SUBJECTS.find(s => s.id === note.subject) || {};
            const readMins = Math.max(2, Math.ceil(note.content.split(' ').length / 150));

            return (
              <div 
                key={note.id} 
                className="upsc-note-card"
                onClick={() => setActiveNote(note)}
                style={{ 
                  background: subInfo.badgeBg ? `linear-gradient(180deg, ${subInfo.badgeBg} 0%, var(--bg-card) 60%)` : undefined,
                  borderTop: `4px solid ${subInfo.badgeColor || '#f59e0b'}` 
                }}
              >
                <div>
                  {/* GS Paper Bookmark & High-Yield Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="gs-paper-bookmark">
                      <Bookmark size={13} /> {note.paperTag || subInfo.paperTag || 'GS Paper'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="high-yield-badge">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" /> High-Yield
                      </span>

                      {userRole === 'admin' && (
                        <button
                          onClick={(e) => handleDeleteNote(e, note.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0.2rem' }}
                          title="Delete Note"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', lineHeight: '1.35', marginBottom: '0.75rem', fontWeight: 700 }}>
                    {note.title}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.65', marginBottom: '1.35rem' }}>
                    {note.summary}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.82rem' }}>
                    <span className="reading-time-pill">
                      <Clock size={13} /> {readMins} min read
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>✍️ {note.author}</span>
                  </div>

                  <button 
                    className="btn btn-secondary" 
                    style={{ 
                      width: '100%', 
                      padding: '0.65rem', 
                      fontSize: '0.9rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.45rem',
                      borderColor: 'rgba(245, 158, 11, 0.4)' 
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>Read Notes</span>
                    <ArrowLeft size={16} color="#f59e0b" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reader Modal View */}
      {activeNote && (
        <div className="modal-backdrop" onClick={() => setActiveNote(null)}>
          <div className="modal-card" style={{ maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setActiveNote(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>

            {/* Note Reader Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="gs-paper-bookmark">
                  <Bookmark size={13} /> {activeNote.paperTag || 'GS Paper'}
                </span>
                <span className="high-yield-badge">
                  <Star size={12} fill="#f59e0b" color="#f59e0b" /> High-Yield Topic
                </span>
              </div>

              <h2 style={{ fontSize: '2rem', lineHeight: '1.3', marginBottom: '0.65rem' }}>
                {activeNote.title}
              </h2>

              <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <span>✍️ {activeNote.author}</span>
                <span>📅 {activeNote.date}</span>
                <span>⏱️ {Math.max(2, Math.ceil(activeNote.content.split(' ').length / 150))} min read</span>
              </div>
            </div>

            {/* High-Yield Takeaway Callout Box */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '1.75rem'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Sparkles size={16} /> Key Syllabus Summary Takeaways:
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                {activeNote.summary}
              </p>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleCopyNote(activeNote.content)}
                style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}
              >
                {copiedNote ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
                {copiedNote ? 'Copied to Clipboard!' : 'Copy Notes Text'}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => handleDownloadNote(activeNote)}
                style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}
              >
                <Download size={16} />
                Download TXT File
              </button>

              {userRole === 'admin' && onGenerateQuizFromNotes && (
                <button
                  className="btn btn-emerald"
                  onClick={() => {
                    setActiveNote(null);
                    onGenerateQuizFromNotes(activeNote);
                  }}
                  style={{ fontSize: '0.88rem', padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #d97706, #10b981)', border: 'none' }}
                >
                  <Zap size={16} />
                  Generate Quiz from Notes
                </button>
              )}
            </div>

            {/* Formatted Content Area */}
            <div className="glass-panel" style={{ padding: '2.25rem', background: 'rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
                {activeNote.content}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin Upload Notes Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            
            <button 
              onClick={() => setShowUploadModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <FileText size={24} color="#f59e0b" />
              <h3>Upload & Publish UPSC Study Note</h3>
            </div>

            <form onSubmit={handleCreateNote}>
              <div className="input-group">
                <label className="input-label">Note Title / Topic</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Fundamental Duties (Art 51A) & Swaran Singh Committee"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">UPSC Subject Category</label>
                  <select
                    className="custom-select"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
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
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Full Detailed Notes Content (Markdown Supported)</label>
                <textarea
                  className="custom-textarea"
                  style={{ height: '180px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  placeholder="Enter detailed headings, bullet points, constitutional articles, or concepts..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
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

    </div>
  );
}
