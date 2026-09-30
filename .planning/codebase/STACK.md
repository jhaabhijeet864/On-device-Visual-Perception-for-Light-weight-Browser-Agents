---
last_mapped_commit: 61245f96ae1c681d5bbca4641137eb59c2d7cbc0
last_mapped_at: 2026-09-30
---
# Technology Stack

**Analysis Date:** 2026-09-30

## Languages

**Primary:**
- TypeScript/JavaScript (ES Modules) - Chrome Extension frontend, workers, and UI (`extension/`, `src/`)
- Python 3.x - Backend inference engine and evaluation tools (`backend/`, `evaluation/`)

**Secondary:**
- HTML/CSS - Extension sidepanel and offscreen documents (`extension/offscreen/`, `dist/assets/`)

## Runtime

**Environment:**
- Node.js / Chrome Browser - Extension environment
- Python 3.x (with CUDA support if available) - Backend server

**Package Manager:**
- npm (v10+) - Frontend dependencies
- pip - Python dependencies (`requirements.txt`)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- FastAPI (Python) - Backend API for VLM reasoning (`backend/main.py`)
- Vite - Frontend build tool and dev server (`vite.config.js`)
- Chrome Extension API (MV3) - Browser integration (`extension/manifest.json`)

**Testing:**
- Custom Python scripts - Latency and resource monitoring (`evaluation/`)

**Build/Dev:**
- Vite - Bundling for the Chrome Extension

## Key Dependencies

**Critical:**
- `@xenova/transformers` (JS) - On-device ONNX model execution for PII detection (`extension/workers/vision_worker.js`)
- `torch` (Python) - Deep learning framework for VLM inference (`backend/inference/vlm_engine.py`)
- `transformers` (Python) - HuggingFace library for loading VLM models (`backend/inference/vlm_engine.py`)
- `FastAPI` / `uvicorn` (Python) - High-performance API server for the reasoning backend

**Infrastructure:**
- `Pillow` (Python) - Image processing for VLM inputs
- `psutil` (Python) - Resource monitoring in evaluation scripts

## Configuration

**Environment:**
- Python requirements defined in `requirements.txt`
- Node dependencies defined in `package.json`

**Build:**
- `vite.config.js` - Configures the build pipeline for the extension

## Platform Requirements

**Development:**
- Node.js (v18+)
- Python 3.10+
- NVIDIA GPU (Optional, but recommended for backend VLM inference via CUDA)

**Production:**
- Chrome Browser (MV3 compliant)
- Linux/Windows server with Python runtime for the Reasoning Backend

---

*Stack analysis: 2026-09-30*
