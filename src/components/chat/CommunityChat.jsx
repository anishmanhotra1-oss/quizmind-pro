import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Shield, Sparkles, Clock, ArrowLeft, RefreshCw, Paperclip, X, Image as ImageIcon, FileText, Download, Eye } from 'lucide-react';

export function CommunityChat({ userRole, studentName, onBackToDashboard }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // { name, type, size, dataUrl }
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUser = userRole === 'admin' ? 'Admin Faculty' : (studentName || 'Student Aspirant');

  useEffect(() => {
    fetchMessages();
    // Fast 2-second real-time global server sync polling across all devices
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 2000);
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
        try {
          localStorage.setItem('QUIZMIND_LOCAL_CHAT', JSON.stringify(data));
        } catch (err) {}
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
        messageText: 'Welcome to QuizMind Community Doubts Chat! Feel free to ask any syllabus questions, doubt clarifications, or attach diagram notes and documents here.',
        attachment: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    localStorage.setItem('QUIZMIND_LOCAL_CHAT', JSON.stringify(initial));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit. Please select a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMsg.trim() && !selectedFile) || sending) return;

    const msgText = inputMsg.trim();
    const attachmentPayload = selectedFile ? { ...selectedFile } : null;

    setInputMsg('');
    setSelectedFile(null);
    setSending(true);

    const newMsgObj = {
      id: 'msg-' + Date.now(),
      senderName: currentUser,
      senderRole: userRole,
      messageText: msgText,
      attachment: attachmentPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistic UI Update
    const updatedMessages = [...messages, newMsgObj];
    setMessages(updatedMessages);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: currentUser,
          senderRole: userRole,
          messageText: msgText,
          attachment: attachmentPayload
        })
      });
      if (res.ok) {
        await fetchMessages(true);
      }
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
              Clarify exam doubts, share diagram notes, attach PDFs/images, and discuss current affairs in real time.
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
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Live Doubts Room • Active as <strong style={{ color: 'var(--primary-indigo)' }}>{currentUser}</strong>
            </span>
            <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.35)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
              ⚡ Global Server Sync (2s)
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
          gap: '1.25rem',
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p>No messages yet. Be the first to ask a doubt or upload a diagram!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isAdmin = msg.senderRole === 'admin';
              const isMe = msg.senderName === currentUser;
              const isImage = msg.attachment && msg.attachment.type && msg.attachment.type.startsWith('image/');

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
                    {/* Render Message Text */}
                    {msg.messageText}

                    {/* Render Attached Image */}
                    {msg.attachment && isImage && (
                      <div style={{ marginTop: msg.messageText ? '0.75rem' : '0' }}>
                        <div 
                          style={{
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            maxHeight: '260px',
                            position: 'relative'
                          }}
                          onClick={() => setPreviewImageModal(msg.attachment.dataUrl)}
                        >
                          <img 
                            src={msg.attachment.dataUrl} 
                            alt={msg.attachment.name} 
                            style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' }} 
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0, 0, 0, 0.65)',
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#ffffff'
                          }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🖼️ {msg.attachment.name}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}><Eye size={12} /> View</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Render Attached Document/PDF */}
                    {msg.attachment && !isImage && (
                      <div style={{ marginTop: msg.messageText ? '0.75rem' : '0' }}>
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                            <FileText size={20} color={isMe ? '#ffffff' : 'var(--primary-indigo)'} />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {msg.attachment.name}
                              </div>
                              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                {msg.attachment.size || 'Document File'}
                              </div>
                            </div>
                          </div>

                          <a
                            href={msg.attachment.dataUrl}
                            download={msg.attachment.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: isMe ? '#ffffff' : 'var(--primary-indigo)',
                              background: 'rgba(255, 255, 255, 0.15)',
                              padding: '0.3rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none'
                            }}
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      </div>
                    )}

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

        {/* Attachment Selection Preview Bar */}
        {selectedFile && (
          <div style={{ 
            padding: '0.6rem 1.25rem', 
            background: 'rgba(99, 102, 241, 0.12)', 
            borderTop: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon size={18} color="var(--primary-indigo)" />
              ) : (
                <FileText size={18} color="var(--primary-indigo)" />
              )}
              <span style={{ fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFile.name}
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({selectedFile.size})</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
              title="Remove attachment"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          id="chat-file-attachment" 
          accept="image/*,.pdf,.docx,.txt,.md" 
          style={{ display: 'none' }}
          onChange={handleFileSelect} 
        />

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ padding: '0.85rem 1.25rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <input
            type="text"
            className="custom-input"
            style={{ flex: 1, height: '46px', fontSize: '0.92rem', minWidth: '180px' }}
            placeholder={`Ask a doubt or send message as ${currentUser}...`}
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
          />

          <button
            type="button"
            className="btn btn-secondary"
            title="Attach Image, PDF, or File"
            onClick={() => document.getElementById('chat-file-attachment').click()}
            style={{ height: '46px', padding: '0 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: selectedFile ? 'var(--primary-indigo)' : 'var(--border-light)', color: selectedFile ? 'var(--primary-indigo)' : 'var(--text-muted)' }}
          >
            <Paperclip size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'inline' }}>
              {selectedFile ? 'File Attached' : 'Attach File'}
            </span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={(!inputMsg.trim() && !selectedFile) || sending}
            style={{ padding: '0 1.4rem', height: '46px', whiteSpace: 'nowrap' }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>

      </div>

      {/* Image Lightbox Preview Modal */}
      {previewImageModal && (
        <div className="modal-backdrop" onClick={() => setPreviewImageModal(null)}>
          <div className="modal-card" style={{ maxWidth: '850px', padding: '1rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-indigo)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>🖼️ Attached Diagram / Image Preview</span>
              <button onClick={() => setPreviewImageModal(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <img src={previewImageModal} alt="Expanded Attachment Preview" style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      )}

    </div>
  );
}

