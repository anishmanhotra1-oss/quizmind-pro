import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Shield, Sparkles, Clock, ArrowLeft, RefreshCw } from 'lucide-react';

export function CommunityChat({ userRole, studentName, onBackToDashboard }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = userRole === 'admin' ? 'Admin Faculty' : (studentName || 'Student Aspirant');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/chat/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        fallbackLocalMessages();
      }
    } catch (e) {
      fallbackLocalMessages();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalMessages = () => {
    try {
      const saved = localStorage.getItem('QUIZMIND_LOCAL_CHAT');
      if (saved) {
        setMessages(JSON.parse(saved));
        return;
      }
    } catch (e) {}

    const initial = [
      {
        id: 'msg-1',
        senderName: 'Anish Manhotra (UPSC Faculty)',
        senderRole: 'admin',
        messageText: 'Welcome to QuizMind Community Doubts Chat! Feel free to ask any syllabus questions, doubt clarifications, or exam strategy queries here.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    localStorage.setItem('QUIZMIND_LOCAL_CHAT', JSON.stringify(initial));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;

    const msgText = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    const newMsgObj = {
      id: 'msg-' + Date.now(),
      senderName: currentUser,
      senderRole: userRole,
      messageText: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistic UI Update
    const updatedMessages = [...messages, newMsgObj];
    setMessages(updatedMessages);
    try {
      localStorage.setItem('QUIZMIND_LOCAL_CHAT', JSON.stringify(updatedMessages));
    } catch (err) {}

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: currentUser,
          senderRole: userRole,
          messageText: msgText
        })
      });
    } catch (e) {
      console.warn('Backend server chat API unavailable, saved locally.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickTag = (tagText) => {
    setInputMsg(prev => prev ? `${prev} ${tagText}` : tagText);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '2rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel hero-glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))',
              border: '1px solid var(--border-indigo)',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              color: '#ffffff',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}>
              <MessageSquare size={15} color="var(--accent-cyan)" />
              Live Doubts & Discussion Hub 💬
            </div>

            <h1 style={{ fontSize: '2rem', lineHeight: '1.25', marginBottom: '0.5rem' }}>
              Student & Admin <span className="gradient-text">Community Chat</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '600px', lineHeight: '1.5' }}>
              Clarify your exam doubts, discuss current affairs, ask faculty questions, and connect with fellow aspirants in real time.
            </p>
          </div>

          {onBackToDashboard && (
            <button className="btn btn-secondary" onClick={onBackToDashboard} style={{ padding: '0.65rem 1.1rem', fontSize: '0.88rem' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-indigo)' }}>
        
        {/* Chat Stream Header */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Live Doubts Room • Active as <strong style={{ color: 'var(--primary-indigo)' }}>{currentUser}</strong>
            </span>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={() => fetchMessages()} 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={13} className={loading ? 'spinning' : ''} /> Refresh
          </button>
        </div>

        {/* Message Stream */}
        <div style={{ 
          height: '420px', 
          overflowY: 'auto', 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p>No messages yet. Be the first to ask a doubt!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isAdmin = msg.senderRole === 'admin';
              const isMe = msg.senderName === currentUser;

              return (
                <div 
                  key={msg.id} 
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender Label & Role Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 700, color: isAdmin ? '#f59e0b' : 'var(--text-main)' }}>
                      {msg.senderName}
                    </span>
                    <span style={{
                      background: isAdmin ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: isAdmin ? '#f59e0b' : 'var(--primary-indigo)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      {isAdmin ? 'FACULTY ADMIN' : 'ASPIRANT'}
                    </span>
                    <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isMe 
                      ? 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))'
                      : isAdmin 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))'
                        : 'var(--bg-card)',
                    border: isMe ? 'none' : isAdmin ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-light)',
                    color: isMe ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    boxShadow: isMe ? '0 4px 15px rgba(99, 102, 241, 0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.messageText}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Doubt Topic Chips */}
        <div style={{ padding: '0.65rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            Quick Topics:
          </span>
          {['#PolityDoubt', '#EconomyQuery', '#CurrentAffairs', '#MainsAnswerWriting', '#PrelimsStrategy'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickTag(tag)}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--primary-indigo)',
                borderRadius: '12px',
                padding: '2px 9px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.25rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="custom-input"
            style={{ height: '46px', fontSize: '0.92rem' }}
            placeholder={`Ask a doubt or send message as ${currentUser}...`}
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!inputMsg.trim() || sending}
            style={{ padding: '0 1.4rem', height: '46px', whiteSpace: 'nowrap' }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
}
