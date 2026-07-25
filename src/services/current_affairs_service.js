// QuizMind Pro - Daily Current Affairs Service (Live RSS + Admin Published Articles)

export const CATEGORIES = [
  { id: 'all', name: 'All Headlines', icon: 'Globe' },
  { id: 'national', name: 'National Affairs', icon: 'Landmark' },
  { id: 'international', name: 'International', icon: 'Earth' },
  { id: 'economy', name: 'Economy & Business', icon: 'TrendingUp' },
  { id: 'environment', name: 'Environment', icon: 'Leaf' },
  { id: 'science', name: 'Science & Tech', icon: 'Atom' },
  { id: 'sports', name: 'Sports & Honors', icon: 'Trophy' },
];

const INITIAL_CUSTOM_AFFAIRS = [
  {
    id: 'ca-custom-1',
    title: 'National Quantum Mission (NQM) 2026 Implementation Guidelines Issued',
    category: 'science',
    categoryName: 'Science & Tech',
    source: 'PIB Delhi / Admin Editorial',
    date: new Date().toISOString().split('T')[0],
    summary: 'Department of Science & Technology releases roadmap for Quantum Computing, Quantum Communication, and Quantum Sensing hubs across premier academic institutions.',
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
    summary: 'Reserve Bank of India introduces mandatory disclosure standards for regulated entities regarding climate-related financial risks and green lending portfolios.',
    content: `The Reserve Bank of India (RBI) has issued detailed guidelines on Climate Risk and Sustainable Finance for Commercial Banks and Financial Institutions.

### Core Objectives:
- **Climate Stress Testing**: Banks must evaluate portfolio exposure to physical and transition climate risks.
- **Green Deposits Framework**: Promoting allocation of capital towards renewable energy, climate adaptation, and green building projects.
- **UPSC Relevance**: GS Paper III Economy & Environmental Economics.`
  }
];

export function getCustomCurrentAffairs() {
  const saved = localStorage.getItem('QUIZMIND_CUSTOM_AFFAIRS');
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
  localStorage.setItem('QUIZMIND_CUSTOM_AFFAIRS', JSON.stringify(list));
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

  const newArticle = {
    id: 'ca-custom-' + Date.now(),
    title: articleData.title,
    category: articleData.category || 'national',
    categoryName: categoryNames[articleData.category] || 'General News',
    source: articleData.source || 'Admin Faculty / PIB',
    date: new Date().toISOString().split('T')[0],
    summary: articleData.summary || articleData.content.substring(0, 120) + '...',
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

  // Merge Custom Admin Articles + Live RSS Items
  let merged = [...customItems, ...liveItems];

  // Apply Category Filter
  if (category && category !== 'all') {
    merged = merged.filter(item => item.category === category);
  }

  // Apply Search Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    merged = merged.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) ||
      (item.content && item.content.toLowerCase().includes(q))
    );
  }

  return merged;
}
