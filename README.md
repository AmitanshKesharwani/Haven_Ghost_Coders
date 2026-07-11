
cat > README.md << 'EOF'

Haven_Ghost_Coders/
├── src/                          # Frontend React application
│   ├── components/               # UI components (chat, journal, voice therapy, etc.)
│   ├── services/                 # AI orchestration, TTS/STT clients, Supabase client
│   ├── utils/                    # Crisis detection, validation
│   └── hooks/                    # React hooks
├── supabase/                     # Supabase Edge Functions
├── Haven gpu services/
│   └── haven-ai-backend/         # Self-hosted FastAPI service (classify, TTS, STT)
└── docs/                         # Reference documentation
## Crisis Detection Design

Crisis detection runs three layers in parallel on every message, not sequentially — so a message is never silently passed through just because an earlier layer didn't flag it:

1. **Keyword scan** (instant, client-side) — catches explicit language
2. **ML classifier** (`sentinet/suicidality`, self-hosted) — catches indirect or ambiguous phrasing via a probability-based "ambiguous" tier, not just a binary top-label check
3. **LLM review** (Qwen) — final judgment call on ambiguous cases before showing the crisis intervention overlay

Flagged conversations route users to verified, government-approved crisis helplines rather than making any clinical determination — Haven is a wellness companion, not a diagnostic tool, and always defers to licensed professionals.

## License & Attributions

See `docs/Attributions.md` for third-party licenses (shadcn/ui, Unsplash).
