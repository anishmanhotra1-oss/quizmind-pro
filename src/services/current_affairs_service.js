// QuizMind Pro - Daily Current Affairs Service (Live RSS + Admin Published Articles)

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
  },

  {
    id: 'ca-custom-3',
    title: 'India Hosts Global Artificial Intelligence Safety Summit in New Delhi',
    category: 'international',
    categoryName: 'International',
    source: 'Ministry of External Affairs',
    date: new Date().toISOString().split('T')[0],
    readTime: '3 min read',
    summary: 'Global delegates convene to establish ethical AI governance protocols, data sovereignty frameworks, and open-source AI infrastructure for developing nations.',
    highlights: [
      'Focus on Global South inclusive AI governance protocols.',
      'Establishment of the International AI Trust & Verification Centre.',
      'Strategic relevance for UPSC GS II International Relations & Tech Diplomacy.'
    ],
    content: `India hosted the Global AI Safety & Trust Summit bringing together tech leaders, policymakers, and ethicists.

### Key Takeaways:
- **Global South Focus**: Democratizing access to high-performance computing resources.
- **AI Safety Declarations**: Voluntary alignment on synthetic media watermarking and deepfake mitigation.`
  }
];

// Local storage keys
const STORAGE_KEY_CUSTOM = 'QUIZMIND_CUSTOM_AFFAIRS';
const STORAGE_KEY_DOCS = 'QUIZMIND_CA_DOCUMENTS';

export function getCustomCurrentAffairs() {
  const saved = localStorage.getItem(STORAGE_KEY_CUSTOM);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading custom current affairs:', e);
    }
  }
  return INITIAL_CUSTOM_AFFAIRS;
}

export function saveCustomCurrentAffairs(list) {
  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(list));
}

export function addCustomCurrentAffairs(articleData) {
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

  // Auto generate highlights if not provided
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
  return newArticle;
}

export function deleteCustomCurrentAffairs(articleId) {
  const currentList = getCustomCurrentAffairs();
  const updated = currentList.filter(item => item.id !== articleId);
  saveCustomCurrentAffairs(updated);
  return updated;
}

// Current Affairs Document Attachments
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
      downloadUrl: '#',
      fileData: 'DATA_EMBEDDED',
      uploadedBy: 'Admin Panel'
    },
    {
      id: 'ca-doc-2',
      title: 'PIB Monthly Current Affairs Dossier - Environment & Science',
      category: 'environment',
      fileType: 'pdf',
      fileSize: '3.1 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      downloadUrl: '#',
      fileData: 'DATA_EMBEDDED',
      uploadedBy: 'UPSC Faculty'
    }
  ];
}

export function addCADocument(doc) {
  const current = getCADocuments();
  const newDoc = {
    id: 'ca-doc-' + Date.now(),
    title: doc.title,
    category: doc.category || 'all',
    fileType: doc.fileType || 'pdf',
    fileSize: doc.fileSize || '1.2 MB',
    uploadDate: new Date().toISOString().split('T')[0],
    fileData: doc.fileData || '',
    downloadUrl: doc.downloadUrl || '#',
    uploadedBy: doc.uploadedBy || 'Admin'
  };
  const updated = [newDoc, ...current];
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated));
  return newDoc;
}

export function deleteCADocument(docId) {
  const current = getCADocuments();
  const updated = current.filter(d => d.id !== docId);
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated));
  return updated;
}

export async function fetchCurrentAffairs({ category = 'all', searchQuery = '' } = {}) {
  const customItems = getCustomCurrentAffairs();
  
  // Try fetching live RSS news from backend endpoint
  let liveItems = [];
  try {
    const res = await fetch(`/api/current-affairs?category=${category}&search=${encodeURIComponent(searchQuery)}`);
    if (res.ok) {
      liveItems = await res.json();
    }
  } catch (e) {
    // Fall back smoothly if backend endpoint unavailable
  }

  // Ensure all items have safe highlights & readTime
  let merged = [...customItems, ...liveItems].map(item => {
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

  // Apply Category Filter
  if (category && category !== 'all') {
    merged = merged.filter(item => item.category === category);
  }

  // Apply Search Filter
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

