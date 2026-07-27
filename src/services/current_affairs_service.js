// QuizMind Pro - Daily Current Affairs Service (Live RSS + Admin Published Articles + Server Sync)

export const CATEGORIES = [
  { id: 'all', label: 'All Headlines', icon: 'Globe' },
  { id: 'national', label: 'National Affairs', icon: 'Landmark' },
  { id: 'international', label: 'International', icon: 'Earth' },
  { id: 'economy', label: 'Economy & Business', icon: 'TrendingUp' },
  { id: 'environment', label: 'Environment', icon: 'Leaf' },
  { id: 'science', label: 'Science & Tech', icon: 'Atom' },
  { id: 'sports', label: 'Sports & Honors', icon: 'Trophy' },
];

const INITIAL_CUSTOM_AFFAIRS = [
  {
    id: 'ca-custom-1',
    title: 'National Quantum Mission (NQM) 2026 Implementation Guidelines Issued',
    category: 'science',
    categoryName: 'Science & Tech',
    source: 'PIB Delhi / Admin Editorial',
    date: new Date().toISOString().split('T')[0],
    readTime: '3 min read',
    summary: 'Department of Science & Technology releases roadmap for Quantum Computing, Quantum Communication, and Quantum Sensing hubs across premier academic institutions.',
    highlights: [
      'Four Thematic Hubs (T-Hubs) established for Quantum Computing and Sensing.',
      'Target to develop 50-1000 physical qubit quantum systems.',
      'Direct relevance to UPSC GS III Science & Technology and IPR.'
    ],
    content: `The Department of Science & Technology (DST) has officially released the operational guidelines for the National Quantum Mission (NQM).

### Key Highlights:
- **Four Thematic Hubs (T-Hubs)**: Set up in Quantum Computing, Quantum Communication, Quantum Sensing & Metrology, and Quantum Materials & Devices.
- **Goal**: Develop intermediate scale quantum computers with 50-1000 physical qubits in 8 years.
- **Impact on UPSC GS III**: Crucial topic for Science & Technology, IPR, and National Innovation Ecosystem.`
  },
  {
    id: 'ca-custom-2',
    title: 'RBI Framework for Climate Risk and Sustainable Finance 2026',
    category: 'economy',
    categoryName: 'Economy & Business',
    source: 'RBI Press Release',
    date: new Date().toISOString().split('T')[0],
    readTime: '4 min read',
    summary: 'Reserve Bank of India introduces mandatory disclosure standards for regulated entities regarding climate-related financial risks and green lending portfolios.',
    highlights: [
      'Mandatory Climate Stress Testing for commercial banks.',
      'Green Deposits Framework promoting capital allocation for renewable energy.',
      'Aligned with UPSC GS Paper III Economy & Environmental Economics.'
    ],
    content: `The Reserve Bank of India (RBI) has issued detailed guidelines on Climate Risk and Sustainable Finance for Commercial Banks and Financial Institutions.

### Core Objectives:
- **Climate Stress Testing**: Banks must evaluate portfolio exposure to physical and transition climate risks.
- **Green Deposits Framework**: Promoting allocation of capital towards renewable energy, climate adaptation, and green building projects.
- **UPSC Relevance**: GS Paper III Economy & Environmental Economics.`
  }
];

const STORAGE_KEY_CUSTOM = 'QUIZMIND_CUSTOM_AFFAIRS';
const STORAGE_KEY_DOCS = 'QUIZMIND_CA_DOCUMENTS';

export async function fetchLiveCustomCurrentAffairs() {
  let liveArticles = [];
  let customArticles = [];

  try {
    const liveRes = await fetch('/api/current-affairs/live');
    if (liveRes.ok) {
      liveArticles = await liveRes.json();
    }
  } catch (e) {}

  try {
    const customRes = await fetch('/api/current-affairs');
    if (customRes.ok) {
      customArticles = await customRes.json();
    }
  } catch (e) {}

  const localCustom = getCustomCurrentAffairs();
  const customMap = new Map();

  if (Array.isArray(localCustom)) {
    localCustom.forEach(item => {
      if (item && item.title) customMap.set(item.id || item.title.toLowerCase().trim(), item);
    });
  }

  if (Array.isArray(customArticles)) {
    customArticles.forEach(item => {
      if (item && item.title) customMap.set(item.id || item.title.toLowerCase().trim(), item);
    });
  }

  let merged = Array.from(customMap.values());

  if (Array.isArray(liveArticles) && liveArticles.length > 0) {
    const existingTitles = new Set(merged.map(item => item.title.toLowerCase().trim()));
    liveArticles.forEach(item => {
      if (!existingTitles.has(item.title.toLowerCase().trim())) {
        merged.unshift(item);
        existingTitles.add(item.title.toLowerCase().trim());
      }
    });
  }

  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(merged));
  return merged;
}

