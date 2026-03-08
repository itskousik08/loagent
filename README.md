<div align="center">
  <img src="https://img.icons8.com/color/96/000000/bot.png" alt="Loagent Logo">
  <h1>🚀 Loagent (Local Agent)</h1>
  <p><b>An Elite, 100% Local & Private AI Software Engineer</b></p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.9+-blue.svg" alt="Python">
    <img src="https://img.shields.io/badge/FastAPI-0.103-green.svg" alt="FastAPI">
    <img src="https://img.shields.io/badge/Ollama-Local_LLM-orange.svg" alt="Ollama">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  </p>
</div>

---

## 🌟 What is Loagent?

**Loagent** is an open-source, autonomous AI software engineering assistant designed to run **completely locally** on your machine. Inspired by tools like Devin and AutoGPT, Loagent uses [Ollama](https://ollama.ai/) to run powerful LLMs (like Llama 3, Mistral, and DeepSeek-Coder) to think, write code, and directly interact with your GitHub repositories.

No API keys. No subscription fees. 100% Privacy.

## ✨ Key Features

- **🧠 Advanced Thought Framework**: Loagent plans before it acts. It exposes its internal `[THOUGHT PROCESS]` in the UI so you know exactly *why* it's writing specific code.
- **💻 Split-Screen Workspace**: A professional, dark-mode UI with a chat interface on the left and a live code workspace on the right.
- **🔄 Local LLM Support**: Drop-down support for various local models via Ollama.
- **🐙 GitHub Integration**: Built-in capability to connect, edit, and push code directly to your GitHub repositories via PyGithub (Work in progress).
- **⚡ Blazing Fast**: Powered by a lightweight **FastAPI** backend and an optimized **Vanilla JS + Tailwind CSS** frontend.

---

## 🏗️ Architecture & Tech Stack

- **Backend**: Python, FastAPI, PyGithub
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN), Highlight.js
- **AI Engine**: Ollama (REST API integration)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
1. **[Python 3.9+](https://www.python.org/downloads/)**
2. **[Ollama](https://ollama.ai/download)** (Make sure it is running in the background)
3. **Git**

Pull your preferred model in Ollama before starting:
```bash
ollama run llama3
# or
ollama run deepseek-coder
