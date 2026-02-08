import { BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';

// Configure autoUpdater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

/**
 * Initialize the auto-updater and set up event listeners.
 * Should only be called in production (not in development).
 */
export function initAutoUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available. Current version is up to date:', info.version);
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`Download progress: ${progress.percent.toFixed(1)}%`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:downloaded', {
        version: info.version,
      });
    }
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:error', {
        message: error.message,
      });
    }
  });

  // Check for updates (silently catch errors in production)
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('Failed to check for updates:', err);
  });
}

/**
 * Download the available update.
 */
export function downloadUpdate(): void {
  autoUpdater.downloadUpdate().catch((err) => {
    console.error('Failed to download update:', err);
  });
}

/**
 * Quit the app and install the downloaded update.
 */
export function installUpdate(): void {
  autoUpdater.quitAndInstall();
}
