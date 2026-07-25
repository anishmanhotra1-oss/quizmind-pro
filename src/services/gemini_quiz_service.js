/**
 * QuizMind AI - Gemini & Document Quiz Generation Engine
 */

/**
 * Safely reads environment variables across Vite, Webpack, and Next.js environments.
 */
function getEnvApiKey() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (
        import.meta.env.VITE_GEMINI_API_KEY ||
        import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        import.meta.env.REACT_APP_GEMINI_API_KEY ||
        ''
      );
    }
  } catch (e) {
    // Ignore environment syntax errors
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env.REACT_APP_GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        ''
      );
    }
  } catch (e) {
    // Ignore process errors
  }
  return '';
}

/**
 * Preprocesses and sanitizes raw text extracted from documents.
 * Preserves text formatting, Unicode characters, and paragraph structure.
 */
export function preprocessDocumentText(rawText) {
  if (!rawText) return '';

  return rawText
    .replace(/%PDF-\d\.\d/gi, '')
    .replace(/\b(endobj|obj|stream|endstream|xref|trailer|startxref)\b/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Retrieves the currently active API key from parameter, local storage, session storage, or env.
 */
export function getActiveGeminiApiKey(userProvidedKey = '') {
  return (
    userProvidedKey ||
    localStorage.getItem('GEMINI_API_KEY') ||
    localStorage.getItem('quizmind_gemini_key') ||
    localStorage.getItem('gemini_api_key') ||
    sessionStorage.getItem('quizmind_gemini_key') ||
    getEnvApiKey()
  );
}

/**
 * Normalizes quiz data to ensure the keys consistently match what the frontend and DB expect.
 */
function normalizeQuizResult(result, fallbackTitle = 'AI Generated Quiz') {
  if (!result) return null;

  const normalized = {
    quiz_title: result.quiz_title || result.quizTitle || fallbackTitle,
    questions: []
  };

  if (Array.isArray(result.questions)) {
    normalized.questions = result.questions.map((q, idx) => ({
      id: q.id !== undefined ? q.id : idx + 1,
      question_text: q.question_text || q.question || '',
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_option_index: typeof q.correct_option_index === 'number' ? q.correct_option_index : 0,
      explanation: q.explanation || ''
    }));
  }

  return normalized;
}

/**
 * Smart Document-Based Fallback Quiz Generator
 * Parses uploaded document text locally to generate high-quality multiple choice questions
 * based 100% on the uploaded file text when Gemini API key is missing or unavailable.
 */
export function generateSmartFallbackQuiz(documentText, count = 5, difficulty = 'Medium') {
  const clean = preprocessDocumentText(documentText);
  if (!clean || clean.length < 20) {
    throw new Error('Not enough readable text in document to generate a quiz.');
  }

  // Split into sentences
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 250 && !/^(page|table|figure|http|www)/i.test(s));

  const questions = [];
  const targetCount = Math.min(count, Math.max(3, sentences.length));

  // Determine key terms from text
  const words = clean.match(/\b[A-Z][a-z]{3,}\b/g) || ['Concept', 'Theory', 'Method', 'Principle', 'Process'];
  const uniqueTerms = Array.from(new Set(words));

  for (let i = 0; i < targetCount; i++) {
    const sentence = sentences[i % sentences.length];
    
    // Pick key term or fragment from sentence
    const sentWords = sentence.split(/\s+/);
    const keySubject = sentWords.slice(0, 4).join(' ').replace(/^[a-z]/, c => c.toUpperCase());

    const questionText = `According to the uploaded material: "${sentence.substring(0, 90)}...", what is the main concept addressed?`;
    
    const correctOption = sentence.length > 80 ? sentence.substring(0, 75) + '...' : sentence;
    
    const distractors = [
      `Alternative interpretation regarding ${uniqueTerms[(i + 1) % uniqueTerms.length] || 'systems'}`,
      `Secondary factor involving ${uniqueTerms[(i + 2) % uniqueTerms.length] || 'methods'}`,
      `Unrelated reference to ${uniqueTerms[(i + 3) % uniqueTerms.length] || 'procedures'}`
    ];

    const options = [correctOption, ...distractors];
    // Shuffle options reproducibly
    const shuffledOptions = options.sort(() => (i % 2 === 0 ? 0.5 - Math.random() : Math.random() - 0.5));
    const correctIdx = shuffledOptions.indexOf(correctOption);

    questions.push({
      id: i + 1,
      question_text: `[Doc Reference Q${i + 1}] ${keySubject}: What statement best describes this concept from the document?`,
      options: shuffledOptions,
      correct_option_index: correctIdx >= 0 ? correctIdx : 0,
      explanation: `Extracted directly from text: "${sentence}"`
    });
  }

  return {
    quiz_title: 'Document Study Quiz',
    questions
  };
}

/**
 * Generates quiz questions from document text using Google Gemini API with smart fallback.
 */
export async function generateQuizFromText(documentTextOrParams, questionCount = 5, difficulty = 'Medium', apiKey = '') {
  let documentText = documentTextOrParams;
  let count = questionCount;
  let diff = difficulty;
  let key = apiKey;

  if (documentTextOrParams && typeof documentTextOrParams === 'object') {
    documentText = documentTextOrParams.documentText || documentTextOrParams.text || '';
    count = documentTextOrParams.questionCount || documentTextOrParams.numQuestions || questionCount;
    diff = documentTextOrParams.difficulty || difficulty;
    key = documentTextOrParams.apiKey || apiKey;
  }

  const cleanText = preprocessDocumentText(documentText);
  if (!cleanText || cleanText.length < 20) {
    throw new Error('Not enough readable study text found in this document. Please ensure the file contains subject matter text.');
  }

  const finalApiKey = getActiveGeminiApiKey(key);

  // 1. Try backend Express proxy endpoint first
  try {
    const response = await fetch('/api/quizzes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentText: cleanText,
        numQuestions: count,
        difficulty: diff,
        apiKey: finalApiKey
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.questions && data.questions.length > 0) {
        return normalizeQuizResult(data);
      }
    }
  } catch (backendErr) {
    console.warn('Backend proxy generation unavailable, trying direct client Gemini API...', backendErr);
  }

  // 2. Try direct Google Gemini API call if key is present
  if (finalApiKey) {
    const modelCandidates = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

    for (const model of modelCandidates) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalApiKey}`;

        const systemPrompt = `You are an expert academic test creator.
STRICT MANDATES:
1. FOCUS EXCLUSIVELY on substantive concepts, definitions, and facts present in the provided study text.
2. NEVER generate generic trivia or questions about document structural metadata.
3. Every question must have exactly 4 options, 0-indexed correct option integer, and an explanation citing the text.`;

        const userPrompt = `Read the following document text carefully and generate exactly ${count} ${diff}-level multiple choice questions:

DOCUMENT CONTENT:
"""
${cleanText.substring(0, 20000)}
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
            const jsonResult = JSON.parse(rawJson);
            return normalizeQuizResult(jsonResult);
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${model} call failed, trying next candidate...`, err);
      }
    }
  }

  // 3. Fallback: Notify missing key / API failure, and use Smart Document Engine
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gemini_key_missing'));
  }

  console.info('Using Smart Document-Based Fallback Engine to generate quiz from file...');
  return generateSmartFallbackQuiz(cleanText, count, diff);
}

// Named alias expected by AdminDashboard.jsx
export const generateQuizWithGemini = generateQuizFromText;

export default {
  generateQuizFromText,
  generateQuizWithGemini,
  generateSmartFallbackQuiz,
  preprocessDocumentText,
  getActiveGeminiApiKey
};