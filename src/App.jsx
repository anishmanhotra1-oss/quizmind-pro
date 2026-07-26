import React, { useState, useEffect } from 'react';
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
import { updateStudentStats } from './services/student_service';
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
    setStorageItem('QUIZMIND_AUTH', 'true');
    setStorageItem('QUIZMIND_ROLE', 'student');
    setStorageItem('QUIZMIND_STUDENT_NAME', name);
    if (email) setStorageItem('QUIZMIND_STUDENT_EMAIL', email);
    
    setStudentName(name);
    if (email) setStudentEmail(email);
    setUserRole('student');
    setIsAuthenticated(true);
    setView('student_join');
  };

  // Admin Password Protection Handler
  const handleAdminLogin = () => {
    setStorageItem('QUIZMIND_AUTH', 'true');
    setStorageItem('QUIZMIND_ROLE', 'admin');
    
    setUserRole('admin');
    setIsAuthenticated(true);
    setView('admin_dashboard');
  };

  // Logout / Switch User
  const handleLogout = () => {
    removeStorageItem('QUIZMIND_AUTH');
    removeStorageItem('QUIZMIND_ROLE');
    removeStorageItem('QUIZMIND_STUDENT_NAME');
    removeStorageItem('QUIZMIND_STUDENT_EMAIL');
    removeStorageItem('QUIZMIND_VIEW');
    
    setIsAuthenticated(false);
    setUserRole('student');
    setStudentName('');
    setStudentEmail('');
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
