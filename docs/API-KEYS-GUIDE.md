# Guía de API Keys para VoxFlow

VoxFlow usa un modelo BYOK (Bring Your Own Key). Tú controlas qué servicios usas y cuánto pagas.

## Deepgram (Speech-to-Text)

**Costo estimado:** ~$0.004 por minuto de audio (~$0.24 por hora)

1. Ve a [console.deepgram.com](https://console.deepgram.com)
2. Crea una cuenta gratuita (incluye $200 de crédito)
3. Ve a Settings → API Keys → Create a Key
4. Copia la key y pégala en VoxFlow → Settings → API Keys → Deepgram

## OpenAI (Text Enhancement)

**Costo estimado:** ~$0.001 por request con GPT-4o-mini

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta y agrega crédito ($5 mínimo)
3. Ve a API Keys → Create new secret key
4. Copia la key y pégala en VoxFlow → Settings → API Keys → OpenAI

## Alternativas Gratuitas (Modelos Locales)

### Whisper (STT local, sin internet)

VoxFlow descarga automáticamente el modelo de Whisper. Solo selecciona "Whisper Local" en Settings.

| Modelo | Tamaño | Velocidad | Precisión |
|--------|--------|-----------|-----------|
| tiny | 75 MB | Muy rápido | Básica |
| base | 142 MB | Rápido | Buena |
| small | 466 MB | Medio | Muy buena |
| medium | 1.5 GB | Lento | Excelente |

### Ollama (LLM local, sin internet)

1. Instala Ollama: [ollama.com/download](https://ollama.com/download)
2. Descarga un modelo: `ollama pull llama3.1:8b`
3. Ollama corre automáticamente en el fondo
4. VoxFlow lo detecta automáticamente

## Costo Mensual Estimado

| Uso | Deepgram | OpenAI | Total |
|-----|----------|--------|-------|
| Casual (30 min/día) | ~$3.60 | ~$0.90 | ~$4.50/mes |
| Moderado (1 hr/día) | ~$7.20 | ~$1.80 | ~$9.00/mes |
| Intensivo (2 hr/día) | ~$14.40 | ~$3.60 | ~$18.00/mes |
| **100% Local** | **$0** | **$0** | **$0/mes** |
