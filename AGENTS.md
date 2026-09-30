# AI Agent Guidelines & Project Standards

**Project:** SIH 26171 - On-device Visual Perception for Light-weight Browser Agents  
**Organization:** Indian Space Research Organisation (ISRO), Department of Space  
**Repository:** [https://github.com/jhaabhijeet864/On-device-Visual-Perception-for-Light-weight-Browser-Agents](https://github.com/jhaabhijeet864/On-device-Visual-Perception-for-Light-weight-Browser-Agents)

---

## 🎯 Non-Negotiable Core Invariants

1. **Zero-Trust Privacy Firewall (Local Only):**
   - Raw viewport screenshots and pixel data MUST NEVER be transmitted to external cloud endpoints unmasked.
   - All PII (credit cards, passwords, emails, SSNs, access tokens) MUST be sanitized locally in browser memory using local ONNX / WebGPU / Regex canvas redaction.

2. **On-Device Hardware Acceleration:**
   - Visual grounding and Set-of-Marks (SOM) tag generation MUST run on-device using WebGPU / WASM (`@xenova/transformers`).

3. **Autonomous Auto-Commit Workflow:**
   - Every completed task, feature modification, bug fix, or documentation update MUST be staged (`git add`), committed with a conventional commit message (`feat:`, `fix:`, `docs:`, `chore:`), and pushed directly to `origin/master`.

---

## 🛠️ Build, Development & Test Commands

```bash
# Install dependencies
npm install

# Build extension bundle for production (Outputs to dist/)
npm run build

# Preview build assets
npm run preview
```

---

## 📁 Repository Directory Topology

- `manifest.json`: Chrome Extension MV3 configuration.
- `src/background/service_worker.js`: MV3 background worker, tab screenshot router, sidepanel handler.
- `src/content/content_script.js`: Injected DOM inspector, SOM visual tag renderer, action executor.
- `src/perception/engine.js`: WebGPU on-device perception engine, interactive DOM scanner.
- `src/perception/privacy_firewall.js`: On-device PII detector & canvas redaction mask generator.
- `src/agent/agent.js`: Light-weight task planner & action execution state machine.
- `src/sidepanel/`: Interactive Glassmorphism telemetry control panel UI.
- `docs/`: Complete problem statement, architecture, design system, rules, and execution plans.
- `dist/`: Compiled production extension bundle ready for Chrome (`chrome://extensions`).
