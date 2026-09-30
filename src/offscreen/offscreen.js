/**
 * Offscreen Canvas & WebGPU Inference Document Script
 * Executes heavy visual image manipulation & off-thread model inference.
 */

import { PrivacyFirewall } from '../perception/privacy_firewall.js';

class OffscreenPerceptionWorker {
  constructor() {
    this.privacyFirewall = new PrivacyFirewall();
    this.canvas = document.getElementById('offscreenCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.initMessageListener();
  }

  initMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.target !== 'offscreen') return;

      switch (message.type) {
        case 'PROCESS_SCREENSHOT_REDACTION':
          this.processScreenshot(message.dataUrl, message.maskedZones)
            .then(sanitizedDataUrl => sendResponse({ status: 'success', sanitizedDataUrl }))
            .catch(err => sendResponse({ status: 'error', error: err.message }));
          return true; // Keep async response channel open

        default:
          break;
      }
    });
  }

  async processScreenshot(dataUrl, maskedZones) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        // Draw local redaction blocks over masked zones
        if (maskedZones && Array.isArray(maskedZones)) {
          this.ctx.fillStyle = '#0F172A';
          maskedZones.forEach(zone => {
            this.ctx.fillRect(zone.left, zone.top, zone.width, zone.height);
          });
        }

        const sanitizedDataUrl = this.canvas.toDataURL('image/webp', 0.85);
        resolve(sanitizedDataUrl);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
}

new OffscreenPerceptionWorker();
