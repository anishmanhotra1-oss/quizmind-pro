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
      {lastAttemptResult && (() => {
        const totalQ = lastAttemptResult.questions ? lastAttemptResult.questions.length : 5;
        const correctQ = lastAttemptResult.correctCount || 0;
        const incorrectQ = Math.max(0, totalQ - correctQ);

        return (
          <div className="glass-panel" style={{
            padding: '1.5rem 1.75rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(124, 58, 237, 0.15))',
            border: '1px solid var(--border-indigo)',
            boxShadow: 'var(--shadow-violet)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ color: '#a5b4fc', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🎯 Your Final Quiz Results
                </span>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '2.6rem', lineHeight: 1 }} className="gradient-text">
                    {lastAttemptResult.scorePercentage}%
                  </h2>

                  {/* Correct & Incorrect Count Badges */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <CheckCircle2 size={15} /> {correctQ} Correct
                    </span>

                    <span style={{
                      background: 'rgba(244, 63, 94, 0.2)',
                      color: '#f43f5e',
                      border: '1px solid rgba(244, 63, 94, 0.4)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      ✕ {incorrectQ} Incorrect
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem' }}>
                  {correctQ} out of {totalQ} questions answered correctly
                </p>
              </div>

              {/* Responsive Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  border: '1px solid var(--border-light)'
                }}>
                  <Clock size={18} color="var(--accent-cyan)" style={{ marginBottom: '2px' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time Taken</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{lastAttemptResult.timeSpentSeconds}s</div>
                </div>

                <div style={{
                  background: 'var(--bg-card)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  border: '1px solid var(--border-light)'
                }}>
                  <Award size={18} color="var(--accent-amber)" style={{ marginBottom: '2px' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rating</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {lastAttemptResult.scorePercentage >= 90 ? 'Mastery 🏆' : lastAttemptResult.scorePercentage >= 70 ? 'Proficient ✨' : 'Review Needed 📚'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Real-time Leaderboard Table (Admin Only) */}
      {isAdmin ? (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
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
            <div className="table-responsive-wrapper">
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
            </div>
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
