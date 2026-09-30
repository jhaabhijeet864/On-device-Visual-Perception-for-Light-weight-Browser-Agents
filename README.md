# On-device Visual Perception for Light-weight Browser Agents

**Smart India Hackathon (SIH) 2026** | **Problem Statement ID:** 26171  
**Organization:** Indian Space Research Organisation (ISRO), Department of Space  
**Category:** Software | **Theme:** Smart Automation / Agentic AI  
**Repository:** [https://github.com/jhaabhijeet864/On-device-Visual-Perception-for-Light-weight-Browser-Agents](https://github.com/jhaabhijeet864/On-device-Visual-Perception-for-Light-weight-Browser-Agents)

---

## 1. Executive Summary

Autonomous web browser agents rely heavily on visual context to interact with dynamic user interfaces. Existing implementations depend on server-side Vision-Language Models (VLMs), introducing latency overheads, high bandwidth consumption, and severe privacy risks due to cloud exfiltration of unmasked user screenshots containing Personally Identifiable Information (PII).

This repository presents an **on-device visual perception and grounding framework** implemented as a Manifest V3 Chrome Extension. Developed for ISRO under SIH Problem Statement 26171, the system performs local scene understanding, interactive Set-of-Marks (SOM) tagging, and zero-trust PII masking directly within the user browser runtime via WebGPU acceleration.

---

## 2. Key Technical Features

### 2.1 On-Device Visual Perception Engine
- **Local WebGPU & WASM Acceleration:** Executes vision inference locally, eliminating cloud API dependencies and network latency.
- **Set-of-Marks (SOM) Tagging:** Assigns numerical badges to interactive DOM elements (`<button>`, `<a>`, `<input>`, ARIA roles) to bridge spatial visual perception with programmatic element execution.

### 2.2 Local Privacy Firewall (Zero-Trust)
- **PII Detection & Sanitization:** Scans captured visual viewports on-device for credit card numbers, passwords, emails, SSNs, and authentication tokens.
- **Canvas-Level Masking:** Applies real-time visual redaction shields over sensitive zones prior to downstream agent processing, ensuring raw user data never leaves the local browser context.

### 2.3 Hybrid Visual-DOM Action Execution
- **Grounded Action Planner:** Maps natural language task prompts to specific SOM numeric marks (`click`, `type`, `scroll`).
- **Native Event Simulation:** Dispatches synthetic events to target elements while preserving focus and state invariants.

---

## 3. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CHROME BROWSER TAB                                |
|                                                                                   |
|    Content Script: DOM Inspector -> SOM Tagging Canvas -> Action Simulator       |
+-----------------------------------------+-----------------------------------------+
                                          | Local DOM Coordinates & Screenshots
                                          v
+-----------------------------------------------------------------------------------+
|                        ON-DEVICE PERCEPTION ENGINE (WebGPU)                       |
|                                                                                   |
|   +---------------------+    +------------------------+    +------------------+   |
|   |  Local Vision OCR   | -> |    Privacy Firewall    | -> | Set-of-Marks     |   |
|   | (Transformers.js)   |    | (PII Redaction Shield) |    | Generator        |   |
|   +---------------------+    +------------------------+    +------------------+   |
+-----------------------------------------+-----------------------------------------+
                                          | Grounded SOM Mark Map
                                          v
+-----------------------------------------------------------------------------------+
|                           LIGHT-WEIGHT BROWSER AGENT                              |
|                                                                                   |
|   Task Planner -> Action Router -> State Machine -> Trajectory Logger            |
+-----------------------------------------+-----------------------------------------+
                                          | Status & Real-time Telemetry
                                          v
+-----------------------------------------------------------------------------------+
|                            CHROME SIDEPANEL CONTROL UI                            |
|   Telemetry Dashboard (Latency, Active Marks, Hardware Engine, Masked Zones)      |
+-----------------------------------------------------------------------------------+
```

---

## 4. Technical Stack

| Component | Technology / Library | Description |
| :--- | :--- | :--- |
| **Platform** | Chrome Extension (Manifest V3) | Modern extension runtime using Service Workers and SidePanel API |
| **Compute Acceleration** | WebGPU / ONNX Runtime Web | On-device parallel hardware acceleration |
| **Vision & ML Models** | `@xenova/transformers` | Lightweight local transformers pipeline |
| **Bundler & Tooling** | Vite 5 | Fast ES module bundler for multi-entry extension assets |
| **UI Design System** | Native CSS (ISRO Glassmorphic Theme) | High-density dark telemetry interface |

---

## 5. Repository Layout

```
├── docs/
│   ├── PROJECT.md          # Project roadmap & milestones
│   ├── ARCHITECTURE.md     # Detailed architecture & technical specs
│   ├── DESIGN.md           # Visual design tokens & SOM overlay guidelines
│   └── RULES.md            # Privacy invariants & engineering guidelines
├── src/
│   ├── background/         # Service worker for viewport capture & message routing
│   ├── content/            # DOM scanner, SOM tag generator, and event simulator
│   ├── perception/         # WebGPU engine & Privacy Firewall PII masking module
│   ├── agent/              # Action planner and execution state machine
│   ├── sidepanel/          # SidePanel control UI & telemetry dashboard
│   └── styles/             # Modular CSS design system
├── assets/                 # Extension icons and visual assets
├── manifest.json           # Chrome MV3 configuration manifest
├── vite.config.js          # Vite build configuration
└── package.json            # Node.js dependencies and scripts
```

---

## 6. Installation & Setup

### 6.1 Prerequisites
- Google Chrome browser (v116+ supporting SidePanel API and WebGPU)
- Node.js (v18+) and npm

### 6.2 Development Build Instructions
```bash
# 1. Clone the repository
git clone https://github.com/jhaabhijeet864/On-device-Visual-Perception-for-Light-weight-Browser-Agents.git
cd On-device-Visual-Perception-for-Light-weight-Browser-Agents

# 2. Install dependencies
npm install

# 3. Build production bundle
npm run build
```

### 6.3 Loading the Extension into Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click **Load unpacked**.
4. Select either the root repository directory or the compiled `dist/` directory.
5. Click the extension icon in the toolbar or open the Chrome Side Panel to launch the agent UI.

---

## 7. Performance Targets & Invariants

- **Perception Latency:** Sub-150ms processing time per captured frame under WebGPU execution.
- **Privacy Guarantee:** Zero network egress of unmasked visual screenshot data.
- **Memory Footprint:** Resident memory utilization under 350MB.

---

## 8. License & Attribution

Developed for **Smart India Hackathon (SIH) 2026** under Problem Statement 26171 (ISRO, Department of Space).  
Licensed under the [MIT License](LICENSE).
