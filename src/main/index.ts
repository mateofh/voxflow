import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createTray, updateTrayState } from './tray';
import { registerHotkeys, hotkeyEmitter, updateHotkey, getCurrentHotkey } from './hotkeys';
import { initAudioHandlers, startRecording, stopRecording } from './audio';
import { initSTT, connectSTT, sendAudioToSTT, disconnectSTT, sttEmitter } from '../stt';
import { insertTextViaClipboard } from './output';
import { playStartSound, playStopSound, playCompleteSound } from './sounds';
import { initLLM, enhanceText, setEnhancementEnabled } from '../llm';
import { registerIPCHandlers } from './ipc-handlers';
import { initAutoUpdater, downloadUpdate, installUpdate } from './updater';

// Gracefully handle broken pipe errors (EPIPE) when stdout/stderr closes
// This happens when running via concurrently and the parent process ends
process.stdout?.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EPIPE') return;
});
process.stderr?.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EPIPE') return;
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: process.env.NODE_ENV === 'development',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
};

app.whenReady().then(() => {
  createWindow();
  createTray(mainWindow);
  registerHotkeys(mainWindow);
  initAudioHandlers(mainWindow);
  registerIPCHandlers();

  // Auto-updater (production only)
  if (process.env.NODE_ENV !== 'development' && mainWindow) {
    initAutoUpdater(mainWindow);
  }

  // Update IPC handlers
  ipcMain.handle('update:check', async () => {
    const { autoUpdater } = await import('electron-updater');
    return autoUpdater.checkForUpdates();
  });

  ipcMain.handle('update:download', async () => {
    downloadUpdate();
  });

  ipcMain.handle('update:install', () => {
    installUpdate();
  });

  // Forward audio chunks to STT in real-time via audioEmitter
  const { audioEmitter } = require('./audio');
  audioEmitter.on('chunk', (chunk: Buffer) => {
    sendAudioToSTT(chunk);
  });

  // VAD event handlers
  ipcMain.on('vad:speech-start', async () => {
    console.log('🗣️ VAD: Speech detected');
    await connectSTT();
    startRecording();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:started');
    }
  });

  ipcMain.on('vad:speech-end', async (_event, audioBuffer: ArrayBuffer) => {
    console.log('🔇 VAD: Speech ended');
    stopRecording();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:stopped');
    }
    // Send final buffer and disconnect
    sendAudioToSTT(Buffer.from(audioBuffer));
    await disconnectSTT();
  });

  // STT result handlers
  sttEmitter.on('result', (result: any) => {
    console.log(`📝 STT result: "${result.text}" (final: ${result.isFinal})`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('transcription:result', result);
    }
  });

  sttEmitter.on('final', async (result: any) => {
    if (result.text) {
      try {
        const finalText = await enhanceText(result.text, {
          language: 'es',
        });
        await insertTextViaClipboard(finalText);
        playCompleteSound();
        updateTrayState('idle');
      } catch (error) {
        console.error('Text processing failed:', error);
        try {
          await insertTextViaClipboard(result.text);
          playCompleteSound();
        } catch (insertError) {
          console.error('Text insertion failed:', insertError);
        }
        updateTrayState('idle');
      }
    }
  });

  sttEmitter.on('error', (error: Error) => {
    console.error('STT error:', error.message);
  });

  // IPC handler for STT initialization
  ipcMain.handle('stt:init', async (_event, apiKey: string) => {
    try {
      await initSTT(apiKey);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // IPC handler for LLM initialization
  ipcMain.handle('llm:init', async (_event, apiKey: string) => {
    try {
      initLLM(apiKey);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // IPC handler for enhancement toggle
  ipcMain.handle('enhancement:toggle', async (_event, enabled: boolean) => {
    setEnhancementEnabled(enabled);
    return { success: true };
  });

  // IPC handler for hotkey update
  ipcMain.handle('hotkey:update', async (_event, newHotkey: string) => {
    const success = updateHotkey(newHotkey, mainWindow);
    return { success, currentHotkey: getCurrentHotkey() };
  });

  // IPC handler for getting current hotkey
  ipcMain.handle('hotkey:get', async () => {
    return { hotkey: getCurrentHotkey() };
  });

  // Hotkey: START recording
  hotkeyEmitter.on('recording:start', async () => {
    console.log('📝 Hotkey: Recording START');
    playStartSound();
    updateTrayState('recording');

    // 1. Open fresh Deepgram connection
    try {
      await connectSTT();
    } catch (err) {
      console.error('Failed to connect STT:', err);
    }

    // 2. Start audio buffer collection in main
    startRecording();

    // 3. Tell renderer to open mic and stream chunks
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:started');
    }
  });

  // Hotkey: STOP recording
  hotkeyEmitter.on('recording:stop', async () => {
    console.log('📝 Hotkey: Recording STOP');
    playStopSound();
    updateTrayState('processing');

    // 1. Tell renderer to stop mic capture
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:stopped');
    }

    // 2. Stop audio buffer in main
    const result = stopRecording();
    if (result) {
      console.log(`Audio captured: ${result.duration.toFixed(1)}s, ${(result.buffer.length / 1024).toFixed(1)}KB`);
    }

    // 3. Close Deepgram connection (triggers final results)
    await disconnectSTT();

    if (!result || result.buffer.length === 0) {
      console.warn('No audio data captured');
      updateTrayState('idle');
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
