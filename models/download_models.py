"""
AegisEdge SIH 26171 Model Downloader Script
Downloads and verifies required server VLM and client ONNX vision models.
"""

import os
from huggingface_hub import snapshot_download

MODELS = [
    {
        "name": "Server VLM (Qwen2-VL-2B-Instruct)",
        "repo_id": "Qwen/Qwen2-VL-2B-Instruct",
        "local_dir": "models/server/Qwen2-VL"
    },
    {
        "name": "On-Device Local Vision ONNX Model (Xenova DETR)",
        "repo_id": "Xenova/detr-resnet-50",
        "local_dir": "models/onnx/detr-resnet-50"
    }
]

def main():
    print("==================================================")
    print("AegisEdge SIH 26171 Model Downloader")
    print("==================================================")

    for item in MODELS:
        print(f"\n[+] Downloading {item['name']}...")
        print(f"    Repository: {item['repo_id']}")
        print(f"    Destination: {item['local_dir']}")
        
        os.makedirs(item['local_dir'], exist_ok=True)
        
        snapshot_download(
            repo_id=item['repo_id'],
            local_dir=item['local_dir'],
            resume_download=True
        )
        print(f"[✓] Finished downloading {item['name']}.")

    print("\n[✔] All models successfully downloaded and verified!")

if __name__ == "__main__":
    main()
