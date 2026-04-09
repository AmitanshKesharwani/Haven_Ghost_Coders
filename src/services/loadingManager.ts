// Loading Manager for AI Response Optimization
export interface LoadingState {
  stage: 'analyzing' | 'generating' | 'processing' | 'complete';
  progress: number;
  message: string;
}

class LoadingManager {
  private activeLoading = new Map<string, LoadingState>();
  private callbacks = new Map<string, (state: LoadingState) => void>();

  startLoading(userId: string, callback?: (state: LoadingState) => void) {
    if (callback) {
      this.callbacks.set(userId, callback);
    }

    this.updateState(userId, {
      stage: 'analyzing',
      progress: 10,
      message: 'Understanding your message...'
    });

    // Simulate progress for better UX
    setTimeout(() => {
      this.updateState(userId, {
        stage: 'generating',
        progress: 40,
        message: 'Generating response...'
      });
    }, 200);

    setTimeout(() => {
      this.updateState(userId, {
        stage: 'processing',
        progress: 70,
        message: 'Finalizing response...'
      });
    }, 800);
  }

  updateState(userId: string, state: LoadingState) {
    this.activeLoading.set(userId, state);
    const callback = this.callbacks.get(userId);
    if (callback) {
      callback(state);
    }
  }

  completeLoading(userId: string) {
    this.updateState(userId, {
      stage: 'complete',
      progress: 100,
      message: 'Response ready!'
    });

    // Clean up after a short delay
    setTimeout(() => {
      this.activeLoading.delete(userId);
      this.callbacks.delete(userId);
    }, 500);
  }

  getState(userId: string): LoadingState | null {
    return this.activeLoading.get(userId) || null;
  }
}

export const loadingManager = new LoadingManager();