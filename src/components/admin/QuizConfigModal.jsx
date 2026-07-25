import React, { useState } from 'react';
import { Sliders, Sparkles, Clock, HelpCircle } from 'lucide-react';

export function QuizConfigModal({ defaultTitle, onGenerate, onClose, isGenerating }) {
  const [title, setTitle] = useState(defaultTitle || 'Document Assessment Quiz');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimitMins, setTimeLimitMins] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      title,
      numQuestions: Number(numQuestions),
      difficulty,
      timeLimitMins: Number(timeLimitMins)
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Sliders size={24} color="var(--primary-indigo)" />
          <h3>Configure Quiz Generator</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Quiz Title</label>
            <input
              type="text"
              className="custom-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">
                <HelpCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Number of Questions
              </label>
              <select
                className="custom-select"
                value={numQuestions}
                onChange={e => setNumQuestions(e.target.value)}
              >
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={8}>8 Questions (Detailed)</option>
                <option value={10}>10 Questions (Full Assessment)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Difficulty Level</label>
              <select
                className="custom-select"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="hard">Hard (Advanced Analytical)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Time Limit (Minutes)
            </label>
            <select
              className="custom-select"
              value={timeLimitMins}
              onChange={e => setTimeLimitMins(e.target.value)}
            >
              <option value={3}>3 Minutes</option>
              <option value={5}>5 Minutes</option>
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isGenerating}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Sparkles size={16} className="spin-icon" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
