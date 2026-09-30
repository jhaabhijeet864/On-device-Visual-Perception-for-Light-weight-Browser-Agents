# Development Rules & Privacy Invariants

## 🛡️ Non-Negotiable Privacy Invariants

1. **Zero External Screenshot Transmission:**
   - Raw viewport screenshots captured via `chrome.tabs.captureVisibleTab` MUST NEVER be transmitted over any network socket or HTTP request.
   - All image processing, OCR, PII detection, and SOM tag generation MUST take place locally within WebGPU / WASM / Browser Memory.

2. **Strict Privacy Firewall Sanitization:**
   - Any sensitive input field (`type="password"`, `autocomplete="cc-number"`, PII patterns matched by local regex/OCR) MUST be redacted on the local canvas before passing pixel data to any visual downstream subscriber.

3. **User-In-The-Loop Consent Controls:**
   - Autonomous actions that alter state (e.g. submitting forms, executing financial/authorization actions) MUST prompt user confirmation in the SidePanel UI before proceeding unless explicitly authorized in developer mode.

---

## 💻 Code Engineering Standards

1. **Modern ES Modules & Manifest V3:**
   - All extension logic must follow Chrome Extension Manifest V3 guidelines.
   - Service workers must remain stateless and handle background wake-up cycles gracefully.

2. **Clean Web Architecture & Typing:**
   - Maintain modular components inside `src/`:
     - `src/background/`: Extension messaging & background tasks.
     - `src/content/`: DOM tree parsing, event synthesis, canvas overlay injection.
     - `src/perception/`: AI vision, WebGPU compute, local OCR, PII masking.
     - `src/agent/`: State machine, prompt parser, task planner.
     - `src/sidepanel/`: Interactive user interface.

3. **Performance Budget:**
   - Content script DOM scan execution time must be `< 30ms`.
   - On-device vision model inference per screenshot frame must remain `< 200ms`.
