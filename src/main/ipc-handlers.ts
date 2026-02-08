import { ipcMain } from 'electron';
import { saveKey, getKey } from './keystore';

// In-memory settings store (will be replaced with SQLite later)
let appSettings: Record<string, any> = {
  enhancementEnabled: true,
  customPrompt: '',
  language: 'es',
  hotkey: '',  // Empty = use default (CommandOrControl+Shift+Space)
};

/**
 * Register all settings-related IPC handlers
 */
export const registerIPCHandlers = (): void => {
  // Keytar: Save API key securely
  ipcMain.handle('keytar:save', async (_event, data: { service: string; key: string }) => {
    try {
      await saveKey(data.service, data.key);
      return { success: true };
    } catch (error) {
      console.error('Keytar save error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Keytar: Get API key
  ipcMain.handle('keytar:get', async (_event, service: string) => {
    try {
      const key = await getKey(service);
      return { success: true, key };
    } catch (error) {
      console.error('Keytar get error:', error);
      return { success: false, key: null };
    }
  });

  // Settings: Get all settings
  ipcMain.handle('settings:get', async () => {
    // Also load API keys (masked) for the settings UI
    const deepgramKey = await getKey('deepgram') || '';
    const openaiKey = await getKey('openai') || '';

    return {
      ...appSettings,
      deepgramKey,
      openaiKey,
    };
  });

  // Settings: Save settings
  ipcMain.handle('settings:set', async (_event, settings: Record<string, any>) => {
    appSettings = { ...appSettings, ...settings };
    console.log('✓ Settings updated:', Object.keys(settings).join(', '));
    return { success: true };
  });

  console.log('✓ IPC handlers registered');
};
