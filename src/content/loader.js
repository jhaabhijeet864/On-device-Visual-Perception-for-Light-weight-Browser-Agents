(async () => {
    try {
        const src = chrome.runtime.getURL('content.js');
        await import(src);
    } catch (e) {
        console.error("Failed to load content script module", e);
    }
})();
