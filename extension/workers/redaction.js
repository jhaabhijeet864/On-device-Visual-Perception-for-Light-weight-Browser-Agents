// redaction.js - Visual masking logic
export async function redactImage(canvas, detections) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;

  detections.forEach(det => {
    if (det.isPII) {
      const { xmin, ymin, xmax, ymax } = det.bbox;

      // Convert percentages to pixels
      const x = xmin * width;
      const y = ymin * height;
      const w = (xmax - xmin) * width;
      const h = (ymax - ymin) * height;

      // Strategy: Solid Black Mask (per ISRO requirement #000000)
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);

      // Optional: Add "REDACTED" text overlay
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText('REDACTED', x + 5, y + 15);
    }
  });

  return canvas.toDataURL('image/webp', 0.8);
}
