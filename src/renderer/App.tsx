import React, { useState, useEffect } from 'react';
import { useRecording } from './hooks/useRecording';

const App: React.FC = () => {
  const { isRecording, duration, error } = useRecording();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          VoxFlow
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Voice to Text Desktop App
        </p>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-pulse">
            <p className="font-bold">Recording...</p>
            <p className="text-2xl font-mono">{duration.toFixed(1)}s</p>
            <p className="text-sm">Press the hotkey again to stop</p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <p className="font-bold">Microphone Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <p className="text-gray-700 mb-4">
            System tray is active! Look for the VoxFlow icon in your menu bar.
          </p>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Global Hotkey:
            </p>
            <p className="text-lg font-mono text-blue-700">
              Cmd + Shift + Space
            </p>
          </div>

          <div className="space-y-2 text-left text-sm text-gray-600">
            <p>System Tray initialized</p>
            <p>Global hotkeys active</p>
            <p>Audio capture ready</p>
            <p>VAD - Coming soon</p>
          </div>
        </div>

        {!isRecording && (
          <p className="mt-6 text-sm text-gray-500">
            Press the hotkey to start recording your voice
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