export function getCustomCurrentAffairs() {
  const saved = localStorage.getItem(STORAGE_KEY_CUSTOM);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return INITIAL_CUSTOM_AFFAIRS;
}

export function saveCustomCurrentAffairs(list) {
  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(list));
}

export async function addCustomCurrentAffairs(articleData) {
  const currentList = getCustomCurrentAffairs();
  const categoryNames = {
    all: 'General News',
    national: 'National Affairs',
    international: 'International',
    economy: 'Economy & Business',
    environment: 'Environment',
    science: 'Science & Tech',
    sports: 'Sports & Honors'
  };

  const wordCount = articleData.content ? articleData.content.split(/\s+/).length : 150;
  const readTimeCalc = `${Math.max(2, Math.ceil(wordCount / 150))} min read`;

  let highlights = articleData.highlights;
  if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
    highlights = articleData.content
      ? articleData.content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')).map(line => line.replace(/^[-*]\s*/, ''))
      : [];
    if (highlights.length === 0) {
      highlights = [
        articleData.summary || 'Key current affairs takeaway for competitive exam preparation.',
        `Category: ${categoryNames[articleData.category] || 'General News'}`,
        'High yield topic for Prelims & Mains revision.'
      ];
    }
  }

  const newArticle = {
    id: 'ca-custom-' + Date.now(),
    title: articleData.title,
    category: articleData.category || 'national',
    categoryName: categoryNames[articleData.category] || 'General News',
    source: articleData.source || 'Admin Faculty / PIB',
    sourceUrl: articleData.sourceUrl || `https://news.google.com/search?q=${encodeURIComponent(articleData.title)}`,
    date: new Date().toISOString().split('T')[0],
    readTime: readTimeCalc,
    summary: articleData.summary || (articleData.content ? articleData.content.substring(0, 140) + '...' : ''),
    highlights: highlights,
    content: articleData.content
  };

  const updated = [newArticle, ...currentList];
  saveCustomCurrentAffairs(updated);

  try {
    const res = await fetch('/api/current-affairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArticle)
    });
    if (res.ok) {
      const serverArticle = await res.json();
      return serverArticle;
    }
  } catch (e) {}

  return newArticle;
}

