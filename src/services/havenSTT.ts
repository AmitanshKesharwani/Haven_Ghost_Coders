/**
 * havenSTT.ts — Haven AI Backend STT integration
 *
 * Records audio with MediaRecorder, sends the blob to
 * POST {VITE_AI_BACKEND_URL}/stt (multipart form data, field "audio"),
 * and returns the transcript.
 *
 * Falls back to browser SpeechRecognition (webkitSpeechRecognition) when
 * the backend is unreachable, so the app still works without the backend.
 */

const BACKEND_URL = (import.meta as any).env.VITE_AI_BACKEND_URL as string | undefined;

export interface STTResult {
  transcript: string;
  confidence: number;
  language: string;
}

// ── Browser SpeechRecognition fallback ───────────────────────────────────────
function browserSTT(
  languageCode: string,
  onResult: (r: STTResult) => void,
  onError: (msg: string) => void
): () => void {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) { onError('SpeechRecognition not supported'); return () => {}; }
  const rec = new SR();
  rec.lang = languageCode;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e: any) => {
    const r = e.results[0]?.[0];
    onResult({ transcript: r?.transcript ?? '', confidence: r?.confidence ?? 0, language: languageCode });
  };
  rec.onerror = (e: any) => onError(e.error ?? 'SpeechRecognition error');
  rec.start();
  return () => rec.stop();
}

// ── MediaRecorder + backend Whisper ──────────────────────────────────────────
export class HavenSTT {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private onResult: ((r: STTResult) => void) | null = null;
  private onError: ((msg: string) => void) | null = null;
  private languageCode = 'en-IN';
  private fallbackStop: (() => void) | null = null;

  /** Start recording. Uses backend if available, browser SR as fallback. */
  async start(
    languageCode: string,
    onResult: (r: STTResult) => void,
    onError: (msg: string) => void
  ): Promise<void> {
    this.onResult = onResult;
    this.onError = onError;
    this.languageCode = languageCode;

    if (!BACKEND_URL) {
      console.warn('VITE_AI_BACKEND_URL not set — using browser SpeechRecognition');
      this.fallbackStop = browserSTT(languageCode, onResult, onError);
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.mediaRecorder.onstop = () => this.sendToBackend(mimeType);
      this.mediaRecorder.start(500);
    } catch (err: any) {
      console.warn('Microphone access failed, falling back to browser SR', err);
      this.fallbackStop = browserSTT(languageCode, onResult, onError);
    }
  }

  /** Stop recording (triggers backend transcription or stops browser SR). */
  stop(): void {
    if (this.fallbackStop) {
      this.fallbackStop();
      this.fallbackStop = null;
      return;
    }
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach(t => t.stop());
  }

  private async sendToBackend(mimeType: string): Promise<void> {
    const blob = new Blob(this.chunks, { type: mimeType });
    this.chunks = [];

    if (blob.size === 0) {
      this.onError?.('No audio captured');
      return;
    }

    try {
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');

      const res = await fetch(`${BACKEND_URL}/stt`, { method: 'POST', body: form });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`STT backend error ${res.status}: ${text}`);
      }

      const data = await res.json();
      this.onResult?.({
        transcript: data.transcript ?? '',
        confidence: data.confidence ?? 0,
        language: data.language ?? this.languageCode,
      });
    } catch (err: any) {
      console.warn('Backend STT failed, trying browser SR fallback', err);
      // Attempt browser SR as last-resort fallback
      this.fallbackStop = browserSTT(this.languageCode, this.onResult!, this.onError!);
    }
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording' || this.fallbackStop !== null;
  }
}

/** Singleton for components that just need a simple start/stop interface */
export const havenSTT = new HavenSTT();
