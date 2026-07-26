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
  try {
    const res = await fetch('/api/current-affairs');
    if (res.ok) {
      const serverList = await res.json();
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(serverList));
      return serverList;
    }
  } catch (e) {}
  return getCustomCurrentAffairs();
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
    await fetch(`/api/current-affairs/${articleId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': userRole }
    });
  } catch (e) {}

  return updated;
}

// Current Affairs Document Attachments Sync
export async function fetchLiveCADocuments() {
  try {
    const res = await fetch('/api/current-affairs/documents');
    if (res.ok) {
      const serverDocs = await res.json();
      const localDocs = getCADocuments();
      const docMap = new Map();
      if (Array.isArray(serverDocs)) {
        serverDocs.forEach(d => docMap.set(d.id, d));
      }
      if (Array.isArray(localDocs)) {
        localDocs.forEach(d => {
          if (!docMap.has(d.id)) {
            docMap.set(d.id, d);
          }
        });
      }
      const mergedDocs = Array.from(docMap.values());
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(mergedDocs));
      return mergedDocs;
    }
  } catch (e) {}
  return getCADocuments();
}

export function getCADocuments() {
  const saved = localStorage.getItem(STORAGE_KEY_DOCS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [
    {
      id: 'ca-doc-1',
      title: 'Economic Survey 2026 Highlights & Key Data PDF',
      category: 'economy',
      fileType: 'pdf',
      fileSize: '2.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      fileData: 'DATA_EMBEDDED',
      uploadedBy: 'Admin Panel'
    }
  ];
}

export async function addCADocument(doc) {
  const current = getCADocuments();
  const newDoc = {
    id: 'ca-doc-' + Date.now(),
    title: doc.title,
    category: doc.category || 'all',
    fileType: doc.fileType || 'pdf',
    fileSize: doc.fileSize || '1.5 MB',
    uploadDate: new Date().toISOString().split('T')[0],
    fileData: doc.fileData || '',
    fileName: doc.fileName || `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.${doc.fileType || 'pdf'}`,
    uploadedBy: doc.uploadedBy || 'Admin'
  };
  const updated = [newDoc, ...current];
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated));

  try {
    const res = await fetch('/api/current-affairs/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc)
    });
    if (res.ok) {
      const serverDoc = await res.json();
      return serverDoc;
    }
  } catch (e) {}

  return newDoc;
}

export async function deleteCADocument(docId, userRole = 'student') {
  if (userRole !== 'admin') {
    return getCADocuments();
  }
  const current = getCADocuments();
  const updated = current.filter(d => d.id !== docId);
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated));

  try {
    await fetch(`/api/current-affairs/documents/${docId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': userRole }
    });
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
