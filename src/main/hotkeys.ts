import { app, globalShortcut, BrowserWindow } from 'electron';
import { EventEmitter } from 'events';

// Event emitter for hotkey events
export const hotkeyEmitter = new EventEmitter();

// Default hotkeys based on platform
const getDefaultHotkey = (): string => {
  // Right Command on macOS, Right Control on Windows/Linux
  return process.platform === 'darwin' ? 'CommandOrControl+Shift+Space' : 'Control+Shift+Space';
};

let currentHotkey: string = getDefaultHotkey();
let isRecording = false;

/**
 * Register the global hotkey for voice recording
 */
export const registerHotkeys = (mainWindow: BrowserWindow | null): void => {
  // Unregister existing hotkey if any
  if (globalShortcut.isRegistered(currentHotkey)) {
    globalShortcut.unregister(currentHotkey);
  }

  // Register the recording hotkey
  const registered = globalShortcut.register(currentHotkey, () => {
    handleRecordingHotkey(mainWindow);
  });

  if (registered) {
    console.log(`✓ Global hotkey registered: ${currentHotkey}`);
  } else {
    console.error(`✗ Failed to register global hotkey: ${currentHotkey}`);
  }
};

/**
 * Handle the recording hotkey press
 */
const handleRecordingHotkey = (mainWindow: BrowserWindow | null): void => {
  if (isRecording) {
    // Stop recording
    isRecording = false;
    console.log('🛑 Recording stopped (hotkey)');
    hotkeyEmitter.emit('recording:stop');

    // Notify renderer process
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:stopped');
    }
  } else {
    // Start recording
    isRecording = true;
    console.log('🎤 Recording started (hotkey)');
    hotkeyEmitter.emit('recording:start');

    // Notify renderer process
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('recording:started');
    }
  }
};

/**
 * Update the hotkey (for user customization)
 */
export const updateHotkey = (newHotkey: string, mainWindow: BrowserWindow | null): boolean => {
  // Unregister current hotkey
  if (globalShortcut.isRegistered(currentHotkey)) {
    globalShortcut.unregister(currentHotkey);
  }

  // Try to register new hotkey
  const registered = globalShortcut.register(newHotkey, () => {
    handleRecordingHotkey(mainWindow);
  });

  if (registered) {
    currentHotkey = newHotkey;
    console.log(`✓ Hotkey updated to: ${newHotkey}`);
    return true;
  } else {
    // Re-register the old hotkey if new one failed
    registerHotkeys(mainWindow);
    console.error(`✗ Failed to register new hotkey: ${newHotkey}`);
    return false;
  }
};

/**
 * Get the current hotkey
 */
export const getCurrentHotkey = (): string => {
  return currentHotkey;
};

/**
 * Get recording state
 */
export const getIsRecording = (): boolean => {
  return isRecording;
};

/**
 * Unregister all hotkeys (call on app quit)
 */
export const unregisterAllHotkeys = (): void => {
  globalShortcut.unregisterAll();
  console.log('✓ All global hotkeys unregistered');
};

// Unregister hotkeys when app quits
app.on('will-quit', () => {
  unregisterAllHotkeys();
});
