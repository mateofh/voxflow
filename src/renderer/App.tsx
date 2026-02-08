import React from 'react';
import { useRecording } from './hooks/useRecording';
import { useVAD } from './hooks/useVAD';

const App: React.FC = () => {
  const { isRecording, duration, error: recordingError } = useRecording();
  const { isListening, isSpeaking, startVAD, stopVAD, error: vadError } = useVAD();

  const handleToggleVAD = async () => {
    if (isListening) {
      stopVAD();
    } else {
      await startVAD();
    }
  };

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

        {/* Speaking indicator (VAD) */}
        {isSpeaking && !isRecording && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-pulse">
            <p className="font-bold">Listening...</p>
            <p className="text-sm">Speaking detected - recording automatically</p>
          </div>
        )}

        {/* Error display */}
        {(recordingError || vadError) && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <p className="font-bold">Error</p>
            <p className="text-sm">{recordingError || vadError}</p>
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

          {/* VAD Toggle */}
          <div className="mb-4">
            <button
              onClick={handleToggleVAD}
              className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isListening ? 'Stop VAD' : 'Start VAD (Auto-detect speech)'}
            </button>
          </div>

          <div className="space-y-2 text-left text-sm text-gray-600">
            <p>System Tray initialized</p>
            <p>Global hotkeys active</p>
            <p>Audio capture ready</p>
            <p>{isListening ? 'VAD active - auto-detecting speech' : 'VAD ready'}</p>
          </div>
        </div>

        {!isRecording && !isListening && (
          <p className="mt-6 text-sm text-gray-500">
            Press the hotkey or enable VAD to start
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
