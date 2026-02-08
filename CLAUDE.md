# CLAUDE.md — Instrucciones para Claude Code

## Descripción del Proyecto

**VoxFlow** es una aplicación de escritorio open source (Electron + React + TypeScript) que convierte voz en texto mejorado por IA. Funciona como alternativa gratuita a Wispr Flow con modelo BYOK (Bring Your Own Key).

## Stack Tecnológico

- **Desktop:** Electron 33+
- **Frontend:** React 19 + TypeScript 5.5+ + Tailwind CSS v4
- **Audio:** Web Audio API + node-record-lpcm16
- **STT Cloud:** Deepgram Nova-3 (streaming real-time)
- **STT Local:** whisper.cpp via whisper-node
- **LLM Cloud:** OpenAI GPT-4o-mini (default), soporta Claude, Groq, custom endpoints
- **LLM Local:** Ollama (API compatible con OpenAI)
- **Base de datos:** SQLite (better-sqlite3)
- **Inserción de texto:** nut.js (cross-platform keyboard simulation)
- **Hotkeys:** electron-globalShortcut + uIOhook
- **Seguridad de keys:** keytar (OS keychain)
- **Build:** electron-builder
- **Tests:** Vitest + Playwright

## Arquitectura

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

## Estructura del Proyecto

```
voxflow/
├── CLAUDE.md              # ← ESTÁS AQUÍ
├── package.json
├── tsconfig.json
├── electron-builder.yml
├── tailwind.config.ts
├── vite.config.ts
├── src/
│   ├── main/              # Proceso principal de Electron
│   │   ├── index.ts       # Entry point, crear BrowserWindow, tray
│   │   ├── tray.ts        # System tray (icono, menú contextual)
│   │   ├── hotkeys.ts     # Global hotkey registration
│   │   ├── audio.ts       # Captura de micrófono, VAD
│   │   ├── ipc-handlers.ts # Handlers IPC (main ↔ renderer)
│   │   └── updater.ts     # Auto-update via GitHub Releases
│   │
│   ├── renderer/          # Frontend React
│   │   ├── App.tsx        # Root component + routing
│   │   ├── main.tsx       # React entry point
│   │   ├── index.html     # HTML shell
│   │   ├── pages/
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── LinkedInReply.tsx
│   │   ├── components/
│   │   │   ├── RecordingOverlay.tsx  # Barra flotante durante grabación
│   │   │   ├── ApiKeyInput.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   └── LinkedInPopup.tsx
│   │   ├── hooks/
│   │   │   ├── useRecording.ts
│   │   │   ├── useSettings.ts
│   │   │   └── useLinkedIn.ts
│   │   └── styles/
│   │       └── globals.css
│   │
│   ├── shared/            # Código compartido main ↔ renderer
│   │   ├── types/
│   │   │   ├── settings.ts
│   │   │   ├── stt.ts
│   │   │   ├── llm.ts
│   │   │   └── linkedin.ts
│   │   ├── constants/
│   │   │   └── defaults.ts
│   │   └── utils/
│   │       └── platform.ts
│   │
│   ├── stt/               # Speech-to-Text
│   │   ├── index.ts       # STT router (cloud vs local)
│   │   ├── deepgram.ts    # Deepgram streaming client
│   │   ├── whisper.ts     # whisper.cpp local bindings
│   │   └── types.ts
│   │
│   ├── llm/               # Large Language Models
│   │   ├── index.ts       # LLM router (selección de provider)
│   │   ├── openai.ts      # OpenAI client
│   │   ├── anthropic.ts   # Anthropic/Claude client
│   │   ├── groq.ts        # Groq client
│   │   ├── ollama.ts      # Ollama local client
│   │   ├── custom.ts      # Custom OpenAI-compatible endpoint
│   │   └── types.ts
│   │
│   ├── context/           # Contexto personal
│   │   ├── profile.ts     # Perfil de usuario (nombre, rol, tono)
│   │   ├── style.ts       # Análisis de estilo de escritura
│   │   └── knowledge.ts   # Base de conocimiento (v2.0: RAG)
│   │
│   ├── linkedin/          # LinkedIn integration
│   │   ├── capture.ts     # Captura de contexto via clipboard
│   │   ├── generate.ts    # Generación de respuesta
│   │   └── types.ts
│   │
│   └── db/                # Base de datos local
│       ├── index.ts       # SQLite connection + migrations
│       ├── settings.ts    # CRUD de settings
│       ├── dictionary.ts  # CRUD de diccionario
│       ├── history.ts     # CRUD de historial
│       └── schema.sql     # Schema inicial
│
├── prompts/               # System prompts para LLM
│   ├── enhancement.md     # Prompt de mejora de texto
│   ├── linkedin-reply.md  # Prompt de respuesta LinkedIn
│   └── tone-presets.json  # Presets de tono (profesional, casual, etc.)
│
├── assets/
│   ├── icons/             # Iconos de app y tray
│   └── sounds/            # Sonidos de feedback
│
├── docs/                  # Documentación
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── API-KEYS-GUIDE.md
│
├── scripts/               # Build & dev scripts
│   ├── download-whisper-model.ts
│   └── setup-dev.ts
│
└── .github/
    ├── workflows/
    │   ├── build.yml      # CI: lint + test + build
    │   └── release.yml    # CD: build installers + GitHub Release
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

## Reglas de Desarrollo

### Generales
- Todo el código en TypeScript estricto (`strict: true`)
- Usar `async/await` en lugar de callbacks o `.then()`
- Nombres de archivos en kebab-case, componentes en PascalCase
- Importaciones absolutas usando paths de tsconfig (`@main/`, `@renderer/`, `@shared/`, etc.)
- Comentarios en inglés, UI en español con soporte i18n futuro
- Nunca hardcodear API keys. Siempre usar keytar (OS keychain)

### Electron
- Toda la lógica pesada (audio, STT, LLM, DB) corre en el proceso main
- El renderer solo maneja UI. Toda comunicación via IPC (contextBridge + preload)
- Habilitar `contextIsolation: true`, `nodeIntegration: false`
- Usar `safeStorage` de Electron para encriptar datos sensibles

### React / Frontend
- Componentes funcionales con hooks. Nunca clases.
- Tailwind para estilos. No CSS modules ni styled-components
- Estado global mínimo: usar zustand si se necesita estado compartido
- Componentes pequeños y enfocados (<100 líneas idealmente)

### Audio
- Formato: PCM 16-bit, 16kHz, mono
- VAD: usar `@ricky0123/vad-web` para detectar fin de habla automáticamente
- Siempre liberar recursos de audio al terminar grabación
- Timeout de seguridad: máximo 5 minutos de grabación continua

### STT (Speech-to-Text)
- Default: Deepgram Nova-3 streaming (latencia <300ms)
- Fallback: whisper.cpp local (modelo `small` por defecto)
- Interface unificada `STTProvider` con método `transcribe(audioBuffer): Promise<string>`
- Streaming: emitir resultados parciales via EventEmitter

### LLM (Text Enhancement)
- Default: OpenAI GPT-4o-mini
- Interface unificada `LLMProvider` con método `enhance(text, context): Promise<string>`
- Todos los providers usan el mismo formato de prompt (ver `/prompts/`)
- Timeout: 10 segundos máximo por request
- Si el LLM falla, insertar texto crudo (no perder el trabajo del usuario)

### Base de Datos
- SQLite via `better-sqlite3` (síncrono, más rápido que alternativas async)
- Migrations versionadas en `/src/db/migrations/`
- Schema definido en `/src/db/schema.sql`
- Nunca SQL directo en componentes. Usar funciones de acceso en `/src/db/`

### LinkedIn Reply
- Método: clipboard-based (no web scraping, no browser extension)
- Flujo: usuario copia post → hotkey → dicta intención → popup con respuesta → aceptar/editar → paste
- El popup es una ventana Electron separada (BrowserWindow pequeña, siempre on-top)

## Flujo de Datos Principal

```
1. Usuario presiona hotkey global
2. main/hotkeys.ts → emite evento 'recording:start'
3. main/audio.ts → inicia captura de micrófono (PCM 16kHz)
4. VAD detecta fin de habla → emite 'recording:stop'
5. Audio buffer → stt/index.ts → selecciona provider (Deepgram o Whisper)
6. STT devuelve texto crudo
7. Si enhancement está ON:
   a. Construye contexto (perfil + app activa + tono)
   b. llm/index.ts → selecciona provider → envía prompt + texto
   c. LLM devuelve texto mejorado
