<p align="center">
  <img src="assets/icons/voxflow-logo.png" alt="VoxFlow Logo" width="120" />
</p>

<h1 align="center">VoxFlow</h1>

<p align="center">
  <strong>Open-source voice-to-text desktop app powered by AI</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://github.com/voxflow/voxflow/releases"><img src="https://img.shields.io/github/v/release/voxflow/voxflow?label=Release" alt="GitHub Release" /></a>
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform: macOS | Windows | Linux" />
</p>

<p align="center">
  Dictate naturally, get polished text — powered by your own API keys.<br/>
  Free alternative to Wispr Flow. No subscription. No limits. You own your data.
</p>

---

## Features

- **Real-time voice to text** -- Streaming speech-to-text via Deepgram Nova-3 with sub-300ms latency
- **AI text enhancement** -- Removes filler words, adds punctuation, and formats intelligently using OpenAI GPT-4o-mini
- **Global hotkey** -- Press `Cmd+Shift+Space` (configurable) to start/stop recording from any application
- **Voice Activity Detection** -- Automatically detects when you stop speaking and processes the audio
- **BYOK (Bring Your Own Key)** -- Use your own Deepgram, OpenAI, Anthropic, Groq, or Ollama keys. No vendor lock-in
- **System tray integration** -- Lives in your menu bar with recording state indicators and quick access menu
- **Secure API key storage** -- Keys are stored in your OS keychain via keytar, never in plain text
- **Cross-platform** -- Runs on macOS, Windows, and Linux
- **Dark-first futuristic UI** -- Clean, modern interface built with Tailwind CSS and Framer Motion
- **LinkedIn reply mode** -- Copy a post, dictate your thoughts, and get a polished comment ready to paste
- **Local model support** -- Run Whisper + Ollama for fully offline, zero-cost operation

## Quick Start

### Prerequisites

