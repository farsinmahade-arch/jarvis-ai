"""Hearing Module - Voice recognition and wake word detection for JARVIS."""

from typing import Optional

from jarvis.core.config import Config


class HearingModule:
    """Advanced voice recognition with wake word detection and multiple engine support."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._recognizer: Optional[object] = None
        self._microphone_class: Optional[type] = None
        self._available = False
        self._init_speech()

    def _init_speech(self) -> None:
        try:
            import speech_recognition as sr

            self._recognizer = sr.Recognizer()
            self._microphone_class = sr.Microphone

            recognizer: sr.Recognizer = self._recognizer  # type: ignore[assignment]
            recognizer.energy_threshold = int(
                self._config.get("hearing.energy_threshold", 4000)
            )
            recognizer.pause_threshold = float(
                self._config.get("hearing.pause_threshold", 0.8)
            )
            recognizer.dynamic_energy_threshold = True
            self._available = True
        except (ImportError, OSError):
            self._available = False

    @property
    def is_available(self) -> bool:
        return self._available

    def listen(self, timeout: int = 5, phrase_limit: int = 10) -> Optional[str]:
        if not self._available:
            return None

        import speech_recognition as sr

        recognizer: sr.Recognizer = self._recognizer  # type: ignore[assignment]
        mic_class: type = self._microphone_class  # type: ignore[assignment]

        try:
            with mic_class() as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = recognizer.listen(
                    source, timeout=timeout, phrase_time_limit=phrase_limit
                )
            return self._recognize(audio)
        except sr.WaitTimeoutError:
            return None
        except Exception:
            return None

    def listen_for_wake_word(self, timeout: int = 30) -> bool:
        text = self.listen(timeout=timeout, phrase_limit=3)
        if text is None:
            return False
        return self._config.wake_word in text.lower()

    def listen_continuous(self) -> Optional[str]:
        return self.listen(timeout=10, phrase_limit=15)

    def _recognize(self, audio: object) -> Optional[str]:
        import speech_recognition as sr

        recognizer: sr.Recognizer = self._recognizer  # type: ignore[assignment]
        audio_data: sr.AudioData = audio  # type: ignore[assignment]
        engine = str(self._config.get("hearing.preferred_engine", "google"))

        engines = [engine] + [e for e in ["google", "sphinx"] if e != engine]

        for eng in engines:
            result = self._recognize_with_engine(recognizer, audio_data, eng)
            if result is not None:
                return result
        return None

    def _recognize_with_engine(
        self, recognizer: object, audio: object, engine: str
    ) -> Optional[str]:
        import speech_recognition as sr

        rec: sr.Recognizer = recognizer  # type: ignore[assignment]
        audio_data: sr.AudioData = audio  # type: ignore[assignment]

        try:
            if engine == "google":
                return str(rec.recognize_google(audio_data))
            if engine == "sphinx":
                return str(rec.recognize_sphinx(audio_data))
        except (sr.UnknownValueError, sr.RequestError):
            return None
        except Exception:
            return None
        return None

    def calibrate(self, duration: float = 2.0) -> bool:
        if not self._available:
            return False

        import speech_recognition as sr

        recognizer: sr.Recognizer = self._recognizer  # type: ignore[assignment]
        mic_class: type = self._microphone_class  # type: ignore[assignment]

        try:
            with mic_class() as source:
                recognizer.adjust_for_ambient_noise(source, duration=duration)
            return True
        except Exception:
            return False
