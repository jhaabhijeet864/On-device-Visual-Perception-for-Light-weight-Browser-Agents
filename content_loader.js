(async () => {
  try {
    const src = chrome.runtime.getURL('content.js');
    await import(src);
    console.log('ISRO Browser Agent: Content script loaded successfully via module loader.');
  } catch (error) {
    console.error('ISRO Browser Agent: Failed to load content script:', error);
  }
})();
