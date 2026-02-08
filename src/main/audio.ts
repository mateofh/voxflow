import { BrowserWindow, ipcMain } from 'electron';
import { EventEmitter } from 'events';

// Audio event emitter for inter-module communication
export const audioEmitter = new EventEmitter();

// Audio configuration
const AUDIO_CONFIG = {
  sampleRate: 16000,    // 16kHz as per spec
  channels: 1,          // Mono
  bitDepth: 16,         // 16-bit PCM
  maxDuration: 5 * 60,  // 5 minutes max recording (safety timeout)
};

// Recording state
let isRecording = false;
let audioChunks: Buffer[] = [];
let recordingTimeout: NodeJS.Timeout | null = null;

/**
 * Initialize audio IPC handlers
 * The renderer process captures audio via Web Audio API
 * and sends PCM chunks to the main process via IPC
 */
export const initAudioHandlers = (mainWindow: BrowserWindow | null): void => {
  // Receive audio chunks from renderer
  ipcMain.on('audio:chunk', (_event, chunk: ArrayBuffer) => {
    if (isRecording) {
      audioChunks.push(Buffer.from(chunk));
    }
  });

  // Handle recording start request
  ipcMain.handle('audio:start', async () => {
    return startRecording();
  });

  // Handle recording stop request
  ipcMain.handle('audio:stop', async () => {
    return stopRecording();
  });

  console.log('✓ Audio IPC handlers initialized');
};

/**
 * Start recording audio
 */
export const startRecording = (): boolean => {
  if (isRecording) {
    console.warn('Already recording');
    return false;
  }

  isRecording = true;
  audioChunks = [];

  // Safety timeout: stop recording after max duration
  recordingTimeout = setTimeout(() => {
    console.warn(`⚠️ Recording timeout (${AUDIO_CONFIG.maxDuration}s)`);
    stopRecording();
  }, AUDIO_CONFIG.maxDuration * 1000);

  console.log('🎤 Audio recording started');
  audioEmitter.emit('recording:started');
  return true;
};

/**
 * Stop recording and return the complete audio buffer
 */
export const stopRecording = (): { buffer: Buffer; duration: number } | null => {
  if (!isRecording) {
    console.warn('Not recording');
    return null;
  }

  isRecording = false;

  // Clear safety timeout
  if (recordingTimeout) {
    clearTimeout(recordingTimeout);
    recordingTimeout = null;
  }

  // Combine all chunks into a single buffer
  const completeBuffer = Buffer.concat(audioChunks);
  const duration = calculateDuration(completeBuffer.length);

  console.log(`🛑 Audio recording stopped. Duration: ${duration.toFixed(1)}s, Size: ${(completeBuffer.length / 1024).toFixed(1)}KB`);

  // Clean up chunks
  audioChunks = [];

  audioEmitter.emit('recording:stopped', { buffer: completeBuffer, duration });

  return { buffer: completeBuffer, duration };
};

/**
 * Calculate audio duration from buffer size
 */
const calculateDuration = (bufferSize: number): number => {
  const bytesPerSample = AUDIO_CONFIG.bitDepth / 8;
  const bytesPerSecond = AUDIO_CONFIG.sampleRate * AUDIO_CONFIG.channels * bytesPerSample;
  return bufferSize / bytesPerSecond;
};

/**
 * Get current recording state
 */
export const getIsRecording = (): boolean => isRecording;

/**
 * Get audio configuration
 */
export const getAudioConfig = () => ({ ...AUDIO_CONFIG });
