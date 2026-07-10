"""
/tts — text-to-speech, replaces the browser's speechSynthesis API and the
old Google Chirp 3 HD calls in src/services/speechServices.ts.

Backend is chosen automatically from app.config.DEVICE, same pattern as stt.py:

  DEVICE=cpu  -> Piper. Real-time on CPU alone, zero GPU needed — good for
                 local dev.
  DEVICE=cuda -> Coqui XTTS-v2. Piper's ONNX Runtime ROCm execution provider
                 is being phased out by AMD (migrating to MIGraphX EP, which
                 needs custom wheels + system packages) — real setup friction
                 for a hackathon week. XTTS-v2 is pure PyTorch, so it uses the
                 exact same ROCm PyTorch install as everything else, no
                 detour needed. It also natively supports Hindi, which Piper
                 doesn't have a great voice for.
"""
import io
import wave
from functools import lru_cache

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.config import (
    DEFAULT_VOICES,
    DEVICE,
    PIPER_VOICES_DIR,
    XTTS_MODEL_ID,
    XTTS_SPEAKER_REFS,
)

router = APIRouter()


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    language: str = Field("en", description="'en' or 'hi' — extend config.py for more")
    voice: str | None = Field(None, description="Piper only: explicit voice name override")


# ── Piper (CPU) ─────────────────────────────────────────────────────────
@lru_cache(maxsize=8)
def _load_piper_voice(voice_name: str):
    from piper.voice import PiperVoice

    model_path = PIPER_VOICES_DIR / f"{voice_name}.onnx"
    if not model_path.exists():
        raise HTTPException(
            status_code=422,
            detail=f"Voice '{voice_name}' not found in {PIPER_VOICES_DIR}. "
                    f"Run scripts/download_voices.py first.",
        )
    return PiperVoice.load(str(model_path))


def _speak_piper(req: SpeakRequest, speed: float = 1.0) -> bytes:
    voice_name = req.voice or DEFAULT_VOICES.get(req.language)
    if not voice_name:
        raise HTTPException(status_code=422, detail=f"No default voice configured for language '{req.language}'")

    voice = _load_piper_voice(voice_name)

    # Split the text into manageable chunks (max 100 chars each)
    text = req.text.strip()
    max_len = 100
    chunks = [text[i:i+max_len] for i in range(0, len(text), max_len)]

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(22050)
        for chunk in chunks:
            try:
                voice.synthesize(chunk, wav_file, speed=speed)
            except TypeError:
                # Fallback for Piper versions without speed param
                voice.synthesize(chunk, wav_file)
    return buffer.getvalue()


# ── XTTS-v2 (GPU) ───────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def _load_xtts():
    import torch
    from TTS.api import TTS

    return TTS(XTTS_MODEL_ID).to("cuda" if torch.cuda.is_available() else "cpu")


def _speak_xtts(req: SpeakRequest) -> bytes:
    speaker_wav = XTTS_SPEAKER_REFS.get(req.language)
    if not speaker_wav:
        raise HTTPException(status_code=422, detail=f"No XTTS reference clip configured for language '{req.language}'")

    tts = _load_xtts()
    # XTTS writes to a file path rather than returning bytes directly —
    # use a temp file to avoid disk churn under load.
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        tts.tts_to_file(text=req.text, speaker_wav=speaker_wav, language=req.language, file_path=tmp.name)
        tmp.seek(0)
        return tmp.read()


@router.post("/tts")
def speak(req: SpeakRequest, speed: float = Query(1.0, ge=0.5, le=2.0, description="Piper synthesis speed (1.0 = default)")):
    audio_bytes = _speak_piper(req, speed) if DEVICE == "cpu" else _speak_xtts(req)
    return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/wav")
