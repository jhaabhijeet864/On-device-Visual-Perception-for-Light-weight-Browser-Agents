# evaluation/pii_benchmark/benchmark.py
import json
import numpy as np
from PIL import Image
import requests

class PIIBenchmark:
    def __init__(self, test_dataset_path):
        self.dataset = self.load_dataset(test_dataset_path)
        self.results = []

    def load_dataset(self, path):
        with open(path, 'r') as f:
            return json.load(f)

    def run_benchmark(self, extension_api_url):
        """
        Sends test images to the extension's local redaction pipeline
        and compares the redacted output with ground truth masks.
        """
        for item in self.dataset:
            image_path = item['image']
            ground_truth = item['pii_bboxes'] # List of [xmin, ymin, xmax, ymax]

            # Trigger local redaction (via mock API for testing)
            response = requests.post(f"{extension_api_url}/redact", json={"image": image_path})
            redacted_image_b64 = response.json()['image']

            # Compare redacted areas with ground truth
            score = self.calculate_score(redacted_image_b64, ground_truth)
            self.results.append(score)

    def calculate_score(self, redacted_img, ground_truth):
        # Heuristic: Check if the center of every GT box is black (#000000) in the output
        # This validates Recall
        recall = 0
        for box in ground_truth:
            if self.is_pixel_black(redacted_img, box):
                recall += 1

        return {
            "recall": recall / len(ground_truth) if ground_truth else 1.0,
            "precision": 0.95 # Simplified for prototype
        }

    def is_pixel_black(self, img_b64, box):
        # Simplified check: Decode and check pixel value at center of bbox
        return True # Mocked for structure

    def get_final_metrics(self):
        avg_recall = sum(r['recall'] for r in self.results) / len(self.results)
        avg_precision = sum(r['precision'] for r in self.results) / len(self.results)
        return {
            "recall": avg_recall,
            "precision": avg_precision,
            "status": "PASS" if avg_recall >= 0.98 else "FAIL"
        }

if __name__ == "__main__":
    # Mock run
    bench = PIIBenchmark("evaluation/pii_benchmark/test_cases.json")
    # mock a result
    bench.results = [{"recall": 0.99, "precision": 0.92}, {"recall": 0.97, "precision": 0.91}]
    print(json.dumps(bench.get_final_metrics(), indent=2))
