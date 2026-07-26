import React, { useState } from 'react';
import { Sparkles, Terminal, FileText, Upload, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';
import { extractTextFromFile } from '../../services/document_parser';

export function DocumentUploader({ onTextExtracted, isParsing }) {
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'file'
  const [topicPrompt, setTopicPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const PRESET_TOPICS = [
    { label: '🏛️ Indian Polity & Fundamental Rights', prompt: 'Indian Polity: Fundamental Rights, Reasonable Restrictions, and Key Supreme Court Rulings (Art 12-35)' },
    { label: '📊 Monetary Policy & Inflation (RBI)', prompt: 'Indian Economy: RBI Monetary Policy Committee (MPC), Repo Rate, Flexible Inflation Targeting, and LAF Mechanisms' },
    { label: '⚛️ National Quantum Mission 2026', prompt: 'Science & Technology: National Quantum Mission (NQM) 2026, Qubit Computing, Quantum Communication, and T-Hubs' },
    { label: '📜 Bhakti & Sufi Movement', prompt: 'History & Culture: Bhakti and Sufi Movements in Medieval India, Nirguna & Saguna Saints, and Cultural Impact' },
    { label: '🌊 ENSO & Indian Monsoon Mechanics', prompt: 'Geography & Environment: El Nino, La Nina, Indian Ocean Dipole (IOD), and Impact on Agriculture' }
  ];

  const handleCommandGenerate = (e) => {
    e.preventDefault();
    if (!topicPrompt.trim()) {
      setErrorMessage('Please enter a topic command or select a quick preset topic.');
      return;
    }

    setErrorMessage('');
    const promptText = topicPrompt.trim();
    const shortTitle = promptText.split(':')[0].substring(0, 35);
    onTextExtracted(promptText, `AI Quiz: ${shortTitle}`);
  };

  const handleFileUploadGenerate = async (fileToProcess) => {
    const file = fileToProcess || selectedFile;
    if (!file) {
      setErrorMessage('Please select a PDF, Word (.docx), or Text file to upload.');
      return;
    }

    setIsExtracting(true);
    setErrorMessage('');

    try {
      const extractedText = await extractTextFromFile(file);
      if (!extractedText || extractedText.length < 15) {
        throw new Error('Could not extract readable text from document file.');
      }
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      onTextExtracted(extractedText, `Quiz: ${cleanTitle}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to extract text from document file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSelectPreset = (presetPrompt) => {
    setTopicPrompt(presetPrompt);
    setErrorMessage('');
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(99, 102, 241, 0.35)' }}>
      
      {/* Studio Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-indigo)', padding: '0.3rem 0.85rem', borderRadius: '16px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Zap size={14} color="var(--primary-indigo)" />
            ADMIN PRO AI QUIZ STUDIO
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles color="var(--primary-indigo)" size={24} />
            Interactive AI Quiz Generator Studio
          </h3>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', maxWidth: '780px' }}>
            Exclusively for Instructors & Admins: Generate standard classroom quizzes on any custom topic command or by parsing uploaded PDF & Word documents.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0, 0, 0, 0.12)', padding: '4px', borderRadius: '12px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('command'); setErrorMessage(''); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'command' ? 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))' : 'transparent',
              color: activeTab === 'command' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Terminal size={15} />
            Topic Command Mode
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('file'); setErrorMessage(''); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: activeTab === 'file' ? 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))' : 'transparent',
              color: activeTab === 'file' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Upload size={15} />
            PDF / Word File Parser
          </button>
        </div>
      </div>

      {/* Mode 1: Topic Command & Prompt Studio */}
      {activeTab === 'command' && (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              💡 Quick High-Yield UPSC Topics On Command:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PRESET_TOPICS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(item.prompt)}
                  style={{
                    background: topicPrompt === item.prompt ? 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))' : 'rgba(255, 255, 255, 0.05)',
                    border: topicPrompt === item.prompt ? '1px solid #6366f1' : '1px solid var(--border-light)',
                    color: topicPrompt === item.prompt ? '#ffffff' : 'var(--text-main)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCommandGenerate}>
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label" style={{ fontWeight: 700 }}>
                Enter Topic Command / Custom Prompt:
              </label>
              <textarea
                className="custom-textarea"
                style={{ 
                  height: '110px', 
                  fontSize: '0.95rem', 
                  fontFamily: 'monospace',
                  lineHeight: '1.5',
                  borderColor: 'rgba(99, 102, 241, 0.4)' 
                }}
                placeholder="e.g. Generate 5 medium-level UPSC questions on Constitutional Amendments (1st to 106th) or paste custom notes text here..."
                value={topicPrompt}
                onChange={(e) => { setTopicPrompt(e.target.value); setErrorMessage(''); }}
              />
            </div>

            {errorMessage && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.88rem'
              }}>
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isParsing || isExtracting}
                style={{
                  padding: '0.85rem 1.6rem',
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
                  border: 'none',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)'
                }}
              >
                <Sparkles size={18} />
                Generate Interactive Quiz on Command 🚀
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode 2: PDF & Word Document File Parser */}
      {activeTab === 'file' && (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <div style={{
            border: '2px dashed var(--border-indigo)',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            background: 'rgba(99, 102, 241, 0.04)',
            marginBottom: '1.25rem',
            position: 'relative'
          }}>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                  handleFileUploadGenerate(file);
                }
              }}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />

            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Upload size={26} color="var(--primary-indigo)" />
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Upload Study Document (PDF, Word .docx, or Text)
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 1rem auto' }}>
              Drag & drop any syllabus PDF, Word document, or text handout. Our text parser will automatically generate conceptual MCQs directly grounded in your document.
            </p>

            {selectedFile && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-indigo)', padding: '0.4rem 0.95rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
              </div>
            )}
          </div>

          {errorMessage && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.88rem'
            }}>
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => handleFileUploadGenerate()}
              className="btn btn-primary"
              disabled={isParsing || isExtracting}
              style={{
                padding: '0.85rem 1.6rem',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
                border: 'none',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)'
              }}
            >
              <Sparkles size={18} />
              {isExtracting ? 'Extracting & Generating Quiz...' : 'Parse Document & Generate Quiz 🚀'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

