from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS, DEVICE
from app.routers import classify, stt, tts

app = FastAPI(
    title="Haven AI Backend",
    description="Self-hosted STT / TTS / crisis-classifier service for Haven",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classify.router, tags=["classify"])
app.include_router(tts.router, tags=["tts"])
app.include_router(stt.router, tags=["stt"])


@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE}
