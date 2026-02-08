import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export const createTray = (mainWindow: BrowserWindow | null): Tray => {
  // Create icon for tray
  // For now, we'll create a simple template image
  const iconPath = path.join(__dirname, '../../assets/icons/tray-icon.png');

  // Try to load the icon, fallback to creating a minimal one
  let icon: Electron.NativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      // Create a simple placeholder icon (16x16 with a dot in the center)
      icon = createPlaceholderIcon();
    }
  } catch (error) {
    icon = createPlaceholderIcon();
  }

  tray = new Tray(icon);

  updateTrayMenu(tray, mainWindow);

  // Handle tray icon click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  return tray;
};

const updateTrayMenu = (tray: Tray, mainWindow: BrowserWindow | null): void => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'VoxFlow',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: mainWindow?.isVisible() ? 'Hide Window' : 'Show Window',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
          updateTrayMenu(tray, mainWindow);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          // TODO: Navigate to settings page
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('VoxFlow - Voice to Text');
};

// Create a simple placeholder icon for development
const createPlaceholderIcon = (): Electron.NativeImage => {
  // Create a 16x16 gray icon with a white dot in the center
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);

  // Fill with gray background
  for (let i = 0; i < size * size; i++) {
    const offset = i * 4;
    canvas[offset] = 128;     // R
    canvas[offset + 1] = 128; // G
    canvas[offset + 2] = 128; // B
    canvas[offset + 3] = 255; // A
  }

  // Draw a white dot in the center (4x4 pixels)
  const centerStart = Math.floor(size / 2) - 2;
  for (let y = centerStart; y < centerStart + 4; y++) {
    for (let x = centerStart; x < centerStart + 4; x++) {
      const offset = (y * size + x) * 4;
      canvas[offset] = 255;     // R
      canvas[offset + 1] = 255; // G
      canvas[offset + 2] = 255; // B
      canvas[offset + 3] = 255; // A
    }
  }

  return nativeImage.createFromBuffer(canvas, {
    width: size,
    height: size,
  });
};

export const getTray = (): Tray | null => tray;
