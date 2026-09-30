---
last_mapped_commit: 61245f96ae1c681d5bbca4641137eb59c2d7cbc0
last_mapped_at: 2026-09-30
---
# Codebase Structure

**Analysis Date:** 2026-09-30

## Directory Layout

```
[project-root]/
├── assets/             # Icons and static assets for the extension
├── backend/            # FastAPI VLM reasoning server
│   ├── inference/      # VLM model loading and reasoning logic
│   ├── schemas/        # Pydantic request/response models
│   └── utils/          # Backend utility functions
├── docs/               # Project documentation and design specs
├── evaluation/         # Latency profiling and PII benchmarking tools
├── extension/          # Compiled/packaged extension files
├── models/             # Model weights and configurations
│   ├── config/         # Model config files
│   ├── onnx/           # Local ONNX models (e.g., detr-resnet-50)
│   └── server/         # Server-side model weights (e.g., Qwen2-VL)
├── src/                # Extension source code
│   ├── agent/          # Execution core and action mapping
│   ├── background/     # Extension service worker (background script)
│   ├── content/        # DOM interaction and content scripts
│   ├── offscreen/      # Offscreen documents for heavy tasks (e.g., image redaction)
│   ├── perception/     # Local vision and privacy firewall logic
│   ├── sidepanel/      # Extension UI (SidePanel)
│   └── styles/         # CSS for UI and SOM overlays
└── vite.config.js      # Build configuration
```

## Directory Purposes

**src/perception:**
- Purpose: Handles local visual understanding and privacy.
- Contains: ML pipeline initialization (Transformers.js) and PII masking.
- Key files: `src/perception/engine.js`, `src/perception/privacy_firewall.js`

**src/agent:**
- Purpose: Maps reasoning outputs to browser actions.
- Contains: Action execution logic.
- Key files: `src/agent/agent.js`

**backend/:**
- Purpose: Provides the VLM "brain" for the system.
- Contains: FastAPI server and PyTorch inference wrappers.
- Key files: `backend/main.py`, `backend/inference/vlm_engine.py`

**models/:**
- Purpose: Central storage for model binaries.
- Contains: Quantized ONNX files for the browser and full weights for the server.

## Key File Locations

**Entry Points:**
- `src/sidepanel/sidepanel.js`: Primary UI controller.
- `backend/main.py`: Backend API entry point.
- `src/background/service_worker.js`: Extension lifecycle manager.

**Configuration:**
- `package.json`: Node dependencies and build scripts.
- `requirements.txt`: Python dependencies.
- `manifest.json`: Chrome Extension manifest.

**Core Logic:**
- `src/perception/engine.js`: Local vision perception.
- `backend/inference/vlm_engine.py`: Server-side VLM reasoning.

**Testing:**
- `evaluation/latency_profiler.py`: Performance measurement.

## Naming Conventions

**Files:**
- camelCase for JS files (`content_script.js` is a legacy/standard exception, most are `sidepanel.js`, `engine.js`).
- snake_case for Python files (`vlm_engine.py`, `main.py`).

**Directories:**
- Lowercase, descriptive names (e.g., `perception`, `inference`).

## Where to Add New Code

**New Feature (Extension):**
- Primary code: `src/` (under appropriate sub-directory: `agent/`, `perception/`, etc.)
- UI changes: `src/sidepanel/` and `src/styles/`

**New Backend Logic:**
- Implementation: `backend/inference/` or `backend/utils/`

**New Model/Config:**
- Weights: `models/onnx/` (for client) or `models/server/` (for server)

**Utilities:**
- Shared helpers: `backend/utils/` (Python) or `src/` (JS).

## Special Directories

**.planning/codebase:**
- Purpose: Stores architecture and codebase maps.
- Generated: Manually by agent.
- Committed: Yes.

**dist/:**
- Purpose: Compiled extension assets.
- Generated: Yes (via Vite).
- Committed: No (usually ignored).

---

*Structure analysis: 2026-09-30*
