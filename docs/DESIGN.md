# Design System & UI/UX Specifications

## 🎨 Design Philosophy & Aesthetic Guidelines
The UI for **On-device Visual Perception Agent** follows a modern, high-tech dark glassmorphism aesthetic inspired by space technology telemetry interfaces (ISRO theme). It prioritizes high density, clean visual typography, vibrant real-time status indicators, and clear visual contrast for task state tracking.

---

## 🌌 Color System Tokens

```css
:root {
  /* Surface & Background Palette */
  --bg-dark-base: #0B0F19;
  --bg-dark-card: rgba(18, 24, 38, 0.75);
  --bg-dark-glass: rgba(255, 255, 255, 0.04);
  --border-glass: rgba(255, 255, 255, 0.12);
  --border-accent: rgba(59, 130, 246, 0.3);

  /* Primary Accent & Signal Colors */
  --accent-cyan: #06B6D4;
  --accent-blue: #3B82F6;
  --accent-indigo: #6366F1;
  --accent-emerald: #10B981;
  --accent-amber: #F59E0B;
  --accent-rose: #F43F5E;

  /* Typography Colors */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --text-glow: 0 0 12px rgba(6, 182, 212, 0.4);

  /* SOM Overlay Colors */
  --som-badge-bg: #3B82F6;
  --som-badge-text: #FFFFFF;
  --som-border-box: #06B6D4;
  --privacy-mask-fill: #0F172A;
}
```

---

## 📱 SidePanel UI Blueprint

1. **Header Bar:**
   - ISRO / SIH 26171 Branding Badge.
   - Real-time Hardware Telemetry (WebGPU Active / GPU Model Name / Memory Usage / FPS counter).
   - Quick Mode Toggles (Perception On/Off, Privacy Firewall Toggle, Auto-Agent Mode).

2. **Goal & Command Prompt Box:**
   - Dynamic prompt input with voice/text suggestions.
   - "Perceive Screen" & "Execute Agent Plan" action buttons with cyan neon gradient.

3. **Live Perception Canvas Viewport:**
   - Real-time mirror/thumbnail of current tab state with active **Set-of-Marks** overlay.
   - PII redaction shield visual badge showing total masked elements.

4. **Task Execution Trajectory:**
   - Step-by-step accordion timeline of executed actions (`#1 Clicked Search Bar`, `#2 Typed Telemetry Data`, `#3 Parsed Result Table`).
   - Latency per step indicator (e.g. `42ms perception` + `18ms execution`).

5. **DOM & Perception Debug Panel:**
   - Raw detected bounding boxes list.
   - OCR text extraction log & privacy audit history.

---

## 🏷 Set-of-Marks (SOM) Visual Overlay Spec

- **Element Bounding Box:** `1.5px solid var(--som-border-box)` with slight pulse animation on active element.
- **Numeric Badge Tag:**
  - Position: Top-left corner of bounding box (`translate(-50%, -50%)`).
  - Shape: Rounded rectangle (`border-radius: 4px`).
  - Font: Mono-spaced `11px` bold (`font-family: 'JetBrains Mono', monospace`).
  - Background: Vibrant blue (`#3B82F6`) with high-contrast white text.
