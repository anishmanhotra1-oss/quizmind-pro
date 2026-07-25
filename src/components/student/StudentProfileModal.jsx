import React from 'react';
import { User, Mail, Calendar, Award, CheckCircle2, X, LogOut, Sparkles, Trophy } from 'lucide-react';
import { getRegisteredStudents } from '../../services/student_service';

export function StudentProfileModal({ studentName, studentEmail, onClose, onLogout }) {
  const students = getRegisteredStudents();
  const currentStudent = students.find(s => s.name.toLowerCase() === (studentName || '').toLowerCase()) || {
    id: 'std-' + Date.now().toString().slice(-4),
    name: studentName || 'Student Learner',
    email: studentEmail || `${(studentName || 'student').toLowerCase().replace(/\s+/g, '.')}@student.edu`,
    joinedDate: new Date().toISOString().split('T')[0],
    attemptsCount: 0,
    avgScore: 0
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '560px', padding: '2.25rem' }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Student Avatar & Identity Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
          }}>
            {currentStudent.name.charAt(0).toUpperCase()}
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>{currentStudent.name}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary-indigo)', fontWeight: 700, background: 'rgba(99, 102, 241, 0.12)', padding: '0.2rem 0.75rem', borderRadius: '12px' }}>
            Student ID: {currentStudent.id}
          </span>
        </div>

        {/* Profile Info Details List */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="var(--primary-indigo)" /> Email Address
            </span>
            <span style={{ fontWeight: 600 }}>{currentStudent.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--accent-cyan)" /> Member Since
            </span>
            <span style={{ fontWeight: 600 }}>{currentStudent.joinedDate}</span>
          </div>
        </div>

        {/* Academic Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <Trophy size={22} color="var(--accent-amber)" style={{ marginBottom: '4px' }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentStudent.attemptsCount}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quizzes Attempted</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <Award size={22} color="var(--accent-emerald)" style={{ marginBottom: '4px' }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentStudent.avgScore}%</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average Accuracy</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Close Profile
          </button>
          
          <button className="btn btn-secondary" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: 'var(--accent-rose)' }} onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

      </div>
    </div>
  );
}
