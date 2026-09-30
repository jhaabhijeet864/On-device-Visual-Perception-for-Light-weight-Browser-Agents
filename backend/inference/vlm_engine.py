import torch
from transformers import AutoProcessor, Qwen2VLForConditionalGeneration
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
        self.model = Qwen2VLForConditionalGeneration.from_pretrained(
            MODEL_PATH,
            torch_dtype="auto",
            device_map="auto"
        )

    async def reason(self, payload):
        # 1. Decode the redacted image
        if payload.redactedImage:
            image_data = base64.b64decode(payload.redactedImage.split(',')[1] if ',' in payload.redactedImage else payload.redactedImage)
            image = Image.open(BytesIO(image_data)).convert("RGB")
        else:
            # Fallback to a blank image if no screenshot was provided
            width = payload.viewportSize.get("width", 800) if payload.viewportSize else 800
            height = payload.viewportSize.get("height", 600) if payload.viewportSize else 600
            image = Image.new("RGB", (width, height), (255, 255, 255))

        # 2. Construct the prompt with surrogate tokens
        token_context = "\n".join([f"Element [ACTION_EL_{t.id}] is at {t.bbox} labeled as {t.label}" for t in payload.tokens])
        prompt = (
            f"Task: {payload.objective}\n"
            f"Context: You are a browser automation agent. You are provided with a sanitized screenshot and a list of interactive elements (tokens).\n"
            f"Your goal is to analyze the image and the structural info to decide the next best action.\n\n"
            f"Structural Info:\n{token_context}\n\n"
            f"RESPONSE FORMAT:\n"
            f"You must respond in the following format:\n"
            f"Reasoning: <your step-by-step thought process>\n"
            f"Action: <CLICK | TYPE | SCROLL | WAIT>\n"
            f"Target: <[ACTION_EL_id] or None>\n\n"
            f"Example:\n"
            f"Reasoning: The user wants to search for 'Climate Change'. I see a search input labeled as [ACTION_EL_1].\n"
            f"Action: TYPE\n"
            f"Target: [ACTION_EL_1]\n\n"
            f"Now, analyze the image and tokens. Provide your reasoning and the target token to act upon."
        )

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt}
                ]
            }
        ]
        
        # 3. Inference
        text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.processor(text=[text], images=[image], return_tensors="pt").to(self.device)
        generated_ids = self.model.generate(**inputs, max_new_tokens=128)
        
        # Strip the input tokens from the generated output
        generated_ids_trimmed = [
            out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        result_text = self.processor.batch_decode(generated_ids_trimmed, skip_special_tokens=True)[0]

        # 4. Deterministic JSON Parsing (Simplified for prototype)
        # In production, we use a constrained decoding library like Guidance or Outlines
        return self.parse_vlm_output(result_text)

    def parse_vlm_output(self, text):
        """
        Parses the VLM output to extract structured action and target.
        Expected format:
        Reasoning: <text>
        Action: <CLICK | TYPE | SCROLL | WAIT>
        Target: <[ACTION_EL_id] or None>
        """
        import re

        # Attempt to parse based on the explicit 'Action:' and 'Target:' keys
        action_match = re.search(r'Action:\s*(CLICK|TYPE|SCROLL|WAIT)', text, re.IGNORECASE)
        target_match = re.search(r'Target:\s*(\[ACTION_EL_\d+\]|None)', text, re.IGNORECASE)

        # Fallback to simple keyword search if structured keys are missing
        action = "WAIT"
        if action_match:
            action = action_match.group(1).upper()
        elif "CLICK" in text.upper(): action = "CLICK"
        elif "TYPE" in text.upper(): action = "TYPE"
        elif "SCROLL" in text.upper(): action = "SCROLL"

        target_token = None
        if target_match:
            res = target_match.group(1)
            target_token = res if res.upper() != "NONE" else None
        else:
            # Fallback to searching for any token pattern [ACTION_EL_X]
            token_match = re.search(r'\[ACTION_EL_\d+\]', text)
            target_token = token_match.group(0) if token_match else None

        return {
            "thought": text,
            "action": action,
            "target_token": target_token,
            "confidence": 0.85 # Simulated
        }
