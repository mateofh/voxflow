import { STTProvider, STTProviderType, STTResult, DEFAULT_STT_CONFIG } from './types';
import { DeepgramProvider } from './deepgram';
import { EventEmitter } from 'events';

export const sttEmitter = new EventEmitter();

let currentProvider: STTProvider | null = null;
let currentProviderType: STTProviderType = DEFAULT_STT_CONFIG.provider;
let storedApiKey: string | null = null;

/**
 * Initialize the STT system (stores the key for later use)
 */
export const initSTT = async (apiKey: string, providerType?: STTProviderType): Promise<void> => {
  storedApiKey = apiKey;
  currentProviderType = providerType || DEFAULT_STT_CONFIG.provider;

  // Test connection to validate the key
  await connectSTT();
  // Close the test connection immediately
  await disconnectSTT();

  console.log(`✓ STT initialized with ${currentProviderType}`);
};

/**
 * Open a fresh STT streaming connection (call at start of each recording)
 */
export const connectSTT = async (): Promise<void> => {
  if (!storedApiKey) {
    console.warn('STT: No API key stored. Call initSTT first.');
    return;
  }

  // Disconnect existing provider
  if (currentProvider?.isConnected()) {
    await currentProvider.disconnect();
  }

  switch (currentProviderType) {
    case 'deepgram':
      currentProvider = new DeepgramProvider();
      break;
    case 'whisper':
      console.warn('Whisper provider not yet implemented, falling back to Deepgram');
      currentProvider = new DeepgramProvider();
      break;
    default:
      throw new Error(`Unknown STT provider: ${currentProviderType}`);
  }

  // Set up event forwarding
  currentProvider.onResult((result: STTResult) => {
    sttEmitter.emit('result', result);
    if (result.isFinal) {
      sttEmitter.emit('final', result);
    } else {
      sttEmitter.emit('partial', result);
    }
  });

  currentProvider.onError((error: Error) => {
    sttEmitter.emit('error', error);
  });

  await currentProvider.connect(storedApiKey);
};

/**
 * Send audio data to the STT provider for transcription (real-time chunks)
 */
export const sendAudioToSTT = (audioBuffer: Buffer): void => {
  if (!currentProvider?.isConnected()) {
    return;
  }
  currentProvider.sendAudio(audioBuffer);
};

/**
 * Disconnect the STT provider
 */
export const disconnectSTT = async (): Promise<void> => {
  if (currentProvider?.isConnected()) {
    await currentProvider.disconnect();
  }
};

/**
 * Check if STT has a stored API key (is configured)
 */
export const isSTTConfigured = (): boolean => {
  return storedApiKey !== null;
};

/**
 * Get current STT provider info
 */
export const getSTTInfo = () => ({
  provider: currentProviderType,
  connected: currentProvider?.isConnected() || false,
  name: currentProvider?.name || 'none',
  configured: storedApiKey !== null,
});

export type { STTResult, STTProviderType } from './types';
