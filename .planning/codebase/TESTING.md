---
last_mapped_commit: 61245f96ae1c681d5bbca4641137eb59c2d7cbc0
last_mapped_at: 2026-09-30
---
# Testing Patterns

**Analysis Date:** 2026-09-30

## Test Framework

**Runner:**
- Python: No formal test runner (e.g., `pytest`, `unittest`) detected. Testing is performed via custom benchmark and profiler scripts in `evaluation/`.
- JavaScript: No test runner (e.g., `Jest`, `Vitest`) detected.

**Assertion Library:**
- Python: Basic comparisons and custom scoring logic within benchmark scripts.

**Run Commands:**

```bash
python evaluation/pii_benchmark/benchmark.py    # Run PII redaction benchmark
python evaluation/latency_profiler.py         # Profile system latency
python evaluation/resource_monitor.py          # Monitor resource consumption
```

## Test File Organization

**Location:**
- Separate `evaluation/` directory for all testing and validation logic.

**Naming:**
- Descriptive script names (e.g., `latency_profiler.py`, `benchmark.py`).

**Structure:**

```
evaluation/
├── pii_benchmark/
│   ├── benchmark.py        # Validation logic for PII redaction
│   └── test_cases.json     # Ground truth data for benchmarking
├── latency_profiler.py     # End-to-end timing analysis
└── resource_monitor.py      # HW utilization tracking
```

## Test Structure

**Suite Organization:**

```python

# Example from evaluation/pii_benchmark/benchmark.py

class PIIBenchmark:
    def __init__(self, test_dataset_path):
        # setup
    def run_benchmark(self, extension_api_url):
        # execution loop
    def calculate_score(self, redacted_img, ground_truth):
        # validation logic
```

**Patterns:**
- **Data-Driven Testing:** Uses JSON files (`evaluation/pii_benchmark/test_cases.json`) to store test inputs and expected outputs (ground truth).
- **Metric-Based Validation:** Focuses on `Recall` and `Precision` for PII detection rather than simple pass/fail binary checks.

## Mocking

**Framework:** Manual mocking.

**Patterns:**

```python

# Example from evaluation/pii_benchmark/benchmark.py:48

def is_pixel_black(self, img_b64, box):
    return True # Mocked for structure
```

**What to Mock:**
- External API calls during structural testing.
- Heavy image processing functions when validating benchmark flow.

**What NOT to Mock:**
- The actual VLM reasoning logic (tested via end-to-end `latency_profiler.py`).
- The ONNX model inference in the browser (tested via manual verification and benchmark).

## Fixtures and Factories

**Test Data:**
- JSON-based ground truth datasets.

**Location:**
- `evaluation/pii_benchmark/test_cases.json`

## Coverage

**Requirements:** No formal coverage target enforced.

**View Coverage:**
- Not applicable (no coverage tool used).

## Test Types

**Unit Tests:**
- Not formally implemented. Basic logic is tested via the `evaluation/` scripts.

**Integration Tests:**
- End-to-end flow testing: `evaluation/latency_profiler.py` profiles the path from Chrome Extension -> Backend -> Chrome Extension.

**E2E Tests:**
- `evaluation/pii_benchmark/benchmark.py` acts as an E2E test for the PII redaction pipeline.

## Common Patterns

**Async Testing:**
- JavaScript components are tested via manual triggers in the Chrome Extension and console logging.

**Error Testing:**
- Handled via `try...catch` and `try...except` blocks in source code, with errors bubbled up to logs for developer analysis.

---

*Testing analysis: 2026-09-30*
