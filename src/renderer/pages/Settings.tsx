import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [deepgramKey, setDeepgramKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [enhancementEnabled, setEnhancementEnabled] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [language, setLanguage] = useState('es');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!window.electron) return;
    try {
      const settings = await window.electron.invoke('settings:get');
      if (settings) {
        setDeepgramKey(settings.deepgramKey || '');
        setOpenaiKey(settings.openaiKey || '');
        setEnhancementEnabled(settings.enhancementEnabled ?? true);
        setCustomPrompt(settings.customPrompt || '');
        setLanguage(settings.language || 'es');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const saveSettings = async () => {
    if (!window.electron) return;
    setSaving(true);
    setStatus(null);

    try {
      // Save API keys securely via keytar
      await window.electron.invoke('keytar:save', {
        service: 'deepgram',
        key: deepgramKey,
      });
      await window.electron.invoke('keytar:save', {
        service: 'openai',
        key: openaiKey,
      });

      // Save other settings
      await window.electron.invoke('settings:set', {
        enhancementEnabled,
        customPrompt,
        language,
      });

      // Initialize STT with new key if provided
      if (deepgramKey) {
        const result = await window.electron.invoke('stt:init', deepgramKey);
        if (!result.success) {
          setStatus('Settings saved, but Deepgram connection failed: ' + result.error);
          setSaving(false);
          return;
        }
      }

      setStatus('Settings saved successfully!');
    } catch (err) {
      setStatus('Error saving settings');
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back
          </button>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">API Keys</h2>
          <p className="text-xs text-gray-500 mb-4">
            Keys are stored securely in your system keychain.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deepgram API Key (Required for STT)
            </label>
            <input
              type="password"
              value={deepgramKey}
              onChange={(e) => setDeepgramKey(e.target.value)}
              placeholder="Enter your Deepgram API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <a
              href="https://console.deepgram.com"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
              target="_blank"
            >
              Get a Deepgram API key
            </a>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key (Optional - for text enhancement)
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <a
              href="https://platform.openai.com/api-keys"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
              target="_blank"
            >
              Get an OpenAI API key
            </a>
          </div>
        </div>

        {/* Enhancement Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Text Enhancement</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Enable Enhancement</p>
              <p className="text-xs text-gray-500">
                Uses AI to improve grammar and clarity
              </p>
            </div>
            <button
              onClick={() => setEnhancementEnabled(!enhancementEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enhancementEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enhancementEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {enhancementEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Prompt (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add custom instructions for text enhancement..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to use default enhancement prompt
              </p>
            </div>
          )}
        </div>

        {/* Language Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Language</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="es">Spanish</option>
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="auto">Auto-detect</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {/* Status Message */}
        {status && (
          <p className={`mt-3 text-sm text-center ${
            status.includes('Error') || status.includes('failed')
              ? 'text-red-600'
              : 'text-green-600'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default Settings;
