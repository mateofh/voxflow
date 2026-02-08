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

  const isStartingRef = useRef(false);

  /**
   * Open mic and start capturing PCM audio chunks
   */
  const startMicCapture = useCallback(async () => {
    // Prevent concurrent mic open attempts
    if (mediaStreamRef.current || audioContextRef.current || isStartingRef.current) return;
    isStartingRef.current = true;

    try {
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

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const pcmData = float32ToInt16(inputData);
        if (window.electron) {
          window.electron.send('audio:chunk', pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      console.error('Mic capture error:', errorMessage);
      setState(prev => ({ ...prev, error: errorMessage, isRecording: false }));
      cleanup();
    } finally {
      isStartingRef.current = false;
    }
  }, [cleanup]);

  // Listen for hotkey events from main process
  useEffect(() => {
    if (!window.electron) return;

    // Clean up any previous listeners first
    window.electron.removeAllListeners('recording:started');
    window.electron.removeAllListeners('recording:stopped');

    window.electron.receive('recording:started', () => {
      setState({ isRecording: true, duration: 0, error: null });
      startTimeRef.current = Date.now();
      startMicCapture();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 100);
    });

    window.electron.receive('recording:stopped', () => {
      cleanup();
      setState(prev => ({ ...prev, isRecording: false }));
    });

    return () => {
      cleanup();
      if (window.electron) {
        window.electron.removeAllListeners('recording:started');
        window.electron.removeAllListeners('recording:stopped');
      }
    };
  }, [startMicCapture, cleanup]);

  /**
   * Start recording (called from UI buttons, not from IPC)
   */
  const startRecording = useCallback(async () => {
    if (mediaStreamRef.current || audioContextRef.current) return;

    setState({ isRecording: true, duration: 0, error: null });
    startTimeRef.current = Date.now();

    if (window.electron) {
      window.electron.invoke('audio:start');
    }

    await startMicCapture();

    durationIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setState(prev => ({ ...prev, duration: elapsed }));
    }, 100);
  }, [startMicCapture]);

  /**
   * Stop recording (called from UI buttons, not from IPC)
   */
  const stopRecording = useCallback(() => {
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
 */
const float32ToInt16 = (float32Array: Float32Array): Int16Array => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = sample < 0
      ? sample * 0x8000
      : sample * 0x7FFF;
  }
  return int16Array;
};
