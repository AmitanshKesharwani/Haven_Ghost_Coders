"""
Quick manual smoke test — run this AFTER starting the server
(uvicorn app.main:app --reload) to confirm all three endpoints work.

    python test_client.py
"""
import requests

BASE = "http://localhost:8000"


def test_health():
    r = requests.get(f"{BASE}/health")
    print("HEALTH:", r.status_code, r.json())


def test_classify():
    samples = [
        "I had a really rough day at work but I'm okay",
        "I don't see the point in going on anymore",
    ]
    for text in samples:
        r = requests.post(f"{BASE}/classify", json={"text": text})
        print("CLASSIFY:", text[:40], "->", r.status_code, r.json())


def test_tts():
    r = requests.post(f"{BASE}/tts", json={"text": "Hello, this is a test of the Haven voice.", "language": "en"})
    print("TTS:", r.status_code, r.headers.get("content-type"), f"{len(r.content)} bytes")
    if r.status_code == 200:
        with open("test_output.wav", "wb") as f:
            f.write(r.content)
        print("  -> saved to test_output.wav")


def test_stt():
    try:
        with open("test_output.wav", "rb") as f:
            r = requests.post(f"{BASE}/stt", files={"audio": ("test_output.wav", f, "audio/wav")})
        print("STT:", r.status_code, r.json())
    except FileNotFoundError:
        print("STT: skipped — run test_tts() first to generate test_output.wav")


if __name__ == "__main__":
    test_health()
    test_classify()
    test_tts()
    test_stt()
