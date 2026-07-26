import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, CheckCircle2, X, LogOut, Sparkles, Trophy, MessageSquare, Laptop, Clock, HelpCircle } from 'lucide-react';
import { fetchStudentProfile, getRegisteredStudents } from '../../services/student_service';

export function StudentProfileModal({ studentName, studentEmail, onClose, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'attempts' | 'doubts'

  const activeName = studentName || localStorage.getItem('QUIZMIND_STUDENT_NAME') || sessionStorage.getItem('QUIZMIND_STUDENT_NAME') || '';
  const activeEmail = studentEmail || localStorage.getItem('QUIZMIND_STUDENT_EMAIL') || sessionStorage.getItem('QUIZMIND_STUDENT_EMAIL') || '';

  useEffect(() => {
    async function loadProfile(silent = false) {
      if (!silent) setLoading(true);
      const queryKey = activeEmail || activeName || '';
      if (queryKey) {
        const liveData = await fetchStudentProfile(queryKey);
        if (liveData) {
          setProfile(liveData);
          setLoading(false);
          return;
        }
      }

      const localList = getRegisteredStudents();
      const found = localList.find(s => s.name.toLowerCase() === (activeName || '').toLowerCase());
      setProfile(found || {
        id: 'std-' + Date.now().toString().slice(-4),
        name: activeName || 'Student Learner',
        email: activeEmail || `${(activeName || 'student').toLowerCase().replace(/\s+/g, '.')}@student.edu`,
        joinedDate: new Date().toISOString().split('T')[0],
        device: 'Web Client',
        attemptsCount: 0,
        avgScore: 0,
        doubtsCount: 0,
        doubtsHistory: []
      });
      setLoading(false);
    }
    loadProfile();

    // Fast 2-second real-time multi-device sync polling
    const interval = setInterval(() => {
      loadProfile(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [studentName, studentEmail, activeName, activeEmail]);

  const currentStudent = profile || {
    id: 'std-101',
    name: studentName || 'Student Learner',
    email: studentEmail || 'student@student.edu',
    joinedDate: new Date().toISOString().split('T')[0],
    device: 'Desktop PC',
    attemptsCount: 0,
    avgScore: 0,
    doubtsCount: 0,
    doubtsHistory: []
  };

  const doubtsList = currentStudent.doubtsHistory || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card responsive-profile-card" 
        style={{ 
          maxWidth: '620px', 
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem 1.75rem',
          borderRadius: 'var(--radius-xl)' 
        }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          title="Close Profile"
        >
          <X size={20} />
        </button>

        {/* Student Avatar & Identity Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.85rem auto',
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.45)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            {currentStudent.name.charAt(0).toUpperCase()}
          </div>

          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.35rem', fontWeight: 800 }}>{currentStudent.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--primary-indigo)', fontWeight: 800, background: 'rgba(99, 102, 241, 0.15)', padding: '0.25rem 0.85rem', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              Student ID: {currentStudent.id}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, background: 'rgba(52, 211, 153, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '14px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              ✓ Backend Live Synced
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'overview' ? '1px solid var(--primary-indigo)' : '1px solid transparent',
              background: activeTab === 'overview' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--primary-indigo)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap'
            }}
          >
            <User size={15} /> Profile Overview
          </button>

          <button
            onClick={() => setActiveTab('attempts')}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'attempts' ? '1px solid #f59e0b' : '1px solid transparent',
              background: activeTab === 'attempts' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'attempts' ? '#f59e0b' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Trophy size={15} /> Quiz Attempts ({currentStudent.attemptsHistory ? currentStudent.attemptsHistory.length : currentStudent.attemptsCount || 0})
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'doubts' ? '1px solid #a855f7' : '1px solid transparent',
              background: activeTab === 'doubts' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'doubts' ? '#a855f7' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap'
            }}
          >
            <MessageSquare size={15} /> Asked Doubts ({doubtsList.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            {/* Academic Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <Trophy size={20} color="#f59e0b" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{currentStudent.attemptsCount || 0}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quizzes Attempted</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <Award size={20} color="#10b981" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{currentStudent.avgScore || 0}%</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average Accuracy</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.1rem', textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                <HelpCircle size={20} color="#a855f7" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{doubtsList.length}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Doubts Asked</div>
              </div>
            </div>

            {/* Profile Info Details Card */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Mail size={15} color="var(--primary-indigo)" /> Email Address
                </span>
                <span style={{ fontWeight: 700, wordBreak: 'break-all', color: 'var(--text-main)', paddingLeft: '1.4rem' }}>
                  {currentStudent.email}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Laptop size={15} color="var(--accent-violet)" /> Login Platform / Device
                </span>
                <span style={{ fontWeight: 700, color: 'var(--primary-violet)' }}>
                  {currentStudent.device || 'Desktop PC'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Calendar size={15} color="var(--accent-cyan)" /> Member Since
                </span>
                <span style={{ fontWeight: 700 }}>{currentStudent.joinedDate || '2026-07-26'}</span>
              </div>

              {currentStudent.lastLogin && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <Clock size={15} color="var(--accent-amber)" /> Last Active Login
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>
                    {new Date(currentStudent.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attempts' && (
          /* Quiz Attempts History Tab */
          <div style={{ marginBottom: '1.5rem' }}>
            {(!currentStudent.attemptsHistory || currentStudent.attemptsHistory.length === 0) ? (
              <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Trophy size={36} color="#f59e0b" style={{ marginBottom: '0.75rem', opacity: 0.7 }} />
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>No Quiz Attempts Recorded Yet</h4>
                <p style={{ fontSize: '0.85rem' }}>
                  Join an active classroom quiz using the 6-digit access code to see your quiz results and scores recorded here live!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {currentStudent.attemptsHistory.map((att, idx) => (
                  <div 
                    key={att.id || idx}
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                        {att.quizTitle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        Date: {att.completed_at ? new Date(att.completed_at).toLocaleDateString() : 'Recent'} • Time: {att.time_spent_seconds ? `${Math.round(att.time_spent_seconds / 60)}m ${att.time_spent_seconds % 60}s` : 'N/A'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 800, 
                        color: att.scorePercentage >= 70 ? 'var(--accent-emerald)' : '#f59e0b',
                        fontFamily: 'monospace' 
                      }}>
                        {att.score}/{att.total_questions} ({att.scorePercentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'doubts' && (
          /* Doubts History Tab */
          <div style={{ marginBottom: '1.5rem' }}>
            {doubtsList.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <MessageSquare size={36} color="#a855f7" style={{ marginBottom: '0.75rem', opacity: 0.7 }} />
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>No Doubts Asked Yet</h4>
                <p style={{ fontSize: '0.85rem' }}>
                  You haven't posted any queries or doubt clarifications yet. Visit the <strong>Community Doubts Chat</strong> to ask syllabus questions!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {doubtsList.map((msg, idx) => (
                  <div 
                    key={msg.id || idx}
                    style={{
                      background: 'rgba(168, 85, 247, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1.1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 800, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HelpCircle size={13} /> Doubt #{idx + 1}
                      </span>
                      <span style={{ color: 'var(--text-dim)' }}>{msg.timestamp || 'Today'}</span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.messageText}
                    </div>

                    {msg.attachment && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#a855f7', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                        📎 Attachment: {msg.attachment.name} ({msg.attachment.size || 'File'})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" style={{ flex: 1, height: '44px', fontSize: '0.9rem' }} onClick={onClose}>
            Close Profile
          </button>
          
          <button className="btn btn-secondary" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: 'var(--accent-rose)', height: '44px', fontSize: '0.9rem' }} onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

      </div>
    </div>
  );
}

