# Project Milestone Planning - AegisEdge (SIH 26171)

## Current Milestone: Milestone 2 - Production-Grade Chrome MV3 Visual Perception Extension & VLM Integration

**Project Goal:** Build an on-device, privacy-preserving visual perception engine and light-weight browser agent for ISRO under Smart India Hackathon (SIH 26171).

---

## Executive Overview of Chrome Extension in AegisEdge

The Chrome Extension acts as the **Client-Side "Eyes & Hands"** of the AegisEdge architecture:
1. **Service Worker (`src/background/service_worker.js`):** Controls extension lifecycle, SidePanel toggle, tab screenshot capture (`chrome.tabs.captureVisibleTab`), offscreen document initialization, and messaging.
2. **Content Script (`src/content/content_script.js`):** Injected directly into active web pages. Scans the DOM tree for interactive elements, assigns numerical Set-of-Marks (SOM) visual badges, detects sensitive PII zones, and dispatches native mouse/keyboard events (`click`, `type`, `scroll`).
3. **Offscreen Perception Canvas Worker (`src/offscreen/`):** Runs an off-thread canvas worker. Draws dark `#0F172A` fill boxes with dashed red borders and `🛡️ REDACTED PII` watermarks over sensitive pixel zones (passwords, credit cards, emails) before transmitting sanitized WebP imagery.
4. **On-Device Perception Engine (`src/perception/`):** Runs local WebGPU detection and regex/input privacy filtering.
5. **Glassmorphism SidePanel UI (`src/sidepanel/`):** Interactive ISRO space telemetry dashboard displaying live latency metrics, active SOM count, WebGPU hardware acceleration status, PII mask counters, prompt input, and step trajectory log.

---

## Milestone Objectives

- [x] Milestone 1: Core Architecture, Documentation, and MV3 Extension Foundation
- [ ] Milestone 2: Complete Extension Functionality, On-Device WebGPU Inference, VLM Backend Bridge, and End-to-End Task Execution
