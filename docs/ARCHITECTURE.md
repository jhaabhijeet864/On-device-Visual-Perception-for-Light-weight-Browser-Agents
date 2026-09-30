# System Architecture & Technical Specifications

## 🏗 System Overview

The **On-Device Visual Perception System** operates as a Chrome MV3 Extension featuring a multi-layered local execution model:

```
+-----------------------------------------------------------------------------------+
|                               CHROME BROWSER TAB                                  |
|                                                                                   |
|  [ Content Script: DOM Inspector + Action Executor + Set-of-Marks Canvas ]       |
+-----------------------------------------+-----------------------------------------+
                                          | (DOM Nodes, Bounding Boxes, Screenshots)
                                          v
+-----------------------------------------------------------------------------------+
|                        ON-DEVICE PERCEPTION ENGINE (WebGPU)                       |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  |  Local Vision OCR  |   |  Privacy Firewall /   |   | Set-of-Marks (SOM)     |  |
|  | (Transformers.js / |-->|  PII Sanitization     |-->| Visual Grounding       |  |
|  |  ONNX Web Runtime) |   |  (Local Canvas Mask)  |   | Generator              |  |
|  +--------------------+   +-----------------------+   +------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          | Grounded Visual State + Numeric Element IDs
                                          v
+-----------------------------------------------------------------------------------+
|                           LIGHT-WEIGHT AGENT CORE                                 |
|                                                                                   |
|  [ Task Planner / State Machine ] ---> [ Action Router ] ---> [ Execution Log ]  |
+-----------------------------------------+-----------------------------------------+
                                          | Simulated Native Events (click, type, scroll)
                                          v
+-----------------------------------------------------------------------------------+
|                            CHROME SIDEPANEL CONTROL UI                            |
|  (Task Input, Live Visual Feed, Performance Metrics: FPS, Latency, Memory)        |
+-----------------------------------------------------------------------------------+
```

---

## 🔬 Component Breakdown

### 1. MV3 Background Service Worker (`src/background/service_worker.js`)
- Manages offscreen document creation for heavy WebGPU workloads.
- Captures tab viewports using `chrome.tabs.captureVisibleTab` with zero cloud transmission.
- Orchestrates inter-process messaging between sidepanel UI, content scripts, and offscreen AI context.

### 2. Content Script & DOM Grounder (`src/content/content_script.js`)
- Scans interactive DOM elements (`<a>`, `<button>`, `<input>`, `[role="button"]`, etc.).
- Computes client bounding boxes (`getBoundingClientRect()`) and maps pixel regions to DOM node paths.
- Renders an ephemeral **Set-of-Marks (SOM)** overlay canvas with distinct numbered visual badges over every target element.

### 3. On-Device Perception Engine (`src/perception/engine.js`)
- **Engine Stack:** Built on `@xenova/transformers` (Transformers.js) / ONNX Runtime Web utilizing WebGPU acceleration.
- **Vision-Language Grounding:** Evaluates screen captures locally to detect target visual elements without round-tripping to cloud endpoints.
- **Privacy Firewall:** Scans captured visual frames locally for PII patterns (credit card numbers, social identifiers, email addresses, password inputs). Masks detected pixel regions on local canvas prior to agent processing.

### 4. Light-Weight Browser Agent (`src/agent/agent.js`)
- Interprets user goals (e.g., *"Search for NISAR satellite telemetry data and download the latest PDF report"*).
- Converts goal into deterministic action sequences mapped to SOM numeric tags: `click(Mark #4)`, `type(Mark #2, "NISAR telemetry")`, `scroll("down")`.
- Validates state transitions post-action to ensure task completion.

---

## ⚡ Performance Invariants
- **Visual Processing Latency:** `< 150ms` per frame on standard WebGPU-enabled browsers.
- **Privacy Guarantee:** 100% of image pixel analysis occurs in-memory inside the browser sandbox; zero network egress for raw screenshots.
- **Memory Footprint:** Light-weight initialization staying below `350MB` VRAM/RAM allocation.
