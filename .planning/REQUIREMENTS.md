# Requirements Specification - Milestone 2

## Functional & Technical Requirements

### 1. Chrome Extension MV3 Runtime & DOM Grounding
- **REQ-EXT-01:** DOM inspector must identify interactive elements (`<button>`, `<a>`, `<input>`, `[role="button"]`) with sub-30ms scan overhead.
- **REQ-EXT-02:** Render high-contrast Set-of-Marks (SOM) numbered badges on the active DOM page overlay without altering page layout.
- **REQ-EXT-03:** Support native event synthesis (`click`, `type`, `scroll`) with smooth scrolling and focus restoration.

### 2. Zero-Trust Local Privacy Firewall
- **REQ-PRIV-01:** Detect password fields, credit card numbers, SSNs, API tokens, and emails using local regex and input element classifiers.
- **REQ-PRIV-02:** Perform off-thread canvas redaction in `src/offscreen/` to render `🛡️ REDACTED PII` watermarks over sensitive pixel zones.
- **REQ-PRIV-03:** Ensure zero unmasked image pixel data leaves browser memory over any network request.

### 3. Server-Side VLM Integration & Autonomous Agent Loop
- **REQ-VLM-01:** Transmit sanitized WebP screenshot and surrogate token map to FastAPI backend (`/reason`).
- **REQ-VLM-02:** Parse VLM JSON action response (`CLICK`, `TYPE`, `SCROLL`, `WAIT`, `TERMINATE`) and map target tokens to DOM elements.
- **REQ-VLM-03:** Provide step-by-step state verification loop in the SidePanel execution trajectory.

### 4. Hardware Acceleration & Telemetry Dashboard
- **REQ-HW-01:** Detect WebGPU availability and gracefully fall back to WASM/CPU if unsupported.
- **REQ-HW-02:** Display real-time telemetry metrics in SidePanel (Perception Latency < 150ms, Active SOM Marks, Masked PII count, VRAM allocation < 350MB).
