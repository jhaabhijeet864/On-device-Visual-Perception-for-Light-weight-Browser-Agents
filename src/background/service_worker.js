/**
 * Chrome MV3 Background Service Worker
 * Manages side panel routing, tab viewport capture, offscreen document creation & inter-process messaging.
 */

// Enable sidepanel to open when extension action icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Error setting sidepanel behavior:', error));

const OFFSCREEN_DOCUMENT_PATH = 'src/offscreen/offscreen.html';

/**
 * Ensures offscreen perception document exists
 */
async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: [chrome.offscreen.Reason.DOM_PARSING, chrome.offscreen.Reason.BLOBS],
    justification: 'Off-thread screenshot canvas PII redaction and WebGPU perception worker'
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[SIH 26171] Visual Perception Extension installed.');
  try {
    await ensureOffscreenDocument();
  } catch (e) {
    console.warn('[SIH 26171] Offscreen creation deferred:', e);
  }
});

// Listener for background messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_VISIBLE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ status: 'error', message: 'No active tab found' });
        return;
      }
      chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (dataUrl) => {
        sendResponse({ status: 'success', dataUrl });
      });
    });
    return true;
  }

  if (message.type === 'REDACT_SCREENSHOT_OFFSCREEN') {
    ensureOffscreenDocument().then(() => {
      chrome.runtime.sendMessage(
        {
          target: 'offscreen',
          type: 'PROCESS_SCREENSHOT_REDACTION',
          dataUrl: message.dataUrl,
          maskedZones: message.maskedZones
        },
        (response) => sendResponse(response)
      );
    });
    return true;
  }

  if (message.type === 'FORWARD_TO_CONTENT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ status: 'error', message: 'No active tab found' });
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, message.payload, (response) => {
        sendResponse(response);
      });
    });
    return true;
  }
});
