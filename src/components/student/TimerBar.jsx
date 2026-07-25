import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export function TimerBar({ totalSeconds, onTimeExpired }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeExpired();
      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsLeft, onTimeExpired]);

  const percentage = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));
  const isWarning = secondsLeft <= 60;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Focus Mode Timer
        </span>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontFamily: 'monospace',
          fontWeight: 800,
          fontSize: '1.1rem',
          color: isWarning ? 'var(--accent-rose)' : 'var(--accent-cyan)'
        }}>
          <Clock size={16} />
          {formattedTime}
        </div>
      </div>

      <div className="timer-bar-wrapper">
        <div 
          className={`timer-bar-fill ${isWarning ? 'warning' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
