# 🚀 RankRightEnv: Policy-Aware Recommendation Governance Environment


A simulation environment where AI agents must **optimize recommendations under policy, safety, and diversity constraints**, not just engagement.

---

## 🚨 Problem

Modern platforms like Instagram, Facebook, and TikTok rely heavily on **engagement-driven recommendation systems**.

While effective for retention, this leads to:

- Echo chambers and filter bubbles  
- Amplification of sensational or harmful content  
- Overuse of invasive or sensitive signals  
- Lack of transparency in decision-making  
- No explicit enforcement of safety or policy constraints  

> The system optimizes for *“what keeps users hooked”*, not *“what should be responsibly recommended.”*

---

## 🛡️ Mitigation (Our Approach)

RankRightEnv introduces a **policy-aware recommendation framework** where optimization is done under real-world constraints.

Instead of maximizing engagement blindly, agents must:

- Respect **platform policies and signal restrictions**  
- Maintain **content diversity and fairness**  
- Avoid **harmful or high-risk recommendations**  
- Make **trade-offs between engagement, safety, and compliance**  


---

## 🧠 Core Idea

Agents must:

- Select signals  
- Rank content  
- Maintain diversity  
- Avoid harmful content  
- Follow platform policies  

Focus: **decision-making under constraints**, not just ranking.

---


## 💡 Key Insight

> The challenge is not just ranking — but **choosing the right signals under constraints**

---

## 🏗 System Architecture
reset() → observe → act → step() → reward → repeat → finalize

### Components

- Environment Engine — state management  
- Policy Engine — constraint enforcement  
- Ranking Engine — content scoring  
- User Simulator — behavior modeling  
- Reward Engine — multi-objective reward  
- Grader — final score (0 → 1)

---

## 📊 Observation Space

- User profile  
- Signals (allowed / restricted / disallowed)  
- Content candidates  
- Policy constraints  

---

## 🎮 Action Space

```json
{
  "action_type": "...",
  "params": {}
}
```

###  Action

- activate_signals
- deactivate_signals
- set_weights
- rank
- finalize
---

## ⚖️ Policy & Reward

Constraints:

- Disallowed & restricted signals
- Diversity requirements
- Risk thresholds

---

## 🎯 Reward Function
Reward = Engagement + Diversity + Safety - Policy Penalties - Signal Costs

---

## 👤 Simulation & Evaluation

### User Simulation:
- Interest match
- Fatigue
- Safety sensitivity
### Evaluation (0 → 1):
- Engagement
- Diversity
- Safety
- Policy compliance

---

## 🧪 Difficulty Levels
- Easy — clear preferences
- Medium — noisy signals
- Hard — high-risk trade-offs

---

## 🔌 API

Base URL:
https://aniket-2004-rankright-env.hf.space

Endpoints:

- POST /reset
- POST /step
- GET /state
- GET /health 

---
## HUGGING FACE DEPLOYEMENT

![Demo](images\hf.jpeg)

---

## DEPLOYED LINK 

https://meta-hack-delta.vercel.app/

---

## DEMO

![Demo](images\demo.png)

## 🏁 Final Note

This is not just a recommender system.

It is a simulation of responsible AI decision-making.

---

## DEVELOPERS

### Aniket Atole
### Vaishnavi Balodhi