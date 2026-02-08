import React, { useState, useCallback } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4;
type MicStatus = 'idle' | 'requesting' | 'granted' | 'denied';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>(1);

  // Step 2
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [micError, setMicError] = useState<string | null>(null);

  // Step 3
  const [deepgramKey, setDeepgramKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  const [keysValidated, setKeysValidated] = useState(false);

  const requestMicPermission = useCallback(async () => {
    setMicStatus('requesting');
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1 },
      });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus('granted');
    } catch (err) {
      setMicStatus('denied');
      setMicError(err instanceof Error ? err.message : 'Microphone access denied');
    }
  }, []);

  const saveApiKeys = useCallback(async () => {
    if (!window.electron || !deepgramKey.trim()) return;
    setKeySaving(true);
    setKeyStatus(null);
    try {
      await window.electron.invoke('keytar:save', { service: 'deepgram', key: deepgramKey.trim() });
      if (openaiKey.trim()) {
        await window.electron.invoke('keytar:save', { service: 'openai', key: openaiKey.trim() });
      }
      const result = await window.electron.invoke('stt:init', deepgramKey.trim());
      if (!result.success) {
        setKeyStatus('La key de Deepgram no es valida: ' + result.error);
        setKeySaving(false);
        return;
      }
      setKeyStatus('Keys guardadas y Deepgram conectado!');
      setKeysValidated(true);
    } catch (err) {
      setKeyStatus('Error: ' + (err instanceof Error ? err.message : 'Failed to save'));
    }
    setKeySaving(false);
  }, [deepgramKey, openaiKey]);

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
            ) : s}
          </div>
          {s < 4 && (
            <div className={`w-8 h-0.5 transition-smooth ${s < step ? 'bg-emerald-500' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // Step 1: Welcome
  const renderWelcome = () => (
    <div className="text-center animate-fade-in">
      <h1 className="text-5xl font-poppins font-bold gradient-text mb-3">VoxFlow</h1>
      <div className="w-16 h-1 gradient-primary mx-auto rounded-full mb-6" />

      <p className="text-lg text-card-foreground font-roboto mb-3 max-w-md mx-auto">
        Convierte tu voz en texto al instante.
      </p>
      <p className="text-sm text-muted-foreground font-roboto mb-10 max-w-sm mx-auto leading-relaxed">
        VoxFlow graba tu voz mientras mantienes presionado un atajo de teclado,
        la transcribe en tiempo real con Deepgram, y opcionalmente la mejora con IA.
        Todo corre en tu escritorio de forma privada.
      </p>

      <div className="gradient-card shadow-card border border-border rounded-lg p-5 max-w-sm mx-auto mb-8 text-left">
        <p className="text-sm font-poppins font-semibold text-card-foreground mb-3">Como funciona:</p>
        <ol className="space-y-2 text-sm text-muted-foreground font-roboto">
          <li className="flex gap-2">
            <span className="text-primary font-bold">1.</span>
            Manten presionado <span className="font-mono text-primary-glow">Cmd+Shift+Space</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">2.</span>
            Habla mientras mantienes presionado
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">3.</span>
            Suelta las teclas y el texto aparece donde tengas el cursor
          </li>
        </ol>
      </div>

      <button
        onClick={() => setStep(2)}
        className="px-8 py-3 gradient-primary hover:opacity-90 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
      >
        Comenzar configuracion
      </button>
    </div>
  );

  // Step 2: Microphone
  const renderMicPermission = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-poppins font-bold text-foreground mb-2 text-center">
        Permiso de microfono
      </h2>
      <p className="text-sm text-muted-foreground font-roboto mb-8 text-center">
        VoxFlow necesita acceso a tu microfono para capturar y transcribir tu voz.
        Este permiso es obligatorio.
      </p>

      <div className="gradient-card shadow-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col items-center gap-4">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
              </svg>
            )}
          </div>

          {micStatus === 'idle' && (
            <p className="text-sm text-muted-foreground font-roboto">Haz click para dar permiso al microfono</p>
          )}
          {micStatus === 'requesting' && (
            <p className="text-sm text-primary-glow font-roboto">Solicitando permiso...</p>
          )}
          {micStatus === 'granted' && (
            <p className="text-sm text-emerald-500 font-roboto font-medium">Microfono habilitado</p>
          )}
          {micStatus === 'denied' && (
            <div className="text-center">
              <p className="text-sm text-destructive font-roboto font-medium">Permiso denegado</p>
              {micError && <p className="text-xs text-muted-foreground mt-1">{micError}</p>}
            </div>
          )}

          {micStatus !== 'granted' && (
            <button
              onClick={requestMicPermission}
              disabled={micStatus === 'requesting'}
              className="px-6 py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
            >
              {micStatus === 'requesting' ? 'Solicitando...' : micStatus === 'denied' ? 'Reintentar' : 'Permitir microfono'}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-poppins font-medium rounded-lg transition-smooth">
          Atras
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={micStatus !== 'granted'}
          className="px-6 py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Step 3: API Keys
  const renderApiKeys = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-poppins font-bold text-foreground mb-2 text-center">API Keys</h2>
      <p className="text-sm text-muted-foreground font-roboto mb-8 text-center leading-relaxed">
        VoxFlow usa tu propia key de Deepgram para transcribir (BYOK).
        <br />Las keys se guardan de forma segura en el llavero de tu sistema operativo.
      </p>

      <div className="gradient-card shadow-card border border-border rounded-lg p-6 mb-6">
        <div className="mb-5">
          <label className="block text-sm font-medium text-card-foreground mb-2 font-roboto">
            Deepgram API Key <span className="text-destructive">*</span>
          </label>
          <input
            type="password"
            value={deepgramKey}
            onChange={(e) => { setDeepgramKey(e.target.value); setKeysValidated(false); setKeyStatus(null); }}
            placeholder="Pega tu key de Deepgram aqui"
            className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
          <a href="https://console.deepgram.com" className="text-xs text-primary-glow hover:text-primary mt-1.5 inline-block transition-smooth" target="_blank" rel="noopener noreferrer">
            Crear key gratis en console.deepgram.com
          </a>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-card-foreground mb-2 font-roboto">
            OpenAI API Key <span className="text-muted-foreground font-normal">(opcional, para mejora de texto)</span>
          </label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="Pega tu key de OpenAI aqui"
            className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
          <a href="https://platform.openai.com/api-keys" className="text-xs text-primary-glow hover:text-primary mt-1.5 inline-block transition-smooth" target="_blank" rel="noopener noreferrer">
            Obtener key en platform.openai.com
          </a>
        </div>

        <button
          onClick={saveApiKeys}
          disabled={!deepgramKey.trim() || keySaving}
          className="w-full py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          {keySaving ? 'Validando...' : keysValidated ? 'Validado' : 'Guardar y validar'}
        </button>

        {keyStatus && (
          <p className={`mt-3 text-sm text-center font-medium animate-fade-in ${
            keyStatus.startsWith('Error') || keyStatus.includes('valida') ? 'text-destructive' : 'text-emerald-500'
          }`}>
            {keyStatus}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-poppins font-medium rounded-lg transition-smooth">
          Atras
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!keysValidated}
          className="px-6 py-2.5 gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Step 4: How to use
  const renderHowToUse = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-poppins font-bold text-foreground mb-2 text-center">
        Listo! Asi se usa
      </h2>
      <p className="text-sm text-muted-foreground font-roboto mb-8 text-center">
        Ya esta todo configurado. Asi funciona VoxFlow:
      </p>

      <div className="gradient-card shadow-card border border-border rounded-lg p-6 mb-6">
        <div className="space-y-6">
          {/* Step by step */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
              <span className="text-primary-foreground font-poppins font-bold text-sm">1</span>
            </div>
            <div>
              <p className="text-sm font-poppins font-semibold text-card-foreground">Pon el cursor donde quieras el texto</p>
              <p className="text-xs text-muted-foreground font-roboto mt-1">En cualquier app: Word, Slack, WhatsApp Web, email, etc.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
              <span className="text-primary-foreground font-poppins font-bold text-sm">2</span>
            </div>
            <div>
              <p className="text-sm font-poppins font-semibold text-card-foreground">Manten presionado el atajo</p>
              <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg inline-block">
                <p className="text-base font-mono text-primary">Cmd + Shift + Space</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
              <span className="text-primary-foreground font-poppins font-bold text-sm">3</span>
            </div>
            <div>
              <p className="text-sm font-poppins font-semibold text-card-foreground">Habla mientras mantienes presionado</p>
              <p className="text-xs text-muted-foreground font-roboto mt-1">VoxFlow graba y transcribe tu voz en tiempo real.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-poppins font-semibold text-card-foreground">Suelta y listo</p>
              <p className="text-xs text-muted-foreground font-roboto mt-1">Al soltar las teclas, el texto transcrito se pega automaticamente donde tengas el cursor.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-card shadow-card border border-border rounded-lg p-4 mb-6">
        <p className="text-xs text-muted-foreground font-roboto text-center leading-relaxed">
          <span className="text-primary-glow font-medium">Tip:</span> VoxFlow se queda en la barra del sistema (menu bar).
          Puedes cerrar esta ventana y seguir usandolo con el atajo de teclado en cualquier app.
        </p>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-poppins font-medium rounded-lg transition-smooth">
          Atras
        </button>
        <button
          onClick={onComplete}
          className="px-8 py-2.5 gradient-primary hover:opacity-90 text-primary-foreground font-poppins font-medium rounded-lg transition-smooth shadow-glow"
        >
          Empezar a usar VoxFlow
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
        {step === 4 && renderHowToUse()}
      </div>
    </div>
  );
};

export default Onboarding;
