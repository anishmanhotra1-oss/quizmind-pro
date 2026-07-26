// QuizMind Pro - Imperial UPSC CSE Notes Service
// Distinct academic palette and GS Paper categorization for UPSC CSE Preparation.

export const UPSC_SUBJECTS = [
  { 
    id: 'all', 
    label: 'All Subjects', 
    paperTag: 'GS I - IV',
    icon: 'BookOpen', 
    gradient: 'linear-gradient(135deg, #f59e0b, #a855f7)',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeColor: '#f59e0b'
  },
  { 
    id: 'polity', 
    label: 'Polity & Constitution', 
    paperTag: 'GS Paper II',
    icon: 'Landmark', 
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    badgeBg: 'rgba(99, 102, 241, 0.18)',
    badgeColor: '#6366f1'
  },
  { 
    id: 'history', 
    label: 'History & Indian Culture', 
    paperTag: 'GS Paper I',
    icon: 'Scroll', 
    gradient: 'linear-gradient(135deg, #d97706, #e11d48)',
    badgeBg: 'rgba(217, 119, 6, 0.18)',
    badgeColor: '#d97706'
  },
  { 
    id: 'economy', 
    label: 'Indian Economy & Budget', 
    paperTag: 'GS Paper III',
    icon: 'TrendingUp', 
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    badgeBg: 'rgba(5, 150, 105, 0.18)',
    badgeColor: '#059669'
  },
  { 
    id: 'geography', 
    label: 'Geography & Environment', 
    paperTag: 'GS Paper I / III',
    icon: 'Globe', 
    gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)',
    badgeBg: 'rgba(2, 132, 199, 0.18)',
    badgeColor: '#0284c7'
  },
  { 
    id: 'science', 
    label: 'Science & Technology', 
    paperTag: 'GS Paper III',
    icon: 'Cpu', 
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    badgeBg: 'rgba(124, 58, 237, 0.18)',
    badgeColor: '#8b5cf6'
  },
  { 
    id: 'ir', 
    label: 'International Relations', 
    paperTag: 'GS Paper II',
    icon: 'ShieldAlert', 
    gradient: 'linear-gradient(135deg, #dc2626, #f59e0b)',
    badgeBg: 'rgba(220, 38, 38, 0.18)',
    badgeColor: '#dc2626'
  },
  { 
    id: 'ethics', 
    label: 'Ethics & Integrity', 
    paperTag: 'GS Paper IV',
    icon: 'Scale', 
    gradient: 'linear-gradient(135deg, #0d9488, #f59e0b)',
    badgeBg: 'rgba(13, 148, 136, 0.18)',
    badgeColor: '#0d9488'
  }
];

