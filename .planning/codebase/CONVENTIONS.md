---
last_mapped_commit: 61245f96ae1c681d5bbca4641137eb59c2d7cbc0
last_mapped_at: 2026-09-30
---
# Coding Conventions

**Analysis Date:** 2026-09-30

## Naming Patterns

**Files:**
- Python: `snake_case.py` (e.g., `vlm_engine.py`, `main.py`)
- JavaScript: `snake_case.js` (e.g., `service_worker.js`, `vision_worker.js`) - *Note: Non-standard for JS, but consistent across the project.*

**Functions:**
- Python: `snake_case` (e.g., `run_benchmark`, `parse_vlm_output`)
- JavaScript: `camelCase` (e.g., `runActionLoop`, `initDetector`)

**Variables:**
- Python: `snake_case` (e.g., `vlm_engine`, `result_dict`)
- JavaScript: `camelCase` (e.g., `sanitizedPayload`, `tokenCoords`)

**Types:**
- Python (Pydantic): `PascalCase` (e.g., `RequestPayload`, `ActionResponse`)
- JavaScript: Not explicitly typed (Plain JS)

## Code Style

**Formatting:**
- Not detected (No `.prettierrc` or `.eslintrc` found).
- Python: Follows standard PEP 8 patterns.
- JavaScript: Uses ES Modules (`import`/`export`).

**Linting:**
- Not detected.

## Import Organization

**Order:**
1. Standard library imports (e.g., `import json`, `import torch`)
2. Third-party library imports (e.g., `from fastapi import ...`, `from transformers import ...`)
3. Local module imports (e.g., `from .inference.vlm_engine import ...`)

**Path Aliases:**
- Not detected.

## Error Handling

**Patterns:**
- Python: Use of `try...except` blocks in entry points (e.g., `backend/main.py:41`) and `HTTPException` for API responses.
- JavaScript: Use of `try...catch` blocks in asynchronous loops and worker message handlers (e.g., `extension/background/orchestrator.js:7`, `extension/workers/vision_worker.js:24`).
- Workers: Errors are caught and sent back to the main thread via `postMessage({ type: 'ERROR', ... })`.

## Logging

**Framework:** `console` / `print`

**Patterns:**
- JavaScript: `console.log` for flow tracking, `console.error` for failures (e.g., `extension/background/orchestrator.js:66`).
- Python: `print` statements used for basic error logging in the API (e.g., `backend/main.py:46`).

## Comments

**When to Comment:**
- Complex logic blocks (e.g., VLM prompt construction in `backend/inference/vlm_engine.py`).
- Implementation notes for production (e.g., "In production, we use a constrained decoding library" in `backend/inference/vlm_engine.py:43`).

**JSDoc/TSDoc:**
- Not used.

## Function Design

**Size:** Functions are generally focused on a single responsibility (e.g., `parse_vlm_output`).

**Parameters:** 
- API: Uses Pydantic models for structured request validation (`RequestPayload`).
- Workers: Uses message-based communication via `e.data`.

**Return Values:**
- Python: Returns dictionaries or Pydantic models.
- JavaScript: Primarily returns `Promises` (async/await).

## Module Design

**Exports:**
- Python: Module-level functions and classes.
- JavaScript: Named exports for utility functions (e.g., `sendSanitizedPayload` in `extension/background/transmitter.js`).

**Barrel Files:**
- Not used.

---

*Convention analysis: 2026-09-30*
