// Speech-to-Text Service using Google Cloud Speech-to-Text with Chirp 3 Model
// Provides real-time speech recognition with multilingual support

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
  'english': 'en-IN',
  'hindi': 'hi-IN',
  'bengali': 'bn-IN',
  'marathi': 'mr-IN',
  'tamil': 'ta-IN',
  'telugu': 'te-IN',
  'gujarati': 'gu-IN',
  'kannada': 'kn-IN',
  'malayalam': 'ml-IN',
  'punjabi': 'pa-IN',
  'odia': 'or-IN',
  'assamese': 'as-IN',
  'urdu': 'ur-IN',
  'english-us': 'en-US',
  'english-gb': 'en-GB'
} as const;

class SpeechToTextService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onTranscriptCallback: ((result: SpeechToTextResult) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private recognition: any = null;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_CHIRP3_API_KEY || import.meta.env.VITE_GOOGLE_CLOUD_SPEECH_API_KEY || '';
    
    // Initialize Web Speech API as fallback
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupWebSpeechAPI();
    }
  }

  /**
   * Setup Web Speech API with enhanced configuration
   */
  private setupWebSpeechAPI(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let confidence = 0;
      let alternatives: any[] = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        confidence = result[0].confidence || 0.9;

        // Collect alternatives
        alternatives = Array.from(result).map((alt: any) => ({
          transcript: alt.transcript,
          confidence: alt.confidence || 0.8
        }));

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && this.onTranscriptCallback) {
        this.onTranscriptCallback({
          transcript: finalTranscript.trim(),
          confidence,
          language: this.recognition.lang || 'en-IN',
          isFinal: true,
          alternatives
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('🚨 Speech recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(`Speech recognition failed: ${event.error}`));
      }
    };

    this.recognition.onend = () => {
      console.log('🔚 Speech recognition ended');
      this.isRecording = false;
    };
  }

  /**
   * Start recording audio for speech-to-text conversion
   */
  async startRecording(options: SpeechToTextOptions = {}): Promise<void> {
    try {
      this.isRecording = true;
      
      // Prioritize Web Speech API for real-time recognition (more reliable)
      if (this.recognition && this.isWebSpeechAPIAvailable()) {
        console.log('🎤 Using Web Speech API for real-time recognition');
        await this.startWebSpeechRecognition(options);
      } else if (this.apiKey) {
        console.log('🎤 Using Google Cloud API with MediaRecorder');
        await this.startMediaRecorderRecognition(options);
      } else {
        throw new Error('No speech recognition method available. Please check your browser support and API configuration.');
      }

    } catch (error) {
      console.error('❌ Error starting recording:', error);
      this.isRecording = false;
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      throw error;
    }
  }

  /**
   * Check if Web Speech API is available and working
   */
  private isWebSpeechAPIAvailable(): boolean {
    return !!(this.recognition && 
             ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window));
  }

  /**
   * Start Web Speech API recognition
   */
  private async startWebSpeechRecognition(options: SpeechToTextOptions): Promise<void> {
    if (!this.recognition) {
      throw new Error('Web Speech API not supported');
    }

    // Set language
    const language = options.language || 'en-IN';
    this.recognition.lang = language;

    console.log(`🎤 Starting Web Speech Recognition with language: ${language}`);
    
    // Request microphone permission first
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.recognition.start();
  }

  /**
   * Start MediaRecorder with Google Cloud API
   */
  private async startMediaRecorderRecognition(options: SpeechToTextOptions): Promise<void> {
    // Request microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000, // Use 16kHz for better Google API compatibility
        channelCount: 1 // Mono audio
      }
    });

    // Try different MIME types for better compatibility
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser choose
        }
      }
    }

    console.log('🎵 Using MIME type:', mimeType || 'browser default');

    // Initialize MediaRecorder
    this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    this.audioChunks = [];

    // Handle data available
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
        console.log('📊 Audio chunk received:', event.data.size, 'bytes');
      }
    };

    // Handle recording stop
    this.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(this.audioChunks, { type: mimeType });
      stream.getTracks().forEach(track => track.stop());
      
      console.log('🎵 Final audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type);
      
      if (audioBlob.size > 0) {
        await this.processAudioWithGoogleAPI(audioBlob, options);
      } else {
        console.error('❌ No audio data recorded');
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('No audio data was recorded. Please check your microphone.'));
        }
      }
      
      this.isRecording = false;
    };

    // Handle errors
    this.mediaRecorder.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error('Recording failed. Please try again.'));
      }
    };

    // Start recording with time slicing for better data handling
    this.mediaRecorder.start(1000); // Collect data every second
    console.log('🎤 Started MediaRecorder with Chirp 3 model');
  }

  /**
   * Stop recording and process the audio
   */
  stopRecording(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      console.log('🛑 Stopped Web Speech Recognition');
    } else if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      console.log('🛑 Stopped MediaRecorder');
    }
    this.isRecording = false;
  }

  /**
   * Process audio blob with Google Cloud Speech-to-Text API
   */
  private async processAudioWithGoogleAPI(audioBlob: Blob, options: SpeechToTextOptions): Promise<void> {
    try {
      console.log('🔄 Processing audio with Google Chirp 3...');
      console.log('📊 Audio blob size:', audioBlob.size, 'bytes');
      
      if (!this.apiKey) {
        throw new Error('Google Cloud Speech API key not configured');
      }
      
      if (audioBlob.size === 0) {
        throw new Error('Audio blob is empty - no audio data recorded');
      }

      // Convert to WAV format for better compatibility
      const audioBuffer = await this.convertToWAV(audioBlob);
      const audioBase64 = await this.arrayBufferToBase64(audioBuffer);
      
      console.log('🎵 Audio converted to WAV, size:', audioBuffer.byteLength, 'bytes');
      
      // Prepare request for Google Cloud Speech-to-Text API
      const requestBody = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: options.language || 'en-IN',
          alternativeLanguageCodes: options.alternativeLanguages || ['hi-IN', 'mr-IN', 'bn-IN'],
          maxAlternatives: 3,
          enableAutomaticPunctuation: options.enableAutomaticPunctuation ?? true,
          enableWordTimeOffsets: options.enableWordTimeOffsets ?? false,
          model: 'chirp', // Use Chirp 3 model
          useEnhanced: options.useEnhanced ?? true
        },
        audio: {
          content: audioBase64
        }
      };

      console.log('📡 Calling Google Cloud Speech-to-Text with Chirp 3');
      console.log('🌍 Languages:', requestBody.config.languageCode, requestBody.config.alternativeLanguageCodes);
      console.log('🔧 Audio config:', {
        encoding: requestBody.config.encoding,
        sampleRate: requestBody.config.sampleRateHertz,
        audioSize: audioBuffer.byteLength
      });

      // Call Google Cloud Speech-to-Text API
      const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google API error response:', errorText);
        throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Google API response:', data);

      // Process results
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const alternative = result.alternatives[0];

        const transcriptionResult: SpeechToTextResult = {
          transcript: alternative.transcript || '',
          confidence: alternative.confidence || 0,
          language: requestBody.config.languageCode,
          isFinal: true,
          alternatives: result.alternatives.slice(1).map((alt: any) => ({
            transcript: alt.transcript,
            confidence: alt.confidence
          }))
        };

        // Call callback with result
        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(transcriptionResult);
        }
      } else {
        throw new Error('No transcription results received from Google API');
      }

    } catch (error) {
      console.error('❌ Error processing audio with Google API:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  /**
   * Convert blob to base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert WebM/Opus audio to WAV format for better Google API compatibility
   */
  private async convertToWAV(audioBlob: Blob): Promise<ArrayBuffer> {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // Google API prefers 16kHz
      });

      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get audio data (mono channel)
      const audioData = audioBuffer.getChannelData(0);
      
      // Convert to 16-bit PCM
      const pcmData = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        // Convert float32 (-1 to 1) to int16 (-32768 to 32767)
        pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(audioData[i] * 32768)));
      }

      // Create WAV header
      const wavHeader = this.createWAVHeader(pcmData.length * 2, 16000, 1, 16);
      
      // Combine header and data
      const wavBuffer = new ArrayBuffer(wavHeader.byteLength + pcmData.byteLength);
      const wavView = new Uint8Array(wavBuffer);
      
      wavView.set(new Uint8Array(wavHeader), 0);
      wavView.set(new Uint8Array(pcmData.buffer), wavHeader.byteLength);

      // Close audio context
      await audioContext.close();

      return wavBuffer;

    } catch (error) {
      console.error('❌ Error converting audio to WAV:', error);
      // Fallback: return original blob as array buffer
      return await audioBlob.arrayBuffer();
    }
  }

  /**
   * Create WAV file header
   */
  private createWAVHeader(dataLength: number, sampleRate: number, channels: number, bitsPerSample: number): ArrayBuffer {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataLength, true); // File size - 8
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, channels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true); // ByteRate
    view.setUint16(32, channels * bitsPerSample / 8, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true); // BitsPerSample

    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataLength, true); // Subchunk2Size

    return header;
  }

  /**
   * Set callback for transcription results
   */
  onTranscript(callback: (result: SpeechToTextResult) => void): void {
    this.onTranscriptCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get supported languages for Chirp 3 model (all 15 languages)
   */
  getSupportedLanguages(): Array<{code: string, name: string, nativeName: string}> {
    return [
      { code: 'en-IN', name: 'English (India)', nativeName: 'English' },
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
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
      { code: 'en-US', name: 'English (US)', nativeName: 'English' },
      { code: 'en-GB', name: 'English (UK)', nativeName: 'English' }
    ];
  }

  /**
   * Get language code by name
   */
  getLanguageCode(languageName: string): string {
    const normalizedName = languageName.toLowerCase().replace(/[^a-z]/g, '');
    return LANGUAGE_CODES[normalizedName as keyof typeof LANGUAGE_CODES] || 'en-IN';
  }

  /**
   * Auto-detect optimal language based on user preferences
   */
  getOptimalLanguageSettings(): SpeechToTextOptions {
    // Get browser language
    const browserLang = navigator.language || 'en-IN';
    
    // Default multilingual setup for Indian users
    const defaultOptions: SpeechToTextOptions = {
      language: 'en-IN',
      alternativeLanguages: ['hi-IN', 'mr-IN', 'bn-IN', 'ta-IN'],
      enableAutomaticPunctuation: true,
      model: 'chirp',
      useEnhanced: true
    };

    // Adjust based on browser language
    if (browserLang.startsWith('hi')) {
      defaultOptions.language = 'hi-IN';
      defaultOptions.alternativeLanguages = ['en-IN', 'mr-IN', 'bn-IN'];
    } else if (browserLang.startsWith('bn')) {
      defaultOptions.language = 'bn-IN';
      defaultOptions.alternativeLanguages = ['en-IN', 'hi-IN', 'as-IN'];
    } else if (browserLang.startsWith('ta')) {
      defaultOptions.language = 'ta-IN';
      defaultOptions.alternativeLanguages = ['en-IN', 'te-IN', 'ml-IN'];
    }

    return defaultOptions;
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return !!(
      (typeof navigator !== 'undefined' && 
       'mediaDevices' in navigator && 
       'getUserMedia' in navigator.mediaDevices) ||
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    );
  }

  /**
   * Get current recording status
   */
  getStatus(): {
    isRecording: boolean;
    isSupported: boolean;
    hasApiKey: boolean;
    method: 'webspeech' | 'googleapi' | 'none';
  } {
    return {
      isRecording: this.isRecording,
      isSupported: this.isSupported(),
      hasApiKey: !!this.apiKey,
      method: this.recognition ? 'webspeech' : (this.apiKey ? 'googleapi' : 'none')
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
  }
}

// Export singleton instance
export const speechToTextService = new SpeechToTextService();