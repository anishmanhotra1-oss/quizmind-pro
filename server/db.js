const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

async function readDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.quizzes) parsed.quizzes = [];
    if (!parsed.questions) parsed.questions = [];
    if (!parsed.attempts) parsed.attempts = [];
    if (!parsed.externalQuizLinks) parsed.externalQuizLinks = [];
    if (!parsed.externalQuizResults) parsed.externalQuizResults = [];
    return parsed;
  } catch (err) {
    // If file doesn't exist, return empty template
    const initial = { quizzes: [], questions: [], attempts: [], externalQuizLinks: [], externalQuizResults: [] };
    await writeDb(initial);
    return initial;
  }
}

async function writeDb(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Retrieves all quizzes ordered by creation date (newest first).
 */
async function getQuizzes() {
  const db = await readDb();
  return db.quizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Saves a new quiz and its corresponding questions.
 */
async function saveQuiz(quiz, questions) {
  const db = await readDb();
  
  // Add quiz
  db.quizzes.push(quiz);
  
  // Add questions
  db.questions.push(...questions);
  
  await writeDb(db);
  return quiz;
}

/**
 * Finds a quiz by its unique 6-digit access code (both standard and external AI quiz links).
 */
async function getQuizByAccessCode(code) {
  const db = await readDb();
  const cleanCode = String(code).trim();
  
  // 1. Search standard quizzes
  const quiz = db.quizzes.find(q => q.access_code === cleanCode && q.is_published);
  if (quiz) return quiz;

  // 2. Search external quiz links
  if (db.externalQuizLinks && db.externalQuizLinks.length > 0) {
    const extLink = db.externalQuizLinks.find(l => l.access_code === cleanCode);
    if (extLink) {
      return {
        id: extLink.id,
        title: `🌐 External Quiz: ${extLink.topic}`,
        topic: extLink.topic,
        access_code: extLink.access_code,
        externalUrl: extLink.externalUrl,
        is_external: true,
        is_published: true,
        created_at: extLink.created_at
      };
    }
  }

  return null;
}

/**
 * Finds all questions for a given quiz ID.
 */
async function getQuestionsForQuiz(quizId) {
  const db = await readDb();
  return db.questions.filter(q => q.quiz_id === quizId);
}

/**
 * Saves a student quiz attempt.
 */
async function saveAttempt(attempt) {
  const db = await readDb();
  db.attempts.push(attempt);
  await writeDb(db);
  return attempt;
}

/**
 * Retrieves leaderboard attempts for a quiz, sorted by score desc, time asc.
 */
async function getAttemptsForQuiz(quizId) {
  const db = await readDb();
  const attempts = db.attempts.filter(att => att.quiz_id === quizId);
  
  return attempts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.time_spent_seconds - b.time_spent_seconds;
  });
}

/**
 * Retrieves community chat messages.
 */
