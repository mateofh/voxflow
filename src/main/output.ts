import { keyboard } from '@nut-tree-fork/nut-js';

// Configure typing speed (characters per second)
keyboard.config.autoDelayMs = 0;

/**
 * Insert text at the current cursor position by simulating keyboard typing.
 * Uses nut.js for cross-platform keyboard simulation.
 */
export const insertTextAtCursor = async (text: string): Promise<void> => {
  if (!text || text.trim().length === 0) {
    console.warn('No text to insert');
    return;
  }

  try {
    console.log(`⌨️ Inserting text (${text.length} chars)`);
    await keyboard.type(text);
    console.log('✓ Text inserted successfully');
  } catch (error) {
    console.error('Failed to insert text:', error);
    throw error;
  }
};

/**
 * Insert text using clipboard (faster for long text).
 * Copies text to clipboard and pastes it.
 */
export const insertTextViaClipboard = async (text: string): Promise<void> => {
  if (!text || text.trim().length === 0) {
    console.warn('No text to insert');
    return;
  }

  try {
    const { clipboard } = await import('electron');
    // Save current clipboard content
    const previousClipboard = clipboard.readText();

    // Set new text and paste
    clipboard.writeText(text);

    // Simulate Cmd+V (Mac) or Ctrl+V (Windows/Linux)
    const { Key } = await import('@nut-tree-fork/nut-js');
    const modifier = process.platform === 'darwin' ? Key.LeftSuper : Key.LeftControl;
    await keyboard.pressKey(modifier, Key.V);
    await keyboard.releaseKey(modifier, Key.V);

    // Restore previous clipboard after a short delay
    setTimeout(() => {
      clipboard.writeText(previousClipboard);
    }, 100);

    console.log('✓ Text pasted via clipboard');
  } catch (error) {
    console.error('Failed to paste text:', error);
    // Fallback to typing
    await insertTextAtCursor(text);
  }
};
