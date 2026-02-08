import { app, globalShortcut, BrowserWindow } from 'electron';
import { EventEmitter } from 'events';

export const hotkeyEmitter = new EventEmitter();

const getDefaultHotkey = (): string => {
  return process.platform === 'darwin' ? 'CommandOrControl+Shift+Space' : 'Control+Shift+Space';
};

let currentHotkey: string = getDefaultHotkey();
let isRecording = false;

/**
 * Register the global hotkey for toggle recording.
 * Press once to start, press again to stop.
 */
export const registerHotkeys = (mainWindow: BrowserWindow | null): void => {
  if (globalShortcut.isRegistered(currentHotkey)) {
    globalShortcut.unregister(currentHotkey);
  }

  const registered = globalShortcut.register(currentHotkey, () => {
    handleToggleRecording();
  });

  if (registered) {
    console.log(`✓ Global hotkey registered: ${currentHotkey}`);
  } else {
    console.error(`✗ Failed to register global hotkey: ${currentHotkey}`);
  }
};

/**
 * Toggle recording: press once to start, press again to stop.
 */
const handleToggleRecording = (): void => {
  if (!isRecording) {
    isRecording = true;
    console.log('🎤 Recording started (hotkey)');
    hotkeyEmitter.emit('recording:start');
  } else {
    isRecording = false;
    console.log('🛑 Recording stopped (hotkey)');
    hotkeyEmitter.emit('recording:stop');
  }
};

/**
 * Update the hotkey
 */
export const updateHotkey = (newHotkey: string, _mainWindow: BrowserWindow | null): boolean => {
  if (globalShortcut.isRegistered(currentHotkey)) {
    globalShortcut.unregister(currentHotkey);
  }

  const registered = globalShortcut.register(newHotkey, () => {
    handleToggleRecording();
  });

  if (registered) {
    currentHotkey = newHotkey;
    console.log(`✓ Hotkey updated to: ${newHotkey}`);
    return true;
  } else {
    registerHotkeys(_mainWindow);
    console.error(`✗ Failed to register new hotkey: ${newHotkey}`);
    return false;
  }
};

export const getCurrentHotkey = (): string => currentHotkey;
export const getIsRecording = (): boolean => isRecording;

export const unregisterAllHotkeys = (): void => {
  globalShortcut.unregisterAll();
  console.log('✓ All global hotkeys unregistered');
};

app.on('will-quit', () => {
  unregisterAllHotkeys();
});