async function getChatMessages() {
  const db = await readDb();
  if (!db.chatMessages) {
    db.chatMessages = [
      {
        id: 'msg-1',
        senderName: 'Anish Manhotra (UPSC Faculty)',
        senderRole: 'admin',
        messageText: 'Welcome to QuizMind Community Doubts Chat! Feel free to ask any syllabus questions, doubt clarifications, or exam strategy queries here.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    await writeDb(db);
  }
  return db.chatMessages;
}

/**
 * Saves a new community chat message.
 */
async function saveChatMessage(msg) {
  const db = await readDb();
  if (!db.chatMessages) db.chatMessages = [];
  db.chatMessages.push(msg);
  await writeDb(db);
  return msg;
}

/**
 * Retrieves registered student roster from database.
 */
async function getStudents() {
  const db = await readDb();
  if (!db.students) {
    db.students = [
      {
        id: 'std-101',
        name: 'Alex Morgan',
        email: 'alex.morgan@student.edu',
        joinedDate: '2026-07-20',
        device: 'Desktop / Chrome',
        attemptsCount: 3,
        avgScore: 88
      },
      {
        id: 'std-102',
        name: 'Jordan Miller',
        email: 'jordan.m@student.edu',
        joinedDate: '2026-07-22',
        device: 'Mobile / Safari',
        attemptsCount: 2,
        avgScore: 75
      },
      {
        id: 'std-103',
        name: 'Priya Sharma',
        email: 'priya.sharma@upsc.org',
        joinedDate: '2026-07-24',
        device: 'Tablet / Chrome',
        attemptsCount: 5,
        avgScore: 94
      }
    ];
    await writeDb(db);
  }
  return db.students.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
}

/**
 * Registers or updates a student account in database.
 */
async function saveStudent(studentData) {
  const db = await readDb();
  if (!db.students) db.students = [];

  const cleanName = studentData.name.trim();
  const cleanEmail = studentData.email && studentData.email.trim()
    ? studentData.email.trim()
    : `${cleanName.toLowerCase().replace(/\s+/g, '.')}@student.edu`;

  const existingIndex = db.students.findIndex(s => s.name.toLowerCase() === cleanName.toLowerCase() || (s.email && s.email.toLowerCase() === cleanEmail.toLowerCase() && cleanEmail.includes('@')));

  if (existingIndex !== -1) {
    db.students[existingIndex] = {
      ...db.students[existingIndex],
      name: cleanName, // Always preserve exact name entered during student login
      lastLogin: new Date().toISOString(),
      device: studentData.device || db.students[existingIndex].device || 'Web Client'
    };
    await writeDb(db);
    return db.students[existingIndex];
  }

  const newStudent = {
    id: 'std-' + Date.now().toString().slice(-4),
    name: cleanName,
    email: cleanEmail,
    joinedDate: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString(),
    device: studentData.device || 'Web Client',
    attemptsCount: 0,
    avgScore: 0
  };

  db.students.unshift(newStudent);
  await writeDb(db);
  return newStudent;
}

/**
 * Updates student score stats in database after test completion.
 */
async function updateStudentStatsInDB(studentName, newScorePercentage) {
  const db = await readDb();
  if (!db.students) return;

  const std = db.students.find(s => s.name.toLowerCase() === studentName.toLowerCase());
  if (std) {
    const attempts = (std.attemptsCount || 0) + 1;
    const currentAvg = std.avgScore || 0;
    const newAvg = Math.round(((currentAvg * (attempts - 1)) + newScorePercentage) / attempts);
    std.attemptsCount = attempts;
    std.avgScore = newAvg;
    await writeDb(db);
  }
}

/**
 * Retrieves UPSC notes list.
 */
async function getUPSCNotes() {
  const db = await readDb();
  if (!db.notes) {
    db.notes = [
      {
        id: 'note-1',
        title: 'Preamble, Fundamental Rights (Art 12-35) & Basic Structure Doctrine',
        subject: 'polity',
        subjectLabel: 'Polity & Constitution',
        paperTag: 'GS Paper II',
        author: 'Anish Manhotra (UPSC Expert Panel)',
        date: '2026-07-25',
        summary: 'Comprehensive analysis of Fundamental Rights, Reasonable Restrictions, and Key Supreme Court Cases (Kesavananda Bharati, Maneka Gandhi).',
        content: '# Polity & Constitution: Fundamental Rights & Basic Structure\n\n## 1. Preamble & Key Constitutional Objectives\nThe Preamble declares India to be a Sovereign, Socialist, Secular, Democratic, Republic.'
      }
    ];
    await writeDb(db);
  }
  return db.notes;
}

async function saveUPSCNote(noteData) {
  const db = await readDb();
  if (!db.notes) db.notes = [];

  const newNote = {
    id: 'note-' + Date.now(),
    title: noteData.title,
    subject: noteData.subject || 'polity',
    subjectLabel: noteData.subjectLabel || 'General Studies',
    paperTag: noteData.paperTag || 'GS Paper II',
    author: noteData.author || 'UPSC Admin Faculty',
    date: new Date().toISOString().split('T')[0],
    summary: noteData.summary || '',
    content: noteData.content || ''
  };

  db.notes.unshift(newNote);
  await writeDb(db);
  return newNote;
}

async function deleteUPSCNote(noteId) {
  const db = await readDb();
  if (!db.notes) return [];
  db.notes = db.notes.filter(n => n.id !== noteId);
  await writeDb(db);
  return db.notes;
}

/**
 * Notes Documents (Attachments)
 */
async function getNotesDocuments() {
  const db = await readDb();
  if (!db.notesDocuments) {
    db.notesDocuments = [
      {
        id: 'doc-note-101',
        title: 'UPSC Mains GS II Constitutional Landmarks Master Reference Sheet',
        subject: 'polity',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        fileName: 'UPSC_GS2_Constitutional_Landmarks.pdf',
        fileData: 'DATA_EMBEDDED',
        uploadDate: '2026-07-25',
        uploadedBy: 'Anish Manhotra'
      }
    ];
    await writeDb(db);
  }
  return db.notesDocuments;
}

async function saveNotesDocument(docData) {
  const db = await readDb();
  if (!db.notesDocuments) db.notesDocuments = [];

  const newDoc = {
    id: 'doc-note-' + Date.now(),
    title: docData.title,
    subject: docData.subject || 'all',
    fileType: docData.fileType || 'pdf',
    fileSize: docData.fileSize || '1.5 MB',
    fileName: docData.fileName || `${docData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${docData.fileType || 'pdf'}`,
    fileData: docData.fileData || '',
    uploadDate: new Date().toISOString().split('T')[0],
    uploadedBy: docData.uploadedBy || 'UPSC Admin Faculty'
  };

  db.notesDocuments.unshift(newDoc);
  await writeDb(db);
  return newDoc;
}

async function deleteNotesDocument(docId) {
  const db = await readDb();
  if (!db.notesDocuments) return [];
  db.notesDocuments = db.notesDocuments.filter(d => d.id !== docId);
  await writeDb(db);
  return db.notesDocuments;
}

/**
 * Current Affairs Articles
 */
async function getCurrentAffairs() {
  const db = await readDb();
  if (!db.currentAffairs) {
    db.currentAffairs = [
      {
        id: 'ca-101',
        title: 'National Quantum Mission (NQM) 2026: Implementation Roadmap & Strategic Implications',
        category: 'science',
        categoryName: 'Science & Technology',
        source: 'PIB / Hindu Editorial',
        date: '2026-07-26',
        summary: 'Deep dive into India\'s Quantum Communication and Computing mandate approved by DST.',
        content: '# National Quantum Mission 2026\n\nIndia advances quantum communication networks across 2000 km key distribution routes.'
      }
    ];
    await writeDb(db);
  }
  return db.currentAffairs;
}

async function saveCurrentAffairs(caData) {
  const db = await readDb();
  if (!db.currentAffairs) db.currentAffairs = [];

  const newCA = {
    id: 'ca-' + Date.now(),
    title: caData.title,
    category: caData.category || 'national',
    categoryName: caData.categoryName || 'National Affairs',
    source: caData.source || 'PIB / Editorial',
    date: new Date().toISOString().split('T')[0],
    summary: caData.summary || '',
    content: caData.content || ''
  };

  db.currentAffairs.unshift(newCA);
  await writeDb(db);
  return newCA;
}

async function deleteCurrentAffairs(caId) {
  const db = await readDb();
  if (!db.currentAffairs) return [];
  db.currentAffairs = db.currentAffairs.filter(c => c.id !== caId);
  await writeDb(db);
  return db.currentAffairs;
}

/**
 * Current Affairs Documents (Attachments)
 */
async function getCADocuments() {
  const db = await readDb();
  if (!db.caDocuments) {
    db.caDocuments = [
      {
        id: 'doc-ca-201',
        title: 'PIB & Yojana July 2026 Monthly Current Affairs Digest Dossier',
        category: 'national',
        fileType: 'pdf',
        fileSize: '3.8 MB',
        fileName: 'PIB_July_2026_Current_Affairs_Digest.pdf',
        fileData: 'DATA_EMBEDDED',
        uploadDate: '2026-07-26',
        uploadedBy: 'Current Affairs Desk'
      }
    ];
    await writeDb(db);
  }
  return db.caDocuments;
}

async function saveCADocument(docData) {
  const db = await readDb();
  if (!db.caDocuments) db.caDocuments = [];

  const newDoc = {
    id: 'doc-ca-' + Date.now(),
    title: docData.title,
    category: docData.category || 'all',
    fileType: docData.fileType || 'pdf',
    fileSize: docData.fileSize || '1.5 MB',
    fileName: docData.fileName || `${docData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${docData.fileType || 'pdf'}`,
    fileData: docData.fileData || '',
    uploadDate: new Date().toISOString().split('T')[0],
    uploadedBy: docData.uploadedBy || 'Current Affairs Faculty'
  };

  db.caDocuments.unshift(newDoc);
  await writeDb(db);
  return newDoc;
}

async function deleteCADocument(docId) {
  const db = await readDb();
  if (!db.caDocuments) return [];
  db.caDocuments = db.caDocuments.filter(d => d.id !== docId);
  await writeDb(db);
  return db.caDocuments;
}

/**
 * Retrieves student profile with attempts and asked doubts history.
 */
async function getStudentProfile(identifier) {
  const db = await readDb();
  if (!db.students) await getStudents();
  const q = (identifier || '').toLowerCase().trim();
  const student = db.students.find(s => 
    s.id.toLowerCase() === q || 
    s.name.toLowerCase() === q || 
    s.email.toLowerCase() === q
  );

  const doubts = (db.chatMessages || []).filter(msg => 
    msg.senderName && msg.senderName.toLowerCase() === (student ? student.name.toLowerCase() : q)
  );

  const attempts = (db.attempts || []).filter(att => 
    att.student_name && att.student_name.toLowerCase() === (student ? student.name.toLowerCase() : q)
  ).map(att => {
    const quizObj = (db.quizzes || []).find(qz => qz.id === att.quiz_id);
    const scorePct = att.total_questions > 0 ? Math.round((att.score / att.total_questions) * 100) : 0;
    return {
      ...att,
      quizTitle: quizObj ? quizObj.title : 'Interactive AI Assessment Quiz',
      scorePercentage: scorePct
    };
  });

  if (!student) {
    return {
      id: 'std-' + Date.now().toString().slice(-4),
      name: identifier || 'Student Learner',
      email: `${(identifier || 'student').toLowerCase().replace(/\s+/g, '.')}@student.edu`,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      device: 'Web Client',
      attemptsCount: attempts.length,
      avgScore: attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.scorePercentage, 0) / attempts.length) : 0,
      doubtsCount: doubts.length,
      doubtsHistory: doubts,
      attemptsHistory: attempts
    };
  }

  return {
    ...student,
    attemptsCount: attempts.length > 0 ? attempts.length : student.attemptsCount || 0,
    avgScore: attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.scorePercentage, 0) / attempts.length) : student.avgScore || 0,
    doubtsCount: doubts.length,
    doubtsHistory: doubts,
    attemptsHistory: attempts
  };
}

