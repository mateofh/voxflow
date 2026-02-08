import { useState, useRef, useCallback, useEffect } from 'react';

interface VADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audio: Float32Array) => void;
}

interface UseVADReturn {
  isListening: boolean;
  isSpeaking: boolean;
  startVAD: () => Promise<void>;
  stopVAD: () => void;
  error: string | null;
}

export const useVAD = (options: VADOptions = {}): UseVADReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vadRef = useRef<any>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopVAD();
    };
  }, []);

  const startVAD = useCallback(async () => {
    try {
      setError(null);

      // Dynamic import to avoid SSR issues
      const { MicVAD } = await import('@ricky0123/vad-web');

      const vad = await MicVAD.new({
        // Called when speech is detected
        onSpeechStart: () => {
          setIsSpeaking(true);
          console.log('🗣️ Speech detected');

          if (window.electron) {
            window.electron.send('vad:speech-start', {});
          }

          options.onSpeechStart?.();
        },

        // Called when speech ends (silence detected)
        onSpeechEnd: (audio: Float32Array) => {
          setIsSpeaking(false);
          console.log(`🔇 Speech ended. Audio length: ${audio.length} samples`);

          // Convert Float32 to Int16 PCM for STT
          const pcmData = float32ToInt16(audio);

          if (window.electron) {
            window.electron.send('vad:speech-end', pcmData.buffer);
          }

          options.onSpeechEnd?.(audio);
        },

        // VAD configuration
        positiveSpeechThreshold: 0.8,  // Higher = less sensitive
        negativeSpeechThreshold: 0.3,  // Lower = needs more silence to stop
        minSpeechFrames: 3,            // Minimum frames to consider as speech
        redemptionFrames: 8,           // Frames of silence before stopping
      });

      vadRef.current = vad;
      vad.start();
      setIsListening(true);
      console.log('✓ VAD started listening');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize VAD';
      console.error('VAD error:', errorMessage);
      setError(errorMessage);
    }
  }, [options]);

  const stopVAD = useCallback(() => {
    if (vadRef.current) {
      vadRef.current.pause();
      vadRef.current.destroy();
      vadRef.current = null;
    }
    setIsListening(false);
    setIsSpeaking(false);
    console.log('✓ VAD stopped');
  }, []);

  return {
    isListening,
    isSpeaking,
    startVAD,
    stopVAD,
    error,
  };
};

/**
 * Convert Float32 audio samples to Int16 PCM
 */
const float32ToInt16 = (float32Array: Float32Array): Int16Array => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
  }
  return int16Array;
};
