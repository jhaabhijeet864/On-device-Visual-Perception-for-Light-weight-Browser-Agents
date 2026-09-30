import torch
from transformers import AutoProcessor, AutoModelForCausalLM
from pydantic import BaseModel, Field
from typing import Optional, Literal, List
import base64
from io import BytesIO
from PIL import Image

# We use Qwen2-VL-2B or Phi-3.5-Vision as per the architectural plan
# For the prototype, we use a representative open-weights VLM
import os
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../models/server/Qwen2-VL"))

class VLMInferenceEngine:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = AutoProcessor.from_pretrained(MODEL_PATH)
        self.model = AutoModelForCausalLM.from_pretrained(
            MODEL_PATH,
            torch_dtype="auto",
            device_map="auto"
        )

    async def reason(self, payload):
        # 1. Decode the redacted image
        image_data = base64.b64decode(payload.redactedImage.split(',')[1] if ',' in payload.redactedImage else payload.redactedImage)
        image = Image.open(BytesIO(image_data)).convert("RGB")

        # 2. Construct the prompt with surrogate tokens
        token_context = "\n".join([f"Token {t.id} is at {t.bbox} labeled as {t.label}" for t in payload.tokens])
        prompt = (
            f"Task: {payload.objective}\n"
            f"Context: The image is a sanitized screenshot. Interactive elements are replaced by tokens.\n"
            f"Structural Info:\n{token_context}\n\n"
            f"Analyze the image and tokens. Provide your reasoning and the target token to act upon."
        )

        # 3. Inference
        inputs = self.processor(text=[prompt], images=[image], return_tensors="pt").to(self.device)
        generated_ids = self.model.generate(**inputs, max_new_tokens=128)
        result_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

        # 4. Deterministic JSON Parsing (Simplified for prototype)
        # In production, we use a constrained decoding library like Guidance or Outlines
        return self.parse_vlm_output(result_text)

    def parse_vlm_output(self, text):
        # Simple heuristic to extract Action and Token from VLM text
        # Example: "I should CLICK [ACTION_EL_1]"
        import re

        action = "WAIT"
        if "CLICK" in text.upper(): action = "CLICK"
        elif "TYPE" in text.upper(): action = "TYPE"
        elif "SCROLL" in text.upper(): action = "SCROLL"

        token_match = re.search(r'\[ACTION_EL_\d+\]', text)
        target_token = token_match.group(0) if token_match else None

        return {
            "thought": text,
            "action": action,
            "target_token": target_token,
            "confidence": 0.85 # Simulated
        }
