---
last_mapped_commit: 61245f96ae1c681d5bbca4641137eb59c2d7cbc0
last_mapped_at: 2026-09-30
---
# External Integrations

**Analysis Date:** 2026-09-30

## APIs & External Services

**VLM Reasoning Backend:**
- Local FastAPI Server - Handles complex visual reasoning tasks
  - Endpoint: `/reason` (POST)
  - Client: Chrome Extension Sidepanel/Background script
  - Data: Base64 redacted images + token metadata

**ONNX Model Runtime:**
- Transformers.js (@xenova/transformers) - Executes local vision models in the browser
  - Model: `detr-resnet-50` (located in `models/onnx/`)
  - Usage: PII detection and interactive element tagging in `extension/workers/vision_worker.js`

## Data Storage

**Databases:**
- Not detected (Stateless architecture)

**File Storage:**
- Local Filesystem - Stores model weights and configs
  - ONNX weights: `models/onnx/`
  - VLM weights: `models/server/Qwen2-VL`
  - Templates: `models/config/`

**Caching:**
- Browser Cache - Used by Transformers.js for model weights via `env.useBrowserCache = true`

## Authentication & Identity

**Auth Provider:**
- Not applicable (Localhost prototype)

## Monitoring & Observability

**Error Tracking:**
- None (Standard console logging used)

**Logs:**
- Python print statements in `backend/main.py` and `backend/inference/vlm_engine.py`

## CI/CD & Deployment

**Hosting:**
- Localhost (Hybrid: Browser + Local Python Server)

**CI Pipeline:**
- Not detected

## Environment Configuration

**Required env vars:**
- Not detected (Configuration is primarily file-based via `requirements.txt` and `package.json`)

**Secrets location:**
- Not applicable

## Webhooks & Callbacks

**Incoming:**
- `/reason` endpoint in `backend/main.py` acts as a callback for the extension's reasoning requests.

**Outgoing:**
- None

---

*Integration audit: 2026-09-30*
