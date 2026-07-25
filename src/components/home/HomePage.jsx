import React, { useState } from 'react';
import { 
  Sparkles, Brain, Newspaper, Trophy, ShieldCheck, Zap, 
  ArrowRight, FileText, KeyRound, User, LogIn, AlertCircle, CheckCircle2, Globe, Flame
} from 'lucide-react';
import { fetchQuizByAccessCode, fetchQuestionsForQuiz, fetchAdminQuizzes } from '../../services/supabase';

export function HomePage({ onNavigate, onStartQuiz, defaultStudentName }) {
  const [accessCode, setAccessCode] = useState('');
  const [studentName, setStudentName] = useState(defaultStudentName || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  React.useEffect(() => {
    fetchAdminQuizzes().then(data => setAvailableQuizzes(data || [])).catch(() => {});
  }, []);

  const handleStudentJoin = async (e) => {
    e.preventDefault();
    if (!accessCode.trim() || !studentName.trim()) {
      setErrorMsg('Please enter both your display name and 6-digit access code.');
      return;
    }

    setIsJoining(true);
    setErrorMsg('');

    try {
      const quiz = await fetchQuizByAccessCode(accessCode.trim());
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
      setErrorMsg(err.message || 'Invalid or non-existent 6-digit access code.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out' }}>
      
      {/* Grand Hero Section */}
      <div className="glass-panel hero-glass-panel">
        {/* Floating Glowing Ambient Orbs */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-60px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '15%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(45px)'
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          
          {/* Hero Left Intro */}
          <div>
            <div className="hero-badge">
              <Sparkles size={16} color="#f59e0b" />
              Next-Gen Quiz & Learning Platform 🚀
            </div>

            <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '1.25rem', fontWeight: 800 }}>
              Transform Any Document into <span className="gradient-text">Interactive Quizzes</span>
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              Upload PDFs, DOCX, or study materials to instantly generate custom multiple-choice tests. Explore live daily current affairs, host real-time classroom sessions, and track live student leaderboards.
            </p>

            {/* Hero Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={() => onNavigate('admin_dashboard')}
                style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
              >
                <Zap size={18} />
                Create Quiz (Admin)
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => onNavigate('current_affairs')}
                style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}
              >
                <Newspaper size={18} color="var(--accent-cyan)" />
                Current Affairs Sphere 📰
              </button>
            </div>
          </div>

          {/* Hero Right Quick Student Join Box */}
          <div className="glass-panel" style={{ 
            padding: '2rem', 
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(24, 27, 42, 0.85)',
            border: '1px solid var(--border-indigo)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
              }}>
                <KeyRound size={22} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>Student Quick Join</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Enter code to start your test</span>
              </div>
            </div>

            <form onSubmit={handleStudentJoin}>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label">Your Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="custom-input"
                    style={{ paddingLeft: '2.4rem', height: '42px' }}
                    placeholder="e.g. Alex Morgan"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">6-Digit Access Code</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="custom-input"
                    style={{ 
                      paddingLeft: '2.4rem', 
                      letterSpacing: '0.2em', 
                      fontFamily: 'monospace', 
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      height: '42px' 
                    }}
                    maxLength={6}
                    placeholder="654321"
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose)',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <AlertCircle size={15} />
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-emerald" 
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                disabled={isJoining}
              >
                <LogIn size={16} />
                {isJoining ? 'Joining Quiz...' : 'Start Test Session'}
              </button>
            </form>

            {/* Active Quiz Codes Quick Select */}
            {availableQuizzes.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📢 Active Classroom Access Codes:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {availableQuizzes.map(q => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setAccessCode(q.access_code)}
                      style={{
                        background: accessCode === q.access_code ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid ' + (accessCode === q.access_code ? 'var(--primary-indigo)' : 'var(--border-light)'),
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                        {q.title}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-indigo)', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                        {q.access_code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3 Core Feature Spheres Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ color: 'var(--primary-violet)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            FEATURE SPHERES
          </span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>Everything You Need for Modern Learning</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          
          {/* Sphere 1: AI Generator */}
          <div 
            className="glass-panel ca-card-interactive" 
            style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', borderTop: '4px solid #8b5cf6', cursor: 'pointer' }}
            onClick={() => onNavigate('admin_dashboard')}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              color: 'var(--primary-violet)'
            }}>
              <Brain size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.65rem' }}>Document Quiz Generator</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
              Upload any course document or PDF. Intelligent text analysis reads the material and crafts conceptual multiple-choice questions with full explanations.
            </p>

            <span style={{ color: 'var(--primary-violet)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Quiz Generator <ArrowRight size={16} />
            </span>
          </div>

          {/* Sphere 2: Daily Current Affairs */}
          <div 
            className="glass-panel ca-card-interactive" 
            style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', borderTop: '4px solid #06b6d4', cursor: 'pointer' }}
            onClick={() => onNavigate('current_affairs')}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(2, 132, 199, 0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              color: 'var(--accent-cyan)'
            }}>
              <Newspaper size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.65rem' }}>Current Affairs Sphere 📰</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
              Real-time daily news updates, exam preparation takeaways, and 1-click quiz creation on national polity, science, economy, and sports.
            </p>

            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Explore Daily News <ArrowRight size={16} />
            </span>
          </div>

          {/* Sphere 3: Classroom Leaderboard */}
          <div 
            className="glass-panel ca-card-interactive" 
            style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', borderTop: '4px solid #f59e0b', cursor: 'pointer' }}
            onClick={() => onNavigate('admin_dashboard')}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(234, 88, 12, 0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              color: '#f59e0b'
            }}>
              <Trophy size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.65rem' }}>Live Classroom Leaderboard</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
              Generate unique 6-digit access codes for students to join on local Wi-Fi or internet, with real-time leaderboard score tracking.
            </p>

            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Active Quizzes <ArrowRight size={16} />
            </span>
          </div>

        </div>
      </div>

      {/* Platform Key Stats Strip */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'rgba(24, 27, 42, 0.6)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>⚡ 100%</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Automated Generation</div>
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>📰 Daily</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Real-time News Feed</div>
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>🔒 6-Digit</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Secure Access Codes</div>
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>🏆 Live</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Classroom Leaderboards</div>
        </div>
      </div>

    </div>
  );
}
