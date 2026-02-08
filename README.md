# VoxFlow

**Open-source AI voice-to-text for Mac & Windows.** Dictate naturally, get polished text — powered by your own API keys.

> Free alternative to Wispr Flow. No subscription. No limits. You own your data.

## Features

- **Voice to text anywhere** — Press a hotkey, speak, text appears where you're typing
- **AI enhancement** — Removes filler words, adds punctuation, formats intelligently
- **BYOK (Bring Your Own Key)** — Use your Deepgram, OpenAI, Anthropic, or Groq keys
- **Local models** — Run Whisper + Ollama for 100% offline, zero-cost operation
- **LinkedIn reply** — Copy a post, dictate your thoughts, get a polished comment
- **Cross-platform** — Works on macOS and Windows
- **Privacy-first** — Everything stored locally. No telemetry. No cloud dependency.

## Quick Start

### Download (recommended)

1. Go to [Releases](https://github.com/voxflow/voxflow/releases)
2. Download `VoxFlow.dmg` (Mac) or `VoxFlow-Setup.exe` (Windows)
3. Install and follow the 2-minute setup wizard

### Build from Source

```bash
git clone https://github.com/voxflow/voxflow.git
cd voxflow
npm install
npm start
```

## Setup

VoxFlow needs at least one API key to work (or local models):

| Provider | What it does | Cost | Get a key |
|----------|-------------|------|-----------|
| **Deepgram** | Speech-to-text (cloud) | ~$0.004/min | [deepgram.com](https://console.deepgram.com) |
| **OpenAI** | Text enhancement | ~$0.001/request | [platform.openai.com](https://platform.openai.com) |
| **Whisper** (local) | Speech-to-text (offline) | Free | Auto-downloaded |
| **Ollama** (local) | Text enhancement (offline) | Free | [ollama.com](https://ollama.com) |

## How It Works

1. Press your hotkey (default: Right ⌘ on Mac, Right Ctrl on Windows)
2. Speak naturally
3. Release or tap again to stop
4. Text appears where your cursor is — cleaned up and formatted

### LinkedIn Reply

1. Copy a LinkedIn post/comment (Ctrl+C)
2. Press Ctrl+Shift+L
3. Say what you want to reply
4. Review the generated comment in the popup
5. Accept → it's pasted into LinkedIn

## Tech Stack

- Electron + React + TypeScript
- Deepgram Nova-3 (cloud STT) / whisper.cpp (local STT)
- OpenAI GPT-4o-mini (cloud LLM) / Ollama (local LLM)
- SQLite for local storage
- Tailwind CSS for UI

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) — Free for individuals and companies.

## Enterprise

Need VoxFlow for your team? [Contact us](mailto:hello@voxflow.app) for shared dictionaries, admin dashboard, and priority support.

---

Built with voice, improved by AI.
