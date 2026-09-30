/**
 * On-Device Privacy Firewall Module
 * Performs zero-latency local detection & masking of sensitive data (PII).
 */

export class PrivacyFirewall {
  constructor() {
    this.piiPatterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
      phone: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      apiKey: /(?:api[_-]?key|auth[_-]?token|bearer)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{16,}['"]?/gi
    };
  }

  /**
   * Scans interactive DOM elements for sensitive inputs (passwords, credit cards)
   * @param {Array<HTMLElement>} elements 
   * @returns {Array<Object>} Masked bounding rects
   */
  scanDOMForSensitiveZones(elements) {
    const maskedZones = [];

    elements.forEach((el) => {
      const isPassword = el.type === 'password' || el.getAttribute('autocomplete') === 'current-password';
      const isCreditCard = el.getAttribute('autocomplete') === 'cc-number' || el.id?.toLowerCase().includes('card');
      const isSensitiveAttr = el.hasAttribute('data-private') || el.classList.contains('sensitive');

      if (isPassword || isCreditCard || isSensitiveAttr) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          maskedZones.push({
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
            type: isPassword ? 'PASSWORD' : 'PII_CREDIT_CARD'
          });
        }
      }
    });

    return maskedZones;
  }

  /**
   * Scans extracted OCR text for PII matches
   * @param {string} text 
   * @returns {Array<Object>} Matches with redacted placeholder
   */
  sanitizeText(text) {
    let sanitized = text;
    let redactedCount = 0;

    // 1. Standard PII Patterns
    for (const [key, pattern] of Object.entries(this.piiPatterns)) {
      sanitized = sanitized.replace(pattern, (match) => {
        redactedCount++;
        return `[REDACTED_${key.toUpperCase()}]`;
      });
    }

    // 2. Generic-high-entropy pattern check (Potential API Keys/Tokens)
    // Looks for strings of 20+ alphanumeric characters with mixed case/numbers (common in keys)
    const highEntropyPattern = /\b[a-zA-Z0-9]{20,}\b/g;
    sanitized = sanitized.replace(highEntropyPattern, (match) => {
      // Avoid redacting common long words by checking for mixed character types
      const hasDigit = /\d/.test(match);
      const hasUpper = /[A-Z]/.test(match);
      const hasLower = /[a-z]/.test(match);

      if ((hasDigit && hasUpper) || (hasDigit && hasLower)) {
        redactedCount++;
        return `[REDACTED_SECRET]`;
      }
      return match;
    });

    return {
      sanitizedText: sanitized,
      redactedCount
    };
  }
}
