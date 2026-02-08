import React, { useState, useEffect } from 'react';
import { useRecording } from './hooks/useRecording';
import { useVAD } from './hooks/useVAD';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';

const App: React.FC = () => {
  const [page, setPage] = useState<'home' | 'settings'>('home');
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { isRecording, duration, error: recordingError } = useRecording();
  const { isListening, isSpeaking, startVAD, stopVAD, error: vadError } = useVAD();

  // Check if onboarding was already completed
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!window.electron) {
        setIsFirstRun(false);
        setIsLoading(false);
        return;
      }

      try {
        const settings = await window.electron.invoke('settings:get');
        if (settings?.onboardingCompleted) {
          setIsFirstRun(false);
        }
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
      }

      setIsLoading(false);
    };

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async () => {
    if (window.electron) {
      try {
        await window.electron.invoke('settings:set', { onboardingCompleted: true });
      } catch (err) {
        console.error('Failed to save onboarding status:', err);
      }
    }
    setIsFirstRun(false);
  };

  // Show nothing while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground font-roboto text-sm">Loading...</p>
      </div>
    );
  }

  // Show onboarding wizard for first-run experience
  if (isFirstRun) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (page === 'settings') {
    return <Settings onBack={() => setPage('home')} />;
  }

  const handleToggleVAD = async () => {
    if (isListening) {
      stopVAD();
    } else {
      await startVAD();
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <h1 className="text-5xl font-poppins font-bold gradient-text mb-2">
          VoxFlow
        </h1>
        <p className="text-base text-muted-foreground mb-8 font-roboto">
          Voice to Text Desktop App
        </p>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 text-destructive-foreground px-5 py-4 rounded-lg animate-glow-pulse">
            <p className="font-poppins font-semibold text-lg">Recording...</p>
            <p className="text-3xl font-mono text-destructive">{duration.toFixed(1)}s</p>
            <p className="text-sm text-muted-foreground mt-1">Press the hotkey again to stop</p>
          </div>
        )}

        {/* Speaking indicator (VAD) */}
        {isSpeaking && !isRecording && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 px-5 py-4 rounded-lg animate-pulse">
            <p className="font-poppins font-semibold text-lg text-emerald-500">Listening...</p>
            <p className="text-sm text-muted-foreground">Speaking detected - recording automatically</p>
          </div>
        )}

        {/* Error display */}
        {(recordingError || vadError) && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 px-5 py-4 rounded-lg">
            <p className="font-poppins font-semibold text-destructive">Error</p>
            <p className="text-sm text-muted-foreground">{recordingError || vadError}</p>
          </div>
        )}

        <div className="gradient-card shadow-card rounded-lg p-6 max-w-md border border-border">
          <p className="text-card-foreground mb-5 font-roboto">
            System tray is active! Look for the VoxFlow icon in your menu bar.
          </p>

          <div className="mb-5 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm font-poppins font-semibold text-primary-glow mb-1">
              Global Hotkey
            </p>
            <p className="text-lg font-mono text-primary">
              Cmd + Shift + Space
            </p>
          </div>

          {/* VAD Toggle */}
          <div className="mb-4">
            <button
              onClick={handleToggleVAD}
              className={`w-full py-3 px-4 rounded-lg font-poppins font-medium transition-smooth ${
                isListening
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground glow-primary'
                  : 'bg-emerald-500 hover:bg-emerald-500/90 text-white'
              }`}
            >
              {isListening ? 'Stop VAD' : 'Start VAD (Auto-detect speech)'}
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setPage('settings')}
            className="w-full py-3 px-4 rounded-lg font-poppins font-medium bg-secondary hover:bg-accent text-secondary-foreground transition-smooth"
          >
            Settings
          </button>

          <div className="mt-5 space-y-2 text-left text-sm text-muted-foreground font-roboto">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              System Tray initialized
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Global hotkeys active
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Audio capture ready
            </p>
            <p className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full inline-block ${isListening ? 'bg-turquoise-blue-400 animate-pulse' : 'bg-muted-foreground'}`}></span>
              {isListening ? 'VAD active - auto-detecting speech' : 'VAD ready'}
            </p>
          </div>
        </div>

        {!isRecording && !isListening && (
          <p className="mt-6 text-sm text-muted-foreground font-roboto">
            Press the hotkey or enable VAD to start
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
