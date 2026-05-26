from setuptools import setup, find_packages

setup(
    name="jarvis-ai",
    version="1.0.0",
    description="JARVIS - AI-Powered Personal Assistant",
    author="Farsin",
    packages=find_packages(),
    python_requires=">=3.9",
    entry_points={
        "console_scripts": [
            "jarvis=jarvis.main:main",
        ],
    },
)
