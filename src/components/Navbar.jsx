import React, { useState } from 'react';
import { 
  Brain, Shield, User, Key, Sparkles, Sun, Moon, Eye, EyeOff, 
  Check, X, ShieldAlert, Newspaper, Home, LogOut, BookOpen, Menu, MessageSquare, FileCheck 
} from 'lucide-react';

export function Navbar({ 
  userRole, setUserRole, currentView, setView, theme, onToggleTheme, 
  isAuthenticated, sessionUser, onLogout, onOpenProfile 
}) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleNavClick = (viewName) => {
    setView(viewName);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar" style={{ position: 'relative', zIndex: 100 }}>
      <div 
        className="nav-brand" 
        style={{ cursor: 'pointer' }}
        onClick={() => handleNavClick(userRole === 'student' ? 'student_join' : 'admin_dashboard')}
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

      {/* Desktop Navigation Action Buttons */}
      <div className="nav-actions desktop-only-nav">
        {/* Main Workspace Nav Button */}
        <button
          className={`btn ${currentView === (userRole === 'student' ? 'student_join' : 'admin_dashboard') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          onClick={() => handleNavClick(userRole === 'student' ? 'student_join' : 'admin_dashboard')}
          title={userRole === 'student' ? 'Student Quiz Portal' : 'Admin Dashboard'}
        >
          <Home size={15} color={currentView === (userRole === 'student' ? 'student_join' : 'admin_dashboard') ? '#ffffff' : 'var(--primary-indigo)'} />
          <span>{userRole === 'student' ? 'Quiz Portal' : 'Admin Dashboard'}</span>
        </button>

        {/* UPSC CSE Notes Sphere Nav Button */}
        <button
          className={`btn ${currentView === 'upsc_notes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          onClick={() => handleNavClick('upsc_notes')}
          title="UPSC CSE Notes Sphere"
        >
          <BookOpen size={15} color={currentView === 'upsc_notes' ? '#ffffff' : '#f59e0b'} />
          <span>UPSC Notes</span>
        </button>

        {/* Current Affairs Sphere Nav Button */}
        <button
          className={`btn ${currentView === 'current_affairs' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          onClick={() => handleNavClick('current_affairs')}
          title="Current Affairs Sphere"
        >
          <Newspaper size={15} color={currentView === 'current_affairs' ? '#ffffff' : 'var(--accent-cyan)'} />
          <span>Current Affairs</span>
        </button>

        {/* Community Chat Nav Button */}
        <button
          className={`btn ${currentView === 'community_chat' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          onClick={() => handleNavClick('community_chat')}
          title="Live Community Doubts Chat"
        >
          <MessageSquare size={15} color={currentView === 'community_chat' ? '#ffffff' : '#34d399'} />
          <span>Doubts Chat</span>
        </button>

        {/* Copy Evaluation Nav Button */}
        <button
          className={`btn ${currentView === 'copy_evaluation' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          onClick={() => handleNavClick('copy_evaluation')}
          title="PRAYAS AI Copy Evaluation"
        >
          <FileCheck size={15} color={currentView === 'copy_evaluation' ? '#ffffff' : '#ec4899'} />
          <span>Copy Eval</span>
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
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
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
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
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
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            onClick={onLogout}
            title="Exit Session / Switch User"
          >
            <LogOut size={15} color="var(--accent-rose)" />
            <span style={{ fontSize: '0.85rem' }}>Logout</span>
          </button>
        )}
      </div>

      {/* Mobile Header Controls */}
      <div className="mobile-only-nav" style={{ display: 'none', alignItems: 'center', gap: '0.65rem' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '0.45rem', borderRadius: '50%', width: '36px', height: '36px' }}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Sun size={16} color="var(--accent-amber)" /> : <Moon size={16} color="var(--primary-indigo)" />}
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '0.45rem', borderRadius: '10px', width: '38px', height: '38px', background: mobileMenuOpen ? 'var(--primary-indigo)' : undefined }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} color="#ffffff" /> : <Menu size={20} color="var(--text-main)" />}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-drawer glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.5rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-indigo)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <button
            className={`btn ${currentView === (userRole === 'student' ? 'student_join' : 'admin_dashboard') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            onClick={() => handleNavClick(userRole === 'student' ? 'student_join' : 'admin_dashboard')}
          >
            <Home size={18} />
            <span>{userRole === 'student' ? 'Student Quiz Portal' : 'Admin Dashboard'}</span>
          </button>

          <button
            className={`btn ${currentView === 'upsc_notes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            onClick={() => handleNavClick('upsc_notes')}
          >
            <BookOpen size={18} color={currentView === 'upsc_notes' ? '#ffffff' : '#f59e0b'} />
            <span>UPSC Notes Vault</span>
          </button>

          <button
            className={`btn ${currentView === 'current_affairs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            onClick={() => handleNavClick('current_affairs')}
          >
            <Newspaper size={18} color={currentView === 'current_affairs' ? '#ffffff' : 'var(--accent-cyan)'} />
            <span>Current Affairs Sphere</span>
          </button>

          <button
            className={`btn ${currentView === 'community_chat' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            onClick={() => handleNavClick('community_chat')}
          >
            <MessageSquare size={18} color={currentView === 'community_chat' ? '#ffffff' : '#34d399'} />
            <span>Community Doubts Chat</span>
          </button>

          <button
            className={`btn ${currentView === 'copy_evaluation' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            onClick={() => handleNavClick('copy_evaluation')}
          >
            <FileCheck size={18} color={currentView === 'copy_evaluation' ? '#ffffff' : '#ec4899'} />
            <span>PRAYAS AI Copy Evaluation</span>
          </button>

          {userRole === 'student' && isAuthenticated && (
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile();
              }}
            >
              <User size={18} color="var(--primary-indigo)" />
              <span>My Profile & Stats</span>
            </button>
          )}

          {userRole === 'admin' && (
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              onClick={() => {
                setMobileMenuOpen(false);
                setShowKeyModal(true);
              }}
            >
              <Key size={18} color="var(--primary-violet)" />
              <span>API Key Configurator</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', borderColor: 'rgba(244, 63, 94, 0.4)', color: 'var(--accent-rose)' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowKeyModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <ShieldAlert size={24} color="var(--primary-indigo)" />
              <h3>Quiz Engine Key Setup</h3>
            </div>

            <form onSubmit={handleSaveKey}>
              <div className="input-group">
                <label className="input-label">Gemini API Key</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="custom-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--accent-emerald)',
                  color: 'var(--accent-emerald)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Check size={16} /> Key saved successfully!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowKeyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Engine Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