const INITIAL_UPSC_NOTES = [
  {
    id: 'note-1',
    title: 'Preamble, Fundamental Rights (Art 12-35) & Basic Structure Doctrine',
    subject: 'polity',
    subjectLabel: 'Polity & Constitution',
    paperTag: 'GS Paper II',
    author: 'Anish Manhotra (UPSC Expert Panel)',
    date: '2026-07-25',
    summary: 'Comprehensive analysis of Fundamental Rights, Reasonable Restrictions, and Key Supreme Court Cases (Kesavananda Bharati, Maneka Gandhi).',
    content: `# Polity & Constitution: Fundamental Rights & Basic Structure

## 1. Preamble & Key Constitutional Objectives
The Preamble serves as the key to the minds of the framers of the Constitution. It declares India to be a **Sovereign, Socialist, Secular, Democratic, Republic**.

- **42nd Amendment Act (1976)**: Added words *Socialist*, *Secular*, and *Integrity*.
- **Justice Dimensions**: Social, Economic, and Political (drawn from the Russian Revolution, 1917).

---

## 2. Fundamental Rights (Articles 12-35) - Part III
Fundamental Rights are justiciable and guaranteed by the Constitution under Article 32 (Supreme Court) and Article 226 (High Court).

### Key Articles Breakdown:
- **Art 14-18**: Right to Equality (Equality before Law & Equal Protection of Laws).
- **Art 19-22**: Right to Freedom (Art 19: 6 basic freedoms; Art 21: Protection of Life & Personal Liberty).
- **Art 23-24**: Right against Exploitation.
- **Art 25-28**: Right to Freedom of Religion.
- **Art 29-30**: Cultural & Educational Rights of Minorities.
- **Art 32**: Constitutional Remedies (Dr. B.R. Ambedkar called Art 32 the "Heart and Soul of the Constitution").

---

## 3. The Basic Structure Doctrine
Originating from the landmark **Kesavananda Bharati Case (1973)**, the Supreme Court ruled that Parliament's constituent power under Article 368 does NOT enable it to alter the basic framework of the Constitution.

### Essential Components of Basic Structure:
1. Supremacy of the Constitution
2. Sovereign, Democratic, and Republican nature of the Indian Polity
3. Secular Character of the Constitution
4. Separation of Powers between Legislature, Executive, and Judiciary
5. Judicial Review & Rule of Law`
  },

  {
    id: 'note-2',
    title: 'Bhakti & Sufi Movements: Socio-Cultural Impact on Medieval India',
    subject: 'history',
    subjectLabel: 'History & Culture',
    paperTag: 'GS Paper I',
    author: 'QuizMind UPSC Editorial',
    date: '2026-07-24',
    summary: 'Examines the rise of Saguna & Nirguna Bhakti Saints (Kabir, Guru Nanak, Mirabai) and Sufi Silsilas (Chishti, Suhrawardi) in shaping regional literature and social egalitarianism.',
    content: `# History & Culture: Bhakti & Sufi Movements

## 1. Core Philosophy & Origin
The Bhakti movement originated in South India (Alvars & Nayanars, 6th-9th Century AD) and spread to North India in the 14th-15th century.

### Two Streams of Bhakti:
1. **Nirguna Bhakti**: Devotion to a formless God without attributes (Saints: Kabir, Guru Nanak, Dadu Dayal). Emphasized Hindu-Muslim unity and rejected caste rituals.
2. **Saguna Bhakti**: Devotion to a God with attributes and human forms (Saints: Tulsidas, Surdas, Chaitanya Mahaprabhu, Mirabai).

---

## 2. Sufi Movement in India
Sufism emphasized spiritual closeness to God through love, devotion, and asceticism (*Tassawuf*).

### Major Silsilas (Orders):
- **Chishti Order**: Founded in India by Khwaja Moinuddin Chishti (Ajmer). Promoted simplicity, vegetarianism, and avoided state patronage (Baba Farid, Nizamuddin Auliya).
- **Suhrawardi Order**: Founded by Shaikh Bahauddin Zakariya. Accepted state posts and lived comfortably in Punjab & Sindh.

---

## 3. Lasting Cultural Contributions
- **Development of Regional Vernacular Literature**: Hindi, Punjabi, Bengali, Marathi, and Tamil literature blossomed.
- **Social Reform**: Challenged rigid caste barriers and elevated the status of women and lower strata.`
  },

  {
    id: 'note-3',
    title: 'Monetary Policy Committee (MPC) & Inflation Targeting Mechanism',
    subject: 'economy',
    subjectLabel: 'Indian Economy',
    paperTag: 'GS Paper III',
    author: 'Economic Research Wing',
    date: '2026-07-23',
    summary: 'Detailed note on RBI’s Flexible Inflation Targeting (4% ± 2%), Repo Rate mechanisms, Monetary Transmission, and Liquidity Management Tools (LAF, MSF, OMO).',
    content: `# Indian Economy: Monetary Policy Committee & Inflation Framework

## 1. Flexible Inflation Targeting (FIT) Framework
Under the RBI Act 1934 (amended in 2016), the central government in consultation with the RBI sets the inflation target every 5 years.

- **Target**: **4% CPI Inflation** with an upper tolerance band of **6%** and lower band of **2%** (4% ± 2%).

---

## 2. Structure of Monetary Policy Committee (MPC)
- **Members**: 6 Members (3 from RBI including Governor as ex-officio Chairperson, and 3 appointed by Central Government).
- **Decision Rule**: Majority vote with casting vote held by Governor in case of tie.
- **Frequency**: Meets at least 4 times a year.

---

## 3. Key Quantitative Monetary Tools
1. **Repo Rate**: Rate at which RBI lends short-term money to commercial banks against government securities.
2. **Reverse Repo Rate**: Rate at which commercial banks park surplus cash with RBI.
3. **Marginal Standing Facility (MSF)**: Overnight emergency borrowing facility for banks at a higher rate.
4. **Open Market Operations (OMOs)**: Buying and selling of Government Securities (G-Secs) in open market to regulate liquidity.`
  },

  {
    id: 'note-4',
    title: 'El Niño vs La Niña: Impact on Indian Monsoon & Agriculture',
    subject: 'geography',
    subjectLabel: 'Geography & Environment',
    paperTag: 'GS Paper I / III',
    author: 'Geographical Research Group',
    date: '2026-07-22',
    summary: 'Technical explanation of ENSO cycle, Walker Circulation, Indian Ocean Dipole (IOD), and agricultural consequences for Kharif crops in India.',
    content: `# Geography & Environment: ENSO & Indian Monsoon Mechanics

## 1. Understanding ENSO (El Niño-Southern Oscillation)
ENSO is a periodic fluctuation in sea surface temperatures (SST) and atmospheric pressure across the equatorial Pacific Ocean.

### El Niño (Warm Phase):
- Unusually warm ocean surface temperatures in central and eastern tropical Pacific.
- Weakens trade winds and disrupts Walker Circulation.
- **Impact on India**: Associated with **droughts or below-normal monsoon rainfall** in India.

### La Niña (Cool Phase):
- Unusually cold sea surface temperatures in eastern Pacific.
- Strengthens trade winds, piling up warm water in western Pacific.
- **Impact on India**: Results in **bountiful monsoon rains**, good Kharif harvest, but potential flash floods.

---

## 2. Indian Ocean Dipole (IOD) Interaction
- **Positive IOD**: Arabian Sea is warmer than eastern Indian Ocean → Boosts Indian Monsoon (can offset negative El Niño impact).
- **Negative IOD**: Eastern Indian Ocean near Indonesia is warmer → Suppresses Indian Monsoon.`
  }
];

