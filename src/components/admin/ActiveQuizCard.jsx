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
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', position: 'relative' }}>
      
      {/* Top Mobile-Responsive Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        
        {/* Header Title & Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '0.75rem', 
              fontWeight: 800, 
              color: 'var(--accent-emerald)',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.2rem 0.65rem',
              borderRadius: '12px',
              marginBottom: '0.4rem'
            }}>
              PUBLISHED & ACTIVE
            </span>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>{quiz.title}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="var(--primary-indigo)" />
                {quiz.time_limit_mins || 5} mins
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={14} color="var(--primary-violet)" />
                {new Date(quiz.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* High-Contrast 6-Digit Access Code Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(124, 58, 237, 0.22))',
          border: '1.5px solid var(--border-indigo)',
          borderRadius: '14px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CLASSROOM CODE
            </div>
            <div style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              color: '#ffffff',
              fontFamily: 'monospace',
              lineHeight: 1.2
            }}>
              {quiz.access_code}
            </div>
          </div>

          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            onClick={handleCopyCode}
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Action Footer Button */}
      <div style={{ 
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-light)'
      }}>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem 0.85rem', justifyContent: 'center' }}
          onClick={() => onViewLeaderboard(quiz)}
        >
          <Trophy size={16} />
          View Live Leaderboard & Submissions
        </button>
      </div>
    </div>
  );
}
