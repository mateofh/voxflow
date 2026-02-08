# Guía Paso a Paso: Construir VoxFlow con Claude Code

> Esta guía es para alguien que nunca ha usado Claude Code para un proyecto. Cada paso es detallado y asume cero experiencia previa.

---

## Paso 0: Preparar tu Computadora

### Instalar las herramientas necesarias

**Mac:**
```bash
# 1. Instalar Homebrew (gestor de paquetes de Mac)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Instalar Node.js 20+
brew install node

# 3. Instalar Git
brew install git

# 4. Verificar instalación
node --version   # Debe mostrar v20.x.x o superior
npm --version    # Debe mostrar 10.x.x o superior
git --version    # Debe mostrar 2.x.x
```

**Windows:**
1. Descargar e instalar [Node.js 20 LTS](https://nodejs.org/) (Next > Next > Install)
2. Descargar e instalar [Git for Windows](https://git-scm.com/download/win) (Next > Next > Install)
3. Abrir PowerShell y verificar:
```powershell
node --version
npm --version
git --version
```

### Instalar Claude Code

```bash
# Instalar Claude Code globalmente
npm install -g @anthropic-ai/claude-code

# Verificar
claude --version
```

> Si no tienes una API key de Anthropic, puedes obtener una en [console.anthropic.com](https://console.anthropic.com). Claude Code necesita esta key para funcionar.

---

## Paso 1: Crear el Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repo: `voxflow`
3. Descripción: "Open-source AI voice-to-text desktop app"
4. Marca "Public" y "Add a README file"
5. License: MIT
6. Click "Create repository"

### Clonar y subir los archivos base

```bash
# Clonar tu repo
git clone https://github.com/TU-USUARIO/voxflow.git
cd voxflow

# Copiar todos los archivos del proyecto que generamos
# (los que están en la carpeta voxflow-project)

# Agregar todo y hacer commit
git add .
git commit -m "Initial project structure with CLAUDE.md and base files"
git push origin main
```

---

## Paso 2: Tu Primera Sesión con Claude Code

### Abrir Claude Code en el proyecto

```bash
# Navegar a tu proyecto
cd ~/ruta/a/tu/voxflow

# Iniciar Claude Code
claude
```

Claude Code se abrirá en tu terminal. Verá automáticamente el archivo `CLAUDE.md` y entenderá el contexto completo del proyecto.

### Tu primer comando

Escribe esto en Claude Code:

```
Lee el CLAUDE.md y confirma que entiendes el proyecto.
Luego, implementa la Semana 1 del MVP:
1. Setup de Electron + React + TypeScript + Vite
2. System tray con icono y menú básico
3. Global hotkey configurable
4. Captura de audio del micrófono
5. Indicador visual de grabación en el tray
```

> **Tip:** Claude Code leerá el `CLAUDE.md`, entenderá la arquitectura, y empezará a generar código. Va a crear archivos, instalar dependencias, y configurar todo.

---

## Paso 3: Semana 1 — Skeleton + Audio

### Lo que Claude va a hacer:
1. Configurar Vite para Electron
2. Crear el proceso main con system tray
3. Registrar hotkeys globales
4. Implementar captura de audio del micrófono
5. Integrar VAD (Voice Activity Detection)

### Comandos sugeridos para Claude:

```
Implementa src/main/index.ts: entry point de Electron.
Debe crear un BrowserWindow oculto, inicializar el system tray,
registrar el hotkey global, y manejar el ciclo de vida de la app.
Sigue las reglas del CLAUDE.md.
```

Después:

```
Implementa src/main/audio.ts: módulo de captura de audio.
Usa Web Audio API + node-record-lpcm16.
Debe capturar PCM 16kHz mono.
Integra @ricky0123/vad-web para detectar fin de habla.
```

### Probar lo que se construyó:

```bash
npm start
```

**Checklist Semana 1:**
- [ ] La app se abre y muestra un icono en el system tray
- [ ] Al hacer click en el icono, aparece un menú con opciones
- [ ] El hotkey global funciona (presionar Right Command/Ctrl)
- [ ] Al activar, el icono cambia de color (indicando grabación)
- [ ] Se captura audio del micrófono correctamente
- [ ] La grabación se detiene automáticamente después de silencio

---

## Paso 4: Semana 2 — STT + Inserción

### Comandos para Claude:

```
Implementa src/stt/deepgram.ts: cliente de Deepgram streaming.
Usa el SDK @deepgram/sdk para transcripción en tiempo real.
Sigue la interface STTProviderInterface de src/shared/types/stt.ts.
Emite eventos 'partial' y 'final' durante el streaming.
```

```
Implementa la inserción de texto en la posición del cursor
usando nut.js. Cuando el STT devuelve texto final, debe
escribirse automáticamente donde el usuario tiene el cursor.
Agrega feedback sonoro al inicio y fin de grabación.
```

### Probar:

```bash
# Primero, agrega tu Deepgram API key en el código (temporalmente para testing)
# O crea un archivo .env.development

npm start
```

**Checklist Semana 2:**
- [ ] Al dictar, el texto aparece en cualquier app (Chrome, VS Code, etc.)
- [ ] La transcripción es precisa y en el idioma correcto
- [ ] Se escucha un sonido al iniciar y terminar grabación
- [ ] El icono del tray cambia durante la grabación
- [ ] La latencia es < 2 segundos (con Deepgram)

---

## Paso 5: Semana 3 — Enhancement + BYOK

### Comandos para Claude:

```
Implementa src/llm/openai.ts: cliente de OpenAI para text enhancement.
Sigue la interface LLMProviderInterface de src/shared/types/llm.ts.
Usa el prompt de prompts/enhancement.md como system prompt.
Inyecta las variables de contexto (perfil, app activa, etc.)
```

```
Implementa la página de Settings (src/renderer/pages/Settings.tsx):
- Sección de API Keys con inputs seguros (password type)
- Dropdown de proveedor STT (Deepgram / Whisper Local)
- Dropdown de proveedor LLM (OpenAI / Anthropic / Groq / Ollama)
- Toggle de Enhancement ON/OFF
- Campo de prompt personalizado
- Selector de hotkey
- Selector de dispositivo de audio
Guarda en SQLite via IPC. Keys en el keychain del OS.
```

**Checklist Semana 3:**
- [ ] El texto sale limpio (sin muletillas, con puntuación)
- [ ] El Settings panel funciona y guarda correctamente
- [ ] Las API keys se guardan de forma segura
- [ ] Se puede cambiar entre Enhancement ON y OFF
- [ ] El prompt personalizado modifica el comportamiento del LLM

---

## Paso 6: Semana 4 — Packaging + Polish

### Comandos para Claude:

```
Implementa el First-Run Wizard (src/renderer/pages/Onboarding.tsx):
5 pasos: Bienvenida → Permisos de micrófono → API Keys → Test Drive → Completado.
Debe ser visualmente atractivo y guiar al usuario paso a paso.
```

```
Configura electron-builder para generar instaladores:
- Mac: .dmg con drag-to-Applications
- Windows: .exe con NSIS installer
- Auto-updater via GitHub Releases
Usa la configuración de electron-builder.yml
```

**Checklist Semana 4:**
- [ ] El onboarding guía correctamente al usuario
- [ ] Se genera un .dmg funcional en Mac
- [ ] Se genera un .exe funcional en Windows
- [ ] El auto-updater detecta nuevas versiones
- [ ] Un usuario no-técnico puede instalar y usar en < 5 minutos

---

## Tips para Trabajar con Claude Code

### Prompts Efectivos

**Bueno:**
```
Implementa src/stt/deepgram.ts siguiendo la interface
STTProviderInterface. Usa @deepgram/sdk con streaming.
Referencia las constantes de src/shared/constants/defaults.ts.
```

**Malo:**
```
haz el speech to text
```

### Cuando algo no funciona

```
El error es: [pega el error aquí]
El archivo problemático es src/main/audio.ts.
¿Puedes diagnosticar y arreglar?
```

### Para revisar código

```
Revisa src/stt/deepgram.ts. ¿Hay problemas de rendimiento,
seguridad, o errores potenciales? Sugiere mejoras.
```

### Para agregar features

```
Agrega soporte para Anthropic Claude en src/llm/.
Sigue el mismo patrón que src/llm/openai.ts.
Usa el SDK @anthropic-ai/sdk.
```

---

## Estructura de Sesiones Recomendada

| Sesión | Duración | Objetivo |
|--------|----------|----------|
| 1 | 2-3 horas | Setup + Tray + Hotkey + Audio capture |
| 2 | 2-3 horas | Deepgram STT + Text insertion |
| 3 | 2-3 horas | OpenAI enhancement + Settings UI |
| 4 | 2-3 horas | BYOK (API keys seguras) + Testing |
| 5 | 2-3 horas | Onboarding wizard + Polish |
| 6 | 2-3 horas | Packaging (.dmg + .exe) + GitHub Release |
| 7 | 2-3 horas | Testing completo + fixes finales |

**Total estimado:** ~15-20 horas de trabajo con Claude Code

---

## Después del MVP

Una vez que el MVP funciona, pide a Claude:

```
Lee el CLAUDE.md sección "Features Post-MVP".
Implementa F9: Respuesta Inteligente en LinkedIn.
Usa el approach clipboard-based descrito en el PRD.
```

Y así sucesivamente con cada feature del roadmap.

---

## Recursos

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Deepgram SDK Docs](https://developers.deepgram.com/docs/js-sdk)
- [OpenAI SDK Docs](https://platform.openai.com/docs)
- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp)
