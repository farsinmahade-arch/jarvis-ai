"""AI Brain module - handles intelligent responses using OpenAI or fallback."""

import datetime
from typing import Optional

from jarvis.core.config import Config


class Brain:
    """AI-powered brain for JARVIS with conversation memory."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._client: Optional[object] = None
        self._conversation_history: list[dict[str, str]] = []
        self._ai_available = False
        self._init_ai()

    def _init_ai(self) -> None:
        api_key = self._config.openai_api_key
        if not api_key:
            self._ai_available = False
            return

        try:
            from openai import OpenAI

            self._client = OpenAI(api_key=api_key)
            self._ai_available = True
        except ImportError:
            self._ai_available = False

    @property
    def system_prompt(self) -> str:
        now = datetime.datetime.now()
        return (
            f"You are {self._config.assistant_name}, an advanced AI personal assistant "
            f"inspired by Tony Stark's JARVIS. You are sophisticated, witty, and highly "
            f"capable. You address your user as '{self._config.owner_name}'. "
            f"Current date/time: {now.strftime('%A, %B %d, %Y at %I:%M %p')}. "
            f"Keep responses concise but helpful. Be proactive in offering assistance. "
            f"You have a calm, professional demeanor with subtle humor."
        )

    def think(self, user_input: str) -> str:
        if self._ai_available:
            return self._think_with_ai(user_input)
        return self._think_with_fallback(user_input)

    def _think_with_ai(self, user_input: str) -> str:
        from openai import OpenAI

        client: OpenAI = self._client  # type: ignore[assignment]
        self._conversation_history.append({"role": "user", "content": user_input})

        if len(self._conversation_history) > 20:
            self._conversation_history = self._conversation_history[-20:]

        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(self._conversation_history)

        try:
            model = str(self._config.get("ai_model", "gpt-4"))
            response = client.chat.completions.create(
                model=model,
                messages=messages,  # type: ignore[arg-type]
                max_tokens=500,
                temperature=0.7,
            )
            reply = response.choices[0].message.content or "I'm processing that, one moment."
            self._conversation_history.append({"role": "assistant", "content": reply})
            return reply
        except Exception:
            return self._think_with_fallback(user_input)

    def _think_with_fallback(self, user_input: str) -> str:
        """Rule-based fallback when AI API is unavailable."""
        text = user_input.lower().strip()
        name = self._config.owner_name

        if any(w in text for w in ["hello", "hi", "hey", "greetings"]):
            return f"Hello {name}. How may I assist you today?"

        if any(w in text for w in ["how are you", "how do you feel"]):
            return (
                f"I'm operating at peak efficiency, {name}. "
                "All systems are nominal. How can I help you?"
            )

        if any(w in text for w in ["your name", "who are you", "what are you"]):
            return (
                f"I am {self._config.assistant_name}, your personal AI assistant. "
                f"I'm here to help you with whatever you need, {name}."
            )

        if any(w in text for w in ["thank", "thanks"]):
            return f"You're welcome, {name}. Always happy to help."

        if any(w in text for w in ["time", "what time"]):
            now = datetime.datetime.now()
            return f"The current time is {now.strftime('%I:%M %p')}, {name}."

        if any(w in text for w in ["date", "what day", "today"]):
            now = datetime.datetime.now()
            return f"Today is {now.strftime('%A, %B %d, %Y')}, {name}."

        if any(w in text for w in ["weather"]):
            return (
                f"I don't have live weather access without an API key, {name}. "
                "Consider adding a weather API for real-time updates."
            )

        if any(w in text for w in ["joke", "funny", "laugh"]):
            try:
                import pyjokes

                return pyjokes.get_joke()
            except ImportError:
                return "Why do programmers prefer dark mode? Because light attracts bugs."

        if any(w in text for w in ["wikipedia", "wiki", "tell me about", "what is", "who is"]):
            return self._wiki_search(text)

        if any(w in text for w in ["system", "cpu", "memory", "ram", "battery"]):
            return self._system_info()

        if any(w in text for w in ["bye", "goodbye", "exit", "quit", "shutdown", "shut down"]):
            return f"Goodbye, {name}. It was a pleasure assisting you. Shutting down."

        return (
            f"I understand you said: '{user_input}'. "
            f"I'm running in offline mode without full AI capabilities. "
            f"Set your OPENAI_API_KEY environment variable to unlock my full potential, {name}."
        )

    def _wiki_search(self, text: str) -> str:
        try:
            import wikipedia

            for prefix in ["tell me about", "what is", "who is", "wikipedia", "wiki", "search for"]:
                text = text.replace(prefix, "")
            query = text.strip()
            if not query:
                return "What would you like me to look up?"
            result = wikipedia.summary(query, sentences=3)
            return str(result)
        except ImportError:
            return "Wikipedia module is not installed."
        except Exception:
            return "I couldn't find information on that topic."

    def _system_info(self) -> str:
        try:
            import psutil

            cpu = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            info = f"CPU Usage: {cpu}% | RAM: {memory.percent}% used ({memory.used // (1024**3)}GB / {memory.total // (1024**3)}GB)"
            battery = psutil.sensors_battery()
            if battery:
                info += f" | Battery: {battery.percent}%"
                if battery.power_plugged:
                    info += " (Charging)"
            return info
        except ImportError:
            return "System monitoring module is not available."

    def clear_memory(self) -> None:
        self._conversation_history.clear()
