# 🔍 AI-Powered Code Review Bot

A full-stack, 3-layer hybrid AI system that automatically detects security vulnerabilities, bugs, performance issues, and style problems in code — then explains each issue's real-world impact and suggests contextual fixes.

**🌐 Live Demo:** [code-review-bot-tech.vercel.app](https://code-review-bot-tech.vercel.app)

> ⚠️ The backend runs on free-tier hosting that sleeps after inactivity. The first review may take ~50 seconds to wake the services — subsequent reviews are fast.

---

## ✨ Features

- **20+ detection rules** across four categories — Security, Bugs, Performance, and Style
- **Contextual AI fixes** — Gemini generates fixes using the code's actual variable and method names, with a validation gate that rejects generic placeholder suggestions
- **Impact explanations** — every issue comes with a plain-English description of what could go wrong in production
- **Quality scoring** — weighted deduction system produces a 0–100 score and a Good / Needs Improvement / Poor grade
- **Review history** — every review is stored, with per-file "evolution" tracking that compares against previous reviews of the same file

---

## 🏗️ Architecture
  React (Vercel) → Java Spring Boot (Render) → Python FastAPI (Render)
  │ 3-Layer Analysis Engine:
    ▼ - Rule Engine (custom)
      MySQL (Aiven) - CodeT5 (fine-tuned)
      - Gemini AI


A microservice-style split: React handles the UI, Spring Boot manages business logic and persistence, and FastAPI hosts the AI analysis engine.
