// Service Worker: Orchestrates the capture and redaction pipeline
async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen/offscreen.html',
    reasons: ['CLIPBOARD'], // Using CLIPBOARD as a generic reason for canvas access
    justification: 'Capture viewport for local PII redaction'
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'background' && message.type === 'CAPTURE_SCREEN') {
    setupOffscreenDocument().then(async () => {
      try {
        const result = await chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'CAPTURE_VIEWPORT'
        });
        sendResponse({ success: true, data: result });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; // keep channel open for async response
  }
});
