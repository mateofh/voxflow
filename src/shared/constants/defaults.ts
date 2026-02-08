// ═══════════════════════════════════════════════════════════
// VoxFlow — Default Constants
// ═══════════════════════════════════════════════════════════

/** Application metadata */
export const APP = {
  name: 'VoxFlow',
  version: '0.1.0',
  description: 'Open-source AI voice-to-text',
  website: 'https://github.com/voxflow/voxflow',
  repo: 'https://github.com/voxflow/voxflow',
} as const;

/** Audio recording defaults */
export const AUDIO = {
  sampleRate: 16000,          // 16kHz (required by Whisper and Deepgram)
  channels: 1,                // Mono
  bitDepth: 16,               // 16-bit PCM
  maxDurationMs: 300_000,     // 5 minutes max recording
  silenceThresholdMs: 1500,   // 1.5s of silence = end of speech
  vadSensitivity: 0.5,        // VAD threshold (0-1)
} as const;

/** STT provider defaults */
export const STT = {
  deepgram: {
    model: 'nova-3',
    language: 'multi',
    smartFormat: true,
    punctuate: true,
    interimResults: true,
  },
  whisper: {
    defaultModel: 'small',
    modelsDir: 'models/whisper',
    modelUrls: {
      tiny: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
      base: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
      small: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
      medium: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin',
    },
  },
} as const;

/** LLM defaults */
export const LLM = {
  defaultTimeout: 10_000,     // 10 seconds
  localTimeout: 30_000,       // 30 seconds for local models
  maxRetries: 2,
  enhancementMaxTokens: 2048,
  linkedInMaxTokens: 512,
} as const;

/** Hotkey defaults per platform */
export const HOTKEYS = {
  darwin: {
    dictation: 'Right Command',
    linkedinReply: 'Command+Shift+L',
    cancel: 'Escape',
  },
  win32: {
    dictation: 'Right Control',
    linkedinReply: 'Control+Shift+L',
    cancel: 'Escape',
  },
} as const;

/** Filler words to remove (Spanish + English) */
export const FILLER_WORDS = {
  es: [
    'ehh', 'ehhh', 'eh', 'este', 'esto', 'pues', 'bueno', 'o sea',
    'básicamente', 'digamos', 'a ver', 'como que', 'tipo', 'sabes',
    'mira', 'entonces', 'verdad', 'no sé', 'es que',
  ],
  en: [
    'umm', 'uh', 'uhh', 'um', 'like', 'you know', 'basically',
    'actually', 'literally', 'right', 'so yeah', 'I mean',
  ],
} as const;

/** LinkedIn reply constraints */
export const LINKEDIN = {
  maxReplyLength: 600,        // characters
  maxReplyLines: 5,
  popupWidth: 480,
  popupHeight: 400,
} as const;

/** Supported languages for STT */
export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Detección Automática' },
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
] as const;
