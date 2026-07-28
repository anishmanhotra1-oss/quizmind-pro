import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthPortal } from './components/auth/AuthPortal';
import { HomePage } from './components/home/HomePage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentJoin } from './components/student/StudentJoin';
import { QuizWorkspace } from './components/student/QuizWorkspace';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { CurrentAffairs } from './components/current_affairs/CurrentAffairs';
import { NotesSphere } from './components/notes/NotesSphere';
import { CommunityChat } from './components/chat/CommunityChat';
import { CopyEvaluation } from './components/evaluation/CopyEvaluation';
import { StudentProfileModal } from './components/student/StudentProfileModal';
import { updateStudentStats, registerStudentAccount } from './services/student_service';
import './styles/main.css';

// Persistent storage helper (localStorage with fallback)
const getStorageItem = (key, defaultVal) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key) || defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, val);
    sessionStorage.setItem(key, val);
  } catch (e) {}
};

const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (e) {}
};

export default function App() {
  // Authentication & Persistent Session Management (Task 4)
  const [isAuthenticated, setIsAuthenticated] = useState(() => getStorageItem('QUIZMIND_AUTH', 'false') === 'true');
  const [userRole, setUserRole] = useState(() => getStorageItem('QUIZMIND_ROLE', 'student')); // 'admin' | 'student'
  const [studentName, setStudentName] = useState(() => getStorageItem('QUIZMIND_STUDENT_NAME', ''));
  const [studentEmail, setStudentEmail] = useState(() => getStorageItem('QUIZMIND_STUDENT_EMAIL', ''));
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  const [viewState, setViewState] = useState(() => {
    const savedRole = getStorageItem('QUIZMIND_ROLE', 'student');
    const savedView = getStorageItem('QUIZMIND_VIEW', '');
    if (savedRole === 'student') {
      if (['current_affairs', 'upsc_notes', 'community_chat', 'copy_evaluation', 'student_join', 'home'].includes(savedView)) {
        return savedView;
      }
      return 'student_join';
    }
    if (savedRole === 'admin') return savedView || 'admin_dashboard';
    return 'home';
  });

  const setView = (newView) => {
    let finalView = newView;
    const currentRole = getStorageItem('QUIZMIND_ROLE', userRole);
    if (currentRole === 'student' && (newView === 'admin_dashboard' || newView === 'home')) {
      finalView = 'student_join';
    }
    setStorageItem('QUIZMIND_VIEW', finalView);
    setViewState(finalView);
  };

  const view = viewState;

  const [theme, setTheme] = useState(() => localStorage.getItem('QUIZMIND_THEME') || 'dark');
  
  // Quiz Active State
  const [activeQuizSession, setActiveQuizSession] = useState(null);
  const [lastAttemptResult, setLastAttemptResult] = useState(null);
  const [selectedLeaderboardQuiz, setSelectedLeaderboardQuiz] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('QUIZMIND_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Student Authentication Handler
  const handleStudentLogin = (name, email) => {
    if (!name || typeof name !== 'string' || !name.trim()) return;
    const cleanName = name.trim();
    const cleanEmail = email && email.trim() ? email.trim() : `${cleanName.toLowerCase().replace(/\s+/g, '.')}@student.edu`;
    
    registerStudentAccount({ name: cleanName, email: cleanEmail });

    setStorageItem('QUIZMIND_AUTH', 'true');
    setStorageItem('QUIZMIND_ROLE', 'student');
    setStorageItem('QUIZMIND_STUDENT_NAME', cleanName);
    setStorageItem('QUIZMIND_STUDENT_EMAIL', cleanEmail);
    
    setStudentName(cleanName);
    setStudentEmail(cleanEmail);
    setUserRole('student');
    setIsAuthenticated(true);
    setView('student_join');
    setShowWelcomeModal(true);
  };

  // Admin Password Protection Handler
  const handleAdminLogin = () => {
    setStorageItem('QUIZMIND_AUTH', 'true');
    setStorageItem('QUIZMIND_ROLE', 'admin');
    
    setUserRole('admin');
    setIsAuthenticated(true);
    setView('admin_dashboard');
  };

  // Logout / Switch User (Preserves student identity & data)
  const handleLogout = () => {
    removeStorageItem('QUIZMIND_AUTH');
    removeStorageItem('QUIZMIND_ROLE');
    removeStorageItem('QUIZMIND_VIEW');
    
    setIsAuthenticated(false);
    setUserRole('student');
    setShowProfileModal(false);
    setViewState('home');
  };

  // Student starts a quiz session
  const handleStartQuiz = ({ quiz, questions, studentName: nameFromQuiz }) => {
    setActiveQuizSession({ quiz, questions, studentName: nameFromQuiz || studentName });
    setView('quiz_workspace');
  };

  // Student finishes quiz session
  const handleQuizCompleted = (resultData) => {
    setLastAttemptResult(resultData);
    setSelectedLeaderboardQuiz(resultData.quiz);
    if (studentName && resultData.scorePercentage !== undefined) {
      updateStudentStats(studentName, resultData.scorePercentage);
    }
    setView('leaderboard');
  };

  // Admin clicks View Leaderboard on active quiz card
  const handleSelectQuizForLeaderboard = (quiz) => {
    setSelectedLeaderboardQuiz(quiz);
    setLastAttemptResult(null);
    setView('leaderboard');
  };

  return (
    <div className="app-container" data-theme={theme}>
      <Navbar 
        userRole={userRole} 
        setUserRole={setUserRole} 
        currentView={view} 
        setView={setView} 
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        sessionUser={userRole === 'student' ? studentName : 'Admin'}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <main className="main-content">
        {!isAuthenticated ? (
          <AuthPortal 
            onStudentLogin={handleStudentLogin}
            onAdminLogin={handleAdminLogin}
          />
        ) : (
          <>
            {view === 'home' && (
              <HomePage
                onNavigate={(newView) => {
                  if (newView === 'admin_dashboard' && userRole !== 'admin') {
                    handleLogout();
                  } else {
                    setView(newView);
                  }
                }}
                onStartQuiz={handleStartQuiz}
                defaultStudentName={studentName}
              />
            )}

            {view === 'admin_dashboard' && userRole === 'admin' && (
              <AdminDashboard 
                onSelectQuizForLeaderboard={handleSelectQuizForLeaderboard} 
              />
            )}

            {(view === 'student_join' || (view === 'admin_dashboard' && userRole !== 'admin')) && (
              <StudentJoin 
                onStartQuiz={handleStartQuiz} 
                defaultStudentName={studentName}
                onStudentLogin={handleStudentLogin}
              />
            )}

            {view === 'quiz_workspace' && activeQuizSession && (
              <QuizWorkspace
                quiz={activeQuizSession.quiz}
                questions={activeQuizSession.questions}
                studentName={activeQuizSession.studentName || studentName}
                onQuizCompleted={handleQuizCompleted}
                onExit={() => setView('student_join')}
              />
            )}

            {view === 'leaderboard' && (
              <LeaderboardView
                quiz={selectedLeaderboardQuiz}
                lastAttemptResult={lastAttemptResult}
                onBack={() => setView(userRole === 'admin' ? 'admin_dashboard' : 'student_join')}
                isAdmin={userRole === 'admin'}
              />
            )}

            {view === 'current_affairs' && (
              <CurrentAffairs
                userRole={userRole}
                onGenerateQuizFromArticle={(article) => {
                  if (userRole === 'admin') {
                    setView('admin_dashboard');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('prefill_quiz_text', { 
                        detail: { 
                          title: `Current Affairs: ${article.title.substring(0, 30)}...`, 
                          text: `${article.title}\n\n${article.summary}\n\n${article.content}` 
                        } 
                      }));
                    }, 100);
                  } else {
                    alert('Quiz creation from articles is reserved for authenticated Instructors/Admins.');
                  }
                }}
                onBackToDashboard={() => setView(userRole === 'admin' ? 'admin_dashboard' : 'student_join')}
              />
            )}

            {view === 'upsc_notes' && (
              <NotesSphere
                userRole={userRole}
                onBackToDashboard={() => setView(userRole === 'admin' ? 'admin_dashboard' : 'student_join')}
                onGenerateQuizFromNotes={(note) => {
                  if (userRole === 'admin') {
                    setView('admin_dashboard');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('prefill_quiz_text', { 
                        detail: { 
                          title: `UPSC Notes: ${note.title.substring(0, 30)}...`, 
                          text: `${note.title}\n\nSubject: ${note.subjectLabel}\n\n${note.content}` 
                        } 
                      }));
                    }, 100);
                  } else {
                    alert('Quiz creation from notes is reserved for authenticated Instructors/Admins.');
                  }
                }}
              />
            )}

            {view === 'community_chat' && (
              <CommunityChat
                userRole={userRole}
                studentName={studentName}
                onBackToDashboard={() => setView(userRole === 'admin' ? 'admin_dashboard' : 'student_join')}
              />
            )}

            {view === 'copy_evaluation' && (
              <CopyEvaluation
                userRole={userRole}
                onBackToDashboard={() => setView(userRole === 'admin' ? 'admin_dashboard' : 'student_join')}
              />
            )}

            {showProfileModal && (
              <StudentProfileModal
                studentName={studentName}
                studentEmail={studentEmail}
                onClose={() => setShowProfileModal(false)}
                onLogout={handleLogout}
              />
            )}

            {/* Student Welcome Modal Popup */}
            {showWelcomeModal && (
              <div className="modal-backdrop" onClick={() => setShowWelcomeModal(false)}>
                <div className="modal-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '2.5rem', borderRadius: 'var(--radius-xl)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                  
                  <button 
                    onClick={() => setShowWelcomeModal(false)}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                  >
                    <X size={22} />
                  </button>

                  {/* Glowing Header Icon */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, var(--primary-indigo), #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)'
                  }}>
                    <Sparkles size={32} color="#ffffff" />
                  </div>

                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    Welcome, <span className="gradient-text">{studentName || 'Student'}</span>! 🎉
                  </h2>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.65', marginBottom: '1.75rem' }}>
                    Welcome to QuizMind! Thank you so much for choosing our platform for your learning and exam preparation. We are thrilled to help you excel with daily quizzes, current affairs, and study materials.
                  </p>

                  <div style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '14px',
                    marginBottom: '1.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--primary-violet)',
                    letterSpacing: '0.5px'
                  }}>
                    from ANISH MANHOTRA
                  </div>

                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, var(--primary-indigo), #a855f7)',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    Get Started 🚀
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
