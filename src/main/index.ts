import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createTray, updateTrayState } from './tray';
import { registerHotkeys, hotkeyEmitter } from './hotkeys';
import { initAudioHandlers, startRecording, stopRecording } from './audio';
import { initSTT, sendAudioToSTT, disconnectSTT, sttEmitter } from '../stt';
import { insertTextViaClipboard } from './output';
import { playStartSound, playStopSound, playCompleteSound } from './sounds';
import { initLLM, enhanceText, setEnhancementEnabled } from '../llm';
import { registerIPCHandlers } from './ipc-handlers';
import { initAutoUpdater, downloadUpdate, installUpdate } from './updater';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Hide window initially (tray-first approach)
    show: false,
  });

  // Load the index.html of the app.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
};

// This method will be called when Electron has finished initialization
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

  // VAD event handlers
  ipcMain.on('vad:speech-start', () => {
    console.log('🗣️ VAD: Speech detected');
    startRecording();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:started');
    }
  });

  ipcMain.on('vad:speech-end', (_event, audioBuffer: ArrayBuffer) => {
    console.log('🔇 VAD: Speech ended');
    stopRecording();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:stopped');
    }
    // Send audioBuffer to STT for transcription
    sendAudioToSTT(Buffer.from(audioBuffer));
  });

  // STT result handlers
  sttEmitter.on('result', (result: any) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('transcription:result', result);
    }
    if (result.isFinal) {
      updateTrayState('idle');
    }
  });

  sttEmitter.on('final', async (result: any) => {
    if (result.text) {
      try {
        // Enhance text with LLM if enabled
        const finalText = await enhanceText(result.text, {
          language: 'es',
        });
        await insertTextViaClipboard(finalText);
        playCompleteSound();
        updateTrayState('idle');
      } catch (error) {
        console.error('Text processing failed:', error);
        // Fallback: insert raw text if enhancement fails
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

  // IPC handler for STT initialization (called from Settings when user enters API key)
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

  // Set up hotkey event listeners
  hotkeyEmitter.on('recording:start', () => {
    console.log('📝 Recording started event received');
    playStartSound();
    updateTrayState('recording');
    startRecording();
  });

  hotkeyEmitter.on('recording:stop', () => {
    console.log('📝 Recording stopped event received');
    playStopSound();
    updateTrayState('processing');
    const result = stopRecording();
    if (result) {
      console.log(`Audio captured: ${result.duration.toFixed(1)}s`);
      // TODO: Send to STT (Week 2)
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle quit event
app.on('before-quit', () => {
  isQuitting = true;
});
