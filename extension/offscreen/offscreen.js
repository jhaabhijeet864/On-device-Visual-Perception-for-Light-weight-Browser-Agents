// Update to offscreen.js to integrate the Worker, Redaction, and Tokenizer pipeline
import { redactImage } from './workers/redaction.js';
import { Tokenizer } from './workers/tokenizer.js';

let visionWorker = new Worker('workers/vision_worker.js', { type: 'module' });
const tokenizer = new Tokenizer();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'offscreen' && message.type === 'CAPTURE_VIEWPORT') {
    processAndSanitize().then(data => sendResponse({ success: true, data }))
                      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function processAndSanitize() {
  // 1. Capture
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'webp' });
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  const canvas = document.getElementById('captureCanvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // 2. Local Inference via Worker
  const detections = await new Promise((resolve, reject) => {
    visionWorker.onmessage = (e) => {
      if (e.data.type === 'DETECTION_RESULT') resolve(e.data.detections);
      if (e.data.type === 'ERROR') reject(new Error(e.data.message));
    };
    visionWorker.postMessage({
      type: 'DETECT_PII',
      imageData: canvas.toDataURL('image/webp'),
      objective: 'detect sensitive data'
    });
  });

  // 3. Redaction (Zero-Egress Firewall)
  const redactedDataUrl = await redactImage(canvas, detections);

  // 4. Tokenization (Structural Mapping)
  const { tokens } = tokenizer.tokenize(detections);

  return {
    image: redactedDataUrl,
    tokens: tokens,
    detections: detections // kept for local debug only
  };
}
