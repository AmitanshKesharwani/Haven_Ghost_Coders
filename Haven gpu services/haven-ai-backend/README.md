# Haven AI Backend

Self-hosted FastAPI service providing three endpoints for Haven:

| Endpoint | Purpose | Model |
|---|---|---|
| `POST /classify` | Second-layer crisis risk scoring | `sentinet/suicidality` |
| `POST /tts` | Text-to-speech | Piper (open source, ONNX) |
| `POST /stt` | Speech-to-text | Whisper (via `faster-whisper` locally, `transformers` on GPU) |

## Phase 1 — run this locally right now (no GPU needed)

```bash
cd haven-ai-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-cpu.txt

cp .env.example .env
# leave HAVEN_DEVICE=cpu for now

python scripts/download_voices.py   # one-time voice download
uvicorn app.main:app --reload
```

In another terminal:

```bash
python test_client.py
```

You should see all four checks pass. This is everything working end to end
on your laptop — no GPU, no cloud spend yet.

## Phase 2 — deploy to AMD Developer Cloud (do this LAST)

Since the droplet can't be deleted once created for the hackathon, get
everything working and tested locally first (phase 1), then only spin up
the MI300X when you're ready for the final deploy:

1. Create the droplet: single MI300X, official ROCm software image.
2. SSH in, clone this backend.
3. Install ROCm-native PyTorch **before** the rest of requirements — see
   the comment at the top of `requirements-rocm.txt` for the exact command.
   This matters: `pip install torch` from PyPI pulls the CUDA build and
   silently breaks GPU acceleration.
4. `pip install --break-system-packages -r requirements-rocm.txt`
5. Set `HAVEN_DEVICE=cuda` in `.env` (ROCm reports itself to PyTorch as
   `"cuda"` — this is expected, not a typo).
6. `uvicorn app.main:app --host 0.0.0.0 --port 8000`
7. Expose it: `cloudflared tunnel --url http://localhost:8000`
8. Point your frontend's API base URL at the tunnel URL.

## Why the STT backend switches between CPU and GPU

`faster-whisper` (CTranslate2) has **no official ROCm backend** — it's
CUDA/CPU only. Getting it running on AMD hardware means building CTranslate2
from source against ROCm, which is not worth the hackathon time. Plain
Whisper via `transformers`/PyTorch, on the other hand, works well on ROCm —
AMD publishes an official ROCm blog demonstrating it on MI210/MI250. So
`app/routers/stt.py` swaps to a plain `transformers` Whisper pipeline when
`HAVEN_DEVICE=cuda`. Same endpoint, same response shape, different engine
underneath — nothing in the frontend needs to know or care.

## Why the TTS backend switches between CPU and GPU

Piper runs on ONNX Runtime, and ONNX Runtime's **ROCm Execution Provider is
being phased out** — AMD's docs say ROCm 7.0 is the last version supporting
it, with migration pushed to the MIGraphX Execution Provider, which needs
custom wheels from `repo.radeon.com` (not PyPI) plus MIGraphX and a `half`
library installed system-wide. Real friction for hackathon week.

So `app/routers/tts.py` uses Piper on CPU (`HAVEN_DEVICE=cpu`, real-time,
zero GPU needed, great for local dev) and switches to **Coqui XTTS-v2** on
GPU (`HAVEN_DEVICE=cuda`). XTTS-v2 is pure PyTorch — it rides the exact same
ROCm PyTorch wheel as everything else, no ONNX/MIGraphX detour required. It
also natively supports Hindi with voice cloning and emotional/style
transfer, which is a meaningfully better fit for Haven than Piper's flatter
single-speaker voices.

Before deploying to GPU, drop two short (6+ second) reference WAV clips into
`app/voices/xtts_ref_en.wav` and `app/voices/xtts_ref_hi.wav` — these are
the voices XTTS-v2 clones from. Record your own or source calm,
warm-toned samples; the reference clip's tone carries into every generated
line, so pick something that matches Haven's supportive voice.

**License note:** XTTS-v2's weights are CPML (non-commercial) — fine for a
hackathon demo. If Haven becomes a commercial product later, swap to Kokoro
(Apache 2.0) or keep Piper (GPL-3.0, note its own distribution implications)
for the shipped version.

## AMD Developer Cloud billing — confirmed

Powering off a GPU instance does **not** stop billing — disk, CPU, RAM, and
IP stay reserved, so charges continue until you **destroy** the instance.
Your plan (get everything tested on CPU first, spin up the MI300X only for
the final deploy) is the right call. Two extra tips:

- **Snapshot before you destroy.** If you do a short validation run to
  confirm the ROCm install works, snapshot the VM before destroying it —
  then recreate from that snapshot for your final run instead of debugging
  ROCm quirks for the first time under deadline pressure.
- **Check your credit's expiry date now.** Some AMD credit grants expire in
  as little as 10 days from approval — confirm yours covers July 11.

## Wiring into the existing Haven frontend

Replace calls in these files:

- `src/services/speechServices.ts` (currently Google Chirp 3 HD) →
  `POST {BACKEND_URL}/tts`, returns a WAV blob you can play directly.
- `src/services/speechToTextService.ts` (currently Google Cloud
  Speech-to-Text) → `POST {BACKEND_URL}/stt` with the recorded audio blob
  as multipart form data under the `audio` field.
- `src/utils/crisisDetection.ts` → keep the existing keyword scan as the
  fast first pass, but when it flags anything, also call
  `POST {BACKEND_URL}/classify` and only show the crisis overlay if either
  layer says high risk.

## Tuning the classifier before you trust it

`sentinet/suicidality`'s actual output label names aren't confirmed in this
scaffold — `app/routers/classify.py` has a `# NOTE` marking exactly where
to check. Run a handful of real sample messages through `/classify` first,
print the raw label your model returns, and adjust the `is_flagged_label`
set accordingly before wiring this into the crisis-detection flow for real.

## "Continuous" crisis monitoring

If by "runs continuously in the background" you mean scanning every message
as it arrives (rather than a scheduled batch job), the current design
already supports that well: the classifier model is loaded once via
`@lru_cache` and stays warm in memory for the life of the process, so each
`/classify` call is just a fast forward pass, not a fresh model load. Call
it on every user message as it's sent — that IS continuous monitoring, just
request-driven rather than polling.

If you specifically want a background worker that scans a queue or a
conversation log independently of the request/response cycle (e.g. to catch
patterns across several messages, not just one at a time), that's a
different shape — an async task loop inside `main.py` consuming from a
queue — worth a follow-up if that's the direction you want.
