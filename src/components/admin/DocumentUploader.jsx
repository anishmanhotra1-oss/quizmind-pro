import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { extractTextFromFile } from '../../services/document_parser';

export function DocumentUploader({ onTextExtracted, isParsing }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parseError, setParseError] = useState('');

  const processFile = async (file) => {
    if (!file) return;
    setSelectedFileName(file.name);
    setParseError('');

    try {
      const extractedText = await extractTextFromFile(file);
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error('Could not extract sufficient text from document. Ensure file is not empty or encrypted.');
      }
      onTextExtracted(extractedText, file.name);
    } catch (err) {
      setParseError(err.message || 'Error processing document.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText color="var(--primary-indigo)" size={20} />
        Document Uploader & Quiz Generator
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Upload course materials, lecture notes, or textbook extracts (PDF, DOCX, TXT) to generate a structured quiz.
      </p>

      <div
        className={`dropzone ${isDragOver ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input-element').click()}
      >
        <input
          type="file"
          id="file-input-element"
          accept=".pdf,.docx,.txt,.md"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <UploadCloud size={32} color="var(--primary-indigo)" />
        </div>

        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
          {selectedFileName ? selectedFileName : 'Drag & drop document here, or click to browse'}
        </h4>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Supports PDF, DOCX, and TXT files (Up to 15MB)
        </p>
      </div>

      {parseError && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.85rem', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          {parseError}
        </div>
      )}
    </div>
  );
}
