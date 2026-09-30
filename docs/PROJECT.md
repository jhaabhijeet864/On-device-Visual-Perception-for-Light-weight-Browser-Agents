# SIH 26171: On-device Visual Perception for Light-weight Browser Agents

> **Organization:** Indian Space Research Organisation (ISRO), Department of Space  
> **Category:** Software | **Theme:** Smart Automation / Agentic AI  
> **Repository:** `https://github.com/jhaabhijeet864/On-device-Visual-Perception-for-Light-weight-Browser-Agents.git`

---

## 🎯 Executive Summary
With the rapid emergence of agentic AI systems, web browser automation relies heavily on visual context and screen state understanding. However, standard agent pipelines depend on cloud-hosted Vision-Language Models (VLMs), introducing high latency, bandwidth consumption, and severe privacy risks (sending unmasked screen captures containing sensitive user PII to third-party APIs).

**SIH 26171** addresses this critical bottleneck by building a **light-weight, local-first on-device visual perception engine** integrated into a Chrome Extension (MV3). It enables light-weight browser agents to perceive, ground, and interact with complex web UI elements entirely on-device with zero-latency visual processing and guaranteed local privacy firewalls.

---

## 🚀 Key Objectives

1. **On-Device Screen & Element Perception**
   - Perform real-time visual grounding directly in the user browser using WebGPU / ONNX Runtime Web / Transformers.js.
   - Generate Set-of-Marks (SOM) visual interactive tags and bounding box maps over interactive DOM elements.

2. **Zero-Trust On-Device Privacy Firewall**
   - Scan screenshots for PII (Personally Identifiable Information), passwords, financial data, and faces locally before any action processing or optional model consultation.
   - Apply real-time canvas-level redaction masks on sensitive UI zones on-device.

3. **Hybrid Visual + DOM Element Grounding**
   - Combine visual spatial awareness (computer vision) with DOM tree structure to achieve high-precision element localization even on dynamic, canvas-heavy, or non-standard web UIs.

4. **Light-Weight Autonomous Agent Pipeline**
   - Execute multi-step workflow automation (Form filling, data extraction, navigation, visual verification) directly inside the Chrome Side Panel.
   - Maintain sub-second perceptual latency and minimal memory footprint suitable for consumer laptops and edge hardware.

---

## 📁 Repository Structure

```
On-device-Visual-Perception-for-Light-weight-Browser-Agents/
├── docs/
│   ├── PROJECT.md          # High-level overview & project roadmap
│   ├── ARCHITECTURE.md     # System architecture & data flow diagrams
│   ├── DESIGN.md           # Visual design system & UI/UX specs
│   └── RULES.md            # Coding standards & privacy invariants
├── manifest.json           # Chrome Extension Manifest V3
├── package.json            # Project dependencies and build scripts
├── vite.config.js          # Vite bundler configuration
├── src/
│   ├── background/         # MV3 Service Worker (screen capture, tab management)
│   ├── content/            # Content scripts (SOM visual tagging, DOM inspector, action simulator)
│   ├── perception/         # On-device AI engine (WebGPU OCR, object detection, PII mask)
│   ├── agent/              # Task planner, execution state machine, action grounding
│   ├── sidepanel/          # Modern Glassmorphic Agent Control Panel UI
│   └── styles/             # Curated design tokens & CSS system
```

---

## 🚩 Target Features & Roadmap

- [x] Phase 1: Core System Architecture & Project Specifications
- [ ] Phase 2: Chrome Extension MV3 Base & Service Worker Screen Capture
- [ ] Phase 3: On-Device Perception Engine (WebGPU/Transformers.js & SOM Tagging)
- [ ] Phase 4: Privacy Firewall (Local OCR & Sensitive Data Masking)
- [ ] Phase 5: Autonomous Task Planner & Execution Engine
- [ ] Phase 6: Production SidePanel UI, Performance Benchmarks & Deliverables
