import React, { useState } from 'react';
import { Copy, Check, Trophy, Clock, Share2, Layers } from 'lucide-react';

export function ActiveQuizCard({ quiz, onViewLeaderboard }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quiz.access_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: 'var(--accent-emerald)',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            marginBottom: '0.5rem'
          }}>
            PUBLISHED & ACTIVE
          </span>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{quiz.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              {quiz.time_limit_mins} mins
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={14} />
              {new Date(quiz.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* 6-Digit Access Code Pill */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.2))',
          border: '1px solid var(--border-indigo)',
          borderRadius: 'var(--radius-md)',
          padding: '0.6rem 1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ACCESS CODE
          </div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#a5b4fc',
            fontFamily: 'monospace'
          }}>
            {quiz.access_code}
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-light)',
        marginTop: '0.75rem'
      }}>
        <button 
          className="btn btn-secondary" 
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          onClick={handleCopyCode}
        >
          {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
          {copied ? 'Code Copied!' : 'Copy Code'}
        </button>

        <button 
          className="btn btn-primary" 
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          onClick={() => onViewLeaderboard(quiz)}
        >
          <Trophy size={14} />
          View Live Leaderboard
        </button>
      </div>
    </div>
  );
}
