/**
 * SidePanel UI Controller
 * Manages user interactions, messaging to content script & real-time telemetry updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  const btnPerceive = document.getElementById('btnPerceive');
  const btnExecute = document.getElementById('btnExecute');
  const btnToggleSOM = document.getElementById('btnToggleSOM');
  const promptInput = document.getElementById('promptInput');

  const valLatency = document.getElementById('valLatency');
  const valMarks = document.getElementById('valMarks');
  const valHardware = document.getElementById('valHardware');
  const valPrivacyMasks = document.getElementById('valPrivacyMasks');
  const trajectoryList = document.getElementById('trajectoryList');
  const stepCount = document.getElementById('stepCount');

  let totalSteps = 0;
  let isSomVisible = false;

  function logTrajectoryStep(message, latencyMs) {
    totalSteps++;
    stepCount.innerText = `${totalSteps} Steps`;

    const item = document.createElement('div');
    item.className = 'step-item';

    const textSpan = document.createElement('span');
    textSpan.innerText = message;

    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'step-latency';
    badgeSpan.innerText = `${latencyMs || 0}ms`;

    item.appendChild(textSpan);
    item.appendChild(badgeSpan);
    trajectoryList.prepend(item);
  }

  // Send message to active tab content script
  async function sendMessageToTab(payload) {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          logTrajectoryStep('Error: No active browser tab found', 0);
          resolve(null);
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, payload, (response) => {
          if (chrome.runtime.lastError) {
            logTrajectoryStep('Error: Please refresh tab to inject content script.', 0);
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });
    });
  }

  // 1. Perceive Screen Event
  btnPerceive.addEventListener('click', async () => {
    btnPerceive.disabled = true;
    btnPerceive.innerText = '⏳ Perceiving...';

    const response = await sendMessageToTab({ type: 'PERCEIVE_SCREEN' });

    if (response && response.data) {
      const { markCount, sensitiveCount, latencyMs, webgpuAccelerated, sensitiveMasks } = response.data;
      valLatency.innerText = `${latencyMs} ms`;
      valMarks.innerText = markCount;
      valPrivacyMasks.innerText = `${sensitiveCount} Masked Zones`;
      valHardware.innerText = webgpuAccelerated ? 'WebGPU' : 'WASM/CPU';
      isSomVisible = true;

      logTrajectoryStep(`Perceived ${markCount} SOM Marks (${sensitiveCount} PII masked)`, latencyMs);

      // Capture and Mask screenshot
      const captureResponse = await new Promise(resolve => chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' }, resolve));
      if (captureResponse && captureResponse.dataUrl) {
          const maskResponse = await new Promise(resolve => chrome.runtime.sendMessage({ 
              type: 'REDACT_SCREENSHOT_OFFSCREEN', 
              dataUrl: captureResponse.dataUrl, 
              maskedZones: sensitiveMasks
          }, resolve));
          
          if (maskResponse && maskResponse.status === 'success') {
              logTrajectoryStep(`PII Masked on Image (${maskResponse.webgpuAccelerated ? 'WebGPU' : 'CPU'})`, 50);
              // Store or send sanitized image as needed
          }
      }
    }

    btnPerceive.disabled = false;
    btnPerceive.innerHTML = '<span>👁️ Perceive Screen</span>';
  });

  // 2. Execute Step Event
  btnExecute.addEventListener('click', async () => {
    const goal = promptInput.value.trim();
    if (!goal) {
      logTrajectoryStep('Warning: Enter an agent goal or command first.', 0);
      return;
    }

    btnExecute.disabled = true;
    btnExecute.innerText = '⚡ VLM Reasoning...';

    try {
      // 1. Perceive & Mask
      const perceptionResp = await sendMessageToTab({ type: 'PERCEIVE_SCREEN' });
      if (!perceptionResp || !perceptionResp.data) throw new Error('Perception failed');
      
      const captureResp = await new Promise(resolve => chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' }, resolve));
      let sanitizedImage = '';
      if (captureResp && captureResp.dataUrl) {
          const maskResp = await new Promise(resolve => chrome.runtime.sendMessage({ 
              type: 'REDACT_SCREENSHOT_OFFSCREEN', 
              dataUrl: captureResp.dataUrl, 
              maskedZones: perceptionResp.data.sensitiveMasks
          }, resolve));
          sanitizedImage = maskResp.sanitizedDataUrl;
      }

      // 2. Build VLM Payload
      const tokens = perceptionResp.data.marksSummary.map(m => ({
          id: m.id.toString(),
          bbox: m.bbox || [0, 0, 0, 0], // Use actual bbox from perception if available
          label: m.text
      }));

      const vlmPayload = {
          taskId: `task_${Date.now()}`,
          objective: goal,
          redactedImage: sanitizedImage,
          tokens: tokens,
          viewportSize: { width: window.innerWidth, height: window.innerHeight }
      };

      logTrajectoryStep('Sending context to VLM backend...', 0);
      const vlmStartTime = performance.now();
      const response = await fetch('http://localhost:8000/reason', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vlmPayload)
      });

      const vlmResult = await response.json();
      const vlmLatency = Math.round(performance.now() - vlmStartTime);
      
      if (vlmResult.detail) {
          throw new Error(`VLM Backend Error: ${JSON.stringify(vlmResult.detail)}`);
      }
      if (!vlmResult.action) {
          throw new Error(`VLM returned invalid response: ${JSON.stringify(vlmResult)}`);
      }

      logTrajectoryStep(`VLM: ${vlmResult.thought}`, vlmLatency);

      // 3. Execute VLM Action
      let targetMarkId = null;
      if (vlmResult.target_token) {
          const match = vlmResult.target_token.match(/\d+/);
          if (match) targetMarkId = parseInt(match[0], 10);
      }

      const execResponse = await sendMessageToTab({
          type: 'EXECUTE_AGENT_GOAL',
          plan: {
              action: vlmResult.action.toLowerCase(),
              targetMarkId: targetMarkId,
              value: vlmResult.value,
              description: `VLM Action: ${vlmResult.action} on Token ${vlmResult.target_token}`
          }
      });

      if (execResponse && execResponse.result) {
          const result = execResponse.result.execution;
          logTrajectoryStep(result.log, 25);

          if (result.needsReperception) {
            logTrajectoryStep('DOM drifted. Triggering re-perception...', 0);
            // Automatically trigger perception again
            btnPerceive.click();
          }
      }
    } catch (e) {
      logTrajectoryStep(`Error: ${e.message}`, 0);
    }

    btnExecute.disabled = false;
    btnExecute.innerHTML = '<span>⚡ Execute Step</span>';
  });

  // 3. Toggle SOM Overlay Event
  btnToggleSOM.addEventListener('click', async () => {
    isSomVisible = !isSomVisible;
    const response = await sendMessageToTab({
      type: 'TOGGLE_SOM_OVERLAY',
      visible: isSomVisible
    });

    if (response) {
      logTrajectoryStep(`SOM Overlay Tags ${isSomVisible ? 'Visible' : 'Hidden'}`, 5);
    }
  });
});
