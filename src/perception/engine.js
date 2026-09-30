/**
 * On-Device Visual Perception Engine
 * Coordinates WebGPU compute, Set-of-Marks visual tagging & scene understanding.
 */

import { PrivacyFirewall } from './privacy_firewall.js';

export class VisualPerceptionEngine {
  constructor() {
    this.privacyFirewall = new PrivacyFirewall();
    this.isWebGPUSupported = false;
    this.checkWebGPUSupport();
  }

  async checkWebGPUSupport() {
    if ('gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        this.isWebGPUSupported = !!adapter;
      } catch (e) {
        this.isWebGPUSupported = false;
      }
    }
  }

  /**
   * Scans current DOM view to detect interactive elements & generate SOM Tagging array
   */
  perceiveDOM() {
    const startTime = performance.now();
    const selectors = [
      'a[href]', 'button', 'input', 'select', 'textarea',
      '[role="button"]', '[role="link"]', '[role="checkbox"]',
      '[role="tab"]', '[role="menuitem"]', '[contenteditable="true"]',
      '[onclick]'
    ];

    const elements = Array.from(document.querySelectorAll(selectors.join(',')));
    const interactiveMarks = [];
    let markId = 1;

    elements.forEach((el) => {
      // Filter visible elements only
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      if (
        rect.width > 10 &&
        rect.height > 10 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        rect.top < window.innerHeight &&
        rect.bottom > 0
      ) {
        const textContent = (el.innerText || el.value || el.placeholder || el.title || el.ariaLabel || '').trim();

        interactiveMarks.push({
          id: markId++,
          tagName: el.tagName.toLowerCase(),
          type: el.type || 'element',
          text: textContent.substring(0, 40),
          rect: {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
            clientLeft: rect.left,
            clientTop: rect.top
          },
          elementRef: el
        });
      }
    });

    // Scan sensitive zones using Privacy Firewall
    const sensitiveMasks = this.privacyFirewall.scanDOMForSensitiveZones(elements);
    const endTime = performance.now();

    return {
      marks: interactiveMarks,
      sensitiveMasks,
      latencyMs: Math.round(endTime - startTime),
      webgpuAccelerated: this.isWebGPUSupported
    };
  }
}
