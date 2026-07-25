import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Send, HelpCircle } from 'lucide-react';
import { TimerBar } from './TimerBar';
import { QuestionCard } from './QuestionCard';
import { submitQuizAttempt } from '../../services/supabase';

export function QuizWorkspace({ quiz, questions, studentName, onQuizCompleted, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIndex]: selectedOptionIndex }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const timeLimitSeconds = (quiz.time_limit_mins || 5) * 60;

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const calculateAndSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    
    // Calculate Score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correct_option_index) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    try {
      const attemptData = await submitQuizAttempt({
        quizId: quiz.id,
        studentName,
        score: scorePercentage,
        totalQuestions,
        timeSpentSeconds
      });

      onQuizCompleted({
        attempt: attemptData,
        quiz,
        questions,
        userAnswers: answers,
        scorePercentage,
        correctCount,
        timeSpentSeconds
      });
    } catch (err) {
      alert('Error submitting quiz attempt: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', marginBottom: '0.25rem' }}
            onClick={onExit}
          >
            <ArrowLeft size={14} /> Exit Quiz
          </button>
          <h2 style={{ fontSize: '1.5rem' }}>{quiz.title}</h2>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student</div>
          <div style={{ fontWeight: 700, color: 'var(--primary-indigo)' }}>{studentName}</div>
        </div>
      </div>

      {/* Persistent Timer Visual Bar */}
      <TimerBar totalSeconds={timeLimitSeconds} onTimeExpired={calculateAndSubmit} />

      {/* Question Focus Card */}
      <QuestionCard
        question={currentQuestion}
        selectedOptionIndex={answers[currentIndex]}
        onSelectOption={handleSelectOption}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
      />

      {/* Bottom Navigation Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={16} /> Previous
        </button>

        {/* Question Pips */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {questions.map((_, idx) => {
            const isAnswered = answers[idx] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: isCurrent 
                    ? 'var(--primary-indigo)' 
                    : isAnswered 
                      ? 'var(--primary-violet)' 
                      : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isCurrent ? '0 0 10px var(--primary-indigo)' : 'none',
                  transition: 'var(--transition-fast)'
                }}
                title={`Go to Question ${idx + 1}`}
              />
            );
          })}
        </div>

        {currentIndex < totalQuestions - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
          >
            Next Question <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-emerald"
            onClick={calculateAndSubmit}
            disabled={isSubmitting}
          >
            <Send size={16} />
            {isSubmitting ? 'Submitting...' : 'Submit Final Answers'}
          </button>
        )}
      </div>
    </div>
  );
}
