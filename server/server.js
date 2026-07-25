const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
// Load environment variables from server/.env and root .env
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });


const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Helper: Get primary local IPv4 address for student network sharing
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Endpoint to fetch network info for Admin Dashboard sharing card
app.get('/api/network-info', (req, res) => {
  const localIp = getLocalIpAddress();
  res.json({
    ip: localIp,
    studentUrl: `http://${localIp}:5173`,
    serverUrl: `http://${localIp}:${PORT}`
  });
});

// ----------------------------------------------------
// LIVE DAILY CURRENT AFFAIRS RSS FEED ENDPOINT
// ----------------------------------------------------
async function fetchLiveNewsRSS(rssUrl, category, categoryName) {
  try {
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QuizMind/1.0' }
    });
    if (!res.ok) return [];
    const xmlText = await res.text();
    
    const items = [];
    const itemRegex = /<item>[\s\S]*?<\/item>/gi;
    let match;
    let count = 0;
    
    while ((match = itemRegex.exec(xmlText)) !== null && count < 6) {
      const itemXml = match[0];
      
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemXml);
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemXml);

      if (titleMatch) {
        let cleanTitle = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
        const sourceMatch = cleanTitle.split(' - ');
        let source = 'Global News';
        if (sourceMatch.length > 1) {
          source = sourceMatch.pop();
          cleanTitle = sourceMatch.join(' - ');
        }

        const dateObj = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
        const formattedDate = dateObj.toISOString().split('T')[0];

        items.push({
          id: `live-${category}-${Date.now()}-${count}`,
          title: cleanTitle,
          category,
          categoryName,
          date: formattedDate,
          readTime: '2 min read',
          source,
          summary: `Latest live update from ${source}: ${cleanTitle}. Read key developments for competitive examination preparation.`,
          highlights: [
            `Breaking news bulletin reported by ${source}.`,
            `Key developments regarding ${cleanTitle.substring(0, 60)}...`,
            `Important current affairs topic for general awareness and exam prep.`
          ],
          content: `${cleanTitle}.\n\nThis live news update was reported on ${dateObj.toLocaleDateString()} by ${source}. Staying updated on daily developments helps build sound general awareness and factual knowledge for academic and competitive exams.`
        });
        count++;
      }
    }
    return items;
  } catch (err) {
    console.error(`Error fetching RSS feed for ${category}:`, err.message);
    return [];
  }
}

let liveNewsCache = {
  lastUpdated: 0,
  data: []
};

