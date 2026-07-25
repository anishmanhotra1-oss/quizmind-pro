import React, { useState } from 'react';
import { 
  Shield, User, Lock, Sparkles, ArrowRight, Brain, AlertCircle, Eye, EyeOff, Mail, CheckCircle2, Award, BookOpen 
} from 'lucide-react';
import { registerStudentAccount } from '../../services/student_service';

export function AuthPortal({ onStudentLogin, onAdminLogin }) {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'
  
  // Student State
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [studentError, setStudentError] = useState('');
  
  // Admin State
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Cryptographic SHA-256 Hash of Admin Password for secure client verification
  const ADMIN_PASSWORD_HASH = '5be541fbd03c2789fc5c40799b1758a2ce258e4dc667d088d54b3fe98ee6f52b';

  async function sha256(plainText) {
    const buffer = new TextEncoder().encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentNameInput.trim()) {
      setStudentError('Please enter your full name to proceed.');
      return;
    }

    setStudentError('');
    const registered = registerStudentAccount({
      name: studentNameInput.trim(),
      email: studentEmailInput.trim()
    });

    onStudentLogin(registered.name, registered.email);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const enteredHash = await sha256(adminPasswordInput.trim());
    if (enteredHash === ADMIN_PASSWORD_HASH) {
      setAdminError('');
      onAdminLogin();
    } else {
      setAdminError('Access Denied: Incorrect Admin Password.');
    }
  };

  return (
    <div style={{ 
      maxWidth: '1050px', 
      margin: '2rem auto', 
      animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
    }}>
      
      {/* Dribbble-Inspired Split Layout Container */}
      <div className="glass-panel auth-split-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-indigo)'
      }}>
        
        {/* Left Panel: Visual Hero & Feature Highlights (Dribbble Showcase Style) */}
        <div className="auth-left-panel" style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.96), rgba(76, 29, 149, 0.92))',
          padding: '3.5rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Lighting Orbs */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          <div style={{
            position: 'absolute',
            bottom: '-40px',
            right: '-40px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          <div>
            {/* Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-indigo), #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
              }}>
                <Brain size={24} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: '#ffffff' }}>
                QuizMind <span className="gradient-text">Pro</span>
              </span>
            </div>

            <h2 style={{ fontSize: '2.2rem', lineHeight: '1.25', marginBottom: '1rem', color: '#ffffff', fontWeight: 800 }}>
              Master Course Content & <span style={{ background: 'linear-gradient(135deg, #fbbf24, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UPSC Notes</span>
            </h2>

            <p style={{ color: 'rgba(241, 245, 249, 0.8)', fontSize: '0.98rem', lineHeight: '1.65', marginBottom: '2rem' }}>
              Interactive document quizzes, GS Paper I-IV revision notes, and live student performance analytics.
            </p>

            {/* Dribbble Floating Feature Pill Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                padding: '0.55rem 1rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Instant Document & PDF Quiz Engine</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                padding: '0.55rem 1rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600
              }}>
                <BookOpen size={16} color="#fbbf24" />
                <span>Imperial UPSC CSE Study Notes Vault</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                padding: '0.55rem 1rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600
              }}>
                <Award size={16} color="#06b6d4" />
                <span>Real-Time Classroom Access Codes</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', color: 'rgba(241, 245, 249, 0.6)', fontSize: '0.82rem' }}>
            © {new Date().getFullYear()} QuizMind Pro • Curated by Anish Manhotra
          </div>
        </div>

        {/* Right Panel: Interactive Login Card */}
        <div className="auth-right-panel" style={{ padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Entrance Selector Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'rgba(0, 0, 0, 0.08)',
            padding: '5px',
            borderRadius: '14px',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => { setActiveTab('student'); setAdminError(''); setStudentError(''); }}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'var(--transition-fast)',
                background: activeTab === 'student' ? 'linear-gradient(135deg, var(--primary-indigo), #7c3aed)' : 'transparent',
                color: activeTab === 'student' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <User size={16} />
              Student Account
            </button>

            <button
              onClick={() => { setActiveTab('admin'); setAdminError(''); setStudentError(''); }}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'var(--transition-fast)',
                background: activeTab === 'admin' ? 'linear-gradient(135deg, var(--primary-indigo), #7c3aed)' : 'transparent',
                color: activeTab === 'admin' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              <Lock size={16} />
              Admin Portal 🔒
            </button>
          </div>

          {/* Student Account Registration & Login */}
          {activeTab === 'student' && (
            <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Create Student Profile</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Register your account to access UPSC study notes and attempt classroom quizzes.
                </p>
              </div>

              <form onSubmit={handleStudentSubmit}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="custom-input"
                      style={{ paddingLeft: '2.8rem', height: '46px' }}
                      placeholder="e.g. Alex Morgan"
                      value={studentNameInput}
                      onChange={e => setStudentNameInput(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Email Address (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      className="custom-input"
                      style={{ paddingLeft: '2.8rem', height: '46px' }}
                      placeholder="alex.morgan@student.edu"
                      value={studentEmailInput}
                      onChange={e => setStudentEmailInput(e.target.value)}
                    />
                  </div>
                </div>

                {studentError && (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: 'var(--accent-rose)',
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    {studentError}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                  Create Account & Enter Portal <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* Admin Password Access */}
          {activeTab === 'admin' && (
            <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Admin Security Access</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Password required to manage course quizzes, publish UPSC notes, and view student profiles.
                </p>
              </div>

              <form onSubmit={handleAdminSubmit}>
                <div className="input-group">
                  <label className="input-label">Admin Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="custom-input"
                      style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem', height: '46px' }}
                      placeholder="Enter admin password..."
                      value={adminPasswordInput}
                      onChange={e => setAdminPasswordInput(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {adminError && (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    color: 'var(--accent-rose)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600
                  }}>
                    <AlertCircle size={18} />
                    {adminError}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                  Unlock Admin Dashboard 🔒
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
