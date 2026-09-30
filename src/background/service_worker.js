/**
 * Chrome MV3 Background Service Worker
 * Manages side panel routing, tab viewport capture & inter-process messaging.
 */

// Enable sidepanel to open when extension action icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Error setting sidepanel behavior:', error));

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SIH 26171] Visual Perception Extension installed.');
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
