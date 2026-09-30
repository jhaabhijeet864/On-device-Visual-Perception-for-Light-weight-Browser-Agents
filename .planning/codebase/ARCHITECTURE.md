---
last_mapped_commit: 61245f96ae1c681d5bbca4641137eb59c2d7cbc0
last_mapped_at: 2026-09-30
---
<!-- refreshed: 2026-09-30 -->

# Architecture

**Analysis Date:** 2026-09-30

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│               `src/sidepanel/sidepanel.js`                  │
└────────┬────────────────────────────────────────────────────┘
          │ Messaging (chrome.tabs.sendMessage)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension Core                    │
│  `src/background/service_worker.js`                          │
│  `src/content/content_script.js`                            │
└────────┬───────────────┬──────────────────────┬─────────────┘
         │               │                      │
         ▼               ▼                      ▼
┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐
│  Perception     │ │  Privacy Firewall│ │  Agent Execution   │
│ `src/perception/` │ `src/perception/` │ `src/agent/agent.js` │
└────────┬────────┘ └────────┬────────┘ └───────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    VLM Reasoning Backend                    │
│                  `backend/main.py`                         │
│               `backend/inference/vlm_engine.py`              │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Local Models (ONNX / PyTorch)                               │
│  `models/onnx/` (DETR) & `models/server/` (Qwen2-VL)        │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| SidePanel | User input, trajectory logging, triggering perception/execution | `src/sidepanel/sidepanel.js` |
| Content Script | DOM scanning, SOM overlay rendering, action execution | `src/content/content_script.js` |
| Perception Engine | Object detection (DETR), interactive element extraction | `src/perception/engine.js` |
| Privacy Firewall | PII detection and screenshot redaction | `src/perception/privacy_firewall.js` |
| Browser Agent | Translating plans into DOM actions (click, type) | `src/agent/agent.js` |
| VLM Backend | High-level reasoning using VLM to determine next action | `backend/main.py` |
| VLM Engine | PyTorch-based inference with Qwen2-VL | `backend/inference/vlm_engine.py` |

## Pattern Overview

**Overall:** Hybrid Edge-Cloud Reasoning (Edge Perception, Server Reasoning).

**Key Characteristics:**
- **Set-of-Marks (SOM) Tagging:** Interactive elements are identified and assigned numeric tokens for VLM grounding.
- **Privacy-First Design:** Local redaction of PII (via `PrivacyFirewall`) before images leave the browser.
- **On-Device Acceleration:** Uses WebGPU for local object detection via Transformers.js.
- **Asynchronous Coordination:** Extension components communicate via Chrome's messaging API.

## Layers

**UI Layer:**
- Purpose: User interaction and telemetry display.
- Location: `src/sidepanel/`
- Contains: HTML/JS for the side panel.
- Depends on: Chrome Extension API.
- Used by: End User.

**Extension Layer (Edge):**
- Purpose: Real-time perception and action execution.
- Location: `src/content/`, `src/background/`, `src/perception/`
- Contains: Content scripts, service workers, and local ML pipelines.
- Depends on: `@xenova/transformers`, DOM API.
- Used by: SidePanel, VLM Backend.

**Reasoning Layer (Backend):**
- Purpose: Complex visual reasoning and task planning.
- Location: `backend/`
- Contains: FastAPI server, PyTorch inference engine.
- Depends on: `transformers`, `torch`, `fastapi`.
- Used by: SidePanel.

## Data Flow

### Primary Request Path (Reasoning Loop)

1. **User Input:** User enters goal in `src/sidepanel/sidepanel.js`.
2. **Perception:** SidePanel triggers `PERCEIVE_SCREEN` in `src/content/content_script.js` $\rightarrow$ `src/perception/engine.js`.
3. **Redaction:** Screenshot is captured and sanitized by `src/perception/privacy_firewall.js`.
4. **VLM Request:** SidePanel sends sanitized image + SOM tokens to `backend/main.py`.
5. **Inference:** `backend/inference/vlm_engine.py` uses Qwen2-VL to reason $\rightarrow$ returns `ActionResponse`.
6. **Execution:** SidePanel sends action plan to `src/agent/agent.js` via content script $\rightarrow$ DOM updated.

## Key Abstractions

**VisualPerceptionEngine:**
- Purpose: Wraps on-device ML (DETR) and DOM scanning.
- Examples: `src/perception/engine.js`
- Pattern: Singleton/Service.

**PrivacyFirewall:**
- Purpose: Encapsulates PII regex patterns and DOM masking logic.
- Examples: `src/perception/privacy_firewall.js`
- Pattern: Strategy.

**BrowserAgent:**
- Purpose: Maps abstract actions (CLICK, TYPE) to concrete DOM events.
- Examples: `src/agent/agent.js`
- Pattern: Command.

## Entry Points

**SidePanel:**
- Location: `src/sidepanel/index.html`
- Triggers: User clicks.
- Responsibilities: Orchestrate the perception-reasoning-execution loop.

**FastAPI Server:**
- Location: `backend/main.py`
- Triggers: HTTP POST `/reason`.
- Responsibilities: Run VLM inference and return structured actions.

**Content Script:**
- Location: `src/content/content_script.js`
- Triggers: Chrome Extension messaging.
- Responsibilities: Interact with the active webpage DOM.

## Architectural Constraints

- **Threading:** Chrome Extensions use a multi-process model (Background, Content, SidePanel). Local ML uses WebGPU/WASM.
- **Global state:** The VLM engine is a global singleton in `backend/main.py`.
- **Circular imports:** Not detected.
- **Privacy:** Images must be redacted on-device before transmission to the backend.

## Error Handling

**Strategy:** Layered exception handling with fallback to "idle" or "wait" actions.

**Patterns:**
- Backend uses FastAPI `HTTPException` for inference errors.
- Frontend uses `try-catch` blocks around `fetch` and `chrome.runtime.sendMessage`.

## Cross-Cutting Concerns

**Logging:** Trajectory steps are logged in the SidePanel UI in real-time.
**Validation:** Pydantic schemas in `backend/main.py` for request/response validation.
**Authentication:** Not implemented (local prototype).

---

*Architecture analysis: 2026-09-30*
