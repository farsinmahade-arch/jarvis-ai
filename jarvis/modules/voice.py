"""Voice Module - Text-to-speech engine for JARVIS."""

import threading
from typing import Optional

from jarvis.core.config import Config


class VoiceModule:
    """Text-to-speech engine with configurable voice parameters."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._engine: Optional[object] = None
        self._available = False
        self._lock = threading.Lock()
        self._init_engine()

    def _init_engine(self) -> None:
        try:
            import pyttsx3

            self._engine = pyttsx3.init()
            engine: pyttsx3.Engine = self._engine  # type: ignore[assignment]
            engine.setProperty("rate", int(self._config.get("voice_speed", 175)))
            engine.setProperty("volume", float(self._config.get("voice_volume", 1.0)))

            voices = engine.getProperty("voices")
            voice_id = int(self._config.get("voice_id", 0))
            if voices and voice_id < len(voices):
                engine.setProperty("voice", voices[voice_id].id)

            self._available = True
        except Exception:
            self._available = False

    @property
    def is_available(self) -> bool:
        return self._available

    def speak(self, text: str) -> None:
        if not self._available or not text:
            return

        import pyttsx3

        with self._lock:
            engine: pyttsx3.Engine = self._engine  # type: ignore[assignment]
            try:
                engine.say(text)
                engine.runAndWait()
            except Exception:
                pass

    def set_speed(self, rate: int) -> None:
        if not self._available:
            return
        import pyttsx3

        engine: pyttsx3.Engine = self._engine  # type: ignore[assignment]
        engine.setProperty("rate", rate)
        self._config.set("voice_speed", rate)

    def set_volume(self, volume: float) -> None:
        if not self._available:
            return
        import pyttsx3

        volume = max(0.0, min(1.0, volume))
        engine: pyttsx3.Engine = self._engine  # type: ignore[assignment]
        engine.setProperty("volume", volume)
        self._config.set("voice_volume", volume)

    def set_voice(self, voice_id: int) -> bool:
        if not self._available:
            return False
        import pyttsx3

        engine: pyttsx3.Engine = self._engine  # type: ignore[assignment]
        voices = engine.getProperty("voices")
        if voices and voice_id < len(voices):
            engine.setProperty("voice", voices[voice_id].id)
            self._config.set("voice_id", voice_id)
            return True
        return False

    def list_voices(self) -> list[str]:
        if not self._available:
            return []
        import pyttsx3

        engine: pyttsx3.Engine = self._engine  # type: ignore[assignment]
        voices = engine.getProperty("voices")
        return [f"[{i}] {v.name}" for i, v in enumerate(voices)]
