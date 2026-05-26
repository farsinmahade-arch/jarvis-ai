"""Wake-up Call & Greeting System for JARVIS."""

import datetime
import random

from jarvis.core.config import Config


class GreetingModule:
    """Time-aware greeting and wake-up call system."""

    def __init__(self, config: Config) -> None:
        self._config = config

    def get_greeting(self) -> str:
        hour = datetime.datetime.now().hour
        name = self._config.owner_name
        assistant = self._config.assistant_name

        if hour < 6:
            time_greeting = random.choice([
                f"It's quite late, {name}. Burning the midnight oil?",
                f"The night is still young, {name}. How can I assist?",
                f"Working through the night, {name}? I admire your dedication.",
            ])
        elif hour < 12:
            time_greeting = random.choice([
                f"Good morning, {name}. I trust you slept well.",
                f"Rise and shine, {name}. A new day awaits.",
                f"Good morning, {name}. All systems are online and ready.",
                f"Morning, {name}. Let's make today count.",
            ])
        elif hour < 17:
            time_greeting = random.choice([
                f"Good afternoon, {name}. How may I be of service?",
                f"Good afternoon, {name}. I hope the day is treating you well.",
                f"Afternoon, {name}. Ready to continue our work?",
            ])
        elif hour < 21:
            time_greeting = random.choice([
                f"Good evening, {name}. What can I do for you?",
                f"Good evening, {name}. Winding down or ramping up?",
                f"Evening, {name}. All systems remain at your disposal.",
            ])
        else:
            time_greeting = random.choice([
                f"Good evening, {name}. Working late tonight?",
                f"It's getting late, {name}. How can I help?",
                f"Evening, {name}. I'm here whenever you need me.",
            ])

        return f"{assistant} online. {time_greeting}"

    def get_wake_up_message(self) -> str:
        name = self._config.owner_name
        now = datetime.datetime.now()
        day_name = now.strftime("%A")
        date_str = now.strftime("%B %d, %Y")
        time_str = now.strftime("%I:%M %p")

        messages = [
            (
                f"Good morning, {name}. It's {day_name}, {date_str}. "
                f"The time is {time_str}. All systems are operational."
            ),
            (
                f"Wake up, {name}. Today is {day_name}, {date_str}. "
                f"Current time: {time_str}. I've prepared everything for you."
            ),
            (
                f"Rise and shine, {name}! It is {time_str} on {day_name}, "
                f"{date_str}. Your personal assistant is ready."
            ),
        ]
        return random.choice(messages)

    def get_status_report(self) -> str:
        name = self._config.owner_name
        lines = [
            f"Status report for {name}:",
            "  System: All modules online",
        ]

        try:
            import psutil

            cpu = psutil.cpu_percent(interval=0.5)
            mem = psutil.virtual_memory()
            lines.append(f"  CPU: {cpu}% | RAM: {mem.percent}%")
            battery = psutil.sensors_battery()
            if battery:
                status = "Charging" if battery.power_plugged else "On Battery"
                lines.append(f"  Battery: {battery.percent}% ({status})")
        except ImportError:
            lines.append("  System monitoring: unavailable")

        return "\n".join(lines)
