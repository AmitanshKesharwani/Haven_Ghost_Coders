/**
 * havenTTS.ts — Haven AI Backend TTS integration
 *
 * Calls POST {VITE_AI_BACKEND_URL}/tts for real AI voices (Piper on CPU,
 * XTTS-v2 on GPU).  Falls back to browser SpeechSynthesis if the backend
 * is unreachable, so voice therapy still works during development without
 * the backend running.
 *
 * Backend language codes: "en" | "hi"  (not BCP-47 like "en-IN")
 * We map BCP-47 → backend code automatically.
 */

const BACKEND_URL = (import.meta as any).env.VITE_AI_BACKEND_URL as string | undefined;

/** Map BCP-47 language codes to backend language keys */
function toBackendLang(bcp47: string): string {
  const code = bcp47.toLowerCase();
  if (code.startsWith('hi')) return 'hi';
  // All other Indian regional languages fall back to English on Piper CPU
  // (Piper only has en + hi voices by default; GPU XTTS-v2 supports more)
  return 'en';
}

/** Browser SpeechSynthesis fallback */
function speakFallback(
  text: string,
  languageCode: string,
  rate: number,
  onEnd?: () => void
): void {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = languageCode;
  u.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const match =
    voices.find(v => v.lang === languageCode) ??
    voices.find(v => v.lang.startsWith(languageCode.split('-')[0])) ??
    null;
  if (match) u.voice = match;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

/** Play a WAV/audio ArrayBuffer via Web Audio API */
async function playAudioBuffer(arrayBuffer: ArrayBuffer, onEnd?: () => void): Promise<void> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === 'suspended') await ctx.resume();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const source = ctx.createBufferSource();
  source.buffer = decoded;
  source.connect(ctx.destination);
  source.onended = () => { onEnd?.(); ctx.close(); };
  source.start(0);
}

/**
 * Speak text using the Haven AI backend.
 * Returns a promise that resolves when audio playback ends (or immediately
 * if the backend is unavailable and we fell back to browser TTS).
 */
export async function havenSpeak(
  text: string,
  languageCode: string,   // BCP-47, e.g. "en-IN", "hi-IN", "ta-IN"
  rate: number = 1.0,
  voiceId?: string        // optional backend voice_id for GPU XTTS-v2
): Promise<void> {
  if (!BACKEND_URL) {
    console.warn('VITE_AI_BACKEND_URL not set — falling back to browser TTS');
    return new Promise(resolve => speakFallback(text, languageCode, rate, resolve));
  }

  try {
    const body: Record<string, unknown> = {
      text,
      language: toBackendLang(languageCode),
    };
    if (voiceId) body.voice_id = voiceId;

    const res = await fetch(`${BACKEND_URL}/tts?speed=${rate}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`Backend TTS returned ${res.status} — falling back to browser TTS`);
      return new Promise(resolve => speakFallback(text, languageCode, rate, resolve));
    }

    const arrayBuffer = await res.arrayBuffer();
    return new Promise(resolve => playAudioBuffer(arrayBuffer, resolve).catch(() => {
      speakFallback(text, languageCode, rate, resolve);
    }));

  } catch (err) {
    console.warn('Backend TTS unreachable — falling back to browser TTS', err);
    return new Promise(resolve => speakFallback(text, languageCode, rate, resolve));
  }
}

/**
 * Stop any currently playing audio (both backend playback and browser TTS).
 * Call this before starting new speech to avoid overlap.
 */
export function havenSpeakStop(): void {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  // Web Audio sources don't have a global stop — they end naturally or via
  // the AudioContext close() called in playAudioBuffer's onended handler.
}
