// ═══════════════════════════════════════════════════════════
// VoxFlow — Speech-to-Text Types
// ═══════════════════════════════════════════════════════════

import { EventEmitter } from 'events';

export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  language?: string;
  duration?: number;         // audio duration in milliseconds
}

export interface STTProviderInterface extends EventEmitter {
  /** Initialize the provider (load model, connect to API, etc.) */
  initialize(): Promise<void>;

  /** Transcribe an audio buffer (batch mode) */
  transcribe(audioBuffer: Buffer): Promise<TranscriptionResult>;

  /** Start streaming transcription */
  startStreaming(): Promise<void>;

  /** Send audio chunk during streaming */
  sendAudioChunk(chunk: Buffer): void;

  /** Stop streaming and get final result */
  stopStreaming(): Promise<TranscriptionResult>;

  /** Check if the provider is available and configured */
  isAvailable(): Promise<boolean>;

  /** Clean up resources */
  dispose(): void;
}

// Events emitted by STT providers during streaming:
// - 'partial': TranscriptionResult (interim result)
// - 'final': TranscriptionResult (final result)
// - 'error': Error
// - 'ready': void (provider is ready to accept audio)

export interface DeepgramConfig {
  apiKey: string;
  language: string;
  model: string;              // 'nova-3' recommended
  smartFormat: boolean;
  punctuate: boolean;
  interimResults: boolean;
}

export interface WhisperConfig {
  modelPath: string;
  modelName: string;          // 'tiny', 'base', 'small', 'medium', 'large'
  language: string;
  useGpu: boolean;
  threads: number;
}
