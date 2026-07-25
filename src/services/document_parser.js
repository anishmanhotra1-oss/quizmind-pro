/**
 * Clean and sanitize extracted text to strip raw metadata headers,
 * PDF stream tags, and non-printable binary artifacts.
 */
function sanitizeExtractedText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/%PDF-\d\.\d/gi, '') // Strip PDF version headers
    .replace(/\b(endobj|obj|stream|endstream|xref|trailer|startxref)\b/gi, '') // Strip PDF keywords
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ') // Strip non-printable control characters only
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces/tabs
    .replace(/\n\s*\n/g, '\n\n') // Preserve paragraph breaks
    .trim();
}

/**
 * Dynamically loads PDF.js from CDN if it is not already available on window.
 */
async function ensurePdfJsLoaded() {
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-pdfjs]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('data-pdfjs', 'true');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      document.head.appendChild(script);
    }

    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to initialize.'));
      }
    };

    script.onerror = () => reject(new Error('Failed to load PDF text extraction engine.'));
  });
}

/**
 * Extracts raw text content from uploaded files (PDF, DOCX, TXT, MD).
 * @param {File} file - The file object from input or drop event.
 * @returns {Promise<string>} Cleaned, readable document text.
 */
export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error('No file provided for text extraction.');
  }

  const fileName = file.name.toLowerCase();

  // 1. Plain Text (.txt, .md, .json, .csv)
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || file.type.startsWith('text/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(sanitizeExtractedText(e.target.result || ''));
      reader.onerror = (err) => reject(new Error('Failed to read text file: ' + err.message));
      reader.readAsText(file);
    });
  }

  // 2. Word Document (.docx) - Safe dynamic handling
  if (fileName.endsWith('.docx')) {
    try {
      let mammothObj = window.mammoth;
      if (!mammothObj) {
        try {
          mammothObj = await import('mammoth');
        } catch (e) {
          console.warn('Mammoth not installed locally, falling back to FileReader.');
        }
      }

      if (mammothObj && mammothObj.extractRawText) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammothObj.extractRawText({ arrayBuffer });
        return sanitizeExtractedText(result.value || '');
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(sanitizeExtractedText(e.target.result || ''));
        reader.readAsText(file);
      });
    } catch (err) {
      console.error('Error parsing DOCX file:', err);
      throw new Error('Failed to parse Word (.docx) document: ' + err.message);
    }
  }

  // 3. PDF Document (.pdf) - Page-by-page text extraction
  if (fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await ensurePdfJsLoaded();

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let extractedText = '';

      // Extract up to first 30 pages for optimal quiz generation context
      const maxPages = Math.min(pdf.numPages, 30);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageStrings = content.items
          .map((item) => (typeof item.str === 'string' ? item.str : ''))
          .filter((str) => str.trim().length > 0);
        extractedText += pageStrings.join(' ') + '\n';
      }

      const cleanText = sanitizeExtractedText(extractedText);

      if (!cleanText || cleanText.length < 30) {
        throw new Error('PDF appears to be an image scan or empty. Please upload a PDF with selectable text.');
      }

      return cleanText;
    } catch (err) {
      console.error('Error parsing PDF file:', err);
      throw new Error('Failed to parse PDF document: ' + err.message);
    }
  }

  // Generic fallback for plain text formats
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(sanitizeExtractedText(e.target.result || ''));
    reader.onerror = (err) => reject(new Error('Failed to read file: ' + err.message));
    reader.readAsText(file);
  });
}

export default {
  extractTextFromFile,
  sanitizeExtractedText
};