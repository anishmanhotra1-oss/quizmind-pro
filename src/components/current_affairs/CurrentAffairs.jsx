import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Search, Globe, Landmark, Earth, Atom, 
  TrendingUp, Trophy, Leaf, Sparkles, Bookmark, BookmarkCheck, 
  ChevronRight, ArrowLeft, Clock, Share2, Check, ExternalLink, Zap, Flame, Radio,
  RefreshCw, Plus, Download, FileText, Upload, Trash2, X
} from 'lucide-react';
import { 
  CATEGORIES, fetchCurrentAffairs, addCustomCurrentAffairs, deleteCustomCurrentAffairs,
  getCADocuments, addCADocument, deleteCADocument, fetchLiveCADocuments, fetchLiveCustomCurrentAffairs,
  fetchCADocumentById
} from '../../services/current_affairs_service';
import { FormattedContentRenderer } from '../common/FormattedContentRenderer';

export function CurrentAffairs({ userRole, onGenerateQuizFromArticle, onBackToDashboard }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Bookmarks state
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

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('all');
  const [docFileType, setDocFileType] = useState('pdf');
  const [docContentText, setDocContentText] = useState('');

  // Native File Picker state
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileData, setSelectedFileData] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');

  // Upload Progress & Status State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  // Admin Add Article Modal state
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('national');
  const [newSource, setNewSource] = useState('PIB Delhi / Editorial');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    loadArticles();
    loadDocuments();

    // Auto-update every 3 seconds for live multi-device sync
    const pollInterval = setInterval(() => {
      loadArticles(true);
      loadDocuments();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeCategory]);

  const loadArticles = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  };

  const loadDocuments = async () => {
    const docs = await fetchLiveCADocuments();
    setDocuments(docs || []);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/current-affairs/rss-refresh', { method: 'POST' });
    } catch (e) {}
    await loadArticles();
    setIsRefreshing(false);
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

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please fill out the article title and content.');
      return;
    }

    await addCustomCurrentAffairs({
      title: newTitle.trim(),
      category: newCategory,
      source: newSource.trim(),
      sourceUrl: newSourceUrl.trim(),
      summary: newSummary.trim(),
      content: newContent.trim()
    });

    setNewTitle('');
    setNewSourceUrl('');
    setNewSummary('');
    setNewContent('');
    setShowAddArticleModal(false);
    await loadArticles();
  };

  const handleDeleteArticle = async (e, articleId) => {
    e.stopPropagation();
    if (userRole !== 'admin') {
      alert('Only Admin users can delete current affairs articles.');
      return;
    }
    if (window.confirm('Delete this published current affairs article?')) {
      const updated = await deleteCustomCurrentAffairs(articleId, userRole);
      setArticles(updated || []);
      if (selectedArticle && selectedArticle.id === articleId) setSelectedArticle(null);
    }
  };

  // Native File Picker handler for mobile & desktop with 15MB limit check
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 15 MB upload limit. Please select a document smaller than 15 MB.`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);

    // Format size
    const sizeMB = file.size / (1024 * 1024);
    const formattedSize = sizeMB >= 1 
      ? `${sizeMB.toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    setSelectedFileSize(formattedSize);

    // Auto extension
    const ext = file.name.split('.').pop().toLowerCase();
    setDocFileType(ext);

    // Auto title if empty
    if (!docTitle || docTitle.trim() === '') {
      const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
      setDocTitle(titleWithoutExt);
    }

    // Read Base64 Data URL for binary/text files
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFileData(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      alert('Please enter or select a document file.');
      return;
    }
    if (!selectedFile && !docContentText.trim()) {
      alert('Please select a document file from your device or enter document text.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadCompleted(false);

    let p = 10;
    const progressInterval = setInterval(() => {
      p += Math.floor(Math.random() * 20) + 12;
      if (p >= 90) {
        p = 90;
        clearInterval(progressInterval);
      }
      setUploadProgress(p);
    }, 150);

    try {
      await addCADocument({
        title: docTitle.trim(),
        category: docCategory,
        fileType: docFileType || 'pdf',
        fileSize: selectedFileSize || '1.4 MB',
        fileData: selectedFileData || docContentText.trim(),
        fileName: selectedFileName || `${docTitle}.${docFileType || 'pdf'}`,
        uploadedBy: userRole === 'admin' ? 'UPSC Admin Faculty' : 'Faculty Panel'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadCompleted(true);

      setTimeout(async () => {
        setDocTitle('');
        setDocContentText('');
        setSelectedFile(null);
        setSelectedFileData('');
        setSelectedFileName('');
        setSelectedFileSize('');
        setIsUploading(false);
        setUploadProgress(0);
        setUploadCompleted(false);
        setShowDocUploadModal(false);
        await loadDocuments();
      }, 1200);
    } catch (err) {
      clearInterval(progressInterval);
      setIsUploading(false);
      alert('Failed to upload document: ' + err.message);
    }
  };

  const handleDeleteDoc = async (e, docId) => {
    e.stopPropagation();
    if (userRole !== 'admin') {
      alert('Only Admin users can delete dossiers and document attachments.');
      return;
    }
    if (window.confirm('Delete this attached document from everywhere?')) {
      const updated = await deleteCADocument(docId, userRole);
      setDocuments(updated || []);
    }
  };

  const handleDownloadDoc = async (doc) => {
    let targetDoc = doc;
    if (!targetDoc.fileData || targetDoc.fileData === 'SERVER_STORED' || !targetDoc.fileData.startsWith('data:')) {
      const fetched = await fetchCADocumentById(doc.id);
      if (fetched && fetched.fileData) {
        targetDoc = fetched;
      }
    }

    const element = document.createElement('a');
    if (targetDoc.fileData && targetDoc.fileData.startsWith('data:')) {
      element.href = targetDoc.fileData;
      element.download = targetDoc.fileName || `${targetDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}.${targetDoc.fileType || 'pdf'}`;
    } else {
      const content = targetDoc.fileData && targetDoc.fileData !== 'DATA_EMBEDDED' && targetDoc.fileData !== 'SERVER_STORED'
        ? targetDoc.fileData
        : `QuizMind Current Affairs Attachment: ${targetDoc.title}\nCategory: ${targetDoc.category}\nUpload Date: ${targetDoc.uploadDate}\nUploaded By: ${targetDoc.uploadedBy}`;
      const blob = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(blob);
      element.download = targetDoc.fileName || `${targetDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}.${targetDoc.fileType || 'txt'}`;
    }
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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

  const getArticleHighlights = (article) => {
    if (article.highlights && Array.isArray(article.highlights) && article.highlights.length > 0) {
      return article.highlights;
    }
    if (article.summary) {
      return [article.summary, 'Curated current affairs takeaway for Prelims & Mains.'];
    }
    return ['Key current affairs bullet point for exam revision.'];
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '3rem' }}>
      
      {/* Hero Header Section */}
      <div className="glass-panel hero-glass-panel" style={{ padding: '2rem 1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
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
                fontWeight: 700
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
                Live News Feed Active
              </div>
            </div>

            <h1 style={{ fontSize: '2.1rem', marginBottom: '0.65rem', lineHeight: '1.2' }}>
              Daily Knowledge & <span className="gradient-text">Breaking News Digest</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '680px', lineHeight: '1.6' }}>
              Stay updated with curated educational current affairs, national polity, international updates, science & technology, and economy news for exam preparation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{ padding: '0.7rem 1.1rem', borderRadius: 'var(--radius-md)', borderColor: 'var(--border-indigo)' }}
              title="Auto Refresh Live RSS News Feed"
            >
              <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} color="var(--primary-indigo)" />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh News'}</span>
            </button>

            {userRole === 'admin' && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddArticleModal(true)}
                style={{ padding: '0.7rem 1.15rem', borderRadius: 'var(--radius-md)' }}
              >
                <Plus size={16} />
                Add News Article
              </button>
            )}

            {onBackToDashboard && (
              <button className="btn btn-secondary" onClick={onBackToDashboard} style={{ padding: '0.7rem 1.1rem', borderRadius: 'var(--radius-md)' }}>
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Breaking News Marquee Ticker */}
      {(() => {
        const tickerItems = topBreakingArticles.length > 0 ? topBreakingArticles : articles;
        if (tickerItems.length === 0) return null;
        return (
          <div className="news-ticker-container" style={{ marginBottom: '1.5rem' }}>
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

      {/* Daily Current Affairs Portal Link Banner */}
      <div className="glass-panel" style={{ 
        padding: '1.25rem 1.5rem', 
        marginBottom: '1.75rem', 
        borderRadius: 'var(--radius-xl)', 
        border: '1px solid rgba(6, 182, 212, 0.3)',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.08))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)'
          }}>
            <Newspaper size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Daily Current Affairs Portal 📰
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Access full daily current affairs, prelims/mains dossiers & exam updates.
            </p>
          </div>
        </div>

        <a
          href="https://upsc-notes-2vb7.onrender.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            textDecoration: 'none',
            boxShadow: '0 4px 18px rgba(6, 182, 212, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span>DAILY CURRENT AFFAIRS</span>
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="custom-input"
              style={{ paddingLeft: '3rem', height: '46px', fontSize: '0.95rem' }}
              placeholder="Search current affairs by keyword, organization, or topic (e.g. ISRO, RBI, Climate, Sports)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
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
                    padding: '0.55rem 1rem',
                    borderRadius: '24px',
                    fontSize: '0.86rem',
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
        <div className={`glass-panel ${getCardAccentClass(selectedArticle.category)}`} style={{ padding: '2rem 1.75rem', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedArticle(null)}
            style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to All Articles
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span className={`status-badge ${getCategoryBadgeClass(selectedArticle.category)}`}>
              {selectedArticle.categoryName || selectedArticle.category}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={15} /> {selectedArticle.date} • {selectedArticle.readTime} • Source: <strong>{selectedArticle.source || 'Global Media'}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: '1.3' }}>
            {selectedArticle.title}
          </h1>

          {/* Key Takeaways Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))',
            borderLeft: '4px solid var(--primary-indigo)',
            padding: '1.25rem 1.5rem',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            marginBottom: '2rem'
          }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary-indigo)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} /> Key Takeaways for Exam Prep
            </h4>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.75' }}>
              {getArticleHighlights(selectedArticle).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Formatted Article Content */}
          <div style={{ marginBottom: '2.5rem' }}>
            <FormattedContentRenderer content={selectedArticle.content || selectedArticle.summary} />
          </div>

          {/* External News Source Link Box for Students */}
          {(() => {
            const targetUrl = selectedArticle.sourceUrl || selectedArticle.url || selectedArticle.link || `https://news.google.com/search?q=${encodeURIComponent(selectedArticle.title)}`;
            return (
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.12))',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)'
                  }}>
                    <Globe size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      Official External News Source
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                      Read complete live news coverage & original report from <strong>{selectedArticle.source || 'Original News Source'}</strong>
                    </p>
                  </div>
                </div>

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    border: 'none',
                    padding: '0.7rem 1.3rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)'
                  }}
                >
                  <span>Read Full News from Source</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            );
          })()}

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.5rem',
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

            {onGenerateQuizFromArticle && (
              <button
                className="btn btn-emerald"
                onClick={() => onGenerateQuizFromArticle(selectedArticle)}
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.92rem' }}
              >
                <Zap size={18} />
                Generate Quiz On This Topic
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Grid List of Articles */
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <Newspaper className="spinning" size={36} style={{ marginBottom: '1rem', color: 'var(--primary-indigo)' }} />
              <p style={{ fontSize: '1.05rem' }}>Fetching live current affairs bulletins...</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {articles.map(article => {
                const isBookmarked = bookmarks.includes(article.id);
                return (
                  <div
                    key={article.id}
                    className={`glass-panel ca-card-interactive ${getCardAccentClass(article.category)}`}
                    style={{
                      padding: '1.5rem',
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                        <span className={`status-badge ${getCategoryBadgeClass(article.category)}`}>
                          {article.categoryName || article.category}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                          </button>

                          {userRole === 'admin' && article.id.startsWith('ca-custom-') && (
                            <button
                              onClick={(e) => handleDeleteArticle(e, article.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', padding: '4px' }}
                              title="Delete Article"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', lineHeight: '1.4', color: 'var(--text-main)', fontWeight: 700 }}>
                        {article.title}
                      </h3>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                        {article.summary}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-light)',
                      fontSize: '0.8rem',
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

      {/* Admin Add Article Modal */}
      {showAddArticleModal && (
        <div className="modal-backdrop" onClick={() => setShowAddArticleModal(false)}>
          <div className="modal-card" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowAddArticleModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Newspaper size={24} color="var(--primary-indigo)" />
              <h3>Add Custom Current Affairs Article</h3>
            </div>

            <form onSubmit={handleCreateArticle}>
              <div className="input-group">
                <label className="input-label">Article Headline / Title</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. India-EFTA Trade Agreement Operationalized"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="custom-select"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Source / Attribution</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">External News Source URL (Optional)</label>
                <input
                  type="url"
                  className="custom-input"
                  placeholder="https://pib.gov.in or original news article link..."
                  value={newSourceUrl}
                  onChange={e => setNewSourceUrl(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Short Summary (1-2 sentences)</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Key summary for card preview..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Full Article Content (Markdown Supported)</label>
                <textarea
                  className="custom-textarea"
                  style={{ height: '170px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  placeholder="Write complete article details, headings (###), and bullet points (- )..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddArticleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Article 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Upload Document Modal with Native Device File Input */}
      {showDocUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowDocUploadModal(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowDocUploadModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Upload size={24} color="var(--primary-indigo)" />
              <h3>Upload Current Affairs Document Attachment</h3>
            </div>

            <form onSubmit={handleAddDocument}>
              
              {/* Native File Input Picker Box */}
              <div className="input-group">
                <label className="input-label">Select Document File from Computer or Mobile</label>
                <div style={{ 
                  border: '2px dashed var(--border-indigo)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.25rem', 
                  textAlign: 'center', 
                  background: 'rgba(99, 102, 241, 0.05)'
                }}>
                  <Upload size={28} color="var(--primary-indigo)" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {selectedFileName ? `File Selected: ${selectedFileName}` : 'Choose PDF, DOCX, or TXT file'}
                  </div>
                  {selectedFileSize && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Size: {selectedFileSize} • Extension: .{docFileType}
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.ppt,.pptx"
                    onChange={handleFileSelect}
                    style={{ width: '100%', marginTop: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Document Title</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Economic Survey 2026 Key Takeaways Summary"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="custom-select"
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">File Type</label>
                  <select
                    className="custom-select"
                    value={docFileType}
                    onChange={e => setDocFileType(e.target.value)}
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="docx">Word DOCX</option>
                    <option value="txt">Text File (TXT)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Optional Text Notes / Summary Description</label>
                <textarea
                  className="custom-textarea"
                  style={{ height: '90px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder="Additional notes summary for students..."
                  value={docContentText}
                  onChange={e => setDocContentText(e.target.value)}
                />
              </div>

              {/* Real-time Percentage Upload Progress Bar & Status */}
              {isUploading && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: 700 }}>
                    <span style={{ color: uploadCompleted ? '#34d399' : 'var(--primary-indigo)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {uploadCompleted ? '✔ Done and Published!' : `Uploading File to Server... ${uploadProgress}%`}
                    </span>
                    <span style={{ fontWeight: 800, color: uploadCompleted ? '#34d399' : 'var(--primary-indigo)' }}>{uploadProgress}%</span>
                  </div>
                  
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      background: uploadCompleted 
                        ? 'linear-gradient(90deg, #10b981, #34d399)' 
                        : 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
                      transition: 'width 0.2s ease-out',
                      borderRadius: '5px'
                    }} />
                  </div>

                  {uploadCompleted && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#34d399', fontWeight: 600, textAlign: 'center' }}>
                      Done and published! Saved in backend & accessible for all users globally.
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocUploadModal(false)} disabled={isUploading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? (uploadCompleted ? 'Done & Published!' : `Uploading (${uploadProgress}%)...`) : 'Upload & Publish File 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
