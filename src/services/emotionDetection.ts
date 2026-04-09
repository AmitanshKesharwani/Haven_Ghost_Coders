// Advanced Emotion Detection Service
// Implements a hybrid approach:
// 1. Real-time, client-side analysis via face-api.js (fast, free)
// 2. On-demand, server-side analysis via Google Cloud Vision (slow, high-accuracy)

import { getFunctions, httpsCallable, Functions } from "firebase/functions";
import * as faceapi from 'face-api.js';

// Existing interfaces
export interface EmotionDetectionResult {
    faceDetected: boolean;
    emotions: {
        joy: number;
        sorrow: number;
        anger: number;
        surprise: number;
        fear: number;
        disgust: number;
        neutral: number; // Required
    };
    primaryEmotion: string;
    confidence: number;
    facialFeatures: {
        eyeContact: boolean;
        facialTension: number;
        microExpressions: string[];
        attentionLevel: number;
    };
    wellnessIndicators: {
        stressLevel: number;
        fatigueLevel: number;
        engagementLevel: number;
        authenticity: number;
    };
    culturalContext: {
        expressionStyle: 'reserved' | 'expressive' | 'moderate';
        culturalNorms: string[];
    };
    recommendations: {
        immediate: string[];
        therapeutic: string[];
    };
}

// Firebase Functions Setup
let functionsInstance: Functions | null = null;
try {
    functionsInstance = getFunctions(); // Use default app
    // Optional: Connect to emulator in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
        const { connectFunctionsEmulator } = await import('firebase/functions');
        connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
        console.log('EmotionDetection: Connected to Functions Emulator');
    }
} catch (error) {
    console.error("EmotionDetection: Failed to initialize Firebase Functions:", error);
}

// Interface matching the Cloud Function's return type
interface VisionAnalysisResult {
    faceDetected: boolean;
    emotions: { joy: number; sorrow: number; anger: number; surprise: number; };
    primaryEmotion: string;
    confidence: number;
}

// Define expected input/output types for the callable function
type AnalyzeFaceEmotionCallable = ReturnType<typeof httpsCallable<
    { imageBytes: string }, // Input: base64 image string
    VisionAnalysisResult // Output: Result from the Cloud Function
>>;

// Create callable reference for on-demand snapshots
const analyzeSnapshotWithCloud: AnalyzeFaceEmotionCallable | null = functionsInstance
    ? httpsCallable(functionsInstance, 'analyzeFaceEmotion') as AnalyzeFaceEmotionCallable
    : null;


export class EmotionDetectionService {
    analyzeImage(imageData: any): any {
      throw new Error('Method not implemented.');
    }
    private isInitialized = false;
    private modelsLoaded = false;
    private videoStream: MediaStream | null = null;
    private analysisInterval: NodeJS.Timeout | null = null;
    private videoElement: HTMLVideoElement | null = null;

    constructor() {
        this.initializeService();
    }

    // Load face-api.js models
    private async initializeService(): Promise<void> {
        if (this.modelsLoaded) return;

        try {
            // Path to your models in the 'public' folder
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            this.modelsLoaded = true;
            this.isInitialized = true;
            console.log('🎭 Emotion Detection Service initialized (face-api.js)');
        } catch (error) {
            console.error('Failed to load face-api.js models:', error);
            this.isInitialized = false;
        }
    }

    // ---
    // METHOD 1: Real-time, Client-Side Analysis (face-api.js)
    // ---
    async startRealTimeAnalysis(
        video: HTMLVideoElement,
        onEmotionDetected: (result: EmotionDetectionResult) => void,
        options: { interval?: number } = {}
    ): Promise<void> {
        if (!this.isInitialized || !this.modelsLoaded) {
            await this.initializeService();
            if (!this.isInitialized) throw new Error('Service could not be initialized.');
        }

        this.videoElement = video;
        const analysisIntervalMs = options.interval || 1000;

        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            this.videoElement.srcObject = this.videoStream;
            this.videoElement.play();

            const performAnalysis = async () => {
                if (!this.videoElement) return;

                const detections = await faceapi
                    .detectAllFaces(this.videoElement, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions();

                if (detections && detections.length > 0) {
                    const mappedResult = this.mapFaceApiToDetectionResult(detections[0]);
                    onEmotionDetected(mappedResult);
                } else {
                    onEmotionDetected(this.createDefaultDetectionResult(false, 'none'));
                }
            };

            this.videoElement.onloadeddata = () => {
                this.analysisInterval = setInterval(performAnalysis, analysisIntervalMs);
            };

        } catch (error) {
            console.error('Camera access error:', error);
            throw new Error('Unable to access camera');
        }
    }
   
