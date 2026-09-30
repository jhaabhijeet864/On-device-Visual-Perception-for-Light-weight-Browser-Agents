---
last_mapped_commit: 61245f96ae1c681d5bbca4641137eb59c2d7cbc0
last_mapped_at: 2026-09-30
---
# Codebase Concerns

**Analysis Date:** 2026-09-30

## Tech Debt

**VLM Output Parsing:**
- Issue: The `VLMInferenceEngine.parse_vlm_output` method uses basic string matching (`"CLICK" in text.upper()`) and a simple regex for token extraction. This is highly fragile and prone to failure if the VLM phrasing varies slightly.
- Files: `backend/inference/vlm_engine.py`
- Impact: Low reliability in action selection; the agent may fail to act or act incorrectly despite correct reasoning.
- Fix approach: Implement constrained decoding using libraries like Guidance or Outlines to force JSON output.

**Action Mapping Logic:**
- Issue: The coordinate mapping in `runActionLoop` uses `window.innerWidth` and `window.innerHeight` within a background script context, where `window` may not refer to the target tab's viewport size.
- Files: `extension/background/orchestrator.js`
- Impact: Clicks may be offset or miss the target entirely due to incorrect coordinate scaling.
- Fix approach: Pass the actual `viewportSize` from the `sanitized` payload or query the tab's dimensions explicitly.

**State Verification Heuristic:**
- Issue: `verifyStateDelta` simply checks if the base64 images are not identical. This will return `true` for any minor pixel shift or animation, even if the intended action failed.
- Files: `extension/background/orchestrator.js`
- Impact: False positives in action verification.
- Fix approach: Implement a structural hash or use the VLM to verify if the objective was progressed.

## Known Bugs

**Token Registry Lookup:**
- Symptoms: If the VLM returns a token ID that isn't perfectly matched in the local `detections` array, the loop simply returns without an error message to the user.
- Files: `extension/background/orchestrator.js`
- Trigger: VLM hallucinating a token ID or using a different format (e.g., omitting "ACTION_EL_").
- Workaround: None.

## Security Considerations

**Base64 Image Transmission:**
- Risk: Redacted images are transmitted via HTTP POST to the backend. While redacted, any leak in the redaction process (`extension/workers/redaction.js`) could expose PII to the backend server.
- Files: `extension/background/transmitter.js`, `backend/main.py`
- Current mitigation: Redaction happens locally in the extension before transmission.
- Recommendations: Ensure HTTPS is strictly enforced for the backend endpoint.

## Performance Bottlenecks

**Synchronous Model Loading:**
- Problem: The `VLMInferenceEngine` loads the entire model in `__init__` during FastAPI startup. This can lead to extremely slow startup times and potential timeouts in certain hosting environments.
- Files: `backend/inference/vlm_engine.py`
- Cause: Loading large weights from `models/server/Qwen2-VL` into GPU memory.
- Improvement path: Implement lazy loading or a separate model-server process.

## Fragile Areas

**Offscreen Document Communication:**
- Files: `extension/background/orchestrator.js`
- Why fragile: The communication between the background script and the offscreen document relies on `chrome.runtime.sendMessage`. If the offscreen document is disposed of by the browser, these calls will fail.
- Safe modification: Implement a check to ensure the offscreen document exists and is ready before sending messages.
- Test coverage: Gaps in testing the lifecycle of the offscreen document.

## Test Coverage Gaps

**End-to-End Action Loop:**
- What's not tested: The full loop from `CAPTURE_VIEWPORT` $\rightarrow$ `reason` $\rightarrow$ `EXECUTE_ACTION` is not covered by automated tests.
- Files: `extension/background/orchestrator.js`
- Risk: Regressions in the coordination logic may go unnoticed until manual testing.
- Priority: High

---

*Concerns audit: 2026-09-30*
