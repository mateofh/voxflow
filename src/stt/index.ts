import { STTProvider, STTProviderType, STTResult, DEFAULT_STT_CONFIG } from './types';
import { DeepgramProvider } from './deepgram';
import { EventEmitter } from 'events';

export const sttEmitter = new EventEmitter();

let currentProvider: STTProvider | null = null;
let currentProviderType: STTProviderType = DEFAULT_STT_CONFIG.provider;

/**
 * Initialize the STT system with the specified provider
 */
export const initSTT = async (apiKey: string, providerType?: STTProviderType): Promise<void> => {
  // Disconnect existing provider
  if (currentProvider?.isConnected()) {
    await currentProvider.disconnect();
  }

  currentProviderType = providerType || DEFAULT_STT_CONFIG.provider;

  switch (currentProviderType) {
    case 'deepgram':
      currentProvider = new DeepgramProvider();
      break;
    case 'whisper':
      // TODO: Implement whisper.cpp local provider
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

  await currentProvider.connect(apiKey);
  console.log(`✓ STT initialized with ${currentProviderType}`);
};

/**
 * Send audio data to the STT provider for transcription
 */
export const sendAudioToSTT = (audioBuffer: Buffer): void => {
  if (!currentProvider?.isConnected()) {
    console.warn('STT provider not connected');
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
    console.log('✓ STT disconnected');
  }
};

/**
 * Get current STT provider info
 */
export const getSTTInfo = () => ({
  provider: currentProviderType,
  connected: currentProvider?.isConnected() || false,
  name: currentProvider?.name || 'none',
});

export type { STTResult, STTProviderType } from './types';
