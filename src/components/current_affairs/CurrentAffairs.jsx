import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Search, Globe, Landmark, Earth, Atom, 
  TrendingUp, Trophy, Leaf, Sparkles, Bookmark, BookmarkCheck, 
  ChevronRight, ArrowLeft, Clock, Share2, Check, ExternalLink, Zap, Flame, Radio
} from 'lucide-react';
import { CATEGORIES, fetchCurrentAffairs } from '../../services/current_affairs_service';

export function CurrentAffairs({ onGenerateQuizFromArticle, onBackToDashboard }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Bookmarks state (saved in localStorage)
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('QUIZMIND_CA_BOOKMARKS');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [copiedId, setCopiedId] = useState(null);
  const [topBreakingArticles, setTopBreakingArticles] = useState([]);

  // Fetch top breaking headlines for the ticker on mount
  useEffect(() => {
    const loadTickerHeadlines = async () => {
      try {
        const topData = await fetchCurrentAffairs({ category: 'all' });
        setTopBreakingArticles(topData);
      } catch (e) {
        console.warn('Failed to load breaking ticker headlines:', e);
      }
    };
    loadTickerHeadlines();
  }, []);

  useEffect(() => {
    loadArticles();
    // Auto-refresh live news feed every 5 minutes
    const interval = setInterval(() => {
      loadArticles();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeCategory, searchQuery]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await fetchCurrentAffairs({ category: activeCategory, searchQuery });
      setArticles(data);
      if (topBreakingArticles.length === 0 && data.length > 0) {
        setTopBreakingArticles(data);
      }
    } catch (err) {
      console.error('Failed to load current affairs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (articleId) => {
    let updated;
    if (bookmarks.includes(articleId)) {
      updated = bookmarks.filter(id => id !== articleId);
    } else {
      updated = [...bookmarks, articleId];
    }
    setBookmarks(updated);
    localStorage.setItem('QUIZMIND_CA_BOOKMARKS', JSON.stringify(updated));
  };

  const handleShare = (article) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title}\n\nRead on QuizMind Current Affairs Sphere`);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Helper to render category icon
  const renderCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Landmark': return <Landmark size={16} />;
      case 'Earth': return <Earth size={16} />;
      case 'Atom': return <Atom size={16} />;
      case 'TrendingUp': return <TrendingUp size={16} />;
      case 'Trophy': return <Trophy size={16} />;
      case 'Leaf': return <Leaf size={16} />;
      default: return <Globe size={16} />;
    }
  };

  // Helper for category badge class
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'national': return 'badge-cat-national';
      case 'international': return 'badge-cat-international';
      case 'science': return 'badge-cat-science';
      case 'economy': return 'badge-cat-economy';
      case 'sports': return 'badge-cat-sports';
      case 'environment': return 'badge-cat-environment';
      default: return 'badge-cat-international';
    }
  };

  // Helper for card top accent border
  const getCardAccentClass = (category) => {
    switch (category) {
      case 'national': return 'card-accent-national';
      case 'international': return 'card-accent-international';
      case 'science': return 'card-accent-science';
      case 'economy': return 'card-accent-economy';
      case 'sports': return 'card-accent-sports';
      case 'environment': return 'card-accent-environment';
      default: return 'card-accent-international';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Premium Hero Header Section */}
      <div className="glass-panel hero-glass-panel">
        {/* Glowing Background Mesh Orbs */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '20%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.3))', 
                padding: '0.4rem 0.95rem', 
                borderRadius: '20px', 
                border: '1px solid var(--border-indigo)', 
                fontSize: '0.85rem', 
                color: '#ffffff', 
                fontWeight: 700,
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
              }}>
                <Flame size={16} color="#f59e0b" />
                Current Affairs Sphere 📰
              </div>

              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#34d399', 
                border: '1px solid rgba(16, 185, 129, 0.4)', 
                padding: '0.35rem 0.85rem', 
                borderRadius: '20px', 
                fontSize: '0.8rem', 
                fontWeight: 700 
              }}>
                <Radio size={14} color="#34d399" />
                Live Daily News Stream Active
              </div>
            </div>

            <h1 style={{ fontSize: '2.3rem', marginBottom: '0.65rem', lineHeight: '1.2' }}>
              Daily Knowledge & <span className="gradient-text">Breaking News Digest</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '680px', lineHeight: '1.6' }}>
              Stay updated with curated educational current affairs, national polity, international updates, science & technology, and economy news for exam preparation.
            </p>
          </div>

          {onBackToDashboard && (
            <button className="btn btn-secondary" onClick={onBackToDashboard} style={{ padding: '0.7rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Permanent Breaking News Marquee Ticker Across All Categories */}
      {(() => {
        const tickerItems = topBreakingArticles.length > 0 ? topBreakingArticles : articles;
        if (tickerItems.length === 0) return null;
        return (
          <div className="news-ticker-container">
            <div className="news-ticker-badge">
              <Radio size={13} />
              Breaking News
            </div>
            <div className="news-ticker-scroll-area">
              <div className="news-ticker-content">
                {tickerItems.slice(0, 8).concat(tickerItems.slice(0, 8)).map((art, idx) => (
                  <span 
                    key={`${art.id}-${idx}`} 
                    onClick={() => setSelectedArticle(art)}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>•</span> {art.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Search & Vibrant Category Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="custom-input"
              style={{ paddingLeft: '3rem', height: '48px', fontSize: '0.95rem' }}
              placeholder="Search current affairs by keyword, organization, or topic (e.g. ISRO, RBI, Climate, Sports)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Color-Coded Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '24px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid var(--border-light)',
                    background: isActive 
                      ? 'linear-gradient(135deg, var(--primary-indigo), var(--primary-violet-dark))' 
                      : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    boxShadow: isActive ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none'
                  }}
                >
                  {renderCategoryIcon(cat.icon)}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Article Detail Reader View */}
      {selectedArticle ? (
        <div className={`glass-panel ${getCardAccentClass(selectedArticle.category)}`} style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedArticle(null)}
            style={{ marginBottom: '1.75rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to All Current Affairs
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span className={`status-badge ${getCategoryBadgeClass(selectedArticle.category)}`}>
              {selectedArticle.categoryName}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={15} /> {selectedArticle.date} • {selectedArticle.readTime} • Source: <strong>{selectedArticle.source || 'Global Media'}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', lineHeight: '1.3' }}>
            {selectedArticle.title}
          </h1>

          {/* Key Highlights Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))',
            borderLeft: '4px solid var(--primary-indigo)',
            padding: '1.5rem 1.75rem',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            marginBottom: '2.25rem'
          }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.85rem', color: 'var(--primary-indigo)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} /> Key Takeaways for Exam Prep
            </h4>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.75' }}>
              {selectedArticle.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Full Article Content */}
          <div style={{ fontSize: '1.05rem', lineHeight: '1.85', color: 'var(--text-main)', marginBottom: '2.5rem', whiteSpace: 'pre-line' }}>
            {selectedArticle.content}
          </div>

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.75rem',
            borderTop: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => toggleBookmark(selectedArticle.id)}
                style={{ fontSize: '0.88rem' }}
              >
                {bookmarks.includes(selectedArticle.id) ? (
                  <>
                    <BookmarkCheck size={16} color="var(--accent-emerald)" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    Save Bookmark
                  </>
                )}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => handleShare(selectedArticle)}
                style={{ fontSize: '0.88rem' }}
              >
                {copiedId === selectedArticle.id ? <Check size={16} color="var(--accent-emerald)" /> : <Share2 size={16} />}
                {copiedId === selectedArticle.id ? 'Copied Link!' : 'Share Article'}
              </button>
            </div>

            {/* Generate Quiz from Article Button */}
            {onGenerateQuizFromArticle && (
              <button
                className="btn btn-emerald"
                onClick={() => onGenerateQuizFromArticle(selectedArticle)}
                style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}
              >
                <Zap size={18} />
                Generate Quiz On This Topic
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Grid List of Articles with Vivid Cards & Top Accent Colors */
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <Newspaper className="spinning" size={36} style={{ marginBottom: '1rem', color: 'var(--primary-indigo)' }} />
              <p style={{ fontSize: '1.05rem' }}>Fetching live current affairs and breaking bulletins...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: 'var(--radius-xl)' }}>
              <Globe size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
              <h3>No Current Affairs Found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Try searching for a different keyword or select another category filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.75rem' }}>
              {articles.map(article => {
                const isBookmarked = bookmarks.includes(article.id);
                return (
                  <div
                    key={article.id}
                    className={`glass-panel ca-card-interactive ${getCardAccentClass(article.category)}`}
                    style={{
                      padding: '1.65rem',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div>
                      {/* Badge & Date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span className={`status-badge ${getCategoryBadgeClass(article.category)}`}>
                          {article.categoryName}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isBookmarked ? '#f59e0b' : 'var(--text-dim)',
                            padding: '4px'
                          }}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                        >
                          {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                        </button>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.85rem', lineHeight: '1.4', color: 'var(--text-main)' }}>
                        {article.title}
                      </h3>

                      {/* Summary */}
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                        {article.summary}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1.1rem',
                      borderTop: '1px solid var(--border-light)',
                      fontSize: '0.82rem',
                      color: 'var(--text-dim)'
                    }}>
                      <span>{article.date} • {article.readTime}</span>
                      <span style={{ color: 'var(--primary-indigo)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Read Article <ChevronRight size={15} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
