/**
 * On-Device Visual Perception Engine
 * Coordinates WebGPU compute, Set-of-Marks visual tagging & scene understanding.
 */

import { PrivacyFirewall } from './privacy_firewall.js';
import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js for Chrome Extension environment
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;

export class VisualPerceptionEngine {
  constructor() {
    this.privacyFirewall = new PrivacyFirewall();
    this.isWebGPUSupported = false;
    this.detrPipeline = null;
    this.isLoadingModel = false;
    this.checkWebGPUSupport().then(() => this.initDETRModel());
  }

  /**
   * Initializes INT8 Quantized DETR vision model for local bounding box detection
   */
  async initDETRModel() {
    if (this.detrPipeline || this.isLoadingModel) return;
    this.isLoadingModel = true;
    try {
      // Load INT8 model (< 350MB budget)
      this.detrPipeline = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
        device: this.isWebGPUSupported ? 'webgpu' : 'wasm',
        quantized: true
      });
      console.log('[AegisEdge] On-Device DETR Model Initialized successfully.');
    } catch (e) {
      console.error('[AegisEdge] Failed to initialize DETR model:', e);
    } finally {
      this.isLoadingModel = false;
    }
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
   * Detects objects in a provided image using on-device DETR
   * @param {string} imageDataUrl 
   * @returns {Promise<Array<Object>>} Detected bounding boxes
   */
  async detectObjects(imageDataUrl) {
    if (!this.detrPipeline) {
      console.warn('[AegisEdge] DETR model not loaded yet.');
      return [];
    }
    try {
      const startTime = performance.now();
      const results = await this.detrPipeline(imageDataUrl, {
        threshold: 0.5,
        percentage: true
      });
      console.log(`[AegisEdge] Object Detection took ${Math.round(performance.now() - startTime)}ms`);
      return results;
    } catch (e) {
      console.error('[AegisEdge] Object detection failed:', e);
      return [];
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
