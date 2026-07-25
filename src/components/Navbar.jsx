import React, { useState } from 'react';
import { Brain, Shield, User, Key, Sparkles, Sun, Moon, Eye, EyeOff, Check, X, ShieldAlert, Newspaper, Home, LogOut, BookOpen } from 'lucide-react';

export function Navbar({ userRole, setUserRole, currentView, setView, theme, onToggleTheme, isAuthenticated, sessionUser, onLogout, onOpenProfile }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;

  React.useEffect(() => {
    const handleKeyMissing = () => {
      setShowKeyModal(true);
    };
    window.addEventListener('gemini_key_missing', handleKeyMissing);
    return () => window.removeEventListener('gemini_key_missing', handleKeyMissing);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKeyInput.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowKeyModal(false);
    }, 1200);
  };

  return (
    <nav className="navbar">
      <div 
        className="nav-brand" 
        style={{ cursor: 'pointer' }}
        onClick={() => setView(userRole === 'student' ? 'student_join' : 'admin_dashboard')}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Brain size={22} color="#ffffff" />
        </div>
        <span>QuizMind <span className="gradient-text">Pro</span></span>
      </div>

      <div className="nav-actions">
        {/* Main Workspace Nav Button */}
        <button
          className={`btn ${currentView === (userRole === 'student' ? 'student_join' : 'admin_dashboard') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          onClick={() => setView(userRole === 'student' ? 'student_join' : 'admin_dashboard')}
          title={userRole === 'student' ? 'Student Quiz Portal' : 'Admin Dashboard'}
        >
          <Home size={15} color={currentView === (userRole === 'student' ? 'student_join' : 'admin_dashboard') ? '#ffffff' : 'var(--primary-indigo)'} />
          <span>{userRole === 'student' ? 'Quiz Portal' : 'Admin Dashboard'}</span>
        </button>

        {/* UPSC CSE Notes Sphere Nav Button */}
        <button
          className={`btn ${currentView === 'upsc_notes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          onClick={() => setView('upsc_notes')}
          title="UPSC CSE Notes Sphere"
        >
          <BookOpen size={15} color={currentView === 'upsc_notes' ? '#ffffff' : 'var(--primary-violet)'} />
          <span>UPSC Notes</span>
        </button>

        {/* Current Affairs Sphere Nav Button */}
        <button
          className={`btn ${currentView === 'current_affairs' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          onClick={() => setView('current_affairs')}
          title="Current Affairs Sphere"
        >
          <Newspaper size={15} color={currentView === 'current_affairs' ? '#ffffff' : 'var(--accent-cyan)'} />
          <span>Current Affairs</span>
        </button>

        {/* Day / Night Theme Switcher */}
        <button
          className="btn btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '50%', width: '38px', height: '38px' }}
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--primary-indigo)" />}
        </button>

        {/* API Key Configurator Button */}
        {userRole === 'admin' && (
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
            onClick={() => setShowKeyModal(true)}
            title="Configure Quiz Engine Key"
          >
            <Key size={15} color="var(--primary-violet)" />
            <span style={{ fontSize: '0.85rem' }}>API Key</span>
          </button>
        )}

        {/* Student My Profile Button */}
        {userRole === 'student' && isAuthenticated && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            onClick={onOpenProfile}
            title="View Student Profile & Stats"
          >
            <User size={15} color="var(--primary-indigo)" />
            <span style={{ fontSize: '0.85rem' }}>My Profile</span>
          </button>
        )}

        {/* User Session / Logout Button */}
        {isAuthenticated && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            onClick={onLogout}
            title="Exit Session / Switch User"
          >
            <LogOut size={15} color="var(--accent-rose)" />
            <span style={{ fontSize: '0.85rem' }}>Logout</span>
          </button>
        )}
      </div>

      {/* Redesigned API Key Modal with Position Clipping Fix */}
      {showKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowKeyModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>

            {/* Header with glowing Sparkle Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="gemini-sparkle-glow">
                <Sparkles size={24} color="var(--primary-violet)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', lineHeight: '1.2' }}>Quiz Engine Key Setup</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Configure your high-speed cloud generation engine key
                </span>
              </div>
            </div>

            {/* Helper Status Badge */}
            <div style={{ marginBottom: '1.5rem' }}>
              {activeKey ? (
                <div className="status-badge active">
                  <Check size={14} />
                  Quiz Engine Key Active
                </div>
              ) : (
                <div className="status-badge fallback">
                  <ShieldAlert size={14} />
                  Using Smart Document Engine Mode
                </div>
              )}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Enter your official API Key below. Your key is stored securely in your local browser storage and used solely to construct multiple-choice questions from uploaded course materials.
            </p>

            <form onSubmit={handleSaveKey}>
              {/* API Key Input with Eye Toggle */}
              <div className="input-group">
                <label className="input-label">Gemini API Key</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="custom-input"
                    style={{ paddingRight: '2.8rem', fontFamily: showPassword ? 'monospace' : 'inherit' }}
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
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
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? 'Hide Key' : 'Show Key'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div style={{ 
                  color: 'var(--accent-emerald)', 
                  fontSize: '0.85rem', 
                  marginBottom: '1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Check size={16} />
                  Settings saved successfully!
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowKeyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={16} />
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