app.get('/api/current-affairs/live', async (req, res) => {
  const now = Date.now();
  if (liveNewsCache.data.length > 0 && (now - liveNewsCache.lastUpdated) < 15 * 60 * 1000) {
    return res.json(liveNewsCache.data);
  }

  try {
    const feeds = [
      { url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en', cat: 'national', name: 'National & Polity' },
      { url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-IN&gl=IN&ceid=IN:en', cat: 'international', name: 'International' },
      { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en', cat: 'science', name: 'Science & Tech' },
      { url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en', cat: 'economy', name: 'Economy & Business' },
      { url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en', cat: 'sports', name: 'Sports & Awards' }
    ];

    const results = await Promise.all(
      feeds.map(f => fetchLiveNewsRSS(f.url, f.cat, f.name))
    );

    const mergedLiveArticles = results.flat();

    if (mergedLiveArticles.length > 0) {
      liveNewsCache = {
        lastUpdated: now,
        data: mergedLiveArticles
      };
      return res.json(mergedLiveArticles);
    }
  } catch (err) {
    console.error('Failed to fetch live RSS news:', err);
  }

  res.json([]);
});


// Helper: safe text preprocessing on backend
function preprocessDocumentText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/%PDF-\d\.\d/gi, '')
    .replace(/\b(endobj|obj|stream|endstream|xref|trailer|startxref)\b/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

// ----------------------------------------------------
// QUIZ GENERATION ENDPOINT (GEMINI PROXY)
// ----------------------------------------------------
app.post('/api/quizzes/generate', async (req, res) => {
  const { documentText, numQuestions = 5, difficulty = 'Medium', apiKey } = req.body;

  const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeApiKey || activeApiKey.startsWith('AQ.')) {
    return res.status(400).json({
      error: 'Gemini API key is missing or invalid. Please enter a valid key in settings.'
    });
  }

  const cleanText = preprocessDocumentText(documentText);
  if (!cleanText || cleanText.length < 20) {
    return res.status(400).json({
      error: 'Not enough readable study text found in this document. Please ensure the file contains subject matter text.'
    });
  }

  const modelCandidates = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let lastError = null;

  for (const model of modelCandidates) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeApiKey}`;

      const systemPrompt = `You are a Senior UPSC CSE & Higher Education Test Examiner.
STRICT EXAMINER MANDATES:
1. STRICT DOCUMENT ADHERENCE: Generate questions 100% EXCLUSIVELY based on the facts, concepts, mechanisms, and arguments presented in the provided study document.
2. NO META PREFIXES: NEVER use prefixes like "According to the document...", "Based on the uploaded text...", "In the provided file...". Ask questions directly as authentic, professional exam items.
3. NO TRUNCATED SENTENCES OR DOTS: NEVER output partial sentences, truncated text, or ellipses ("..."). Every question sentence and option MUST be complete, grammatically sound, and fully written out.
4. UPSC EXAMINER QUESTION PATTERNS (Vary the question types across the set):
   - STATEMENT-BASED PATTERN: "Consider the following statements regarding [Concept]:\n1. [Statement I]\n2. [Statement II]\nWhich of the statements given above is/are correct?" (Options: "1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2")
   - ASSERTION-REASON PATTERN: "Assertion (A): [Premise]\nReason (R): [Explanation]\nWhich one of the following is correct?"
   - FACTUAL & LOGICAL ANALYSIS PATTERN: "With reference to [Subject], which one of the following statements is correct?"
5. HIGH-QUALITY OPTIONS & EXPLANATIONS:
   - Provide exactly 4 clear, plausible, distinct options and an educational explanation citing the document.`;

      const userPrompt = `Thoroughly analyze the following study document content and generate exactly ${numQuestions} ${difficulty}-level UPSC examiner style questions (mix Statement-Based, Assertion-Reason, and Analytical Logic patterns):

STUDY DOCUMENT CONTENT:
"""
${cleanText.substring(0, 25000)}
"""`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              quiz_title: { type: 'STRING' },
              questions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    id: { type: 'INTEGER' },
                    question_text: { type: 'STRING' },
                    options: {
                      type: 'ARRAY',
                      items: { type: 'STRING' }
                    },
                    correct_option_index: { type: 'INTEGER' },
                    explanation: { type: 'STRING' }
                  },
                  required: ['id', 'question_text', 'options', 'correct_option_index', 'explanation']
                }
              }
            },
            required: ['quiz_title', 'questions']
          }
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const quizResult = JSON.parse(rawJson);
          return res.json(quizResult);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        lastError = errData?.error?.message || `HTTP ${response.status}`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(400).json({ error: `Gemini API call failed: ${lastError || 'Invalid request'}` });
});

// ----------------------------------------------------
// DATABASE API ENDPOINTS
// ----------------------------------------------------

// Fetch all quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await db.getQuizzes();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
});

// Create a new quiz
app.post('/api/quizzes', async (req, res) => {
  const { title, timeLimitMins, questions, adminId = 'admin-1' } = req.body;

  if (!title || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Quiz title and an array of questions are required.' });
  }

  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
  const quizId = 'quiz-' + Date.now();

  const newQuiz = {
    id: quizId,
    admin_id: adminId,
    title,
    access_code: accessCode,
    document_url: null,
    time_limit_mins: Number(timeLimitMins) || 5,
    is_published: true,
    created_at: new Date().toISOString()
  };

  const formattedQuestions = questions.map((q, idx) => ({
    id: 'q-' + Date.now() + '-' + idx,
    quiz_id: quizId,
    question_text: q.question_text,
    options: q.options,
    correct_option_index: Number(q.correct_option_index) ?? 0,
    explanation: q.explanation || '',
    created_at: new Date().toISOString()
  }));

  try {
    await db.saveQuiz(newQuiz, formattedQuestions);
    res.status(201).json({ quiz: newQuiz, accessCode });
  } catch (err) {
    console.error('Error saving quiz:', err);
    res.status(500).json({ error: 'Failed to save quiz to database.' });
  }
});

// Fetch quiz by 6-digit access code
app.get('/api/quizzes/code/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const quiz = await db.getQuizByAccessCode(code);
    if (!quiz) {
      return res.status(404).json({ error: 'Invalid or expired 6-digit access code.' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz.' });
  }
});

// Fetch questions for a quiz
app.get('/api/quizzes/:id/questions', async (req, res) => {
  const quizId = req.params.id;
  try {
    const questions = await db.getQuestionsForQuiz(quizId);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

// Submit a student attempt
app.post('/api/quizzes/:id/attempts', async (req, res) => {
  const quizId = req.params.id;
  const { studentName, score, totalQuestions, timeSpentSeconds } = req.body;

  if (!studentName) {
    return res.status(400).json({ error: 'Student name is required.' });
  }

  const attempt = {
    id: 'att-' + Date.now(),
    quiz_id: quizId,
    student_name: studentName,
    score: Number(score) ?? 0,
    total_questions: Number(totalQuestions) ?? 0,
    time_spent_seconds: Number(timeSpentSeconds) ?? 0,
    completed_at: new Date().toISOString()
  };

  try {
    await db.saveAttempt(attempt);
    res.status(201).json(attempt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save attempt.' });
  }
});

// Fetch leaderboard attempts for a quiz
app.get('/api/quizzes/:id/attempts', async (req, res) => {
  const quizId = req.params.id;
  try {
    const attempts = await db.getAttemptsForQuiz(quizId);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// Serve frontend static build files (production fallback)
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`\n=================================================`);
  console.log(`🚀 QuizMind AI Full-Stack Server Running!`);
  console.log(`- Local URL:   http://localhost:${PORT}`);
  console.log(`- Network IP:  http://${localIp}:${PORT}`);
  console.log(`=================================================\n`);
});
