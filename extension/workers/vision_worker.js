// vision_worker.js - Web Worker for Local Inference
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Configure environment for browser compatibility
env.allowLocalModels = true;
env.useBrowserCache = true;

let detector = null;

async function initDetector() {
  if (!detector) {
    // We use a lightweight object detection model (e.g., DETR or MobileNet based)
    // For this implementation, we use a generic object detection pipeline
    // In production, this would be a custom-trained PII-detection ONNX model
    detector = await pipeline('object-detection', './models/onnx/detr-resnet-50');
  }
  return detector;
}

self.onmessage = async (e) => {
  const { type, imageData, objective } = e.data;

  if (type === 'DETECT_PII') {
    try {
      const model = await initDetector();

      // Perform inference on the image
      const detections = await model(imageData, {
        threshold: 0.5,
        percentage: true,
      });

      // Map general detections to PII and Interactive labels
      // PII: Person (faces), etc.
      // Interactive: Buttons, Inputs (though usually identified via DOM)
      const processedDetections = detections.map(det => {
        let label = det.label;
        let isPII = false;

        // Simple mapping logic for prototype
        if (['person', 'face', 'id card', 'credit card'].includes(label)) {
          isPII = true;
          label = 'PII_SENSITIVE';
        } else if (['button', 'input', 'checkbox'].includes(label)) {
          label = 'INTERACTIVE_ELEMENT';
        }

        return {
          bbox: det.box, // {xmin, ymin, xmax, ymax}
          label: label,
          isPII: isPII,
          confidence: det.score
        };
      });

      self.postMessage({
        type: 'DETECTION_RESULT',
        detections: processedDetections
      });
    } catch (error) {
      self.postMessage({ type: 'ERROR', message: error.message });
    }
  }
};
