import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Landmark, Scroll, TrendingUp, Globe, Cpu, ShieldAlert, Scale, 
  Search, Plus, Sparkles, X, FileText, Download, Copy, Check, ArrowLeft, Trash2, Zap, Clock, Award, Star, Bookmark, Upload
} from 'lucide-react';
import { 
  getUPSCNotes, addUPSCNote, deleteUPSCNote, UPSC_SUBJECTS,
  getNotesDocuments, addNotesDocument, deleteNotesDocument,
  fetchLiveUPSCNotes, fetchLiveNotesDocuments
} from '../../services/notes_service';
import { FormattedContentRenderer } from '../common/FormattedContentRenderer';

export function NotesSphere({ userRole, onBackToDashboard, onGenerateQuizFromNotes }) {
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note Reader Modal State
  const [activeNote, setActiveNote] = useState(null);
  const [copiedNote, setCopiedNote] = useState(false);

  // Admin Upload Note Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('polity');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [authorName, setAuthorName] = useState('Anish Manhotra (UPSC Panel)');

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docSubject, setDocSubject] = useState('all');
  const [docFileType, setDocFileType] = useState('pdf');
  const [docContentText, setDocContentText] = useState('');

  // Native File Picker State
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileData, setSelectedFileData] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');

  const loadNotes = async () => {
    const list = await fetchLiveUPSCNotes();
    setNotes(list || []);
  };

  const loadDocuments = async () => {
    const list = await fetchLiveNotesDocuments();
    setDocuments(list || []);
  };

  useEffect(() => {
    loadNotes();
    loadDocuments();

    // Auto refresh every 3 seconds for live multi-device note & document sync
    const pollInterval = setInterval(() => {
      loadNotes();
      loadDocuments();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please fill out the note title and content.');
      return;
    }

    await addUPSCNote({
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
    await loadNotes();
  };

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this UPSC note?')) {
      const updated = await deleteUPSCNote(noteId);
      setNotes(updated);
      if (activeNote && activeNote.id === noteId) setActiveNote(null);
    }
  };

  // Native File Picker Handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedFileName(file.name);

    // Format size
    const sizeMB = file.size / (1024 * 1024);
    const formattedSize = sizeMB >= 1 
      ? `${sizeMB.toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    setSelectedFileSize(formattedSize);

    // Auto extension
    const ext = file.name.split('.').pop().toLowerCase();
    setDocFileType(ext);

    // Auto title if empty
    if (!docTitle || docTitle.trim() === '') {
      const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
      setDocTitle(titleWithoutExt);
    }

    // Read Base64 Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFileData(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      alert('Please enter or select a document file.');
      return;
    }
    if (!selectedFile && !docContentText.trim()) {
      alert('Please select a document file from your device or enter notes content.');
      return;
    }

    await addNotesDocument({
      title: docTitle.trim(),
      subject: docSubject,
      fileType: docFileType || 'pdf',
      fileSize: selectedFileSize || '1.5 MB',
      fileData: selectedFileData || docContentText.trim(),
      fileName: selectedFileName || `${docTitle}.${docFileType || 'pdf'}`,
      uploadedBy: userRole === 'admin' ? 'UPSC Admin Faculty' : 'Faculty Panel'
    });

    setDocTitle('');
    setDocContentText('');
    setSelectedFile(null);
    setSelectedFileData('');
    setSelectedFileName('');
    setSelectedFileSize('');
    setShowDocUploadModal(false);
    await loadDocuments();
  };

  const handleDeleteDoc = async (e, docId) => {
    e.stopPropagation();
    if (window.confirm('Delete this study document file?')) {
      const updated = await deleteNotesDocument(docId);
      setDocuments(updated);
    }
  };

  const handleDownloadDoc = (doc) => {
    const element = document.createElement('a');
    if (doc.fileData && doc.fileData.startsWith('data:')) {
      element.href = doc.fileData;
      element.download = doc.fileName || `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.${doc.fileType || 'pdf'}`;
    } else {
      const content = doc.fileData && doc.fileData !== 'DATA_EMBEDDED'
        ? doc.fileData
        : `QuizMind UPSC Study Material Attachment: ${doc.title}\nSubject: ${doc.subject}\nDate: ${doc.uploadDate}\nAuthor: ${doc.uploadedBy}`;
      const blob = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(blob);
      element.download = doc.fileName || `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.${doc.fileType || 'txt'}`;
    }
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  const filteredDocuments = documents.filter(doc => {
    return selectedSubject === 'all' || doc.subject === 'all' || doc.subject === selectedSubject;
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

      {/* Hero Banner */}
      <div className="upsc-hero-banner" style={{ padding: '2rem 1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
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
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)'
            }}>
              <Sparkles size={16} color="#f59e0b" />
              IMPERIAL UPSC CSE REVISION VAULT 🏛️
            </div>
            
            <h1 style={{ fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '0.75rem', fontWeight: 800 }}>
              UPSC CSE <span style={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>General Studies Notes</span>
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '700px', lineHeight: '1.65' }}>
              Academic revision notes categorized by GS Papers I, II, III & IV. High-yield concept outlines, constitutional analysis, and syllabus takeaways.
            </p>
          </div>

          {/* Admin Upload Notes & Document Buttons */}
          {userRole === 'admin' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
                style={{
                  padding: '0.85rem 1.4rem',
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #d97706, #7c3aed)',
                  border: 'none',
                  boxShadow: '0 0 25px rgba(217, 119, 6, 0.35)'
                }}
              >
                <Plus size={18} />
                Upload UPSC Note
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setShowDocUploadModal(true)}
                style={{ padding: '0.85rem 1.2rem', fontSize: '0.95rem', borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                <Upload size={18} />
                Upload Document
              </button>
            </div>
          )}
        </div>

        {/* Academic Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(245, 158, 11, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{notes.length} Topics</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Structured Modules</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>GS Papers I-IV</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Syllabus Mapped</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Star size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{documents.length} Dossiers</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Downloadable Materials</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#f59e0b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="custom-input"
              style={{ paddingLeft: '2.8rem', height: '46px', width: '100%', fontSize: '0.95rem', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              placeholder="Search UPSC topics (e.g. Fundamental Rights, Bhakti Movement, MPC, Monsoon)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {UPSC_SUBJECTS.map(sub => {
              const isActive = selectedSubject === sub.id;
              const count = getSubjectNoteCount(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  style={{
                    padding: '0.55rem 1.05rem',
                    borderRadius: '22px',
                    border: '1px solid ' + (isActive ? '#f59e0b' : 'var(--border-light)'),
                    background: isActive ? sub.gradient : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
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

      {/* Downloadable Study Documents Vault Section */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Downloadable UPSC Study Documents & Dossiers</h3>
          </div>

          {userRole === 'admin' && (
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowDocUploadModal(true)}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', borderColor: '#f59e0b', color: '#f59e0b' }}
            >
              <Upload size={14} /> Upload Notes Document
            </button>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No study documents uploaded for this subject category yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredDocuments.map(doc => (
              <div 
                key={doc.id} 
                style={{ 
                  background: 'rgba(245, 158, 11, 0.05)', 
                  border: '1px solid rgba(245, 158, 11, 0.25)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span style={{ 
                      background: 'rgba(245, 158, 11, 0.2)', 
                      color: '#f59e0b', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.72rem', 
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      {doc.fileType || 'PDF'} • {doc.fileSize || 'FILE'}
                    </span>

                    {userRole === 'admin' && (
                      <button 
                        onClick={(e) => handleDeleteDoc(e, doc.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                        title="Delete File"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {doc.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                    Date: {doc.uploadDate} by {doc.uploadedBy}
                  </div>
                </div>

                <button 
                  className="btn btn-secondary"
                  onClick={() => handleDownloadDoc(doc)}
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem', justifyContent: 'center', gap: '0.4rem', borderColor: 'rgba(245, 158, 11, 0.5)', color: '#f59e0b' }}
                >
                  <Download size={14} color="#f59e0b" /> Download Document
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Cards Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <BookOpen size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <h3>No Notes Found in Vault</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            No study notes match your search. {userRole === 'admin' ? 'Click "Upload UPSC Note" above to add notes.' : ''}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
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

                  <h3 style={{ fontSize: '1.18rem', lineHeight: '1.35', marginBottom: '0.75rem', fontWeight: 700 }}>
                    {note.title}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
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
                      padding: '0.6rem', 
                      fontSize: '0.88rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.45rem',
                      borderColor: 'rgba(245, 158, 11, 0.4)' 
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>Read Detailed Notes</span>
                    <ArrowLeft size={16} color="#f59e0b" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Reader Modal View */}
      {activeNote && (
        <div className="modal-backdrop" onClick={() => setActiveNote(null)}>
          <div className="modal-card" style={{ maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            
            <button 
              onClick={() => setActiveNote(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="gs-paper-bookmark">
                  <Bookmark size={13} /> {activeNote.paperTag || 'GS Paper'}
                </span>
                <span className="high-yield-badge">
                  <Star size={12} fill="#f59e0b" color="#f59e0b" /> High-Yield Topic
                </span>
              </div>

              <h2 style={{ fontSize: '1.9rem', lineHeight: '1.3', marginBottom: '0.65rem' }}>
                {activeNote.title}
              </h2>

              <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span>✍️ {activeNote.author}</span>
                <span>📅 {activeNote.date}</span>
                <span>⏱️ {Math.max(2, Math.ceil(activeNote.content.split(' ').length / 150))} min read</span>
              </div>
            </div>

            {/* High-Yield Summary Box */}
            <div style={{
              padding: '1.15rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Sparkles size={16} /> Key Syllabus Summary Takeaways:
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                {activeNote.summary}
              </p>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleCopyNote(activeNote.content)}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                {copiedNote ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
                {copiedNote ? 'Copied!' : 'Copy Text'}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => handleDownloadNote(activeNote)}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
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
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem', background: 'linear-gradient(135deg, #d97706, #10b981)', border: 'none' }}
                >
                  <Zap size={16} />
                  Generate Quiz from Notes
                </button>
              )}
            </div>

            {/* Formatted Content Area */}
            <div className="glass-panel" style={{ padding: '1.75rem', background: 'rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <FormattedContentRenderer content={activeNote.content} />
            </div>

          </div>
        </div>
      )}

      {/* Admin Upload Notes Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
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
                <label className="input-label">Full Detailed Notes Content (Markdown Headings #, ##, - Bullet points supported)</label>
                <textarea
                  className="custom-textarea"
                  style={{ height: '170px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  placeholder="Write detailed notes with headings (## Section), bold (**term**), and bullet lists (- item)..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #d97706, #7c3aed)', border: 'none' }}>
                  Publish Note 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Upload Document Modal with Native Device File Input */}
      {showDocUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowDocUploadModal(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowDocUploadModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Upload size={22} color="#f59e0b" />
              <h3>Upload Notes Document Attachment</h3>
            </div>

            <form onSubmit={handleCreateDocument}>
              
              {/* Native File Input Picker Box */}
              <div className="input-group">
                <label className="input-label">Select Document File from Computer or Mobile</label>
                <div style={{ 
                  border: '2px dashed rgba(245, 158, 11, 0.4)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.25rem', 
                  textAlign: 'center', 
                  background: 'rgba(245, 158, 11, 0.05)'
                }}>
                  <Upload size={28} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {selectedFileName ? `File Selected: ${selectedFileName}` : 'Choose PDF, DOCX, or TXT file'}
                  </div>
                  {selectedFileSize && (
                    <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Size: {selectedFileSize} • Extension: .{docFileType}
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.ppt,.pptx"
                    onChange={handleFileSelect}
                    style={{ width: '100%', marginTop: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Document Title</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. UPSC Prelims Constitutional Amendments Master Chart"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Subject Category</label>
                  <select
                    className="custom-select"
                    value={docSubject}
                    onChange={e => setDocSubject(e.target.value)}
                  >
                    {UPSC_SUBJECTS.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">File Format</label>
                  <select
                    className="custom-select"
                    value={docFileType}
                    onChange={e => setDocFileType(e.target.value)}
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="docx">Word DOCX</option>
                    <option value="txt">Text File (TXT)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Optional Content / Text File Body</label>
                <textarea
                  className="custom-textarea"
                  style={{ height: '90px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder="Additional summary text for students..."
                  value={docContentText}
                  onChange={e => setDocContentText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #d97706, #7c3aed)', border: 'none' }}>
                  Upload & Publish File 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
