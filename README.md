# JARVIS — AI-Powered Desktop Assistant

> *Just A Rather Very Intelligent System*

A futuristic AI desktop assistant inspired by Tony Stark's JARVIS. Built with Electron, React, and Node.js.

![Dark Blue UI](https://img.shields.io/badge/UI-Dark_Blue_Futuristic-0ea5e9?style=flat-square)
![Electron](https://img.shields.io/badge/Electron-React-47848f?style=flat-square)
![AI Powered](https://img.shields.io/badge/AI-GPT--4.1-blueviolet?style=flat-square)

---

## Features

- **AI Chat** — Powered by OpenAI GPT-4.1 (or OpenRouter) with JARVIS personality
- **Password Protection** — Secure login with hashed passwords and brute-force lockout
- **Quick Shortcuts** — 30+ shortcuts to open websites instantly (`o yt`, `o g`, `o gh`...)
- **App Launcher** — Open local apps with commands (`app code`, `app chrome`...)
- **SearchAPI Integration** — Search the web from the chat
- **System Monitor** — Real-time CPU, RAM, and battery status
- **Local Memory** — Remembers conversation history and preferences
- **Futuristic UI** — Dark blue theme with cyan accents, arc reactor animation, particle effects, waveform visualizer

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind CSS v4 + Framer Motion |
| Backend | Node.js + Express |
| Desktop | Electron |
| AI | OpenAI API / OpenRouter |
| Search | SearchAPI |
| Database | Local JSON |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/farsinmahade-arch/jarvis-ai.git
cd jarvis-ai

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Run (Web Mode)

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Run (Electron Desktop Mode)

```bash
npm run electron:dev
```

---

## Project Structure

```
jarvis/
├── electron/          # Electron main process
│   ├── main.js
│   └── preload.js
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── ArcReactor.jsx
│       │   ├── ParticleBackground.jsx
│       │   ├── ShortcutsPanel.jsx
│       │   ├── SystemStatus.jsx
│       │   └── WaveformVisualizer.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   └── Dashboard.jsx
│       └── App.jsx
├── backend/           # Node.js + Express
│   ├── server.js
│   ├── auth.js
│   ├── ai/chat.js
│   ├── memory/
│   ├── commands/
│   └── search/
├── database/          # Local JSON storage (auto-created)
└── package.json
```

---

## Commands

Type these in the JARVIS chat:

| Command | Description |
|---------|-------------|
| `help` | Show all commands |
| `o yt` | Open YouTube |
| `o g` | Open Google |
| `o gh` | Open GitHub |
| `o gpt` | Open ChatGPT |
| `shortcuts` | List all 30+ shortcuts |
| `app code` | Launch VS Code |
| `app chrome` | Launch Chrome |
| `apps` | List all app shortcuts |
| `time` | Current time |
| `date` | Current date |
| `clear memory` | Reset conversation history |

Or just type anything to chat with the AI.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI chat | For AI features |
| `OPENAI_BASE_URL` | Custom API endpoint (OpenRouter, etc.) | No |
| `AI_MODEL` | AI model to use (default: `gpt-4.1-mini`) | No |
| `SEARCHAPI_KEY` | SearchAPI key for web search | For search |
| `PORT` | Backend port (default: `3001`) | No |

---

## Future Roadmap

- [ ] Voice Input (Whisper / Deepgram STT)
- [ ] Voice Output (ElevenLabs / Piper TTS)
- [ ] Wake Word Detection ("Hey Jarvis" via Porcupine)
- [ ] Vision System (webcam, screenshot analysis)
- [ ] Smart Home Integration (IoT devices)
- [ ] Autonomous Actions (browse web, manage files)

---

## License

MIT
