"""Configuration management for JARVIS."""

import json
import os
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).parent.parent / "data"
FACE_DATA_DIR = DATA_DIR / "face_data"
CONFIG_FILE = DATA_DIR / "config.json"

DEFAULT_CONFIG = {
    "assistant_name": "JARVIS",
    "owner_name": "Sir",
    "wake_word": "jarvis",
    "voice_speed": 175,
    "voice_volume": 1.0,
    "voice_id": 0,
    "theme_color": "cyan",
    "ai_provider": "openai",
    "ai_model": "gpt-4",
    "security": {
        "password_enabled": True,
        "face_lock_enabled": True,
        "max_login_attempts": 3,
        "lockout_duration_seconds": 300,
    },
    "hearing": {
        "energy_threshold": 4000,
        "pause_threshold": 0.8,
        "phrase_time_limit": 10,
        "preferred_engine": "google",
    },
}


class Config:
    """Manages JARVIS configuration with file persistence."""

    def __init__(self) -> None:
        self._config: dict[str, Any] = {}
        self._ensure_dirs()
        self._load()

    def _ensure_dirs(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        FACE_DATA_DIR.mkdir(parents=True, exist_ok=True)

    def _load(self) -> None:
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, "r") as f:
                self._config = json.load(f)
        else:
            self._config = DEFAULT_CONFIG.copy()
            self._save()

    def _save(self) -> None:
        with open(CONFIG_FILE, "w") as f:
            json.dump(self._config, f, indent=2)

    def get(self, key: str, default: Any = None) -> Any:
        keys = key.split(".")
        value: Any = self._config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default
            if value is None:
                return default
        return value

    def set(self, key: str, value: Any) -> None:
        keys = key.split(".")
        config = self._config
        for k in keys[:-1]:
            if k not in config or not isinstance(config[k], dict):
                config[k] = {}
            config = config[k]
        config[keys[-1]] = value
        self._save()

    @property
    def assistant_name(self) -> str:
        return str(self.get("assistant_name", "JARVIS"))

    @property
    def owner_name(self) -> str:
        return str(self.get("owner_name", "Sir"))

    @property
    def openai_api_key(self) -> str:
        return os.environ.get("OPENAI_API_KEY", "")

    @property
    def wake_word(self) -> str:
        return str(self.get("wake_word", "jarvis")).lower()
