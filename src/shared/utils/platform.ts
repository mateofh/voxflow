// ═══════════════════════════════════════════════════════════
// VoxFlow — Platform Utilities
// ═══════════════════════════════════════════════════════════

/** Check if running on macOS */
export const isMac = (): boolean => process.platform === 'darwin';

/** Check if running on Windows */
export const isWindows = (): boolean => process.platform === 'win32';

/** Check if running on Linux */
export const isLinux = (): boolean => process.platform === 'linux';

/** Get the platform-specific user data directory */
export function getUserDataDir(): string {
  if (isMac()) {
    return `${process.env.HOME}/Library/Application Support/VoxFlow`;
  }
  if (isWindows()) {
    return `${process.env.APPDATA}/VoxFlow`;
  }
  return `${process.env.HOME}/.config/voxflow`;
}

/** Get the platform-specific models directory */
export function getModelsDir(): string {
  return `${getUserDataDir()}/models`;
}

/** Get the database file path */
export function getDatabasePath(): string {
  return `${getUserDataDir()}/voxflow.db`;
}

/** Get the platform-specific hotkey modifier name */
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

/** Format a hotkey for display */
export function formatHotkey(accelerator: string): string {
  if (isMac()) {
    return accelerator
      .replace('CommandOrControl', '⌘')
      .replace('Command', '⌘')
      .replace('Control', '⌃')
      .replace('Alt', '⌥')
      .replace('Shift', '⇧')
      .replace(/\+/g, '');
  }
  return accelerator
    .replace('CommandOrControl', 'Ctrl')
    .replace('+', ' + ');
}

/** Check if Apple Silicon (for GPU acceleration) */
export function isAppleSilicon(): boolean {
  if (!isMac()) return false;
  try {
    const { execSync } = require('child_process');
    const arch = execSync('uname -m').toString().trim();
    return arch === 'arm64';
  } catch {
    return false;
  }
}

/** Check if NVIDIA GPU is available (for CUDA acceleration) */
export function hasNvidiaGpu(): boolean {
  if (isMac()) return false;
  try {
    const { execSync } = require('child_process');
    execSync('nvidia-smi', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Check if Ollama is running locally */
export async function isOllamaRunning(endpoint = 'http://localhost:11434'): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
}

/** Get available Ollama models */
export async function getOllamaModels(endpoint = 'http://localhost:11434'): Promise<string[]> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.models || []).map((m: { name: string }) => m.name);
  } catch {
    return [];
  }
}
