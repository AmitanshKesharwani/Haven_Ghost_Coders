<div align="center">

# 🌿 Haven

### An open-source AI mental wellness companion for Indian students

*Built on AMD Instinct GPUs · Powered by Fireworks AI · Fully migrated off Firebase & Gemini*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-haven--omega--two.vercel.app-2ea44f?style=for-the-badge)](https://haven-omega-two.vercel.app)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![AMD](https://img.shields.io/badge/AMD%20Instinct-ROCm-ED1C24?style=flat-square&logo=amd&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

---

Haven is the bridge between *"I don't want to talk to anyone"* and reaching real help — an AI companion, journal, and voice therapy app designed around Indian family dynamics, academic pressure, and social context that generic wellness apps overlook.

<div align="center">

| 💬 AI Companion | 📔 Journaling | 🎭 Emotion Detection | 🎙️ Voice Therapy |
|:---:|:---:|:---:|:---:|
| 🧘 Breathing Exercises | 📊 PHQ-9 / GAD-7 | 🚨 Crisis Detection | 🌐 Multilingual |

</div>

## ✨ Features

- **AI Companion Chat** — culturally-aware, memory-driven conversations in English, Hindi, or mixed, powered by open-weight LLMs on AMD Instinct GPUs
- **Journaling with AI Insights** — sentiment analysis, key themes, and gentle reflections on every entry
- **Facial Emotion Detection** — webcam-based recognition giving the AI real-time emotional context
- **Voice Therapy** — natural voice conversations, self-hosted multilingual STT (Whisper) and TTS (Piper / XTTS-v2) running directly on AMD GPU hardware
- **Breathing Exercises & Calm-Down Sessions** — guided grounding tools for in-the-moment stress
- **Clinically Validated Assessments** — PHQ-9 and GAD-7 screening, tracked over time
- **Crisis Detection & Escalation** — keyword detection plus a dedicated ML risk classifier, surfacing verified Government of India helplines the moment it matters
- **Privacy by Design** — Row Level Security on every table, AES-256 encrypted payloads

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React + TypeScript + Vite (Vercel)           │
└───────────────────────────┬───────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────────┐
│ Supabase Auth   │  │ Supabase        │  │ Self-hosted AMD    │
│ + Postgres      │  │ Edge Functions  │  │ GPU Backend         │
│ (Row Level      │  │ (Deno, HTTPS,   │  │ (FastAPI, ROCm)     │
│  Security)       │  │  AES-256-GCM)   │  │                     │
└─────────────────┘  └───────┬────────┘  │ • Whisper STT       │
                             │            │ • Piper / XTTS-v2   │
              ┌──────────────┼────────────┤   TTS               │
              │              │            │ • Crisis classifier │
       ┌──────▼─────┐ ┌──────▼──────┐    │   (suicidality      │
       │ ai-companion│ │analyze-face-│    │    detection)       │
       │ analyze-    │ │  emotion    │    └─────────────────────┘
       │ journal-entry│ │(Fireworks   │
       │(Fireworks AI,│ │ Vision, AMD │
       │ AMD Instinct)│ │ Instinct)   │
       └─────────────┘ └─────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Auth & Database | Supabase (Postgres, Row Level Security, Auth) |
| Backend Logic | Supabase Edge Functions (Deno) |
| AI — Chat & Journal | Open-weight LLMs via **Qwen3p7-Plus on Fireworks AI** |
| AI — Facial Emotion | Vision-capable open model via **llama-v3p2-11b-vision-instruct on Fireworks AI** |
| AI — Crisis Classifier | Fine-tuned suicidality-detection model **sentinet/suicidality classifier from Hugginf Face**, self-hosted on AMD GPU |
| Voice — STT | Whisper, self-hosted on AMD GPU |
| Voice — TTS | Piper (CPU) / Coqui XTTS-v2 (AMD GPU), multilingual voice cloning |
| Encryption | AES-256-GCM for all sensitive Edge Function payloads |


## 🚀 Getting Started

```bash
git clone https://github.com/AmitanshKesharwani/Haven_Ghost_Coders.git
cd Haven_Ghost_Coders
npm install
cp .env.example .env   # fill in Supabase + encryption keys
npm run dev
```

<details>
<summary><b>Required environment variables</b></summary>

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENCRYPTION_KEY=your_transport_encryption_key
VITE_AI_BACKEND_URL=your_amd_gpu_backend_url
```

</details>

<details>
<summary><b>Deploying Supabase Edge Functions</b></summary>

```bash
supabase secrets set FIREWORKS_API_KEY=your_fireworks_key
supabase secrets set ENCRYPTION_KEY=same_value_as_VITE_ENCRYPTION_KEY
supabase secrets set HUGGINGFACE_API_KEY=your_huggingface_key

supabase functions deploy ai-companion
supabase functions deploy analyze-journal-entry
supabase functions deploy analyze-face-emotion
supabase functions deploy analyze-emotional-context
```

</details>

## 🆘 Crisis Safety

Haven is explicit: **it is not a replacement for a therapist or emergency service.** When distress signals are detected, it surfaces real, verified helplines:

| Helpline | Number | Availability |
|---|---|---|
| **Tele MANAS** | 14416 / 1800-891-4416 | 24/7, Govt. of India, 20+ languages |
| **KIRAN** | 1800-599-0019 | 24/7, Govt. of India |
| **NIMHANS** | 080-4611-0007 | 24/7 |

## 🗺️ Roadmap

- [ ] Expand the AMD-hosted voice pipeline to more Indian languages
- [ ] A stylized, ethically-designed AI avatar mode
- [ ] Deeper clinician-facing PHQ-9/GAD-7 trend dashboards

## ⚠️ Disclaimer

Haven is a wellness support tool, not a substitute for professional mental health care. If you or someone you know is in crisis, please contact **Tele MANAS (14416)** or a local emergency service immediately.

---

<div align="center">

Built for the **AMD Developer Hackathon: ACT II**

</div>
