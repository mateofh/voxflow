// ═══════════════════════════════════════════════════════════
// VoxFlow — Settings Types
// ═══════════════════════════════════════════════════════════

export type STTProvider = 'deepgram' | 'whisper-local';
export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'ollama' | 'custom';
export type TonePreset = 'professional' | 'casual' | 'technical' | 'creative' | 'concise' | 'empathetic' | 'custom';
export type RecordingMode = 'toggle' | 'push-to-talk';
export type WhisperModel = 'tiny' | 'base' | 'small' | 'medium' | 'large';

export interface ApiKeys {
  deepgram?: string;
  openai?: string;
  anthropic?: string;
  groq?: string;
  customEndpoint?: string;
  customApiKey?: string;
}

export interface STTSettings {
  provider: STTProvider;
  language: string;           // ISO 639-1 code or 'auto'
  whisperModel: WhisperModel;
}

export interface LLMSettings {
  provider: LLMProvider;
  model: string;              // e.g., 'gpt-4o-mini', 'claude-3-5-haiku', 'llama3.1:8b'
  ollamaEndpoint: string;     // default: 'http://localhost:11434'
  customEndpoint: string;     // for custom OpenAI-compatible endpoints
  enhancementEnabled: boolean;
  customPrompt: string;       // user's custom system prompt override
  temperature: number;        // 0.0 - 1.0, default 0.3
}

export interface AudioSettings {
  inputDeviceId: string;      // '' = system default
  soundFeedback: boolean;
  recordingMode: RecordingMode;
}

export interface HotkeySettings {
  dictation: string;          // e.g., 'CommandOrControl+Shift+Space'
  linkedinReply: string;      // e.g., 'CommandOrControl+Shift+L'
  cancelRecording: string;    // e.g., 'Escape'
}

export interface UserProfile {
  name: string;
  role: string;
  industry: string;
  tone: TonePreset;
  customToneInstruction: string;
  permanentInstructions: string;   // always appended to LLM context
  writingSamples: string[];        // 3-5 examples of user's writing
}

export interface AppSettings {
  apiKeys: ApiKeys;
  stt: STTSettings;
  llm: LLMSettings;
  audio: AudioSettings;
  hotkeys: HotkeySettings;
  profile: UserProfile;
  general: {
    launchAtStartup: boolean;
    showRecordingOverlay: boolean;
    language: string;              // UI language
    firstRunCompleted: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiKeys: {},
  stt: {
    provider: 'deepgram',
    language: 'auto',
    whisperModel: 'small',
  },
  llm: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    ollamaEndpoint: 'http://localhost:11434',
    customEndpoint: '',
    enhancementEnabled: true,
    customPrompt: '',
    temperature: 0.3,
  },
  audio: {
    inputDeviceId: '',
    soundFeedback: true,
    recordingMode: 'toggle',
  },
  hotkeys: {
    dictation: process.platform === 'darwin' ? 'Right Command' : 'Right Control',
    linkedinReply: 'CommandOrControl+Shift+L',
    cancelRecording: 'Escape',
  },
  profile: {
    name: '',
    role: '',
    industry: '',
    tone: 'professional',
    customToneInstruction: '',
    permanentInstructions: '',
    writingSamples: [],
  },
  general: {
    launchAtStartup: false,
    showRecordingOverlay: true,
    language: 'es',
    firstRunCompleted: false,
  },
};
