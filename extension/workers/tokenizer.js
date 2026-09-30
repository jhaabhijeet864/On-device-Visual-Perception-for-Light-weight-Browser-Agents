// tokenizer.js - Structural Coordinate Tokenization
export class Tokenizer {
  constructor() {
    this.registry = new Map();
    this.tokenCounter = 0;
  }

  /**
   * Processes detections and assigns surrogate tokens to interactive elements.
   * @param {Array} detections - Results from the vision model
   * @returns {Object} { tokens: Array, registry: Map }
   */
  tokenize(detections) {
    const networkTokens = [];

    detections.forEach(det => {
      if (!det.isPII && det.label === 'INTERACTIVE_ELEMENT') {
        this.tokenCounter++;
        const tokenId = `[ACTION_EL_${this.tokenCounter}]`;

        const { xmin, ymin, xmax, ymax } = det.bbox;

        // Store the a secret mapping locally
        this.registry.set(tokenId, {
          coordinates: {
            x: xmin,
            y: ymin,
            width: xmax - xmin,
            height: ymax - ymin
          },
          label: det.label,
          confidence: det.confidence
        });

        // Prepare the sanitized token for the server
        networkTokens.push({
          id: tokenId,
          bbox: [xmin, ymin, xmax, ymax],
          label: det.label
        });
      }
    });

    return {
      tokens: networkTokens,
      registry: this.registry
    };
  }

  getTokenCoordinates(tokenId) {
    return this.registry.get(tokenId);
  }

  clear() {
    this.registry.clear();
    this.tokenCounter = 0;
  }
}
