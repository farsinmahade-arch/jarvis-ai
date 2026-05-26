"""JARVIS Terminal UI Theme - Sleek Iron Man inspired interface."""

import shutil
import time

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.align import Align
from rich import box

import pyfiglet


console = Console()

JARVIS_BLUE = "cyan"
JARVIS_GOLD = "yellow"
JARVIS_RED = "red"
JARVIS_GREEN = "green"
JARVIS_DIM = "dim white"

ARC_REACTOR = r"""
        ╔═══════════╗
      ╔═╝  ┌─────┐  ╚═╗
    ╔═╝  ┌─┤ ◉◉◉ ├─┐  ╚═╗
   ║   ┌─┤ │ ◉◉◉ │ ├─┐   ║
   ║   │ │ │ ◉◉◉ │ │ │   ║
   ║   └─┤ │ ◉◉◉ │ ├─┘   ║
    ╚═╗  └─┤ ◉◉◉ ├─┘  ╔═╝
      ╚═╗  └─────┘  ╔═╝
        ╚═══════════╝
"""

SHIELD_LOGO = r"""
     ▄▄▄▄▄▄▄▄▄▄▄▄▄
   ▄▀  ╔═══════╗  ▀▄
  █   ║ JARVIS  ║   █
  █   ║ v1.0.0  ║   █
   ▀▄  ╚═══════╝  ▄▀
     ▀▀▀▀▀▀▀▀▀▀▀▀▀
"""


class JarvisTheme:
    """Handles all visual output for the JARVIS terminal interface."""

    def __init__(self, color: str = "cyan") -> None:
        self.primary = color
        self.console = console

    def show_boot_screen(self) -> None:
        self.console.clear()
        title = pyfiglet.figlet_format("J.A.R.V.I.S", font="slant")
        self.console.print(f"[bold {self.primary}]{title}[/]", justify="center")
        self.console.print(
            f"[bold {JARVIS_GOLD}]Just A Rather Very Intelligent System[/]",
            justify="center",
        )
        self.console.print(
            f"[{JARVIS_DIM}]v1.0.0 | AI-Powered Personal Assistant[/]",
            justify="center",
        )
        self.console.print()
        self._typing_effect("Initializing core systems...", JARVIS_BLUE)
        self.console.print()

    def show_loading_sequence(self, modules: list[str]) -> None:
        for module in modules:
            self._show_module_load(module)
            time.sleep(0.15)
        self.console.print()

    def _show_module_load(self, module_name: str) -> None:
        self.console.print(
            f"  [{JARVIS_GREEN}]■[/] [{self.primary}]{module_name}[/] "
            f"[{JARVIS_DIM}]........[/] [{JARVIS_GREEN}]ONLINE[/]"
        )

    def show_module_status(self, module_name: str, available: bool) -> None:
        status = f"[{JARVIS_GREEN}]ONLINE[/]" if available else f"[{JARVIS_RED}]OFFLINE[/]"
        self.console.print(
            f"  [{'■' if available else '□'}] [{self.primary}]{module_name}[/] "
            f"[{JARVIS_DIM}]........[/] {status}"
        )

    def show_security_prompt(self, prompt_text: str) -> None:
        self.console.print()
        panel = Panel(
            f"[bold {JARVIS_GOLD}]🔒 {prompt_text}[/]",
            border_style=JARVIS_RED,
            title=f"[bold {JARVIS_RED}]SECURITY[/]",
            title_align="center",
            box=box.DOUBLE,
        )
        self.console.print(panel)

    def show_arc_reactor(self) -> None:
        self.console.print(f"[bold {self.primary}]{ARC_REACTOR}[/]", justify="center")

    def show_greeting(self, message: str) -> None:
        self.console.print()
        panel = Panel(
            Align.center(f"[bold {JARVIS_GOLD}]{message}[/]"),
            border_style=self.primary,
            title=f"[bold {self.primary}]◉ JARVIS[/]",
            box=box.ROUNDED,
        )
        self.console.print(panel)
        self.console.print()

    def show_response(self, text: str) -> None:
        self.console.print(
            f"  [{self.primary}]◉ JARVIS:[/] [{JARVIS_GOLD}]{text}[/]"
        )

    def show_user_input_prompt(self) -> str:
        self.console.print()
        try:
            user_input = self.console.input(
                f"  [bold {JARVIS_GREEN}]► You:[/] "
            )
            return user_input
        except (EOFError, KeyboardInterrupt):
            return "exit"

    def show_listening(self) -> None:
        self.console.print(
            f"  [{self.primary}]◎ LISTENING...[/] "
            f"[{JARVIS_DIM}](speak now)[/]"
        )

    def show_processing(self) -> None:
        self.console.print(f"  [{self.primary}]⟳ Processing...[/]")

    def show_error(self, message: str) -> None:
        self.console.print(f"  [{JARVIS_RED}]✗ Error:[/] {message}")

    def show_success(self, message: str) -> None:
        self.console.print(f"  [{JARVIS_GREEN}]✓[/] {message}")

    def show_warning(self, message: str) -> None:
        self.console.print(f"  [{JARVIS_GOLD}]⚠[/] {message}")

    def show_info(self, message: str) -> None:
        self.console.print(f"  [{self.primary}]ℹ[/] {message}")

    def show_divider(self) -> None:
        width = shutil.get_terminal_size().columns - 4
        self.console.print(f"  [{JARVIS_DIM}]{'─' * width}[/]")

    def show_shutdown(self) -> None:
        self.console.print()
        self._typing_effect("Shutting down all systems...", JARVIS_RED)
        modules = ["AI Core", "Voice Module", "Hearing Module", "Security", "UI"]
        for module in modules:
            self.console.print(
                f"  [{JARVIS_RED}]□[/] [{JARVIS_DIM}]{module}[/] "
                f"[{JARVIS_DIM}]........[/] [{JARVIS_RED}]OFFLINE[/]"
            )
            time.sleep(0.1)
        self.console.print()
        goodbye = pyfiglet.figlet_format("GOODBYE", font="small")
        self.console.print(f"[{JARVIS_DIM}]{goodbye}[/]", justify="center")

    def show_help_table(self, commands: dict[str, str]) -> None:
        table = Table(
            title="JARVIS Commands",
            border_style=self.primary,
            box=box.ROUNDED,
            show_header=True,
            header_style=f"bold {JARVIS_GOLD}",
        )
        table.add_column("Command", style=f"bold {self.primary}")
        table.add_column("Description", style=JARVIS_DIM)
        for cmd, desc in commands.items():
            table.add_row(cmd, desc)
        self.console.print(table)

    def _typing_effect(self, text: str, color: str) -> None:
        for char in text:
            self.console.print(f"[{color}]{char}[/]", end="")
            time.sleep(0.02)
        self.console.print()
