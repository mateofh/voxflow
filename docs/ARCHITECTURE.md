# VoxFlow Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 Electron Main Process                     │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Hotkeys  │  │  Audio   │  │   Tray   │  │  IPC   │  │
│  │ (global)  │  │ (mic+VAD)│  │ (status) │  │ Bridge │  │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └───┬────┘  │
│       │              │                           │       │
│  ┌────▼──────────────▼───────────────────────────▼────┐  │
│  │              Pipeline Orchestrator                  │  │
│  │  audio → STT → Enhancement → Output                │  │
│  └──┬────────────┬────────────┬────────────┬──────────┘  │
│     │            │            │            │             │
│  ┌──▼──┐    ┌───▼───┐   ┌───▼───┐   ┌───▼────┐        │
│  │ STT  │    │  LLM  │   │Context│   │ Output │        │
│  │Module│    │Module │   │Module │   │(nut.js)│        │
│  └──────┘    └───────┘   └───────┘   └────────┘        │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │              SQLite (better-sqlite3)               │   │
│  │  settings │ profile │ dictionary │ history         │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              Electron Renderer Process                     │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │Onboarding│  │ Settings │  │  LinkedIn Reply Popup │   │
│  └──────────┘  └──────────┘  └──────────────────────┘   │
│                                                          │
│  React 19 + TypeScript + Tailwind CSS                    │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### Voice-to-Text (Standard)
```
Hotkey → Mic On → Audio Buffer → VAD → STT → Raw Text → LLM Enhancement → Insert at Cursor
```

### LinkedIn Reply
```
Clipboard (post) + Hotkey → Mic → STT → Intention → LLM (post + profile + intention) → Popup → Accept → Paste
```

## Module Responsibilities

| Module | Location | Responsibility |
|--------|----------|----------------|
| Hotkeys | `src/main/hotkeys.ts` | Register/unregister global shortcuts |
| Audio | `src/main/audio.ts` | Mic capture, PCM format, VAD |
| Tray | `src/main/tray.ts` | System tray icon, menu, status |
| STT | `src/stt/` | Speech-to-text (Deepgram or Whisper) |
| LLM | `src/llm/` | Text enhancement (OpenAI, Anthropic, etc.) |
| Context | `src/context/` | User profile, style, knowledge base |
| LinkedIn | `src/linkedin/` | Clipboard capture, reply generation |
| DB | `src/db/` | SQLite CRUD operations |
| Output | `src/main/` | Text insertion via nut.js |

## Security Model

- API keys: stored in OS keychain (never in files)
- Audio: deleted immediately after transcription
- Data: all local in SQLite, encrypted at rest
- Communication: HTTPS only for API calls
- Telemetry: none
