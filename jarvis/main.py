"""JARVIS - AI-Powered Personal Assistant - Main Entry Point."""

import sys
import signal
import getpass
from typing import Optional

from jarvis.core.config import Config
from jarvis.core.brain import Brain
from jarvis.modules.hearing import HearingModule
from jarvis.modules.voice import VoiceModule
from jarvis.modules.greeting import GreetingModule
from jarvis.modules.commands import CommandProcessor
from jarvis.security.password import PasswordManager
from jarvis.security.face_lock import FaceLock
from jarvis.ui.theme import JarvisTheme


class Jarvis:
    """Main JARVIS application controller."""

    def __init__(self) -> None:
        self.config = Config()
        self.theme = JarvisTheme(str(self.config.get("theme_color", "cyan")))
        self.brain = Brain(self.config)
        self.hearing = HearingModule(self.config)
        self.voice = VoiceModule(self.config)
        self.greeting = GreetingModule(self.config)
        self.commands = CommandProcessor(self.config)
        self.password_manager = PasswordManager(self.config)
        self.face_lock = FaceLock(self.config)
        self._running = False
        self._voice_mode = False

    def boot(self) -> None:
        signal.signal(signal.SIGINT, self._handle_signal)
        self.theme.show_boot_screen()
        self._load_modules()
        if not self._authenticate():
            self.theme.show_error("Authentication failed. Access denied.")
            sys.exit(1)
        self._welcome()
        self._running = True
        self._main_loop()

    def _load_modules(self) -> None:
        modules = [
            ("AI Core", True),
            ("Voice Engine", self.voice.is_available),
            ("Hearing Module", self.hearing.is_available),
            ("Password Security", self.password_manager.is_enabled),
            ("Face Recognition", self.face_lock.is_available),
            ("Command Processor", True),
            ("Greeting System", True),
        ]
        for name, available in modules:
            self.theme.show_module_status(name, available)

        self.theme.console.print()

    def _authenticate(self) -> bool:
        password_ok = self._password_auth()
        if not password_ok:
            return False

        face_ok = self._face_auth()
        if not face_ok:
            return False

        return True

    def _password_auth(self) -> bool:
        if not self.password_manager.is_enabled:
            return True

        if not self.password_manager.is_configured:
            self.theme.show_security_prompt("First-time setup: Create your JARVIS password")
            while True:
                password = getpass.getpass("  Enter new password (min 4 chars): ")
                if len(password) < 4:
                    self.theme.show_error("Password must be at least 4 characters.")
                    continue
                confirm = getpass.getpass("  Confirm password: ")
                if password != confirm:
                    self.theme.show_error("Passwords do not match.")
                    continue
                if self.password_manager.setup_password(password):
                    self.theme.show_success("Password configured successfully.")
                    return True
                self.theme.show_error("Failed to set password.")
                return False

        self.theme.show_security_prompt("Enter your password to access JARVIS")
        while True:
            if self.password_manager.is_locked_out:
                remaining = self.password_manager.lockout_remaining
                self.theme.show_error(
                    f"Account locked. Try again in {remaining} seconds."
                )
                return False

            password = getpass.getpass("  Password: ")
            if self.password_manager.verify_password(password):
                self.theme.show_success("Password verified.")
                return True

            remaining = self.password_manager.attempts_remaining
            if remaining > 0:
                self.theme.show_error(
                    f"Incorrect password. {remaining} attempts remaining."
                )
            else:
                self.theme.show_error("Too many failed attempts. Account locked.")
                return False

    def _face_auth(self) -> bool:
        if not self.face_lock.is_enabled or not self.face_lock.is_available:
            return True

        if not self.face_lock.is_configured:
            self.theme.show_security_prompt(
                "Face Lock setup: Look at the camera to enroll your face"
            )
            self.theme.show_info("Press Enter to start enrollment, or 's' to skip...")
            choice = input("  > ").strip().lower()
            if choice == "s":
                self.theme.show_warning("Face lock skipped.")
                return True
            self.theme.show_info("Look at the camera. Collecting face samples...")
            if self.face_lock.enroll_face():
                self.theme.show_success("Face enrolled successfully.")
            else:
                self.theme.show_warning("Face enrollment failed. Skipping face lock.")
            return True

        self.theme.show_security_prompt("Face verification required. Look at the camera.")
        if self.face_lock.verify_face():
            self.theme.show_success("Face verified. Welcome back.")
            return True

        self.theme.show_error("Face verification failed.")
        return False

    def _welcome(self) -> None:
        greeting = self.greeting.get_greeting()
        self.theme.show_greeting(greeting)
        self._speak(greeting)

        status = self.greeting.get_status_report()
        self.theme.show_info(status.replace("\n", "\n  "))

    def _main_loop(self) -> None:
        self.theme.show_divider()
        self.theme.show_info(
            "Type commands or speak naturally. Say 'help' for commands. "
            "Say 'voice mode' to switch to voice input."
        )
        self.theme.show_divider()

        while self._running:
            try:
                if self._voice_mode:
                    user_input = self._voice_input()
                else:
                    user_input = self.theme.show_user_input_prompt()

                if not user_input or not user_input.strip():
                    continue

                self._process_input(user_input.strip())

            except (EOFError, KeyboardInterrupt):
                self._shutdown()
                break

    def _voice_input(self) -> Optional[str]:
        self.theme.show_listening()
        text = self.hearing.listen_continuous()
        if text:
            self.theme.console.print(f"  [bold green]► You:[/] {text}")
            return text

        self.theme.show_warning("Could not understand. Try again or type 'text mode'.")
        fallback = self.theme.show_user_input_prompt()
        return fallback

    def _process_input(self, text: str) -> None:
        if self.commands.is_exit_command(text):
            self._shutdown()
            return

        lower = text.lower().strip()

        if lower == "voice mode":
            if self.hearing.is_available:
                self._voice_mode = True
                msg = "Voice mode activated. I'm listening."
                self.theme.show_success(msg)
                self._speak(msg)
            else:
                self.theme.show_error(
                    "Voice input unavailable. Install PyAudio and SpeechRecognition."
                )
            return

        if lower == "text mode":
            self._voice_mode = False
            self.theme.show_success("Text mode activated.")
            return

        if lower == "help":
            self.theme.show_help_table(CommandProcessor.COMMANDS)
            return

        if lower == "clear memory":
            self.brain.clear_memory()
            msg = "Conversation memory cleared."
            self.theme.show_success(msg)
            self._speak(msg)
            return

        if lower == "wake up":
            msg = self.greeting.get_wake_up_message()
            self.theme.show_response(msg)
            self._speak(msg)
            return

        if lower.startswith("volume "):
            self._handle_volume(lower)
            return

        if lower.startswith("speed "):
            self._handle_speed(lower)
            return

        if lower == "voices":
            voices = self.voice.list_voices()
            if voices:
                for v in voices:
                    self.theme.show_info(v)
            else:
                self.theme.show_warning("No voices available.")
            return

        if lower.startswith("voice "):
            try:
                vid = int(text.split()[-1])
                if self.voice.set_voice(vid):
                    self.theme.show_success(f"Voice changed to {vid}.")
                else:
                    self.theme.show_error("Invalid voice ID.")
            except ValueError:
                self.theme.show_error("Usage: voice <id>")
            return

        if lower == "change password":
            self._change_password()
            return

        if lower == "settings":
            result = self.commands.execute(text)
            if result:
                self.theme.show_info(result.replace("\n", "\n  "))
            return

        if lower == "status":
            status = self.greeting.get_status_report()
            self.theme.show_info(status.replace("\n", "\n  "))
            return

        if self.commands.is_command(text):
            result = self.commands.execute(text)
            if result:
                self.theme.show_response(result)
                self._speak(result)
            return

        self.theme.show_processing()
        response = self.brain.think(text)
        self.theme.show_response(response)
        self._speak(response)

    def _handle_volume(self, text: str) -> None:
        if "up" in text:
            current = float(self.config.get("voice_volume", 1.0))
            new_vol = min(1.0, current + 0.1)
            self.voice.set_volume(new_vol)
            self.theme.show_success(f"Volume: {new_vol:.0%}")
        elif "down" in text:
            current = float(self.config.get("voice_volume", 1.0))
            new_vol = max(0.0, current - 0.1)
            self.voice.set_volume(new_vol)
            self.theme.show_success(f"Volume: {new_vol:.0%}")
        else:
            self.theme.show_error("Usage: volume up / volume down")

    def _handle_speed(self, text: str) -> None:
        if "up" in text:
            current = int(self.config.get("voice_speed", 175))
            new_speed = min(300, current + 25)
            self.voice.set_speed(new_speed)
            self.theme.show_success(f"Speed: {new_speed} WPM")
        elif "down" in text:
            current = int(self.config.get("voice_speed", 175))
            new_speed = max(50, current - 25)
            self.voice.set_speed(new_speed)
            self.theme.show_success(f"Speed: {new_speed} WPM")
        else:
            self.theme.show_error("Usage: speed up / speed down")

    def _change_password(self) -> None:
        old_pw = getpass.getpass("  Current password: ")
        new_pw = getpass.getpass("  New password (min 4 chars): ")
        if len(new_pw) < 4:
            self.theme.show_error("Password must be at least 4 characters.")
            return
        confirm = getpass.getpass("  Confirm new password: ")
        if new_pw != confirm:
            self.theme.show_error("Passwords do not match.")
            return
        if self.password_manager.change_password(old_pw, new_pw):
            self.theme.show_success("Password changed successfully.")
        else:
            self.theme.show_error("Current password is incorrect.")

    def _speak(self, text: str) -> None:
        if self.voice.is_available:
            self.voice.speak(text)

    def _shutdown(self) -> None:
        self._running = False
        msg = f"Goodbye, {self.config.owner_name}. Shutting down."
        self._speak(msg)
        self.theme.show_shutdown()

    def _handle_signal(self, signum: int, frame: object) -> None:
        self._shutdown()
        sys.exit(0)


def main() -> None:
    jarvis = Jarvis()
    jarvis.boot()


if __name__ == "__main__":
    main()
