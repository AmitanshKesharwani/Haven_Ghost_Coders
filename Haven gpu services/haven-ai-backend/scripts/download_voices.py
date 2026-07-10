"""
One-time helper to download the Piper voices Haven needs into app/voices/.

Run once before starting the server:
    python scripts/download_voices.py

Add more languages by extending VOICES below — browse the full catalogue at
https://github.com/rhasspy/piper/blob/master/VOICES.md and pick the
<lang>_<REGION>-<name>-<quality> id.
"""
from pathlib import Path

from piper.download_voices import download_voice

VOICES_DIR = Path(__file__).resolve().parent.parent / "app" / "voices"

VOICES = [
    "en_US-lessac-medium",
    "hi_IN-priyamvada-medium",
]

if __name__ == "__main__":
    VOICES_DIR.mkdir(parents=True, exist_ok=True)
    for voice in VOICES:
        print(f"Downloading {voice} -> {VOICES_DIR}")
        download_voice(voice, VOICES_DIR)
    print("Done. Voices available:", [p.name for p in VOICES_DIR.glob("*.onnx")])
