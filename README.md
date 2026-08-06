# 🔍 AI-Powered Code Review Bot

A full-stack, 3-layer hybrid AI system that automatically detects security vulnerabilities, bugs, performance issues, and style problems in source code — then explains each issue's real-world impact and suggests contextual fixes.

**🌐 Live Demo:** [code-review-bot-tech.vercel.app](https://code-review-bot-tech.vercel.app)

> ⚠️ The backend runs on free-tier hosting that sleeps after inactivity. The first review may take ~50 seconds to wake the services — subsequent reviews are fast.

---

## ✨ Features

- **20+ detection rules** across four categories — Security, Bugs, Performance, and Style
- **Two-pass analysis** — per-line scanning plus whole-file analysis that catches multiline issues like SQL injection, integer overflow, and concurrent modification
- **Contextual AI fixes** — Gemini generates fixes using the code's actual variable and method names, with a validation gate that rejects generic placeholder suggestions
- **Impact explanations** — every issue comes with a plain-English description of what could go wrong in production
- **Quality scoring** — weighted deduction system produces a 0–100 score and a Good / Needs Improvement / Poor grade
- **Language detection** — validates that submitted code matches the selected language and flags unsupported languages
- **Review history** — every review is stored, with per-file "evolution" tracking that compares against previous reviews of the same file
- **Modern UI** — Material Design 3 interface with dark/light themes

---

## 🏗️ Architecture
