from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal, List
import uvicorn
import base64
from inference.vlm_engine import VLMInferenceEngine

app = FastAPI(title="AegisEdge Reasoning Backend")

# --- Schemas ---

class TokenMetadata(BaseModel):
    id: str
    bbox: List[float] # [xmin, ymin, xmax, ymax]
    label: str

class RequestPayload(BaseModel):
    taskId: str
    objective: str
    redactedImage: str  # Base64 encoded WebP
    tokens: List[TokenMetadata]
    viewportSize: dict

class ActionResponse(BaseModel):
    thought: str
    action: Literal["CLICK", "TYPE", "SCROLL", "WAIT", "TERMINATE"]
    target_token: Optional[str] = None
    value: Optional[str] = None
    confidence: float

# --- Global Engine ---
vlm_engine = None

@app.on_event("startup")
async def startup_event():
    global vlm_engine
    vlm_engine = VLMInferenceEngine()

@app.post("/reason", response_model=ActionResponse)
async def reason(payload: RequestPayload):
    try:
        # The engine now performs actual VLM reasoning on the redacted image
        result_dict = await vlm_engine.reason(payload)
        return ActionResponse(**result_dict)
    except Exception as e:
        print(f"Inference Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
