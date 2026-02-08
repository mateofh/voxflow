import { shell } from 'electron';

// Use system sounds on macOS, or generate beeps
const isMac = process.platform === 'darwin';

/**
 * Play a sound to indicate recording has started
 * Short high-pitched beep
 */
export const playStartSound = (): void => {
  try {
    if (isMac) {
      // Use macOS afplay with system sounds
      const { exec } = require('child_process');
      exec('afplay /System/Library/Sounds/Tink.aiff');
    } else {
      // On Windows/Linux, use a simple approach
      // The shell.beep() is available but very basic
      shell.beep();
    }
  } catch (error) {
    console.warn('Could not play start sound:', error);
  }
};

/**
 * Play a sound to indicate recording has stopped
 * Short low-pitched beep
 */
export const playStopSound = (): void => {
  try {
    if (isMac) {
      const { exec } = require('child_process');
      exec('afplay /System/Library/Sounds/Pop.aiff');
    } else {
      shell.beep();
    }
  } catch (error) {
    console.warn('Could not play stop sound:', error);
  }
};

/**
 * Play a sound to indicate processing is complete
 */
export const playCompleteSound = (): void => {
  try {
    if (isMac) {
      const { exec } = require('child_process');
      exec('afplay /System/Library/Sounds/Glass.aiff');
    } else {
      shell.beep();
    }
  } catch (error) {
    console.warn('Could not play complete sound:', error);
  }
};

/**
 * Play an error sound
 */
export const playErrorSound = (): void => {
  try {
    if (isMac) {
      const { exec } = require('child_process');
      exec('afplay /System/Library/Sounds/Basso.aiff');
    } else {
      shell.beep();
    }
  } catch (error) {
    console.warn('Could not play error sound:', error);
  }
};
