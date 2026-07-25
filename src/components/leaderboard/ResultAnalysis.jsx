import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Sparkles } from 'lucide-react';

export function ResultAnalysis({ questions, userAnswers }) {
  const [openAccordions, setOpenAccordions] = useState(
    questions.reduce((acc, _, idx) => ({ ...acc, [idx]: true }), {})
  );

  const toggleAccordion = (idx) => {
    setOpenAccordions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Sparkles color="var(--primary-violet)" size={22} />
        <h2>Question Breakdown & Gemini Explanations</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.map((q, idx) => {
          const selectedOption = userAnswers[idx];
          const isCorrect = selectedOption === q.correct_option_index;
          const isOpen = openAccordions[idx];
          const letters = ['A', 'B', 'C', 'D'];

          return (
            <div 
              key={idx}
              className="glass-panel"
              style={{ 
                overflow: 'hidden',
                borderColor: isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
              }}
            >
              {/* Header Bar */}
              <div 
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)'
                }}
                onClick={() => toggleAccordion(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {isCorrect ? (
                    <CheckCircle color="var(--accent-emerald)" size={22} />
                  ) : (
                    <XCircle color="var(--accent-rose)" size={22} />
                  )}

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Question #{idx + 1} • {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>
                    <h4 style={{ fontSize: '1rem', marginTop: '2px', color: 'var(--text-main)' }}>
                      {q.question_text}
                    </h4>
                  </div>
                </div>

                {isOpen ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
              </div>

              {/* Accordion Content */}
              {isOpen && (
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
                  <div className="result-options-grid">
                    {q.options.map((optText, optIdx) => {
                      const isUserChoice = selectedOption === optIdx;
                      const isCorrectChoice = q.correct_option_index === optIdx;

                      let cardStyle = 'option-card';
                      if (isCorrectChoice) cardStyle += ' correct';
                      else if (isUserChoice && !isCorrectChoice) cardStyle += ' incorrect';

                      return (
                        <div key={optIdx} className={cardStyle} style={{ cursor: 'default', margin: 0 }}>
                          <div className="option-badge">
                            {letters[optIdx]}
                          </div>
                          <span style={{ fontSize: '0.9rem', flex: 1 }}>{optText}</span>
                          {isUserChoice && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: isCorrectChoice ? 'var(--accent-emerald)' : 'var(--accent-rose)', color: 'white' }}>
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Gemini Explanation Box */}
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid var(--border-indigo)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)'
                  }}>
                    <strong style={{ color: 'var(--primary-indigo)', display: 'block', marginBottom: '4px' }}>
                      💡 Gemini AI Explanation:
                    </strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
