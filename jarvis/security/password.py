"""Password Protection System for JARVIS."""

import hashlib
import json
import time

from jarvis.core.config import Config, DATA_DIR


CREDENTIALS_FILE = DATA_DIR / "credentials.dat"


class PasswordManager:
    """Secure password authentication system with lockout protection."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._failed_attempts = 0
        self._lockout_until: float = 0
        self._credentials: dict[str, str] = {}
        self._load_credentials()

    @property
    def is_enabled(self) -> bool:
        return bool(self._config.get("security.password_enabled", True))

    @property
    def is_configured(self) -> bool:
        return bool(self._credentials.get("password_hash"))

    @property
    def is_locked_out(self) -> bool:
        if self._lockout_until > time.time():
            return True
        if self._lockout_until > 0:
            self._lockout_until = 0
            self._failed_attempts = 0
        return False

    @property
    def lockout_remaining(self) -> int:
        if self.is_locked_out:
            return int(self._lockout_until - time.time())
        return 0

    def _load_credentials(self) -> None:
        if CREDENTIALS_FILE.exists():
            try:
                with open(CREDENTIALS_FILE, "r") as f:
                    self._credentials = json.load(f)
            except (json.JSONDecodeError, OSError):
                self._credentials = {}

    def _save_credentials(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(CREDENTIALS_FILE, "w") as f:
            json.dump(self._credentials, f)

    def _hash_password(self, password: str) -> str:
        salt = self._credentials.get("salt", "jarvis_secure_salt_2024")
        return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

    def setup_password(self, password: str) -> bool:
        if len(password) < 4:
            return False
        import secrets

        salt = secrets.token_hex(16)
        self._credentials["salt"] = salt
        self._credentials["password_hash"] = hashlib.sha256(
            f"{salt}{password}".encode()
        ).hexdigest()
        self._save_credentials()
        return True

    def verify_password(self, password: str) -> bool:
        if self.is_locked_out:
            return False

        if not self.is_configured:
            return False

        password_hash = self._hash_password(password)
        if password_hash == self._credentials.get("password_hash"):
            self._failed_attempts = 0
            return True

        self._failed_attempts += 1
        max_attempts = int(self._config.get("security.max_login_attempts", 3))
        if self._failed_attempts >= max_attempts:
            lockout_duration = int(
                self._config.get("security.lockout_duration_seconds", 300)
            )
            self._lockout_until = time.time() + lockout_duration
        return False

    def change_password(self, old_password: str, new_password: str) -> bool:
        if not self.verify_password(old_password):
            return False
        return self.setup_password(new_password)

    @property
    def attempts_remaining(self) -> int:
        max_attempts = int(self._config.get("security.max_login_attempts", 3))
        return max(0, max_attempts - self._failed_attempts)
