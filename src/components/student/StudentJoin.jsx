import React, { useState, useEffect } from 'react';
import { LogIn, KeyRound, User, Sparkles, AlertCircle, Play, BookOpen, Bookmark, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { fetchQuizByAccessCode, fetchQuestionsForQuiz, fetchAdminQuizzes, fetchExternalQuizLinks, buildExternalQuizUrl } from '../../services/supabase';
import { getUPSCNotes, UPSC_SUBJECTS } from '../../services/notes_service';
import { registerStudentAccount } from '../../services/student_service';

export function StudentJoin({ onStartQuiz, defaultStudentName, onStudentLogin }) {
  const [accessCode, setAccessCode] = useState('');
  const [studentName, setStudentName] = useState(() => defaultStudentName || localStorage.getItem('QUIZMIND_STUDENT_NAME') || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Available 6-Digit Access Codes, External Links & Published Notes
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [publishedNotes, setPublishedNotes] = useState([]);

  useEffect(() => {
    const loadAllQuizzesAndLinks = () => {
      fetchAdminQuizzes()
        .then(data => setAvailableQuizzes(data || []))
        .catch(() => {});

      fetchExternalQuizLinks()
        .then(data => setExternalLinks(data || []))
        .catch(() => {});
    };

    loadAllQuizzesAndLinks();
    
    // Live polling every 3 seconds so external link quizzes uploaded by admin appear immediately for every student
    const pollInterval = setInterval(loadAllQuizzesAndLinks, 3000);

    setPublishedNotes(getUPSCNotes());

    return () => clearInterval(pollInterval);
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
      const cleanName = studentName.trim();
      const registered = await registerStudentAccount({ name: cleanName });
      
      localStorage.setItem('QUIZMIND_STUDENT_NAME', cleanName);
      if (registered && registered.email) {
        localStorage.setItem('QUIZMIND_STUDENT_EMAIL', registered.email);
      }

      if (onStudentLogin) {
        onStudentLogin(cleanName, registered ? registered.email : '');
      }

      // Check external links local state first
      const foundExt = externalLinks.find(l => l.access_code === cleanCode);
      if (foundExt) {
        const targetUrl = buildExternalQuizUrl(foundExt.externalUrl, cleanName, foundExt.topic);
        window.location.href = targetUrl;
        setIsJoining(false);
        return;
      }

      const quiz = await fetchQuizByAccessCode(cleanCode);

      // Handle external link quiz returned by access code search
      if (quiz && (quiz.is_external || quiz.externalUrl)) {
        const targetUrl = buildExternalQuizUrl(quiz.externalUrl, cleanName, quiz.topic || quiz.title);
        window.location.href = targetUrl;
        setIsJoining(false);
        return;
      }

      const questions = await fetchQuestionsForQuiz(quiz.id);

      if (!questions || questions.length === 0) {
        throw new Error('This quiz has no questions associated with it.');
      }

      onStartQuiz({
        quiz,
        questions,
        studentName: cleanName
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
                onChange={e => {
                  setStudentName(e.target.value);
                  localStorage.setItem('QUIZMIND_STUDENT_NAME', e.target.value);
                  if (onStudentLogin && e.target.value.trim()) {
                    onStudentLogin(e.target.value.trim());
                  }
                }}
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

        {/* Daily Quiz Section - Placed directly above Admin Published UPSC Revision Notes */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', textAlign: 'left' }}>
          <span style={{ fontSize: '0.82rem', color: '#a855f7', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Globe size={16} /> Daily Quiz Portal
          </span>
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(99, 102, 241, 0.12))',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '16px',
            padding: '1.25rem 1.25rem',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
            }}>
              <Globe size={26} color="#ffffff" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                Daily Quiz 🌐
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                Launch QuizDaily to take interactive AI-generated daily quizzes & live tests.
              </p>
            </div>
            <a
              href="https://quizdaily-1.onrender.com"
              target="_self"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "https://quizdaily-1.onrender.com";
              }}
              className="btn"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.35)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Launch Daily Quiz</span>
              <ExternalLink size={18} />
            </a>
          </div>

          {/* Dynamic External Links list if available */}
          {externalLinks.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {externalLinks.map(link => (
                <div
                  key={link.id}
                  onClick={() => {
                    const cleanName = studentName.trim() || 'Student';
                    const targetUrl = buildExternalQuizUrl(link.externalUrl, cleanName, link.topic);
                    window.location.href = targetUrl;
                  }}
                  style={{
                    background: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🌐 {link.topic}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#a855f7', marginTop: '2px' }}>
                      External AI Test • Click to Launch
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: '#ffffff',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    letterSpacing: '1px'
                  }}>
                    {link.access_code}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



      </div>
    </div>
  );
}
