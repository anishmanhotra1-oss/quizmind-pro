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

module.exports = {
  getQuizzes,
  saveQuiz,
  getQuizByAccessCode,
  getQuestionsForQuiz,
  saveAttempt,
  getAttemptsForQuiz,
  getChatMessages,
  saveChatMessage
};

