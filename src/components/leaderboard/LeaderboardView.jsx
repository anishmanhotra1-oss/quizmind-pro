import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Award, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchLeaderboard, subscribeToLeaderboard } from '../../services/supabase';
import { ResultAnalysis } from './ResultAnalysis';

export function LeaderboardView({ quiz, lastAttemptResult, onBack, isAdmin }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lastAttemptResult && lastAttemptResult.scorePercentage >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [lastAttemptResult]);

  const loadScores = async () => {
    if (!quiz) return;
    setLoading(true);
    try {
      const data = await fetchLeaderboard(quiz.id);
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();

    if (!quiz) return;
    const unsubscribe = subscribeToLeaderboard(quiz.id, (updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [quiz]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      <button
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}
        onClick={onBack}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Quiz Summary Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem' }}>{quiz ? quiz.title : 'Live Quiz Leaderboard'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Real-time global and classroom leaderboard rankings.
        </p>
      </div>

      {/* Student Score Card (if just finished quiz) */}
      {lastAttemptResult && (
        <div className="glass-panel" style={{
          padding: '2rem',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(124, 58, 237, 0.15))',
          border: '1px solid var(--border-indigo)',
          boxShadow: 'var(--shadow-violet)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Final Performance
              </span>
              <h2 style={{ fontSize: '2.5rem', marginTop: '0.2rem' }} className="gradient-text">
                {lastAttemptResult.scorePercentage}%
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {lastAttemptResult.correctCount} of {lastAttemptResult.questions.length} questions answered correctly
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(15, 17, 26, 0.6)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px solid var(--border-light)'
              }}>
                <Clock size={20} color="var(--accent-cyan)" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time Spent</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{lastAttemptResult.timeSpentSeconds}s</div>
              </div>

              <div style={{
                background: 'rgba(15, 17, 26, 0.6)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px solid var(--border-light)'
              }}>
                <Award size={20} color="var(--accent-amber)" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rating</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {lastAttemptResult.scorePercentage >= 90 ? 'Mastery 🏆' : lastAttemptResult.scorePercentage >= 70 ? 'Proficient ✨' : 'Review Needed 📚'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Leaderboard Table (Admin Only) */}
      {isAdmin ? (
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy color="var(--accent-amber)" size={24} />
              <h2>Classroom Leaderboard (Admin Access)</h2>
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              onClick={loadScores}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Syncing leaderboard scores...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No attempts recorded for this quiz yet.
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Student Name</th>
                  <th>Score</th>
                  <th>Time Spent</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={item.id || index}>
                      <td>
                        <div className={`rank-badge rank-${rank}`}>
                          {rank}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.student_name}</td>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          color: item.score >= 80 ? 'var(--accent-emerald)' : 'var(--text-main)',
                          fontFamily: 'monospace'
                        }}>
                          {item.score}%
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {item.time_spent_seconds}s
                      </td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid var(--border-indigo)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          <Trophy size={20} color="var(--accent-amber)" />
          <span>Full classroom score leaderboards are managed privately by your Instructor / Admin.</span>
        </div>
      )}

      {/* Question Breakdown Accordion */}
      {lastAttemptResult && (
        <ResultAnalysis
          questions={lastAttemptResult.questions}
          userAnswers={lastAttemptResult.userAnswers}
        />
      )}
    </div>
  );
}
