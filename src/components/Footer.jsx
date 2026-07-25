import React from 'react';
import { Brain, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      padding: '2rem 1.5rem',
      marginTop: 'auto',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        
        {/* Brand & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.35)'
          }}>
            <Brain size={18} color="#ffffff" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
            QuizMind <span className="gradient-text">Pro</span>
          </span>
        </div>

        {/* Curated By Anish Manhotra Highlighted Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 1rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.15))',
          border: '1px solid var(--border-indigo)',
          fontSize: '0.88rem',
          fontWeight: 600,
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)'
        }}>
          <Sparkles size={15} color="#f59e0b" />
          <span style={{ color: 'var(--text-muted)' }}>Curated by</span>
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: '0.02em'
          }}>
            Anish Manhotra
          </span>
        </div>

        {/* Copyright */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          © {new Date().getFullYear()} QuizMind Pro • All rights reserved.
        </div>

      </div>
    </footer>
  );
}
