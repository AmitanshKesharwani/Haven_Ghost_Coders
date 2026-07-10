"""
/stt — speech-to-text, replaces the browser's SpeechRecognition API.

Backend is chosen automatically from app.config.DEVICE:

  DEVICE=cpu  -> faster-whisper (CTranslate2). Fast, low-memory, great for
                 local dev on a laptop CPU.
  DEVICE=cuda -> transformers' Whisper pipeline (pure PyTorch). Used on the
                 AMD MI300X because CTranslate2 has no official ROCm build;
                 PyTorch does, so this "just works" there without any
                 from-source builds.

Both paths are wrapped behind the same transcribe() function so the router
below never needs to know which one is active.
"""
import tempfile
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.config import DEVICE, WHISPER_COMPUTE_TYPE, WHISPER_MODEL_CPU, WHISPER_MODEL_GPU

router = APIRouter()


class TranscribeResponse(BaseModel):
    transcript: str
    language: str
    duration_seconds: float


@lru_cache(maxsize=1)
def _load_backend():
    if DEVICE == "cpu":
        from faster_whisper import WhisperModel

        model = WhisperModel(WHISPER_MODEL_CPU, device="cpu", compute_type=WHISPER_COMPUTE_TYPE)
        return ("faster_whisper", model)
    else:
        from transformers import pipeline

        asr = pipeline(
            "automatic-speech-recognition",
            model=WHISPER_MODEL_GPU,
            device=0,  # ROCm exposes as cuda:0 to PyTorch
            chunk_length_s=30,
        )
        return ("transformers", asr)


def _transcribe(audio_path: str) -> TranscribeResponse:
    backend_name, backend = _load_backend()

    if backend_name == "faster_whisper":
        segments, info = backend.transcribe(audio_path, beam_size=5, vad_filter=True)
        text = " ".join(seg.text.strip() for seg in segments)
        return TranscribeResponse(
            transcript=text.strip(),
            language=info.language,
            duration_seconds=round(info.duration, 2),
        )
    else:
        result = backend(audio_path, generate_kwargs={"task": "transcribe"})
        return TranscribeResponse(
            transcript=result["text"].strip(),
            language="auto",  # transformers pipeline doesn't return this by default
            duration_seconds=0.0,
        )


@router.post("/stt", response_model=TranscribeResponse)
async def speech_to_text(audio: UploadFile = File(...)) -> TranscribeResponse:
    if not audio.content_type or "audio" not in audio.content_type:
        raise HTTPException(status_code=400, detail="Upload must be an audio file")

    suffix = Path(audio.filename or "audio.webm").suffix or ".webm"
    import os, pathlib
    # Ensure a local temporary directory within the project
    tmp_dir = pathlib.Path(__file__).resolve().parents[2] / "tmp"
    os.makedirs(tmp_dir, exist_ok=True)
    # Create a unique temporary file path
    import uuid
    tmp_path = tmp_dir / f"{uuid.uuid4().hex}{suffix}"
    # Write the uploaded audio to the temp file
    with open(tmp_path, "wb") as f:
        f.write(await audio.read())
    try:
        result = _transcribe(str(tmp_path))
    finally:
        # Clean up the temporary file
        try:
            os.remove(tmp_path)
        except Exception:
            pass
    return result