8. Output: nut.js simula typing del texto en la app activa
9. Feedback: sonido + icono de tray vuelve a estado idle
```

## Flujo LinkedIn Reply

```
1. Usuario copia post/comment de LinkedIn al clipboard (Ctrl+C)
2. Presiona hotkey de LinkedIn (Ctrl+Shift+L)
3. main → lee clipboard → abre popup de LinkedIn
4. Usuario dicta su intención ("quiero decir que...")
5. Intención → STT → texto crudo
6. LLM recibe: post original + perfil + estilo + intención
7. Popup muestra respuesta generada
8. Usuario: Aceptar / Editar / Regenerar / Cancelar
9. Al aceptar: texto se copia al clipboard + auto-paste si es posible
```

## Comandos Útiles

```bash
npm start          # Dev mode con hot reload
npm run build      # Build de producción
npm run package    # Crear instaladores (Mac .dmg + Windows .exe)
npm run test       # Correr tests
npm run lint       # ESLint + Prettier
npm run typecheck  # TypeScript check sin emitir
```

## Prioridades del MVP (Semanas 1-4)

### Semana 1: Skeleton + Audio
- [ ] Setup proyecto Electron + React + TypeScript + Vite
- [ ] System tray con icono y menú básico
- [ ] Global hotkey (configurable, default: Right Command/Right Ctrl)
- [ ] Captura de audio del micrófono → buffer PCM
- [ ] VAD para detectar fin de habla

### Semana 2: STT + Inserción
- [ ] Integración Deepgram streaming (real-time)
- [ ] Inserción de texto en posición del cursor (nut.js)
- [ ] Feedback visual (icono de tray cambia durante grabación)
- [ ] Feedback sonoro (sonidos start/stop)

### Semana 3: Enhancement + BYOK
- [ ] Integración OpenAI GPT-4o-mini para text enhancement
- [ ] Panel de Settings con inputs de API keys
- [ ] Almacenamiento seguro de keys (keytar)
- [ ] Toggle Enhancement ON/OFF
- [ ] Prompt personalizable

### Semana 4: Packaging + Polish
- [ ] First-run wizard (permisos, API keys, test drive)
- [ ] electron-builder: .dmg (Mac) + .exe (Windows)
- [ ] Auto-updater via GitHub Releases
- [ ] README.md completo
- [ ] GitHub Release con instaladores

## Variables de Entorno (desarrollo)

No se usan variables de entorno en producción (BYOK). Solo para desarrollo local:

```env
# .env.development (NUNCA commitear)
DEEPGRAM_API_KEY=tu-key-de-desarrollo
OPENAI_API_KEY=tu-key-de-desarrollo
```

## Dependencias Principales

```json
{
  "dependencies": {
    "electron": "^33.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@deepgram/sdk": "^3.0.0",
    "openai": "^4.0.0",
    "better-sqlite3": "^11.0.0",
    "keytar": "^7.9.0",
    "nut-js": "^4.0.0",
    "@ricky0123/vad-web": "^0.0.18",
    "electron-updater": "^6.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "electron-builder": "^25.0.0",
    "vitest": "^2.0.0",
    "playwright": "^1.48.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```
