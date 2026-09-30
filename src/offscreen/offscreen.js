/**
 * Offscreen Canvas & WebGPU Perception Worker Script
 * Handles off-thread screenshot manipulation, local PII canvas masking & image sanitization.
 */

import { PrivacyFirewall } from '../perception/privacy_firewall.js';

class OffscreenPerceptionWorker {
  constructor() {
    this.privacyFirewall = new PrivacyFirewall();
    this.canvas = document.getElementById('offscreenCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.webgpuSupported = false;

    this.checkWebGPU();
    this.initMessageListener();
  }

  async checkWebGPU() {
    if ('gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        this.webgpuSupported = !!adapter;
      } catch (e) {
        this.webgpuSupported = false;
      }
    }
  }

  initMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.target !== 'offscreen') return false;

      switch (message.type) {
        case 'PROCESS_SCREENSHOT_REDACTION':
          this.processScreenshot(message.dataUrl, message.maskedZones)
            .then(sanitizedDataUrl => sendResponse({ 
              status: 'success', 
              sanitizedDataUrl, 
              webgpuAccelerated: this.webgpuSupported 
            }))
            .catch(err => sendResponse({ status: 'error', error: err.message }));
          return true; // Keep async response channel open

        case 'PING_OFFSCREEN':
          sendResponse({ status: 'active', webgpu: this.webgpuSupported });
          return true;

        default:
          break;
      }
      return true;
    });
  }

  /**
   * Loads screenshot image onto canvas and renders PII redaction masks
   */
  async processScreenshot(dataUrl, maskedZones) {
    return new Promise((resolve, reject) => {
      if (!dataUrl) {
        reject(new Error('No screenshot dataUrl provided'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;

        // Draw original screenshot onto canvas
        this.ctx.clearRect(0, 0, img.width, img.height);
        this.ctx.drawImage(img, 0, 0);

        // Draw local PII redaction blocks over masked zones
        if (maskedZones && Array.isArray(maskedZones)) {
          maskedZones.forEach(zone => {
            // Fill background box
            this.ctx.fillStyle = '#0F172A';
            this.ctx.fillRect(zone.left, zone.top, zone.width, zone.height);

            // Draw dashed border
            this.ctx.strokeStyle = '#F43F5E';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([4, 4]);
            this.ctx.strokeRect(zone.left, zone.top, zone.width, zone.height);
            this.ctx.setLineDash([]);

            // Render watermark text if zone is large enough
            if (zone.width > 50 && zone.height > 16) {
              this.ctx.fillStyle = '#F43F5E';
              this.ctx.font = 'bold 11px monospace';
              this.ctx.fillText(
                `🛡️ ${zone.type || 'PII_REDACTED'}`,
                zone.left + 6,
                zone.top + Math.min(zone.height - 4, 14)
              );
            }
          });
        }

        // Export sanitized image as WebP
        const sanitizedDataUrl = this.canvas.toDataURL('image/webp', 0.85);
        resolve(sanitizedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image into offscreen canvas'));
      img.src = dataUrl;
    });
  }
}

// Instantiate worker
new OffscreenPerceptionWorker();
