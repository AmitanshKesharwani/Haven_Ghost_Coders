// Speech-to-Text Service using self‑hosted backend

export interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  language: string;
  isFinal: boolean;
  alternatives?: {
    transcript: string;
    confidence: number;
  }[];
}

export interface SpeechToTextOptions {
  language?: string;
  alternativeLanguages?: string[];
  enableAutomaticPunctuation?: boolean;
  enableWordTimeOffsets?: boolean;
  model?: 'chirp' | 'chirp_2' | 'latest_long' | 'latest_short';
  useEnhanced?: boolean;
}

// Language mapping for all 15 supported languages
const LANGUAGE_CODES = {
  english: 'en-IN',
  hindi: 'hi-IN',
  bengali: 'bn-IN',
  marathi: 'mr-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  gujarati: 'gu-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  punjabi: 'pa-IN',
  odia: 'or-IN',
  assamese: 'as-IN',
  urdu: 'ur-IN',
  'english-us': 'en-US',
  'english-gb': 'en-GB',
} as const;

class SpeechToTextService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onTranscriptCallback: ((result: SpeechToTextResult) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  // Fallback to browser SpeechRecognition when backend fails
  private fallbackStop: (() => void) | null = null;
  private languageCode: string = 'en-IN';

  constructor() {
    // No API key needed – we use the self‑hosted backend.
    // Initialize fallback fields
    this.fallbackStop = null;
    this.languageCode = 'en-IN';
  }

  /**
   * Start recording audio using MediaRecorder.
   */
  async startRecording(options: SpeechToTextOptions = {}): Promise<void> {
    try {
      // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });

        const mimeType = 'audio/webm;codecs=opus';
        // Store language code for fallback
        this.languageCode = options.language || navigator.language || 'en-IN';
      this.mediaRecorder = new MediaRecorder(
        stream,
        MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined
      );
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        stream.getTracks().forEach((t) => t.stop());
        await this.sendAudioToBackend(audioBlob, options);
        this.isRecording = false;
      };
      this.mediaRecorder.start(1000); // collect data every second
      this.isRecording = true;
    } catch (err) {
      this.handleError(err as Error);
      throw err;
    }
  }

  /**
   * Stop recording and trigger backend processing.
   */
  stopRecording(): void {
    // If using browser fallback, stop it
    if (this.fallbackStop) {
      this.fallbackStop();
      this.fallbackStop = null;
    }
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
  }

  /**
   * Send recorded audio to the self‑hosted backend.
   */
  private async sendAudioToBackend(blob: Blob, options: SpeechToTextOptions): Promise<void> {
    try {
      const backendUrl = import.meta.env.VITE_AI_BACKEND_URL;
      if (!backendUrl) throw new Error('VITE_AI_BACKEND_URL is not configured');

      const form = new FormData();
      form.append('audio', blob);

      const response = await fetch(`${backendUrl}/stt`, {
        method: 'POST',
        body: form,
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Backend STT error ${response.status}: ${txt}`);
      }
      const data = await response.json();
      const result: SpeechToTextResult = {
        transcript: data.transcript || '',
        confidence: data.confidence ?? 0,
        language: data.language ?? options.language ?? '',
        isFinal: true,
        alternatives: data.alternatives ?? [],
      };
      if (this.onTranscriptCallback) this.onTranscriptCallback(result);
    } catch (err) {
      console.warn('Backend STT failed, falling back to browser SpeechRecognition', err);
      // Attempt browser SpeechRecognition as fallback
      this.fallbackStop = this.createBrowserSTT(this.languageCode);
    }
  }

  /**
   * Register callback for transcription results.
   */
  onTranscript(callback: (result: SpeechToTextResult) => void): void {
    this.onTranscriptCallback = callback;
  }

  /**
   * Register callback for errors.
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Get language code mapping.
   */
  getLanguageCode(languageName: string): string {
    const normalized = languageName.toLowerCase().replace(/[^a-z]/g, '');
    return LANGUAGE_CODES[normalized as keyof typeof LANGUAGE_CODES] || 'en-IN';
  }

  /**
   * Get optimal language options – retained for backward compatibility.
   */
  getOptimalLanguageSettings(): SpeechToTextOptions {
    const browserLang = navigator.language || 'en-IN';
    const defaults: SpeechToTextOptions = {
      language: 'en-IN',
      alternativeLanguages: ['hi-IN', 'mr-IN', 'bn-IN'],
      enableAutomaticPunctuation: true,
      model: 'chirp',
      useEnhanced: true,
    };
    if (browserLang.startsWith('hi')) defaults.language = 'hi-IN';
    else if (browserLang.startsWith('bn')) defaults.language = 'bn-IN';
    else if (browserLang.startsWith('ta')) defaults.language = 'ta-IN';
    return defaults;
  }

  /**
   * Check if MediaRecorder is supported.
   */
  isSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices
    );
  }

  /**
   * Get supported languages list.
   */
  getSupportedLanguages(): { code: string; name: string; nativeName: string }[] {
    return [
      { code: 'en-IN', name: 'English', nativeName: 'English (India)' },
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
      { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া' },
      { code: 'ur-IN', name: 'Urdu', nativeName: 'اردو' },
      { code: 'en-US', name: 'English (US)', nativeName: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
    ];
  }

  /**
   * Get current status.
   */
  getStatus(): { isRecording: boolean; isSupported: boolean; method: 'selfhosted' | 'none' | 'webspeech' | 'googleapi'; hasApiKey: boolean } {
    return {
      isRecording: this.isRecording,
      isSupported: this.isSupported(),
      method: this.isSupported() ? 'selfhosted' : 'none',
      hasApiKey: true,
    };
  }

  /**
   * Cleanup resources.
   */
  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) this.mediaRecorder.stop();
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Internal error handling helper.
   */
  /** Create a browser SpeechRecognition fallback */
  private createBrowserSTT(languageCode: string): () => void {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      this.handleError(new Error('SpeechRecognition not supported'));
      return () => {};
    }
    const rec = new SR();
    rec.lang = languageCode;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const r = e.results[0]?.[0];
      const result: SpeechToTextResult = {
        transcript: r?.transcript ?? '',
        confidence: r?.confidence ?? 0,
        language: languageCode,
        isFinal: true,
        alternatives: []
      };
      this.onTranscriptCallback?.(result);
    };
    rec.onerror = (e: any) => this.handleError(new Error(e.error ?? 'SpeechRecognition error'));
    rec.start();
    return () => rec.stop();
  }

  private handleError(err: Error): void {
    console.error('❌ Speech-to-Text error:', err);
    if (this.onErrorCallback) this.onErrorCallback(err);
  }
}

// Export singleton instance
export const speechToTextService = new SpeechToTextService();