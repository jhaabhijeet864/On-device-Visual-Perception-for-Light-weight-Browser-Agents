/**
 * Content Script - Injected into active browser tab pages.
 * Handles DOM perception scan, SOM overlay canvas injection & action execution.
 */

import { VisualPerceptionEngine } from '../perception/engine.js';
import { BrowserAgent } from '../agent/agent.js';

class ContentScriptController {
  constructor() {
    this.perceptionEngine = new VisualPerceptionEngine();
    this.agent = new BrowserAgent();
    this.somContainer = null;
    this.currentMarks = [];
    this.isSomVisible = false;

    this.initMessageListeners();
  }

  initMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'PERCEIVE_SCREEN':
          const perceptionData = this.runPerception();
          sendResponse({ status: 'success', data: perceptionData });
          break;

        case 'TOGGLE_SOM_OVERLAY':
          this.toggleSomOverlay(message.visible);
          sendResponse({ status: 'success', visible: this.isSomVisible });
          break;

        case 'EXECUTE_AGENT_GOAL':
          const result = this.executeGoal(message.goal);
          sendResponse({ status: 'success', result });
          break;

        default:
          break;
      }
      return true; // Keep async response channel open
    });
  }

  runPerception() {
    const perception = this.perceptionEngine.perceiveDOM();
    this.currentMarks = perception.marks;
    this.renderSomOverlay(perception.marks, perception.sensitiveMasks);
    return {
      markCount: perception.marks.length,
      sensitiveCount: perception.sensitiveMasks.length,
      latencyMs: perception.latencyMs,
      webgpuAccelerated: perception.webgpuAccelerated,
      marksSummary: perception.marks.map(m => ({ id: m.id, text: m.text, tag: m.tagName })),
      sensitiveMasks: perception.sensitiveMasks
    };
  }

  renderSomOverlay(marks, sensitiveMasks) {
    this.removeSomOverlay();

    this.somContainer = document.createElement('div');
    this.somContainer.id = 'sih-som-overlay-root';
    this.somContainer.className = 'sih-som-overlay-canvas';
    document.body.appendChild(this.somContainer);

    // Render interactive Set-of-Marks badges & bounding boxes
    marks.forEach((mark) => {
      const box = document.createElement('div');
      box.className = 'sih-som-mark';
      box.style.left = `${mark.rect.left}px`;
      box.style.top = `${mark.rect.top}px`;
      box.style.width = `${mark.rect.width}px`;
      box.style.height = `${mark.rect.height}px`;

      const badge = document.createElement('div');
      badge.className = 'sih-som-badge';
      badge.innerText = mark.id;
      box.appendChild(badge);

      this.somContainer.appendChild(box);
    });

    // Render Privacy Firewall Redacted Zones
    sensitiveMasks.forEach((mask) => {
      const maskEl = document.createElement('div');
      maskEl.className = 'sih-pii-masked-zone';
      maskEl.style.left = `${mask.left}px`;
      maskEl.style.top = `${mask.top}px`;
      maskEl.style.width = `${mask.width}px`;
      maskEl.style.height = `${mask.height}px`;
      maskEl.innerText = `🛡️ MASKED (${mask.type})`;
      this.somContainer.appendChild(maskEl);
    });

    this.isSomVisible = true;
  }

  removeSomOverlay() {
    if (this.somContainer) {
      this.somContainer.remove();
      this.somContainer = null;
      this.isSomVisible = false;
    }
  }

  toggleSomOverlay(visible) {
    if (visible === false) {
      this.removeSomOverlay();
    } else {
      this.runPerception();
    }
  }

  executeGoal(goal) {
    if (!this.currentMarks || this.currentMarks.length === 0) {
      this.runPerception();
    }
    const plan = this.agent.planAction(goal, this.currentMarks);
    const execution = this.agent.executeAction(plan, this.currentMarks);

    // Re-run perception to refresh SOM after interaction
    setTimeout(() => this.runPerception(), 400);

    return {
      plan,
      execution
    };
  }
}

// Instantiate controller on script inject
new ContentScriptController();
