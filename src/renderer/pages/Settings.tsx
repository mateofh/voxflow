import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onBack: () => void;
}

// Convert Electron accelerator to display string
const formatHotkeyDisplay = (hotkey: string): string => {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  return hotkey
    .replace('CommandOrControl', isMac ? 'Cmd' : 'Ctrl')
    .replace('Command', 'Cmd')
    .replace('Control', 'Ctrl');
};

// Convert a KeyboardEvent to Electron accelerator format
const keyEventToAccelerator = (e: React.KeyboardEvent): string | null => {
  const parts: string[] = [];

  if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');

  const key = e.key;
  // Ignore if only modifiers are pressed
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return null;

  // Need at least one modifier
  if (parts.length === 0) return null;

  // Map key names to Electron accelerator format
  if (key === ' ') parts.push('Space');
  else if (key === 'Enter') parts.push('Return');
  else if (key === 'Escape') parts.push('Escape');
  else if (key === 'Backspace') parts.push('Backspace');
  else if (key === 'Delete') parts.push('Delete');
  else if (key === 'Tab') parts.push('Tab');
  else if (key === 'ArrowUp') parts.push('Up');
  else if (key === 'ArrowDown') parts.push('Down');
  else if (key === 'ArrowLeft') parts.push('Left');
  else if (key === 'ArrowRight') parts.push('Right');
  else if (key.startsWith('F') && key.length <= 3) parts.push(key); // F1-F12
  else if (key.length === 1) parts.push(key.toUpperCase());
  else return null;

  return parts.join('+');
};

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [deepgramKey, setDeepgramKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [enhancementEnabled, setEnhancementEnabled] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [language, setLanguage] = useState('es');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentHotkey, setCurrentHotkey] = useState('CommandOrControl+Shift+Space');
  const [recordingHotkey, setRecordingHotkey] = useState(false);
  const [hotkeyStatus, setHotkeyStatus] = useState<string | null>(null);

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
      // Load current hotkey from main process
      const hotkeyResult = await window.electron.invoke('hotkey:get');
      if (hotkeyResult?.hotkey) {
        setCurrentHotkey(hotkeyResult.hotkey);
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

  const handleHotkeyKeyDown = async (e: React.KeyboardEvent) => {
    if (!recordingHotkey) return;
    e.preventDefault();
    e.stopPropagation();

    const accelerator = keyEventToAccelerator(e);
    if (!accelerator) return; // Only modifiers pressed, keep waiting

    setRecordingHotkey(false);

    if (!window.electron) return;

    try {
      const result = await window.electron.invoke('hotkey:update', accelerator);
      if (result?.success) {
        setCurrentHotkey(accelerator);
        setHotkeyStatus('Hotkey actualizado');
        setTimeout(() => setHotkeyStatus(null), 2000);
      } else {
        setHotkeyStatus('No se pudo registrar esa combinacion');
        setTimeout(() => setHotkeyStatus(null), 3000);
      }
    } catch (err) {
      setHotkeyStatus('Error al actualizar hotkey');
      setTimeout(() => setHotkeyStatus(null), 3000);
    }
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

        {/* Hotkey Section */}
        <div className="gradient-card rounded-lg shadow-card border border-border p-6 mb-5">
          <h2 className="text-lg font-poppins font-semibold text-card-foreground mb-4">Hotkey</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Manten presionado el hotkey para grabar, suelta para pegar el texto.
          </p>

          <div className="flex items-center gap-3">
            <div
              tabIndex={0}
              onKeyDown={handleHotkeyKeyDown}
              onBlur={() => setRecordingHotkey(false)}
              onClick={() => setRecordingHotkey(true)}
              className={`flex-1 px-4 py-3 rounded-lg border text-center font-mono text-sm cursor-pointer transition-smooth ${
                recordingHotkey
                  ? 'border-primary bg-primary/10 text-primary animate-pulse'
                  : 'border-border bg-input text-foreground hover:border-primary/50'
              }`}
            >
              {recordingHotkey
                ? 'Presiona la nueva combinacion...'
                : formatHotkeyDisplay(currentHotkey)
              }
            </div>
          </div>

          {hotkeyStatus && (
            <p className={`mt-2 text-xs text-center font-medium animate-fade-in ${
              hotkeyStatus.includes('Error') || hotkeyStatus.includes('No se pudo')
                ? 'text-destructive'
                : 'text-emerald-500'
            }`}>
              {hotkeyStatus}
            </p>
          )}
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
