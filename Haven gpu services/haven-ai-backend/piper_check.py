# piper_check.py
import io, wave, sys
from pathlib import Path

try:
    from piper.voice import PiperVoice
except Exception as e:
    print("Import error:", e)
    sys.exit(1)

VOICE_PATH = Path(r"D:\havenversion 1\Haven gpu services\haven-ai-backend\app\voices\en_US-lessac-medium.onnx")
print(f"Checking that the ONNX file exists ... {VOICE_PATH.is_file()}")
if not VOICE_PATH.is_file():
    print("File not found – double-check the path and that the .onnx file is present.")
    sys.exit(1)

try:
    voice = PiperVoice.load(str(VOICE_PATH))
    print("PiperVoice loaded successfully.")
except Exception as e:
    print("Error while loading the voice:", e)
    sys.exit(1)

# Try a tiny synthesis
try:
    out_buf = io.BytesIO()
    with wave.open(out_buf, "wb") as wav_file:
        # Set standard PCM parameters expected by Piper (mono, 16‑bit, 22050 Hz)
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(22050)
        voice.synthesize("Hello, this is a test.", wav_file)
    wav_bytes = out_buf.getvalue()
    print(f"Synthesis succeeded – generated {len(wav_bytes)} bytes of WAV data.")
    with open("test_output.wav", "wb") as f:
        f.write(wav_bytes)
    print("Saved test_output.wav in the current directory.")
except Exception as e:
    print("Synthesis error:", e)
    sys.exit(1)
