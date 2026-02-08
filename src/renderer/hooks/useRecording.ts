import { useState, useRef, useCallback, useEffect } from 'react';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  error: string | null;
}

interface UseRecordingReturn extends RecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

const SAMPLE_RATE = 16000; // 16kHz as per spec
const CHUNK_INTERVAL = 250; // Send chunks every 250ms

export const useRecording = (): UseRecordingReturn => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    error: null,
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Listen for hotkey events from main process
  useEffect(() => {
    if (window.electron) {
      window.electron.receive('recording:started', () => {
        startRecording();
      });

      window.electron.receive('recording:stopped', () => {
        stopRecording();
      });
    }
  }, []);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  /**
   * Start recording from microphone
   * Uses Web Audio API to capture PCM 16-bit, 16kHz, mono
   */
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isRecording: true, duration: 0 }));
      startTimeRef.current = Date.now();

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      // Create source from microphone stream
      const source = audioContext.createMediaStreamSource(stream);

      // Use ScriptProcessorNode to capture raw PCM data
      // Buffer size of 4096 at 16kHz = ~256ms chunks
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        const inputData = event.inputBuffer.getChannelData(0);

        // Convert Float32 samples to Int16 PCM
        const pcmData = float32ToInt16(inputData);

        // Send PCM chunk to main process via IPC
        if (window.electron) {
          window.electron.send('audio:chunk', pcmData.buffer);
        }
      };

      // Connect: microphone → processor → destination (required for processing)
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Notify main process
      if (window.electron) {
        window.electron.invoke('audio:start');
      }

      // Update duration counter
      durationIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 100);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      console.error('Recording error:', errorMessage);
      setState(prev => ({ ...prev, error: errorMessage, isRecording: false }));
      cleanup();
    }
  }, [cleanup]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    // Notify main process
    if (window.electron) {
      window.electron.invoke('audio:stop');
    }

    cleanup();
    setState(prev => ({ ...prev, isRecording: false }));
  }, [cleanup]);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
};

/**
 * Convert Float32 audio samples to Int16 PCM
 * Float32 range: -1.0 to 1.0
 * Int16 range: -32768 to 32767
 */
const float32ToInt16 = (float32Array: Float32Array): Int16Array => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp values to [-1, 1] range
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to Int16
    int16Array[i] = sample < 0
      ? sample * 0x8000
      : sample * 0x7FFF;
  }
  return int16Array;
};
