"""Command Processing Module for JARVIS."""

import subprocess
import sys
import webbrowser
from typing import Optional

from jarvis.core.config import Config


# Quick-open shortcuts: type "o <key>" to instantly open
SHORTCUTS: dict[str, str] = {
    # Websites
    "yt": "https://www.youtube.com",
    "g": "https://www.google.com",
    "gh": "https://www.github.com",
    "gm": "https://mail.google.com",
    "gd": "https://drive.google.com",
    "gp": "https://photos.google.com",
    "maps": "https://maps.google.com",
    "news": "https://news.google.com",
    "rd": "https://www.reddit.com",
    "tw": "https://www.twitter.com",
    "ig": "https://www.instagram.com",
    "fb": "https://www.facebook.com",
    "li": "https://www.linkedin.com",
    "so": "https://stackoverflow.com",
    "wp": "https://www.wikipedia.org",
    "amz": "https://www.amazon.com",
    "nf": "https://www.netflix.com",
    "sp": "https://open.spotify.com",
    "dc": "https://discord.com/app",
    "wa": "https://web.whatsapp.com",
    "tg": "https://web.telegram.org",
    "gpt": "https://chat.openai.com",
    "pin": "https://www.pinterest.com",
    "tt": "https://www.tiktok.com",
    # Dev tools
    "npm": "https://www.npmjs.com",
    "pypi": "https://pypi.org",
    "codepen": "https://codepen.io",
    "figma": "https://www.figma.com",
    "notion": "https://www.notion.so",
    "vercel": "https://vercel.com",
}

# App shortcuts: type "app <key>" to launch local apps
APP_SHORTCUTS: dict[str, dict[str, str]] = {
    "code": {"linux": "code", "darwin": "open -a 'Visual Studio Code'", "win32": "code"},
    "chrome": {"linux": "google-chrome", "darwin": "open -a 'Google Chrome'", "win32": "start chrome"},
    "firefox": {"linux": "firefox", "darwin": "open -a Firefox", "win32": "start firefox"},
    "terminal": {"linux": "gnome-terminal", "darwin": "open -a Terminal", "win32": "start cmd"},
    "files": {"linux": "nautilus", "darwin": "open ~", "win32": "explorer"},
    "calc": {"linux": "gnome-calculator", "darwin": "open -a Calculator", "win32": "calc"},
    "notepad": {"linux": "gedit", "darwin": "open -a TextEdit", "win32": "notepad"},
    "music": {"linux": "rhythmbox", "darwin": "open -a Music", "win32": "start wmplayer"},
    "settings": {"linux": "gnome-control-center", "darwin": "open -a 'System Preferences'", "win32": "start ms-settings:"},
}


