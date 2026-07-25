import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function QuestionCard({ question, selectedOptionIndex, onSelectOption, questionNumber, totalQuestions }) {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.25rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <span style={{ 
          background: 'rgba(99, 102, 241, 0.15)', 
          color: '#a5b4fc', 
          fontWeight: 700, 
          padding: '0.25rem 0.75rem', 
          borderRadius: '12px' 
        }}>
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      <h3 style={{ 
        fontSize: '1.25rem', 
        lineHeight: '1.6', 
        marginBottom: '1.75rem',
        color: 'var(--text-main)'
      }}>
        {question.question_text}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {question.options.map((optionText, optIdx) => {
          const isSelected = selectedOptionIndex === optIdx;
          return (
            <div
              key={optIdx}
              className={`option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectOption(optIdx)}
            >
              <div className="option-badge">
                {letters[optIdx] || optIdx + 1}
              </div>
              <span style={{ flex: 1, fontSize: '0.98rem', fontWeight: isSelected ? 600 : 400 }}>
                {optionText}
              </span>
              {isSelected && <CheckCircle2 size={20} color="var(--primary-indigo)" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
