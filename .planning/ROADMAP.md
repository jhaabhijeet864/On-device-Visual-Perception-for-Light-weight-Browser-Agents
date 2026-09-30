# AegisEdge Roadmap - Milestone 2

## Phase Structure & Execution Roadmap

### Phase 1: Chrome Extension Core Consolidation & Offscreen Bridge
- Merge and standardize `extension/` worker components with `src/` MV3 extension.
- Complete offscreen message protocol between Service Worker, Offscreen Canvas, and Content Script.
- Verify zero-latency SOM badge rendering on complex web pages (Wikipedia, E-commerce, Forms).

### Phase 2: On-Device WebGPU Model Integration (`Xenova/detr-resnet-50`)
- Connect `@xenova/transformers` ONNX local vision model in `src/perception/engine.js` for on-device bounding box detection.
- Implement INT8 model loading and memory budget cap ($\le 350\text{MB}$).

### Phase 3: End-to-End FastAPI VLM Backend Integration (`Qwen2-VL-2B-Instruct`)
- Connect Chrome SidePanel UI with local FastAPI server (`http://localhost:8000/reason`).
- Implement sanitized payload transmission (`redactedImage` WebP + token metadata).
- Execute closed-loop VLM action execution in browser tab (`CLICK`, `TYPE`, `SCROLL`).

### Phase 4: Benchmarking, Failure-Handling & Final Verification
- Run SIH 26171 evaluation benchmark suite (`evaluation/latency_profiler.py`, `evaluation/resource_monitor.py`, `evaluation/pii_benchmark/`).
- Validate latency target ($T_{\text{total}} \le 1.8\text{s}$) and PII recall target ($\ge 98\%$).
- Build final production bundle (`dist/`) and produce submission deliverables.
