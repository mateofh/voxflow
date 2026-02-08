export interface STTResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  duration: number;
}

export interface STTProvider {
  name: string;
  connect: (apiKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendAudio: (audioBuffer: Buffer) => void;
  onResult: (callback: (result: STTResult) => void) => void;
  onError: (callback: (error: Error) => void) => void;
  isConnected: () => boolean;
}

export type STTProviderType = 'deepgram' | 'whisper';

export interface STTConfig {
  provider: STTProviderType;
  language: string;
  model: string;
  sampleRate: number;
  channels: number;
  encoding: string;
}

export const DEFAULT_STT_CONFIG: STTConfig = {
  provider: 'deepgram',
  language: 'es',
  model: 'nova-3',
  sampleRate: 16000,
  channels: 1,
  encoding: 'linear16',
};
