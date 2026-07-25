// QuizMind AI - Full Stack API Service Client
// This module bridges the React frontend to the Express backend.

export const isSupabaseConfigured = false;
export const supabase = null;

// Dynamic Base URL detection for API endpoints
const API_BASE = ''; // empty string uses relative paths (proxied via Vite during dev, relative in production)

/** Generate unique 6-digit access code (frontend fallback if needed, but done on backend) */
export function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Create a new Quiz with Questions */
export async function createQuizInDB({ title, timeLimitMins, questions, adminId = 'admin-1' }) {
  const response = await fetch(`${API_BASE}/api/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, timeLimitMins, questions, adminId })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

/** Fetch All Admin Quizzes */
export async function fetchAdminQuizzes() {
  const response = await fetch(`${API_BASE}/api/quizzes`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

/** Fetch Quiz details by 6-digit Access Code */
export async function fetchQuizByAccessCode(code) {
  const cleanCode = String(code).trim();
  const response = await fetch(`${API_BASE}/api/quizzes/code/${cleanCode}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid or expired 6-digit access code.');
  }

  return await response.json();
}

/** Fetch Questions for a Quiz */
export async function fetchQuestionsForQuiz(quizId) {
  const response = await fetch(`${API_BASE}/api/quizzes/${quizId}/questions`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

/** Submit a Student Quiz Attempt */
export async function submitQuizAttempt({ quizId, studentName, score, totalQuestions, timeSpentSeconds }) {
  const response = await fetch(`${API_BASE}/api/quizzes/${quizId}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentName, score, totalQuestions, timeSpentSeconds })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

/** Fetch Leaderboard for a Quiz */
export async function fetchLeaderboard(quizId) {
  const response = await fetch(`${API_BASE}/api/quizzes/${quizId}/attempts`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

/** Subscribe to Real-time Leaderboard Updates (implemented via robust short polling) */
export function subscribeToLeaderboard(quizId, callback) {
  // Load initially
  fetchLeaderboard(quizId).then(callback).catch(console.error);

  // Poll for updates every 3 seconds
  const intervalId = setInterval(async () => {
    try {
      const data = await fetchLeaderboard(quizId);
      callback(data);
    } catch (err) {
      console.error('Error polling leaderboard:', err);
    }
  }, 3000);

  // Return unsubscribe cleanup function
  return () => {
    clearInterval(intervalId);
  };
}
