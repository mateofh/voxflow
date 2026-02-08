import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Example IPC methods (will expand as we add features)
  send: (channel: string, data: any) => {
    // Whitelist channels
    const validChannels = [
      'recording:start',
      'recording:stop',
      'settings:get',
      'settings:set',
      'audio:chunk',
      'vad:speech-start',
      'vad:speech-end',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = [
      'recording:started',
      'recording:stopped',
      'transcription:result',
      'settings:updated',
      'vad:started',
      'vad:stopped',
      'vad:speech-detected',
      'vad:speech-ended',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
  invoke: async (channel: string, data?: any) => {
    const validChannels = [
      'settings:get',
      'settings:set',
      'recording:start',
      'recording:stop',
      'audio:start',
      'audio:stop',
      'stt:init',
      'keytar:save',
      'keytar:get',
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
  },
});

// Type definitions for TypeScript
export interface IElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  invoke: (channel: string, data?: any) => Promise<any>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
