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
    <div className="min-h-screen gradient-hero p-6">
      <div className="max-w-lg mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-poppins font-bold gradient-text">Settings</h1>
          <button
            onClick={onBack}
            className="text-sm font-medium text-primary-glow hover:text-primary transition-smooth"
          >
            Back
          </button>
        </div>

        {/* API Keys Section */}
        <div className="gradient-card rounded-lg shadow-card border border-border p-6 mb-5">
          <h2 className="text-lg font-poppins font-semibold text-card-foreground mb-4">API Keys</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Keys are stored securely in your system keychain.
          </p>

          <div className="mb-5">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Deepgram API Key (Required for STT)
            </label>
            <input
              type="password"
              value={deepgramKey}
              onChange={(e) => setDeepgramKey(e.target.value)}
              placeholder="Enter your Deepgram API key"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm placeholder:text-muted-foreground"
            />
            <a
              href="https://console.deepgram.com"
              className="text-xs text-primary-glow hover:text-primary mt-1.5 inline-block transition-smooth"
              target="_blank"
            >
              Get a Deepgram API key
            </a>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              OpenAI API Key (Optional - for text enhancement)
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm placeholder:text-muted-foreground"
            />
            <a
              href="https://platform.openai.com/api-keys"
              className="text-xs text-primary-glow hover:text-primary mt-1.5 inline-block transition-smooth"
              target="_blank"
            >
              Get an OpenAI API key
            </a>
          </div>
        </div>

        {/* Enhancement Section */}
        <div className="gradient-card rounded-lg shadow-card border border-border p-6 mb-5">
          <h2 className="text-lg font-poppins font-semibold text-card-foreground mb-4">Text Enhancement</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Enable Enhancement</p>
              <p className="text-xs text-muted-foreground">
                Uses AI to improve grammar and clarity
              </p>
            </div>
            <button
              onClick={() => setEnhancementEnabled(!enhancementEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-smooth ${
                enhancementEnabled ? 'bg-primary glow-subtle' : 'bg-secondary'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-smooth ${
                  enhancementEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {enhancementEnabled && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Custom Prompt (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add custom instructions for text enhancement..."
                rows={3}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm placeholder:text-muted-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Leave empty to use default enhancement prompt
              </p>
            </div>
          )}
        </div>

        {/* Language Section */}
        <div className="gradient-card rounded-lg shadow-card border border-border p-6 mb-5">
          <h2 className="text-lg font-poppins font-semibold text-card-foreground mb-4">Language</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
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
          className="w-full py-3 gradient-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {/* Status Message */}
        {status && (
          <p className={`mt-4 text-sm text-center font-medium animate-fade-in ${
            status.includes('Error') || status.includes('failed')
              ? 'text-destructive'
              : 'text-emerald-500'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default Settings;