- **Node.js** 20+ (see [nodejs.org](https://nodejs.org))
- **npm** (included with Node.js)

### Install and Run

```bash
# Clone the repository
git clone https://github.com/voxflow/voxflow.git
cd voxflow

# Install dependencies
npm install

# Start in development mode with hot reload
npm start
```

### Download Pre-built Binaries

Pre-built installers are available on the [Releases](https://github.com/voxflow/voxflow/releases) page:

- **macOS:** `VoxFlow.dmg`
- **Windows:** `VoxFlow-Setup.exe`
- **Linux:** `VoxFlow.AppImage`

### First Run

On first launch, VoxFlow opens a setup wizard that walks you through:

1. Granting microphone permissions
2. Entering your API keys (Deepgram for speech-to-text, OpenAI for enhancement)
3. Configuring your preferred hotkey
4. A quick test drive to verify everything works

## API Keys Setup

VoxFlow uses a BYOK (Bring Your Own Key) model. Your keys are stored securely in your operating system's keychain and never leave your machine.

### Deepgram (Required for cloud STT)

Deepgram provides the real-time streaming speech-to-text engine.

1. Create a free account at [console.deepgram.com](https://console.deepgram.com)
2. Navigate to **API Keys** and create a new key
3. Paste the key into VoxFlow's settings or the first-run wizard

Deepgram offers a generous free tier. Typical usage costs approximately **$0.004 per minute** of audio.

### OpenAI (Optional, for text enhancement)

OpenAI powers the AI text enhancement that cleans up, formats, and improves your dictated text.

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Navigate to **API Keys** and generate a new secret key
3. Paste the key into VoxFlow's settings

Enhancement is optional. Without an OpenAI key, VoxFlow will insert the raw transcribed text. Cost is approximately **$0.001 per enhancement request** using GPT-4o-mini.

### Alternative Providers

VoxFlow also supports these providers for text enhancement:

| Provider | Type | Notes |
|----------|------|-------|
| **Anthropic (Claude)** | Cloud LLM | Requires API key |
| **Groq** | Cloud LLM | Fast inference, requires API key |
| **Ollama** | Local LLM | Fully offline, free. Install from [ollama.com](https://ollama.com) |
| **Custom endpoint** | Cloud LLM | Any OpenAI-compatible API |
| **Whisper (whisper.cpp)** | Local STT | Fully offline alternative to Deepgram |

## Usage

### Voice-to-Text

1. **Press your hotkey** (default: `Cmd+Shift+Space` on macOS, `Ctrl+Shift+Space` on Windows/Linux) from any application
2. **Speak naturally** -- the system tray icon changes to indicate recording is active
3. **Stop recording** by pressing the hotkey again, or let Voice Activity Detection (VAD) automatically detect when you stop speaking
4. **Text appears** at your cursor position in whatever application you were using, cleaned up and formatted

### Voice Activity Detection (VAD)

When VAD is enabled, VoxFlow listens for speech and automatically stops recording after you pause. No need to press the hotkey again. This is the recommended mode for a hands-free experience. A safety timeout of 5 minutes prevents accidental indefinite recording.

### Text Enhancement

Toggle enhancement on or off from the system tray menu or the settings page:

- **Enhancement ON:** Your dictated text is sent through the configured LLM (e.g., GPT-4o-mini) which removes filler words, adds proper punctuation, and formats the text naturally
- **Enhancement OFF:** Raw transcription is inserted directly, as-is from the STT engine

If the LLM encounters an error, VoxFlow gracefully falls back to inserting the raw transcription so you never lose your work.

### LinkedIn Reply Mode

1. **Copy** a LinkedIn post or comment to your clipboard (`Ctrl+C` / `Cmd+C`)
2. **Press** the LinkedIn hotkey (`Ctrl+Shift+L` / `Cmd+Shift+L`)
3. **Dictate** what you want to reply (e.g., "I agree with this and want to add that...")
4. **Review** the generated response in the popup window
5. **Accept**, edit, or regenerate -- accepted text is copied to your clipboard and auto-pasted

### Settings

Open settings from the system tray menu to configure:

- API keys for all providers
- Preferred STT and LLM providers
- Hotkey bindings
- Enhancement prompts and tone presets (professional, casual, etc.)
- User profile (name, role, writing style) for personalized output
- Custom dictionary for domain-specific terms
- Audio input device selection

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Electron 33](https://www.electronjs.org/) | Desktop application framework |
| [React 19](https://react.dev/) | UI component library |
| [TypeScript 5.7](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |
| [Vite 6](https://vite.dev/) | Build tool and dev server |
| [Deepgram SDK](https://developers.deepgram.com/) | Real-time streaming speech-to-text (Nova-3) |
| [OpenAI SDK](https://platform.openai.com/docs) | LLM text enhancement (GPT-4o-mini) |
| [keytar](https://github.com/nicedoc/keytar) | Secure API key storage via OS keychain |
| [nut.js](https://nutjs.dev/) | Cross-platform keyboard simulation for text insertion |
| [electron-updater](https://www.electron.build/auto-update) | Auto-update via GitHub Releases |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Local SQLite database for settings and history |
| [Framer Motion](https://www.framer.com/motion/) | UI animations |
| [Zustand](https://zustand.docs.pmnd.rs/) | Lightweight state management |
| [Radix UI](https://www.radix-ui.com/) | Accessible UI primitives |
| [Vitest](https://vitest.dev/) | Unit testing framework |

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    UI Layer (React)                    │
│  System Tray │ Settings │ Onboarding │ LinkedIn Popup │
├──────────────────────────────────────────────────────┤
│               Electron IPC Bridge                     │
├──────────────────────────────────────────────────────┤
│  Audio Layer  │  STT Layer  │  Enhancement  │ Output  │
│  mic capture  │  Deepgram   │  LLM post-    │ cursor  │
│  VAD          │  whisper    │  processing   │ insert  │
├──────────────────────────────────────────────────────┤
│  Context Layer (SQLite)                               │
│  user profile │ dictionary │ style │ knowledge base  │
└──────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User presses global hotkey
2. Main process starts microphone capture (PCM 16-bit, 16kHz, mono)
3. VAD detects end of speech --> stops recording
4. Audio buffer is sent to the STT provider (Deepgram or Whisper)
5. STT returns raw transcription text
6. If enhancement is ON:
   a. Context is assembled (user profile, active app, tone preset)
   b. LLM provider receives prompt + raw text
   c. LLM returns enhanced text
7. nut.js simulates keyboard typing to insert text at the cursor
8. System tray icon returns to idle state with audio feedback
```

## Development

### Commands

```bash
npm start          # Start dev mode with hot reload
npm run build      # Production build
npm run package    # Create platform installers
npm run test       # Run tests (Vitest)
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
npm run format     # Run Prettier
npm run typecheck  # TypeScript type checking (no emit)
```

### Project Structure

```
voxflow/
├── src/
│   ├── main/               # Electron main process
│   │   ├── index.ts        # Entry point, BrowserWindow, tray
│   │   ├── tray.ts         # System tray icon and context menu
│   │   ├── hotkeys.ts      # Global hotkey registration
│   │   ├── audio.ts        # Microphone capture and VAD
│   │   ├── ipc-handlers.ts # IPC handlers (main <-> renderer)
│   │   └── updater.ts      # Auto-update via GitHub Releases
│   │
│   ├── renderer/           # React frontend
│   │   ├── App.tsx         # Root component + routing
│   │   ├── pages/          # Onboarding, Settings, LinkedInReply
│   │   ├── components/     # RecordingOverlay, ApiKeyInput, etc.
│   │   ├── hooks/          # useRecording, useSettings, etc.
│   │   └── styles/         # Global CSS
│   │
│   ├── shared/             # Code shared between main and renderer
│   │   ├── types/          # TypeScript type definitions
│   │   ├── constants/      # Default values and configuration
│   │   └── utils/          # Platform utilities
│   │
│   ├── stt/                # Speech-to-Text providers
│   │   ├── deepgram.ts     # Deepgram streaming client
│   │   └── whisper.ts      # whisper.cpp local bindings
│   │
│   ├── llm/                # LLM providers for text enhancement
│   │   ├── openai.ts       # OpenAI client
│   │   ├── anthropic.ts    # Anthropic/Claude client
│   │   ├── groq.ts         # Groq client
│   │   ├── ollama.ts       # Ollama local client
│   │   └── custom.ts       # Custom OpenAI-compatible endpoint
│   │
│   ├── context/            # Personal context engine
│   │   ├── profile.ts      # User profile (name, role, tone)
│   │   ├── style.ts        # Writing style analysis
│   │   └── knowledge.ts    # Knowledge base (future RAG support)
│   │
│   ├── linkedin/           # LinkedIn reply integration
│   │   ├── capture.ts      # Clipboard-based context capture
│   │   └── generate.ts     # Response generation
│   │
│   └── db/                 # Local SQLite database
│       ├── index.ts        # Connection and migrations
│       ├── settings.ts     # Settings CRUD
│       ├── dictionary.ts   # Custom dictionary CRUD
│       ├── history.ts      # Transcription history CRUD
│       └── schema.sql      # Database schema
│
├── prompts/                # LLM system prompts
│   ├── enhancement.md      # Text enhancement prompt
│   ├── linkedin-reply.md   # LinkedIn reply prompt
│   └── tone-presets.json   # Tone presets (professional, casual, etc.)
│
├── assets/                 # Icons and sounds
├── scripts/                # Build and dev scripts
├── docs/                   # Documentation
└── .github/                # CI/CD workflows and issue templates
```

### Key Conventions

- All code is strict TypeScript (`strict: true`)
- File names use kebab-case; React components use PascalCase
- Absolute imports via tsconfig paths: `@main/`, `@renderer/`, `@shared/`
- All heavy logic (audio, STT, LLM, DB) runs in the Electron main process
- The renderer only handles UI; all communication goes through the IPC bridge with `contextIsolation: true`

## Building

Create platform-specific installers using electron-builder:

```bash
# macOS (.dmg)
npm run package:mac

# Windows (.exe via NSIS)
npm run package:win

# Linux (.AppImage, .deb)
npm run package:linux

# All platforms (current OS only)
npm run package
```

Build output is written to the `dist/` directory. Auto-update is configured via GitHub Releases using `electron-updater`.

## Contributing

Contributions are welcome! Whether it is a bug fix, new feature, documentation improvement, or idea for discussion, we appreciate your help.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes and ensure tests pass (`npm run test && npm run typecheck`)
4. Commit your changes with a descriptive message
5. Push to your fork and open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE). Free for individuals and companies.

## Acknowledgments

VoxFlow is built on the shoulders of these excellent projects and services:

- [Deepgram](https://deepgram.com) -- Real-time speech-to-text API powering VoxFlow's core transcription
- [OpenAI](https://openai.com) -- GPT-4o-mini for intelligent text enhancement
- [Electron](https://www.electronjs.org/) -- Cross-platform desktop application framework
- [React](https://react.dev/) -- UI component library
- [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/) -- Accessible, composable UI primitives
- [Tailwind CSS](https://tailwindcss.com/) -- Utility-first CSS framework
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) -- Local speech-to-text via whisper-node
- [Ollama](https://ollama.com/) -- Local LLM inference for offline operation

---

<p align="center">Built with voice, improved by AI.</p>