/**
 * External AI Quiz Links & Webhook Results
 */
async function getExternalQuizLinks() {
  const db = await readDb();
  if (!db.externalQuizLinks) {
    db.externalQuizLinks = [];
  }
  return db.externalQuizLinks;
}

async function saveExternalQuizLink({ topic, externalUrl }) {
  const db = await readDb();
  if (!db.externalQuizLinks) db.externalQuizLinks = [];

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const newLink = {
    id: 'ext-link-' + Date.now(),
    topic: topic.trim(),
    externalUrl: externalUrl.trim(),
    access_code: code,
    is_external: true,
    created_at: new Date().toISOString()
  };

  db.externalQuizLinks.unshift(newLink);
  await writeDb(db);
  return newLink;
}

async function deleteExternalQuizLink(linkId) {
  const db = await readDb();
  if (!db.externalQuizLinks) return [];
  db.externalQuizLinks = db.externalQuizLinks.filter(l => l.id !== linkId);
  await writeDb(db);
  return db.externalQuizLinks;
}

async function saveWebhookResult({ studentId, topic, score }) {
  const db = await readDb();
  if (!db.externalQuizResults) db.externalQuizResults = [];

  const newResult = {
    id: 'res-' + Date.now(),
    studentId: String(studentId),
    topic: String(topic),
    score: Number(score),
    submittedAt: new Date().toISOString()
  };

  db.externalQuizResults.unshift(newResult);

  // Also record as a student attempt so it reflects live on student profiles & leaderboard
  if (!db.attempts) db.attempts = [];
  const attemptRecord = {
    id: 'att-ext-' + Date.now(),
    quiz_id: 'ext-' + topic.replace(/[^a-zA-Z0-9]/g, '_'),
    student_name: String(studentId),
    score_achieved: Number(score),
    total_questions: 100,
    scorePercentage: Number(score),
    time_spent_seconds: 120,
    completed_at: new Date().toISOString()
  };
  db.attempts.unshift(attemptRecord);

  await writeDb(db);
  return newResult;
}

module.exports = {
  getQuizzes,
  saveQuiz,
  getQuizByAccessCode,
  getQuestionsForQuiz,
  saveAttempt,
  getAttemptsForQuiz,
  getChatMessages,
  saveChatMessage,
  getStudents,
  saveStudent,
  updateStudentStatsInDB,
  getStudentProfile,
  getUPSCNotes,
  saveUPSCNote,
  deleteUPSCNote,
  getNotesDocuments,
  saveNotesDocument,
  deleteNotesDocument,
  getCurrentAffairs,
  saveCurrentAffairs,
  deleteCurrentAffairs,
  getCADocuments,
  saveCADocument,
  deleteCADocument,
  getExternalQuizLinks,
  saveExternalQuizLink,
  deleteExternalQuizLink,
  saveWebhookResult
};



