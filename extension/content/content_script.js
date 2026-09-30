// extension/content/content_script.js
/**
 * Actuator: Executes synthetic events in the DOM based on coordinate mapping
 */
export async function dispatchAction(action, targetCoords, value = null) {
  const { x, y, width, height } = targetCoords;

  // Calculate center point for the click
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  console.log(`AegisEdge: Dispatching ${action} at (${centerX}, ${centerY})`);

  switch (action) {
    case 'CLICK':
      const element = document.elementFromPoint(centerX, centerY);
      if (element) {
        element.click();
        // Also dispatch MouseEvents for better compatibility
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY
        });
        element.dispatchEvent(clickEvent);
      }
      break;

    case 'TYPE':
      const inputElement = document.elementFromPoint(centerX, centerY);
      if (inputElement && (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA')) {
        inputElement.focus();
        inputElement.value = value;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      }
      break;

    case 'SCROLL':
      window.scrollBy({ top: 500, behavior: 'smooth' });
      break;

    case 'WAIT':
      console.log('AegisEdge: Waiting for state change...');
      break;
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXECUTE_ACTION') {
    dispatchAction(message.action, message.coords, message.value)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