class CommandProcessor:
    """Processes and executes user commands."""

    COMMANDS: dict[str, str] = {
        "help": "Show available commands",
        "time": "Tell the current time",
        "date": "Tell the current date",
        "system": "Show system information",
        "joke": "Tell a joke",
        "search <query>": "Search Wikipedia",
        "open <website>": "Open a website in browser",
        "o <shortcut>": "Quick open (o yt, o g, o gh...)",
        "shortcuts": "List all shortcuts",
        "app <name>": "Launch app (code, chrome, files...)",
        "apps": "List all app shortcuts",
        "volume up": "Increase voice volume",
        "volume down": "Decrease voice volume",
        "speed up": "Increase speech speed",
        "speed down": "Decrease speech speed",
        "voices": "List available voices",
        "voice <id>": "Switch voice",
        "clear memory": "Clear conversation history",
        "change password": "Change login password",
        "settings": "Show current settings",
        "exit / quit / shutdown": "Shut down JARVIS",
    }

    def __init__(self, config: Config) -> None:
        self._config = config

    def is_exit_command(self, text: str) -> bool:
        exit_words = ["exit", "quit", "shutdown", "shut down", "goodbye", "bye", "terminate"]
        return any(word in text.lower() for word in exit_words)

    def is_command(self, text: str) -> bool:
        command_triggers = [
            "open ", "search ", "volume ", "speed ", "voice ",
            "help", "voices", "settings", "clear memory", "change password",
            "o ", "shortcuts", "app ", "apps",
        ]
        lower = text.lower().strip()
        return any(lower.startswith(t) or lower == t for t in command_triggers)

    def execute(self, text: str) -> Optional[str]:
        lower = text.lower().strip()

        if lower == "help":
            return self._help()

        if lower == "shortcuts":
            return self._list_shortcuts()

        if lower == "apps":
            return self._list_apps()

        if lower.startswith("o "):
            return self._quick_open(lower[2:].strip())

        if lower.startswith("app "):
            return self._launch_app(lower[4:].strip())

        if lower.startswith("open "):
            return self._open_website(text[5:].strip())

        if lower == "settings":
            return self._show_settings()

        return None

    def _help(self) -> str:
        lines = ["Available Commands:"]
        for cmd, desc in self.COMMANDS.items():
            lines.append(f"  {cmd:25s} - {desc}")
        return "\n".join(lines)

    def _quick_open(self, shortcut: str) -> str:
        key = shortcut.lower().strip()
        if key in SHORTCUTS:
            url = SHORTCUTS[key]
            try:
                webbrowser.open(url)
                return f"Opening {key} → {url}"
            except Exception:
                return f"Could not open {key}."

        close_matches = [k for k in SHORTCUTS if k.startswith(key[:1])]
        if close_matches:
            suggestions = ", ".join(close_matches[:5])
            return f"Unknown shortcut '{key}'. Did you mean: {suggestions}? Type 'shortcuts' for full list."
        return f"Unknown shortcut '{key}'. Type 'shortcuts' to see all available shortcuts."

    def _list_shortcuts(self) -> str:
        lines = ["Quick-Open Shortcuts (type 'o <key>'):"]
        lines.append("")
        lines.append("  WEBSITES:")
        for key, url in SHORTCUTS.items():
            name = url.replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")
            lines.append(f"    o {key:10s} → {name}")
        lines.append("")
        lines.append("  TIP: You can also type 'o <any-url>' to open any URL directly.")
        return "\n".join(lines)

    def _list_apps(self) -> str:
        lines = ["App Shortcuts (type 'app <name>'):"]
        lines.append("")
        for name in APP_SHORTCUTS:
            lines.append(f"    app {name}")
        return "\n".join(lines)

    def _launch_app(self, app_name: str) -> str:
        key = app_name.lower().strip()
        if key not in APP_SHORTCUTS:
            available = ", ".join(APP_SHORTCUTS.keys())
            return f"Unknown app '{key}'. Available: {available}"

        platform_cmds = APP_SHORTCUTS[key]
        platform = sys.platform
        if platform.startswith("linux"):
            cmd = platform_cmds.get("linux")
        elif platform == "darwin":
            cmd = platform_cmds.get("darwin")
        else:
            cmd = platform_cmds.get("win32")

        if not cmd:
            return f"No command configured for '{key}' on this platform."

        try:
            subprocess.Popen(
                cmd.split(),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return f"Launching {key}..."
        except FileNotFoundError:
            return f"Could not find '{key}'. It may not be installed."
        except Exception:
            return f"Failed to launch '{key}'."

    def _open_website(self, query: str) -> str:
        sites: dict[str, str] = {
            "google": "https://www.google.com",
            "youtube": "https://www.youtube.com",
            "github": "https://www.github.com",
            "gmail": "https://mail.google.com",
            "maps": "https://maps.google.com",
            "news": "https://news.google.com",
            "reddit": "https://www.reddit.com",
            "stackoverflow": "https://stackoverflow.com",
            "twitter": "https://www.twitter.com",
            "linkedin": "https://www.linkedin.com",
        }

        lower = query.lower()
        if lower in sites:
            url = sites[lower]
        elif lower in SHORTCUTS:
            url = SHORTCUTS[lower]
        elif query.startswith("http"):
            url = query
        else:
            url = f"https://www.google.com/search?q={query.replace(' ', '+')}"

        try:
            webbrowser.open(url)
            return f"Opening {query} in your browser."
        except Exception:
            return f"Could not open {query}."

    def _show_settings(self) -> str:
        lines = [
            "Current Settings:",
            f"  Assistant Name: {self._config.get('assistant_name')}",
            f"  Owner Name:     {self._config.get('owner_name')}",
            f"  Wake Word:      {self._config.get('wake_word')}",
            f"  Voice Speed:    {self._config.get('voice_speed')}",
            f"  Voice Volume:   {self._config.get('voice_volume')}",
            f"  AI Provider:    {self._config.get('ai_provider')}",
            f"  AI Model:       {self._config.get('ai_model')}",
            f"  Password Lock:  {'Enabled' if self._config.get('security.password_enabled') else 'Disabled'}",
            f"  Face Lock:      {'Enabled' if self._config.get('security.face_lock_enabled') else 'Disabled'}",
        ]
        return "\n".join(lines)
