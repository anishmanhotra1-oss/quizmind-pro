import React, { useState, useEffect } from 'react';
import { LogIn, KeyRound, User, Sparkles, AlertCircle, Play, BookOpen, Bookmark, ArrowRight } from 'lucide-react';
import { fetchQuizByAccessCode, fetchQuestionsForQuiz, fetchAdminQuizzes } from '../../services/supabase';
import { getUPSCNotes, UPSC_SUBJECTS } from '../../services/notes_service';

export function StudentJoin({ onStartQuiz, defaultStudentName }) {
  const [accessCode, setAccessCode] = useState('');
  const [studentName, setStudentName] = useState(defaultStudentName || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Available 6-Digit Access Codes & Published Notes
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [publishedNotes, setPublishedNotes] = useState([]);

  useEffect(() => {
    fetchAdminQuizzes()
      .then(data => setAvailableQuizzes(data || []))
      .catch(() => {});
    setPublishedNotes(getUPSCNotes());
  }, []);

  const handleJoinWithCode = async (codeToUse) => {
    const cleanCode = codeToUse || accessCode.trim();
    if (!cleanCode || !studentName.trim()) {
      setErrorMsg('Please enter both your name and 6-digit access code.');
      return;
    }

    setIsJoining(true);
    setErrorMsg('');

    try {
      const quiz = await fetchQuizByAccessCode(cleanCode);
      const questions = await fetchQuestionsForQuiz(quiz.id);

      if (!questions || questions.length === 0) {
        throw new Error('This quiz has no questions associated with it.');
      }

      onStartQuiz({
        quiz,
        questions,
        studentName: studentName.trim()
      });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid 6-digit access code.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleJoinWithCode(accessCode.trim());
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', animation: 'fadeIn 0.35s ease-out' }}>
      
      {/* Pristine Student Code Portal Card */}
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
        
        {/* Glow Icon Header */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={30} color="#ffffff" />
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Student Quiz Portal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Enter your name and 6-digit access code to start your test.
        </p>

        <form onSubmit={handleFormSubmit}>
          <div className="input-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <label className="input-label">Student Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="custom-input"
                style={{ paddingLeft: '2.8rem', height: '46px' }}
                placeholder="e.g. Alex Morgan"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="input-label">6-Digit Access Code</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="custom-input"
                style={{ 
                  paddingLeft: '2.8rem', 
                  letterSpacing: '0.25em', 
                  fontFamily: 'monospace', 
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  height: '46px',
                  textAlign: 'center'
                }}
                maxLength={6}
                placeholder="849201"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: 'var(--accent-rose)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            disabled={isJoining}
          >
            <Play size={18} />
            {isJoining ? 'Verifying Code...' : 'Start Test Session'}
          </button>
        </form>

        {/* Available Access Codes Mobile-Responsive Section */}
        {availableQuizzes.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--primary-indigo)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📢 Active Classroom Quiz Codes ({availableQuizzes.length}):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {availableQuizzes.map(quiz => (
                <div
                  key={quiz.id}
                  onClick={() => {
                    setAccessCode(quiz.access_code);
                    handleJoinWithCode(quiz.access_code);
                  }}
                  style={{
                    background: accessCode === quiz.access_code ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(124, 58, 237, 0.25))' : 'var(--bg-card)',
                    border: accessCode === quiz.access_code ? '1.5px solid var(--primary-indigo)' : '1px solid var(--border-light)',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'var(--transition-fast)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {quiz.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {quiz.questions ? quiz.questions.length : 5} Questions • Tap to Enter
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, var(--primary-indigo), #7c3aed)',
                    color: '#ffffff',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                    flexShrink: 0
                  }}>
                    {quiz.access_code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published UPSC Notes Directory on Student Dashboard */}
        {publishedNotes.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} /> Admin Published UPSC Revision Notes ({publishedNotes.length}):
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              {publishedNotes.slice(0, 3).map(note => {
                const subObj = UPSC_SUBJECTS.find(s => s.id === note.subject) || {};
                return (
                  <div key={note.id} className="glass-panel" style={{ padding: '0.9rem 1rem', borderRadius: '14px', borderLeft: `3px solid ${subObj.badgeColor || '#f59e0b'}` }}>
                    <span style={{ fontSize: '0.72rem', color: subObj.badgeColor || '#f59e0b', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                      {note.paperTag || 'GS Paper'} • {note.subjectLabel}
                    </span>
                    <h5 style={{ fontSize: '0.9rem', lineHeight: '1.3', marginBottom: '4px' }}>{note.title}</h5>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>✍️ {note.author}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
