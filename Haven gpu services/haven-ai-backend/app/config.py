"""
Central config for the Haven AI backend.

Everything that changes between "running on my laptop" and "running on the
AMD MI300X droplet" is controlled by environment variables here — nothing
else in the codebase should need to change.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# ── Device switch ────────────────────────────────────────────────────────
# "cpu"  -> local development, uses faster-whisper (CTranslate2, CPU-only)
# "cuda" -> AMD MI300X droplet. ROCm exposes itself to PyTorch as "cuda",
#           so this also covers the AMD GPU case. Uses transformers' Whisper
#           pipeline instead of faster-whisper, since CTranslate2 has no
#           official ROCm backend.
DEVICE = os.getenv("HAVEN_DEVICE", "cpu")  # "cpu" | "cuda"

# ── STT (Whisper) ────────────────────────────────────────────────────────
WHISPER_MODEL_CPU = os.getenv("WHISPER_MODEL_CPU", "small")        # faster-whisper size
WHISPER_MODEL_GPU = os.getenv("WHISPER_MODEL_GPU", "openai/whisper-large-v3")  # HF repo id
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")   # faster-whisper CPU quantization

# ── TTS ──────────────────────────────────────────────────────────────────
# CPU (DEVICE=cpu)  -> Piper. Fast, simple, real-time on CPU alone.
# GPU (DEVICE=cuda) -> Coqui XTTS-v2. Pure PyTorch (no ONNX/MIGraphX detour
#                      needed on ROCm), better quality, native Hindi support,
#                      voice cloning from a short reference clip.
PIPER_VOICES_DIR = Path(os.getenv("PIPER_VOICES_DIR", str(BASE_DIR / "voices")))
DEFAULT_VOICES = {
    "en": "en_US-lessac-medium",
    "hi": "hi_IN-priyamvada-medium",
}

XTTS_MODEL_ID = os.getenv("XTTS_MODEL_ID", "tts_models/multilingual/multi-dataset/xtts_v2")
# Reference audio clips used to clone each voice — drop short (6s+) WAV
# samples here before deploying to GPU. See README for how to source these.
# Multi‑voice configuration for XTTS‑v2 (GPU).
# For each language we expose a list of voice options.  Each option provides
# a unique `voice_id` (used by the API), a human readable `name`, a short
# `description`, and the path to a reference clip used for voice cloning.
# Placeholder clips are provided – replace the paths with real WAV files.
XTTS_VOICES = {
    "en": [
        {
            "voice_id": "en_1",
            "name": "English Voice 1",
            "description": "Placeholder English voice 1",
            "ref_clip_path": str(BASE_DIR / "voices" / "xtts_ref_en_1.wav"),
        },
        {
            "voice_id": "en_2",
            "name": "English Voice 2",
            "description": "Placeholder English voice 2",
            "ref_clip_path": str(BASE_DIR / "voices" / "xtts_ref_en_2.wav"),
        },
    ],
    "hi": [
        {
            "voice_id": "hi_1",
            "name": "Hindi Voice 1",
            "description": "Placeholder Hindi voice 1",
            "ref_clip_path": str(BASE_DIR / "voices" / "xtts_ref_hi_1.wav"),
        },
        {
            "voice_id": "hi_2",
            "name": "Hindi Voice 2",
            "description": "Placeholder Hindi voice 2",
            "ref_clip_path": str(BASE_DIR / "voices" / "xtts_ref_hi_2.wav"),
        },
    ],
}


# ── Crisis classifier ────────────────────────────────────────────────────
CLASSIFIER_MODEL_ID = os.getenv("CLASSIFIER_MODEL_ID", "sentinet/suicidality")
# Score threshold above which we treat the message as high risk.
# Tune this after testing against real conversation samples — starting
# conservative (lower threshold = more sensitive) is safer for a mental
# health product.
CLASSIFIER_RISK_THRESHOLD = float(os.getenv("CLASSIFIER_RISK_THRESHOLD", "0.7"))

# ── Server ───────────────────────────────────────────────────────────────
HOST = os.getenv("HAVEN_HOST", "0.0.0.0")
PORT = int(os.getenv("HAVEN_PORT", "8000"))

# Comma-separated list of allowed origins for CORS (your Vite dev server +
# deployed frontend URL). Keep this tight — this service will be exposed
# via a public Cloudflare tunnel.
ALLOWED_ORIGINS = os.getenv(
    "HAVEN_ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:3000",
).split(",")
