/**
 * QuizMind Pro - Cross-Site External Quiz SDK
 * ----------------------------------------------------
 * Include this script on your external AI-generated static quiz site:
 * <script src="http://localhost:5000/quizmind-external-sdk.js"></script>
 */

(function () {
  const DEFAULT_MAIN_SITE = window.location.origin.includes('localhost')
    ? 'http://localhost:5000'
    : window.location.origin;

  const CONFIG = {
    webhookUrl: window.QUIZMIND_WEBHOOK_URL || `${DEFAULT_MAIN_SITE}/webhooks/quiz-result`,
    redirectUrl: window.QUIZMIND_REDIRECT_URL || `${DEFAULT_MAIN_SITE}`,
    secretToken: window.QUIZMIND_SECRET_TOKEN || 'super-secret-bearer-token-12345'
  };

  let studentId = null;
  let topic = 'General Knowledge';

  /**
   * Parses URL query parameters on load to extract studentId and topic.
   */
  function initSession() {
    const params = new URLSearchParams(window.location.search);
    studentId = params.get('studentId') || params.get('student_id') || params.get('student') || null;
    topic = params.get('topic') || params.get('subject') || 'External AI Quiz';

    if (studentId) {
      console.log(`[QuizMind SDK] Initialized session for Student ID: ${studentId} | Topic: ${topic}`);
    } else {
      console.warn('[QuizMind SDK] Warning: studentId query parameter missing from URL.');
    }
  }

  /**
   * Submits student score to the QuizMind Pro Webhook and redirects the browser.
   * @param {number} finalScore - Score or score percentage (0 - 100)
   */
  async function submitAndRedirect(finalScore) {
    if (!studentId) {
      const promptName = prompt('Please enter your Student Name / ID to record your score:');
      if (promptName && promptName.trim()) {
        studentId = promptName.trim();
      } else {
        alert('Student ID is required to submit your score.');
        return;
      }
    }

    const payload = {
      studentId: String(studentId),
      topic: String(topic),
      score: Number(finalScore)
    };

    try {
      console.log('[QuizMind SDK] Submitting quiz result via webhook...', payload);

      const response = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.secretToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('[QuizMind SDK] Score recorded successfully. Redirecting to main portal...');
        window.location.href = CONFIG.redirectUrl;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('[QuizMind SDK] Error submitting quiz score:', err);
      alert(`Submission Failed: ${err.message}`);
    }
  }

  // Expose global methods
  window.QuizMindSDK = {
    initSession,
    submitAndRedirect,
    getStudentId: () => studentId,
    getTopic: () => topic
  };

  window.submitAndRedirect = submitAndRedirect;

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSession);
  } else {
    initSession();
  }
})();
