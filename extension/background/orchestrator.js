// extension/background/orchestrator.js
import { sendSanitizedPayload } from './transmitter.js';

async function runActionLoop(objective) {
  console.log(`Starting action loop for: ${objective}`);

  try {
    // 1. Capture & Sanitize (via offscreen)
    const sanitized = await chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'CAPTURE_VIEWPORT'
    });

    if (!sanitized.success) throw new Error('Capture failed');

    // 2. Transmit & Reason
    const payload = {
      taskId: crypto.randomUUID(),
      objective: objective,
      redactedImage: sanitized.data.image,
      tokens: sanitized.data.tokens,
      viewportSize: {
        width: sanitized.data.detections[0]?.bbox[2] || 1920,
        height: sanitized.data.detections[0]?.bbox[3] || 1080
      }
    };

    const response = await sendSanitizedPayload(payload);

    // 3. Map Token -> Coordinates
    // Note: In a real app, the TokenRegistry is held in a singleton in the background script
    const tokenCoords = sanitized.data.detections.find(d => d.id === response.target_token);

    if (!tokenCoords) {
      console.error('Token not found in local registry');
      return;
    }

    // 4. Dispatch Action
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, {
      type: 'EXECUTE_ACTION',
      action: response.action,
      coords: {
        x: tokenCoords.bbox[0] * window.innerWidth,
        y: tokenCoords.bbox[1] * window.innerHeight,
        width: (tokenCoords.bbox[2] - tokenCoords.bbox[0]) * window.innerWidth,
        height: (tokenCoords.bbox[3] - tokenCoords.bbox[1]) * window.innerHeight
      },
      value: response.value
    });

    // 5. State Verification
    const newState = await chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'CAPTURE_VIEWPORT'
    });

    if (verifyStateDelta(sanitized.data.image, newState.data.image)) {
      console.log('Action verified successfully');
    } else {
      console.warn('Action did not result in expected state change');
    }

  } catch (error) {
    console.error('Loop Error:', error);
  }
}

function verifyStateDelta(oldImg, newImg) {
  // Simple heuristic: check if image hashes differ
  return oldImg !== newImg;
}

// Trigger loop via message from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_AGENT') {
    runActionLoop(message.objective);
    sendResponse({ status: 'started' });
  }
});
