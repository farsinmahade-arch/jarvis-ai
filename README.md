# 🤖 J.A.R.V.I.S - AI-Powered Personal Assistant

> *Just A Rather Very Intelligent System*

An advanced AI-powered personal assistant inspired by Tony Stark's JARVIS. Features voice recognition, text-to-speech, face lock authentication, password protection, and a sleek terminal UI.

```
       ___   ___  ______  _   __  ___  _____
      / / | / _ \/ __/ / | | / / /  _|/ ___/
 __  / /| |/ , _/\ \/ /  | |/ / _/ / _\ \
/___/_/ |_/_/|_/___/___/  |___/ /___//___/
```

---

## ✨ Features

### 🧠 AI Brain
- **OpenAI GPT Integration** — Full conversational AI with GPT-4/3.5
- **Conversation Memory** — Remembers context across your session
- **Smart Fallback** — Rule-based responses when offline (jokes, wiki, system info)

### 🎤 Hearing Module (Voice Recognition)
- **Multi-engine support** — Google Speech, CMU Sphinx
- **Wake word detection** — Say "Jarvis" to activate
- **Auto-calibration** — Adapts to ambient noise
- **Voice & text modes** — Switch seamlessly between input methods

### 🔊 Voice Engine (Text-to-Speech)
- **Natural speech output** via pyttsx3
- **Adjustable speed & volume** — Real-time control
- **Multiple voice options** — Male/female voices

### 🔒 Password Protection
- **Secure hashing** with SHA-256 + random salt
- **Brute-force protection** — Auto-lockout after failed attempts
- **First-time setup wizard** — Guided password creation
- **Password change** — Secure in-session password updates

### 👤 Face Lock
- **Biometric authentication** using face_recognition + OpenCV
- **Multi-sample enrollment** — 5-sample averaging for accuracy
- **Real-time verification** — Camera-based face scanning
- **Visual UI** — Live camera feed with status overlay

### 🌅 Wake-up Call System
- **Time-aware greetings** — Different messages for morning/afternoon/evening/night
- **System status report** — CPU, RAM, battery on boot
- **Motivational messages** — Randomized greetings to start your day

### 🎨 Themed Terminal UI
- **Iron Man inspired** — Cyan/gold color scheme
- **ASCII art boot screen** — Animated JARVIS logo
- **Module loading animation** — Visual system boot sequence
- **Rich formatting** — Tables, panels, colored output
- **Typing effects** — Simulated typing for immersion

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- A microphone (for voice features)
- A webcam (for face lock)
- PortAudio (for PyAudio)

### Installation

```bash
# Clone the repository
git clone https://github.com/farsinmahade-arch/jarvis-ai.git
cd jarvis-ai

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install system dependencies (Linux)
sudo apt-get install -y portaudio19-dev python3-dev cmake

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Set OpenAI API key for full AI features
export OPENAI_API_KEY="your-api-key-here"

# Launch JARVIS
python -m jarvis.main
```

### macOS
```bash
brew install portaudio cmake
pip install -r requirements.txt
```

### Windows
```bash
pip install pipwin
pipwin install pyaudio
pip install -r requirements.txt
```

---

## 🎮 Usage

### Text Mode (Default)
```
► You: hello
◉ JARVIS: Hello Sir. How may I assist you today?

► You: tell me about quantum computing
◉ JARVIS: [AI-powered response about quantum computing]

► You: what's the system status
◉ JARVIS: CPU Usage: 12% | RAM: 45% used (8GB / 16GB) | Battery: 87% (Charging)
```

### Voice Mode
```
► You: voice mode
✓ Voice mode activated. I'm listening.
◎ LISTENING... (speak now)
► You: what time is it
◉ JARVIS: The current time is 02:30 PM, Sir.
```

### Commands
| Command | Description |
|---------|-------------|
| `help` | Show all commands |
| `voice mode` | Switch to voice input |
| `text mode` | Switch to text input |
| `wake up` | Get wake-up call with date/time |
| `time` / `date` | Current time or date |
| `system` / `status` | System information |
| `joke` | Tell a joke |
| `open <website>` | Open a website |
| `search <query>` | Wikipedia search |
| `volume up/down` | Adjust speech volume |
| `speed up/down` | Adjust speech speed |
| `voices` | List available voices |
| `voice <id>` | Change voice |
| `settings` | Show settings |
| `change password` | Change login password |
| `clear memory` | Clear AI conversation history |
| `exit` / `quit` | Shut down JARVIS |

---

## 🔐 Security Setup

### First Launch
1. JARVIS prompts you to create a password
2. Optionally enroll your face for Face Lock
3. On subsequent launches, authenticate with password + face

### Face Lock
- Enrollment captures 5 face samples for accuracy
- Verification uses 0.5 tolerance for reliable matching
- Face data stored locally in `jarvis/data/face_data/`

---

## ⚙️ Configuration

Settings are stored in `jarvis/data/config.json`:

```json
{
  "assistant_name": "JARVIS",
  "owner_name": "Sir",
  "wake_word": "jarvis",
  "voice_speed": 175,
  "voice_volume": 1.0,
  "theme_color": "cyan",
  "ai_provider": "openai",
  "ai_model": "gpt-4",
  "security": {
    "password_enabled": true,
    "face_lock_enabled": true,
    "max_login_attempts": 3,
    "lockout_duration_seconds": 300
  }
}
```

---

## 📁 Project Structure

```
jarvis-ai/
├── jarvis/
│   ├── __init__.py
│   ├── main.py              # Entry point & main loop
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py         # Configuration management
│   │   └── brain.py          # AI brain (OpenAI + fallback)
│   ├── modules/
│   │   ├── __init__.py
│   │   ├── hearing.py        # Voice recognition
│   │   ├── voice.py          # Text-to-speech
│   │   ├── greeting.py       # Wake-up call system
│   │   └── commands.py       # Command processor
│   ├── security/
│   │   ├── __init__.py
│   │   ├── password.py       # Password protection
│   │   └── face_lock.py      # Face lock authentication
│   ├── ui/
│   │   ├── __init__.py
│   │   └── theme.py          # Terminal UI theme
│   └── data/
│       └── face_data/        # Face enrollment data
├── requirements.txt
├── setup.py
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| AI Engine | OpenAI GPT-4 / GPT-3.5 |
| Voice Recognition | SpeechRecognition + PyAudio |
| Text-to-Speech | pyttsx3 |
| Face Recognition | face_recognition + OpenCV |
| Password Security | SHA-256 + random salt |
| Terminal UI | Rich + pyfiglet |
| System Monitor | psutil |

---

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

*"I am JARVIS. I am here to assist you."*