export async function deleteCustomCurrentAffairs(articleId, userRole = 'student') {
  if (userRole !== 'admin') {
    return getCustomCurrentAffairs();
  }
  const currentList = getCustomCurrentAffairs();
  const updated = currentList.filter(item => item.id !== articleId);
  saveCustomCurrentAffairs(updated);

  try {
    const res = await fetch(`/api/current-affairs/${articleId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': userRole }
    });
    if (res.ok) {
      const serverUpdated = await res.json();
      if (Array.isArray(serverUpdated)) {
        saveCustomCurrentAffairs(serverUpdated);
        return serverUpdated;
      }
    }
  } catch (e) {}

  return updated;
}

// Current Affairs Document Attachments Sync
function safeSaveLocalStorage(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn(`localStorage quota exceeded for ${key}, caching metadata only.`);
    try {
      const lightweight = items.map(item => {
        if (item.fileData && item.fileData.length > 100000) {
          return { ...item, fileData: 'SERVER_STORED' };
        }
        return item;
      });
      localStorage.setItem(key, JSON.stringify(lightweight));
    } catch (e) {}
  }
}

export async function fetchLiveCADocuments() {
  const localDocs = getCADocuments();
  let serverDocs = null;

  try {
    const res = await fetch('/api/current-affairs/documents');
    if (res.ok) {
      serverDocs = await res.json();
    }
  } catch (e) {}

  if (Array.isArray(serverDocs)) {
    const localMap = new Map();
    if (Array.isArray(localDocs)) {
      localDocs.forEach(d => {
        if (d && (d.id || d.title)) {
          const key = d.id || d.title.toLowerCase().trim();
          localMap.set(key, d);
          if (d.title) localMap.set(d.title.toLowerCase().trim(), d);
        }
      });
    }

    const merged = serverDocs.map(sd => {
      const key = sd.id || (sd.title ? sd.title.toLowerCase().trim() : '');
      const local = localMap.get(key) || (sd.title ? localMap.get(sd.title.toLowerCase().trim()) : null);
      if (local && local.fileData && local.fileData.startsWith('data:')) {
        if (!sd.fileData || sd.fileData === 'SERVER_STORED' || sd.fileData === '') {
          return { ...sd, fileData: local.fileData };
        }
      }
      return sd;
    });

    safeSaveLocalStorage(STORAGE_KEY_DOCS, merged);
    return merged;
  }

  return localDocs;
}

export async function fetchCADocumentById(docId) {
  try {
    const res = await fetch(`/api/current-affairs/documents/${docId}`);
    if (res.ok) {
      const doc = await res.json();
      if (doc && doc.id) return doc;
    }
  } catch (e) {}
  const local = getCADocuments().find(d => d.id === docId);
  return local || null;
}

export function getCADocuments() {
  const saved = localStorage.getItem(STORAGE_KEY_DOCS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

export async function addCADocument(doc) {
  const current = getCADocuments();
  const docId = 'ca-doc-' + Date.now();
  const newDoc = {
    id: docId,
    title: doc.title,
    category: doc.category || 'all',
    fileType: doc.fileType || 'pdf',
    fileSize: doc.fileSize || '1.5 MB',
    uploadDate: new Date().toISOString().split('T')[0],
    fileData: doc.fileData || '',
    fileName: doc.fileName || `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.${doc.fileType || 'pdf'}`,
    uploadedBy: doc.uploadedBy || 'Admin'
  };

  try {
    const res = await fetch('/api/current-affairs/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc)
    });
    if (res.ok) {
      const serverDoc = await res.json();
      const filteredCurrent = current.filter(d => d.id !== newDoc.id && d.title !== newDoc.title);
      const updated = [serverDoc, ...filteredCurrent];
      safeSaveLocalStorage(STORAGE_KEY_DOCS, updated);
      return serverDoc;
    }
  } catch (e) {}

  const filteredCurrent = current.filter(d => d.id !== newDoc.id && d.title !== newDoc.title);
  const updated = [newDoc, ...filteredCurrent];
  safeSaveLocalStorage(STORAGE_KEY_DOCS, updated);
  return newDoc;
}

export async function deleteCADocument(docId, userRole = 'student') {
  if (userRole !== 'admin') {
    return getCADocuments();
  }
  const current = getCADocuments();
  const cleanId = String(docId).trim();
  const updated = current.filter(d => d.id !== cleanId && d.id !== cleanId.replace(/^ca-doc-/, 'doc-ca-') && d.id !== cleanId.replace(/^doc-ca-/, 'ca-doc-'));
  safeSaveLocalStorage(STORAGE_KEY_DOCS, updated);

  try {
    const res = await fetch(`/api/current-affairs/documents/${docId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': userRole }
    });
    if (res.ok) {
      const serverUpdated = await res.json();
      if (Array.isArray(serverUpdated)) {
        safeSaveLocalStorage(STORAGE_KEY_DOCS, serverUpdated);
        return serverUpdated;
      }
    }
  } catch (e) {}

  return updated;
}

export async function fetchCurrentAffairs({ category = 'all', searchQuery = '' } = {}) {
  const customItems = await fetchLiveCustomCurrentAffairs();
  let merged = [...customItems].map(item => {
    const wordCount = item.content ? item.content.split(/\s+/).length : 150;
    const readTimeCalc = item.readTime || `${Math.max(2, Math.ceil(wordCount / 150))} min read`;
    
    let highlights = item.highlights;
    if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
      highlights = [
        item.summary || 'Key current affairs takeaway.',
        `Source: ${item.source || 'PIB / Global Press'}`,
        'Relevant for UPSC Prelims & Mains GS Papers'
      ];
    }

    return {
      ...item,
      readTime: readTimeCalc,
      highlights: highlights
    };
  });

  if (category && category !== 'all') {
    merged = merged.filter(item => item.category === category);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    merged = merged.filter(item => 
      item.title.toLowerCase().includes(q) || 
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q))
    );
  }

  return merged;
}
