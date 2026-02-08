import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎤 VoxFlow
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Voice to Text Desktop App
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <p className="text-gray-700 mb-4">
            System tray is now active! Look for the VoxFlow icon in your menu bar.
          </p>
          <div className="space-y-2 text-left text-sm text-gray-600">
            <p>✓ System Tray initialized</p>
            <p>⏳ Global hotkeys - Coming soon</p>
            <p>⏳ Audio capture - Coming soon</p>
            <p>⏳ VAD - Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
