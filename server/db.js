const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

async function readDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty template
    const initial = { quizzes: [], questions: [], attempts: [] };
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
 * Finds a quiz by its unique 6-digit access code.
 */
async function getQuizByAccessCode(code) {
  const db = await readDb();
  const quiz = db.quizzes.find(q => q.access_code === code && q.is_published);
  return quiz || null;
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

  const existingIndex = db.students.findIndex(s => s.name.toLowerCase() === cleanName.toLowerCase() || s.email.toLowerCase() === cleanEmail.toLowerCase());

  if (existingIndex !== -1) {
    db.students[existingIndex] = {
      ...db.students[existingIndex],
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
  updateStudentStatsInDB
};