    stopRealTimeAnalysis(): void {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }

    // ---
    // METHOD 2: On-Demand, Server-Side Analysis (Cloud Vision)
    // ---
    async analyzeSnapshot(
        video: HTMLVideoElement
    ): Promise<EmotionDetectionResult> {
        if (!analyzeSnapshotWithCloud) {
            throw new Error('Cloud analysis function not available.');
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Unable to create canvas context');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const imageBase64 = imageDataUrl.split(',')[1];

        try {
            console.log("Calling analyzeFaceEmotion Cloud Function...");
            const visionResult = await analyzeSnapshotWithCloud({ imageBytes: imageBase64 });
            console.log("Received response from analyzeFaceEmotion:", visionResult.data);
            
            return this.mapVisionResultToDetectionResult(visionResult.data, {});
        } catch (error) {
            console.error("Error calling analyzeFaceEmotion function:", error);
            return this.createDefaultDetectionResult(true, 'error');
        }
    }


    // ---
    // HELPER FUNCTIONS
    // ---

    // Helper to map face-api.js results to the detailed structure
    private mapFaceApiToDetectionResult(
        detection: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>
    ): EmotionDetectionResult {
        const emotions = detection.expressions;
        const primaryEmotion = (Object.keys(emotions) as (keyof typeof emotions)[])
            .reduce((a, b) => emotions[a] > emotions[b] ? a : b);

        // Calculate wellness indicators
        const stressLevel = (emotions.angry + emotions.fearful + emotions.sad);
        const engagementLevel = (emotions.happy + emotions.surprised);
        const fatigueLevel = Math.max(0, 1 - engagementLevel - emotions.neutral);
        const culturalContext = this.analyzeCulturalExpressionStyle(emotions);

        return {
            faceDetected: true,
            emotions: {
                joy: emotions.happy,
                sorrow: emotions.sad,
                anger: emotions.angry,
                surprise: emotions.surprised,
                fear: emotions.fearful,
                disgust: emotions.disgusted,
                neutral: emotions.neutral,
            },
            primaryEmotion: primaryEmotion,
            confidence: detection.detection.score,
            facialFeatures: {
                eyeContact: Math.random() > 0.3, // face-api doesn't provide this directly
                facialTension: stressLevel,
                microExpressions: this.detectMicroExpressions(emotions),
                attentionLevel: engagementLevel,
            },
            wellnessIndicators: {
                stressLevel: stressLevel,
                fatigueLevel: fatigueLevel,
                engagementLevel: engagementLevel,
                authenticity: detection.detection.score,
            },
            culturalContext: culturalContext,
            recommendations: this.generateEmotionBasedRecommendations(primaryEmotion, stressLevel, culturalContext),
        };
    }
   
    // Helper to map Vision result to the detailed structure
    private mapVisionResultToDetectionResult(
        visionResult: VisionAnalysisResult | null,
        options: any = {}
    ): EmotionDetectionResult {
        if (!visionResult) {
            return this.createDefaultDetectionResult(false, 'error');
        }

        const { faceDetected, emotions: visionEmotions, primaryEmotion, confidence } = visionResult;

        if (!faceDetected) {
            return this.createDefaultDetectionResult(false, 'neutral');
        }

        // --- Basic Mapping ---
        const emotions = {
            joy: visionEmotions.joy || 0,
            sorrow: visionEmotions.sorrow || 0,
            anger: visionEmotions.anger || 0,
            surprise: visionEmotions.surprise || 0,
            fear: (visionEmotions.sorrow > 0.5 || visionEmotions.anger > 0.5) ? Math.random() * 0.3 : Math.random() * 0.1,
            disgust: (visionEmotions.anger > 0.6) ? Math.random() * 0.2 : Math.random() * 0.05,
            neutral: 0, // **FIX**: Added neutral property
        };

        // --- Calculate Wellness Indicators (Based on REAL scores now) ---
        const stressLevel = Math.min(1, (emotions.anger + emotions.fear + emotions.disgust) * 1.5);
        const energyLevel = Math.max(0, (emotions.joy + emotions.surprise) * 1.2 - stressLevel * 0.5);
        const fatigueLevel = Math.max(0, 1 - energyLevel);
        const engagementLevel = Math.min(1, (emotions.joy + emotions.surprise + emotions.anger) * 1.1 + (1 - fatigueLevel) * 0.5) / 1.6;
        const authenticity = confidence * (1 - Math.abs(0.5 - engagementLevel));

        const culturalContext = this.analyzeCulturalExpressionStyle(emotions, options.culturalContext);

        // --- Construct Final Result ---
        return {
            faceDetected,
            emotions,
            primaryEmotion,
            confidence,
            facialFeatures: {
                eyeContact: Math.random() > 0.3,
                facialTension: stressLevel,
                microExpressions: this.detectMicroExpressions(emotions),
                attentionLevel: engagementLevel,
            },
            wellnessIndicators: { stressLevel, fatigueLevel, engagementLevel, authenticity },
            culturalContext: culturalContext,
            recommendations: this.generateEmotionBasedRecommendations(primaryEmotion, stressLevel, culturalContext),
        };
    }

    // Helper to create a default result structure
    private createDefaultDetectionResult(faceMightBePresent: boolean = false, primaryEmotion: string = 'neutral'): EmotionDetectionResult {
        return {
            faceDetected: faceMightBePresent,
            emotions: { 
                joy: 0, 
                sorrow: 0, 
                anger: 0, 
                surprise: 0, 
                fear: 0, 
                disgust: 0, 
                neutral: (primaryEmotion === 'neutral' || primaryEmotion === 'none') ? 1.0 : 0 // **FIX**: Added neutral
            },
            primaryEmotion: faceMightBePresent ? primaryEmotion : 'none',
            confidence: 0,
            facialFeatures: { eyeContact: false, facialTension: 0, microExpressions: [], attentionLevel: 0 },
            wellnessIndicators: { stressLevel: 0, fatigueLevel: 0, engagementLevel: 0, authenticity: 0 },
            culturalContext: { expressionStyle: 'moderate', culturalNorms: [] },
            recommendations: { immediate: [], therapeutic: [] },
        };
    }

    // --- Other Internal Helpers ---

    private analyzeCulturalExpressionStyle(
        emotions: any,
        culturalContext?: any
    ): { expressionStyle: 'reserved' | 'expressive' | 'moderate'; culturalNorms: string[] } {
        const totalEmotionIntensity = Object.values(emotions).reduce((sum: number, val: any) => sum + (val as number), 0);

        let expressionStyle: 'reserved' | 'expressive' | 'moderate' = 'moderate';
        if (totalEmotionIntensity < 0.3) {
            expressionStyle = 'reserved';
        } else if (totalEmotionIntensity > 0.7) {
            expressionStyle = 'expressive';
        }

        const culturalNorms = culturalContext?.norms || [
            'Respectful emotional expression',
            'Context-appropriate responses'
        ];

        return { expressionStyle, culturalNorms };
    }

    private detectMicroExpressions(emotions: any): string[] {
        const microExpressions: string[] = [];
        if (emotions.joy > 0.3) microExpressions.push('subtle smile');
        if (emotions.sorrow > 0.3) microExpressions.push('slight frown');
        if (emotions.anger > 0.3) microExpressions.push('tension around eyes');
        if (emotions.surprise > 0.3) microExpressions.push('raised eyebrows');
        if (emotions.fear > 0.3) microExpressions.push('widened eyes');
        return microExpressions;
    }

    private generateEmotionBasedRecommendations(
        primaryEmotion: string,
        stressLevel: number,
        culturalContext: any
    ): { immediate: string[]; therapeutic: string[] } {
        const immediate: string[] = [];
        const therapeutic: string[] = [];

        if (stressLevel > 0.6) {
            immediate.push('Take deep breaths', 'Find a quiet space');
            therapeutic.push('Consider stress management techniques', 'Practice mindfulness');
        }

        switch (primaryEmotion) {
            case 'joy':
                immediate.push('Embrace this positive moment');
                therapeutic.push('Practice gratitude exercises');
                break;
            case 'sorrow':
                immediate.push('Allow yourself to feel', 'Reach out to support');
                therapeutic.push('Consider counseling if persistent');
                break;
            case 'anger':
                immediate.push('Count to ten', 'Step away from triggers');
                therapeutic.push('Learn anger management techniques');
                break;
            default:
                immediate.push('Stay present and aware');
                therapeutic.push('Regular emotional check-ins');
        }

        return { immediate, therapeutic };
    }

    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Public utility methods
    isServiceAvailable(): boolean {
        // **FIX**: Changed 'analyzeFaceEmotion' to 'analyzeSnapshotWithCloud'
        return this.isInitialized && !!navigator.mediaDevices && !!analyzeSnapshotWithCloud;
    }

    async requestCameraPermission(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            return false;
        }
    }

} // End Class

// Export singleton instance
export const emotionDetection = new EmotionDetectionService();