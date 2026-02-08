import React, { useState, useEffect, useCallback } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4;

type MicStatus = 'idle' | 'requesting' | 'granted' | 'denied';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>(1);

  // Step 2: Microphone
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [micError, setMicError] = useState<string | null>(null);

  // Step 3: API Keys
  const [deepgramKey, setDeepgramKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  const [keysValidated, setKeysValidated] = useState(false);

  // Step 4: Test Drive
  const [isTestRecording, setIsTestRecording] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);

  // Listen for transcription results in step 4
  useEffect(() => {
    if (!window.electron) return;

    window.electron.receive('transcription:result', (result: string) => {
      setTranscriptionResult(result);
      setIsTestRecording(false);
    });
  }, []);

  // Step 2: Request microphone permission
  const requestMicPermission = useCallback(async () => {
    setMicStatus('requesting');
    setMicError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Permission granted - release the stream immediately
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus('granted');
    } catch (err) {
      setMicStatus('denied');
      const message =
        err instanceof Error ? err.message : 'Microphone access denied';
      setMicError(message);
    }
  }, []);

  // Step 3: Save API keys
  const saveApiKeys = useCallback(async () => {
    if (!window.electron || !deepgramKey.trim()) return;

    setKeySaving(true);
    setKeyStatus(null);

    try {
      // Save Deepgram key via keytar
      await window.electron.invoke('keytar:save', {
        service: 'deepgram',
        key: deepgramKey.trim(),
      });

      // Save OpenAI key if provided
      if (openaiKey.trim()) {
        await window.electron.invoke('keytar:save', {
          service: 'openai',
          key: openaiKey.trim(),
        });
      }

      // Initialize STT with the Deepgram key
      const result = await window.electron.invoke('stt:init', deepgramKey.trim());

      if (!result.success) {
        setKeyStatus('Deepgram key saved, but connection failed: ' + result.error);
        setKeySaving(false);
        return;
      }

      setKeyStatus('Keys saved and Deepgram connected successfully!');
      setKeysValidated(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save API keys';
      setKeyStatus('Error: ' + message);
    }

    setKeySaving(false);
  }, [deepgramKey, openaiKey]);

  // Step 4: Toggle test recording
  const toggleTestRecording = useCallback(async () => {
    if (!window.electron) return;

    if (isTestRecording) {
      await window.electron.invoke('audio:stop');
      setIsTestRecording(false);
    } else {
      setTranscriptionResult(null);
      await window.electron.invoke('audio:start');
      setIsTestRecording(true);
    }
  }, [isTestRecording]);

  // Step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-poppins font-medium transition-smooth ${
              s === step
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : s < step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-secondary text-muted-foreground'
            }`}
          >
            {s < step ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              s
            )}
          </div>
          {s < 4 && (
            <div
              className={`w-8 h-0.5 transition-smooth ${
                s < step ? 'bg-emerald-500' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Step 1: Welcome
  const renderWelcome = () => (
    <div className="text-center animate-fade-in">
      <div className="mb-6">
        <h1 className="text-5xl font-poppins font-bold gradient-text mb-3">
          VoxFlow
        </h1>
        <div className="w-16 h-1 gradient-primary mx-auto rounded-full mb-6" />
      </div>

      <p className="text-lg text-card-foreground font-roboto mb-3 max-w-md mx-auto">
        Transform your voice into polished text, instantly.
      </p>
      <p className="text-sm text-muted-foreground font-roboto mb-10 max-w-sm mx-auto">
        VoxFlow captures your speech, transcribes it in real time with Deepgram,
        and optionally enhances it with AI -- all running privately on your desktop.
      </p>

      <button
        onClick={() => setStep(2)}
        className="px-8 py-3 gradient-primary hover:opacity-90 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
      >
        Get Started
      </button>
    </div>
  );

  // Step 2: Microphone Permission
  const renderMicPermission = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-poppins font-bold text-foreground mb-2 text-center">
        Microphone Access
      </h2>
      <p className="text-sm text-muted-foreground font-roboto mb-8 text-center">
        VoxFlow needs access to your microphone to capture and transcribe your voice.
      </p>

      <div className="gradient-card shadow-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col items-center gap-4">
          {/* Mic icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-smooth ${
              micStatus === 'granted'
                ? 'bg-emerald-500/20 border-2 border-emerald-500'
                : micStatus === 'denied'
                  ? 'bg-destructive/20 border-2 border-destructive'
                  : 'bg-secondary border-2 border-border'
            }`}
          >
            {micStatus === 'granted' ? (
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
                />
              </svg>
            )}
          </div>

          {/* Status text */}
          {micStatus === 'idle' && (
            <p className="text-sm text-muted-foreground font-roboto">
              Click below to grant microphone access
            </p>
          )}
          {micStatus === 'requesting' && (
            <p className="text-sm text-primary-glow font-roboto">
              Requesting permission...
            </p>
          )}
          {micStatus === 'granted' && (
            <p className="text-sm text-emerald-500 font-roboto font-medium">
              Microphone access granted
            </p>
          )}
          {micStatus === 'denied' && (
            <div className="text-center">
              <p className="text-sm text-destructive font-roboto font-medium">
                Microphone access denied
              </p>
              {micError && (
                <p className="text-xs text-muted-foreground mt-1">{micError}</p>
              )}
            </div>
          )}

          {/* Request button */}
          {micStatus !== 'granted' && (
            <button
              onClick={requestMicPermission}
              disabled={micStatus === 'requesting'}
              className="px-6 py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
            >
              {micStatus === 'requesting'
                ? 'Requesting...'
                : micStatus === 'denied'
                  ? 'Try Again'
                  : 'Allow Microphone'}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-poppins font-medium rounded-lg transition-smooth"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={micStatus !== 'granted'}
          className="px-6 py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: API Keys
  const renderApiKeys = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-poppins font-bold text-foreground mb-2 text-center">
        API Keys
      </h2>
      <p className="text-sm text-muted-foreground font-roboto mb-8 text-center">
        Enter your API keys to enable speech-to-text and AI enhancement.
        Keys are stored securely in your system keychain.
      </p>

      <div className="gradient-card shadow-card border border-border rounded-lg p-6 mb-6">
        {/* Deepgram key */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-card-foreground mb-2 font-roboto">
            Deepgram API Key
            <span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="password"
            value={deepgramKey}
            onChange={(e) => {
              setDeepgramKey(e.target.value);
              setKeysValidated(false);
              setKeyStatus(null);
            }}
            placeholder="Enter your Deepgram API key"
            className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
          <a
            href="https://console.deepgram.com"
            className="text-xs text-primary-glow hover:text-primary mt-1.5 inline-block transition-smooth"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get a Deepgram API key (free tier available)
          </a>
        </div>

        {/* OpenAI key */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-card-foreground mb-2 font-roboto">
            OpenAI API Key
            <span className="text-muted-foreground ml-1 font-normal">(optional)</span>
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
            rel="noopener noreferrer"
          >
            Get an OpenAI API key
          </a>
        </div>

        {/* Save / validate button */}
        <button
          onClick={saveApiKeys}
          disabled={!deepgramKey.trim() || keySaving}
          className="w-full py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          {keySaving ? 'Validating...' : keysValidated ? 'Validated' : 'Save & Validate Keys'}
        </button>

        {/* Status message */}
        {keyStatus && (
          <p
            className={`mt-3 text-sm text-center font-medium animate-fade-in ${
              keyStatus.startsWith('Error') || keyStatus.includes('failed')
                ? 'text-destructive'
                : 'text-emerald-500'
            }`}
          >
            {keyStatus}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-poppins font-medium rounded-lg transition-smooth"
        >
          Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!keysValidated}
          className="px-6 py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 4: Test Drive
  const renderTestDrive = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-poppins font-bold text-foreground mb-2 text-center">
        Test Drive
      </h2>
      <p className="text-sm text-muted-foreground font-roboto mb-8 text-center">
        Everything is set up. Try it out before you go!
      </p>

      <div className="gradient-card shadow-card border border-border rounded-lg p-6 mb-6">
        {/* Hotkey info */}
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
          <p className="text-sm font-poppins font-semibold text-primary-glow mb-1">
            Global Hotkey
          </p>
          <p className="text-lg font-mono text-primary">
            Cmd + Shift + Space
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-roboto">
            Press this anywhere on your Mac to start/stop recording
          </p>
        </div>

        {/* Try recording */}
        <div className="text-center">
          <p className="text-sm text-card-foreground font-roboto mb-4">
            Or try recording right here:
          </p>

          <button
            onClick={toggleTestRecording}
            className={`px-8 py-3 rounded-lg font-poppins font-medium transition-smooth ${
              isTestRecording
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-glow-pulse'
                : 'gradient-primary hover:opacity-90 text-primary-foreground shadow-glow'
            }`}
          >
            {isTestRecording ? 'Stop Recording' : 'Try Recording'}
          </button>

          {isTestRecording && (
            <p className="text-sm text-muted-foreground mt-3 animate-fade-in font-roboto">
              Speak now... press stop when done.
            </p>
          )}
        </div>

        {/* Transcription result */}
        {transcriptionResult && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-fade-in">
            <p className="text-xs font-poppins font-semibold text-emerald-500 mb-2">
              Transcription Result
            </p>
            <p className="text-sm text-card-foreground font-roboto leading-relaxed">
              {transcriptionResult}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(3)}
          className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-poppins font-medium rounded-lg transition-smooth"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-8 py-2.5 gradient-primary hover:opacity-90 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          Finish Setup
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {renderStepIndicator()}
        {step === 1 && renderWelcome()}
        {step === 2 && renderMicPermission()}
        {step === 3 && renderApiKeys()}
        {step === 4 && renderTestDrive()}
      </div>
    </div>
  );
};

export default Onboarding;
