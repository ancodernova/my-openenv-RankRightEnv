---
title: RankRightEnv
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# 🚀 RankRightEnv — Policy-Aware Recommendation Governance Environment

## 🌍 Overview
Modern recommendation systems (Instagram Reels, TikTok, etc.) are not just about engagement anymore. They must balance:
- User satisfaction
- Diversity
- Safety
- Policy compliance

RankRightEnv is a simulation environment where AI agents learn to make recommendation decisions under real-world constraints.

---

## 💡 Core Idea
Instead of optimizing only for engagement, we build a **governance-aware recommendation system**.

---

## 🧠 Problem
Traditional systems:
- Create echo chambers
- Promote addictive/sensational content
- Ignore governance constraints

---

## 🧩 Solution
We built a simulation environment where an AI agent must:
- Select signals
- Rank content
- Maintain diversity
- Avoid harmful content
- Follow policies

---

## 🏗️ Architecture

reset() → step() → reward → repeat → finalize

Components:
- Environment Engine
- Policy Engine
- Ranking Engine
- User Simulator
- Reward System
- Grader

---

## 📊 Observation
Includes:
- user profile
- signals
- candidates
- policy constraints

---

## 🎮 Actions
- activate_signals
- deactivate_signals
- set_weights
- rank
- finalize

---

## ⚖️ Policy
- disallowed signals blocked
- diversity enforced
- risk controlled

---

## 🎯 Reward
Reward = engagement + diversity + safety - penalties

---

## 👤 User Simulation
Simulates:
- interest match
- fatigue
- safety sensitivity

---

## 📈 Evaluation
Final score based on:
- engagement
- diversity
- safety
- policy compliance

---

## 🧪 API

POST /reset  
POST /step  
GET /state  
GET /health  

---

## 🤖 Inference
Uses OpenAI-compatible LLM (Groq backend)

---

## 🐳 Deployment
Docker + Hugging Face Spaces

---

## 🏆 Innovation
We shift:
"What to recommend" → "How to recommend responsibly"

---

## 🚀 Future Scope
- RL training
- multi-agent simulation
- explainable AI

---

## 👨‍💻 Author
Meta x PyTorch x Hugging Face Hackathon