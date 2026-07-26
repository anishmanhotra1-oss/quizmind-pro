import React, { useState } from 'react';
import { Eye, Check, Edit3, Trash2, Send, AlertTriangle } from 'lucide-react';

export function QuizPreviewEditor({ initialQuiz, onPublish, onClose, isPublishing }) {
  const [quizTitle, setQuizTitle] = useState(initialQuiz.quiz_title || 'AI Generated Quiz');
  const [questions, setQuestions] = useState(initialQuiz.questions || []);

  const handleQuestionTextChange = (qIndex, newText) => {
    const updated = [...questions];
    updated[qIndex].question_text = newText;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, newText) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = newText;
    setQuestions(updated);
  };

  const handleCorrectOptionSelect = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correct_option_index = optIndex;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex, newText) => {
    const updated = [...questions];
    updated[qIndex].explanation = newText;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (qIndex) => {
    if (questions.length <= 1) {
      alert('Quiz must contain at least 1 question.');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleFinalPublish = () => {
    onPublish({
      title: quizTitle,
      questions
    });
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        question_text: 'Enter your new custom question here...',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_option_index: 0,
        explanation: 'Detailed concept explanation for this question.'
      }
    ]);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ maxWidth: '850px', maxHeight: '88vh' }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Eye size={24} color="var(--primary-violet)" />
            <h3>Preview & Edit AI Questions</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddQuestion}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              + Add Question
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {questions.length} Questions
            </span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Quiz Title</label>
          <input
            type="text"
            className="custom-input"
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
          />
        </div>

        {/* Question Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {questions.map((q, qIdx) => (
            <div 
              key={qIdx} 
              style={{
                background: 'rgba(15, 17, 26, 0.6)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary-indigo)', fontSize: '0.9rem' }}>
                  Question #{qIdx + 1}
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                  onClick={() => handleDeleteQuestion(qIdx)}
                  title="Remove question"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Question Text */}
              <input
                type="text"
                className="custom-input"
                style={{ fontWeight: 600, marginBottom: '1rem' }}
                value={q.question_text}
                onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
              />

              {/* Options grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correct_option_index === optIdx;
                  return (
                    <div 
                      key={optIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.4rem 0.6rem'
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isCorrect ? 'none' : '1px solid var(--text-dim)',
                          background: isCorrect ? 'var(--accent-emerald)' : 'transparent',
                          color: isCorrect ? 'white' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => handleCorrectOptionSelect(qIdx, optIdx)}
                        title="Set as correct answer"
                      >
                        <Check size={14} />
                      </button>

                      <input
                        type="text"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-main)',
                          outline: 'none',
                          width: '100%',
                          fontSize: '0.9rem'
                        }}
                        value={opt}
                        onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Gemini Explanation */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8rem' }}>AI Explanation</label>
                <textarea
                  className="custom-textarea"
                  rows={2}
                  style={{ fontSize: '0.85rem' }}
                  value={q.explanation}
                  onChange={e => handleExplanationChange(qIdx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isPublishing}>
            Cancel
          </button>
          <button type="button" className="btn btn-emerald" onClick={handleFinalPublish} disabled={isPublishing}>
            <Send size={16} />
            {isPublishing ? 'Publishing...' : 'Publish Quiz & Get Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