export function getUPSCNotes() {
  const saved = localStorage.getItem('QUIZMIND_UPSC_NOTES');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing stored UPSC notes:', e);
    }
  }
  return INITIAL_UPSC_NOTES;
}

export function saveUPSCNotes(notesList) {
  localStorage.setItem('QUIZMIND_UPSC_NOTES', JSON.stringify(notesList));
}

export function addUPSCNote(newNoteData) {
  const currentNotes = getUPSCNotes();
  const subObj = UPSC_SUBJECTS.find(s => s.id === newNoteData.subject) || {};

  const newNote = {
    id: 'note-' + Date.now(),
    title: newNoteData.title,
    subject: newNoteData.subject,
    subjectLabel: subObj.label || 'General Studies',
    paperTag: subObj.paperTag || 'GS Paper',
    author: newNoteData.author || 'Admin / Faculty',
    date: new Date().toISOString().split('T')[0],
    summary: newNoteData.summary || newNoteData.content.substring(0, 120) + '...',
    content: newNoteData.content
  };

  const updated = [newNote, ...currentNotes];
  saveUPSCNotes(updated);
  return newNote;
}

export function deleteUPSCNote(noteId) {
  const currentNotes = getUPSCNotes();
  const updated = currentNotes.filter(n => n.id !== noteId);
  saveUPSCNotes(updated);
  return updated;
}

// Notes Document Attachments Storage & Management
const STORAGE_KEY_NOTES_DOCS = 'QUIZMIND_NOTES_DOCUMENTS';

export function getNotesDocuments() {
  const saved = localStorage.getItem(STORAGE_KEY_NOTES_DOCS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [
    {
      id: 'notes-doc-1',
      title: 'UPSC Polity Constitutional Amendments (1st to 106th) Handout PDF',
      subject: 'polity',
      fileType: 'pdf',
      fileSize: '1.8 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      fileData: 'DATA_EMBEDDED',
      uploadedBy: 'Anish Manhotra (UPSC Panel)'
    },
    {
      id: 'notes-doc-2',
      title: 'GS Paper III Economy Key Formulas & Macro Data Cheat Sheet',
      subject: 'economy',
      fileType: 'pdf',
      fileSize: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      fileData: 'DATA_EMBEDDED',
      uploadedBy: 'Faculty Wing'
    }
  ];
}

export function addNotesDocument(doc) {
  const current = getNotesDocuments();
  const newDoc = {
    id: 'notes-doc-' + Date.now(),
    title: doc.title,
    subject: doc.subject || 'all',
    fileType: doc.fileType || 'pdf',
    fileSize: doc.fileSize || '1.5 MB',
    uploadDate: new Date().toISOString().split('T')[0],
    fileData: doc.fileData || '',
    uploadedBy: doc.uploadedBy || 'Admin Panel'
  };
  const updated = [newDoc, ...current];
  localStorage.setItem(STORAGE_KEY_NOTES_DOCS, JSON.stringify(updated));
  return newDoc;
}

export function deleteNotesDocument(docId) {
  const current = getNotesDocuments();
  const updated = current.filter(d => d.id !== docId);
  localStorage.setItem(STORAGE_KEY_NOTES_DOCS, JSON.stringify(updated));
  return updated;
}

