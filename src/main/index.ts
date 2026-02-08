import { app, BrowserWindow } from 'electron';
import path from 'path';
import { createTray } from './tray';
import { registerHotkeys, hotkeyEmitter } from './hotkeys';

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

  // Set up hotkey event listeners
  hotkeyEmitter.on('recording:start', () => {
    console.log('📝 Recording started event received');
    // TODO: Start audio capture (Task #3)
  });

  hotkeyEmitter.on('recording:stop', () => {
    console.log('📝 Recording stopped event received');
    // TODO: Stop audio capture and process (Task #3)
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
