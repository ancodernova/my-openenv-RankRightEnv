import os
import json
import requests
from openai import OpenAI

# -------------------------------
# CONFIG
# -------------------------------
BASE_URL = "http://localhost:8000"
MODEL_NAME = os.getenv("MODEL_NAME", "llama3-70b-8192")

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("API_BASE_URL")
)


# -------------------------------
# STRICT SYSTEM PROMPT
# -------------------------------
SYSTEM_PROMPT = """
You are a policy-aware recommendation agent.

STRICT RULES:
- Output ONLY valid JSON
- NO explanations
- NO markdown
- NO extra text

FORMAT EXACTLY:
{
  "action_type": "...",
  "params": {...}
}

OBJECTIVES:
- maximize engagement
- maintain diversity
- avoid risky content
- follow policy constraints strictly

SIGNAL RULES:
- NEVER use disallowed signals
- Avoid restricted signals unless absolutely necessary
"""


# -------------------------------
# SAFE LLM CALL (WITH RETRY)
# -------------------------------
def get_action_from_llm(observation):
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": json.dumps(observation)}
                ],
                temperature=0.2
            )

            content = response.choices[0].message.content.strip()

            action = safe_parse_json(content)

            if validate_action(action):
                return action

        except Exception as e:
            print(f"⚠ LLM attempt {attempt+1} failed:", e)

    return fallback_action()


# -------------------------------
# SAFE JSON PARSER
# -------------------------------
def safe_parse_json(text):
    try:
        return json.loads(text)
    except:
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            return json.loads(text[start:end])
        except:
            return fallback_action()


# -------------------------------
# VALIDATE ACTION STRUCTURE
# -------------------------------
def validate_action(action):
    if not isinstance(action, dict):
        return False

    if "action_type" not in action:
        return False

    if "params" not in action:
        return False

    return True


# -------------------------------
# FALLBACK ACTION
# -------------------------------
def fallback_action():
    return {
        "action_type": "rank",
        "params": {}
    }


# -------------------------------
# RUN SINGLE EPISODE
# -------------------------------
def run_episode(task_id):
    print(f"\n🚀 Running task: {task_id}")

    # RESET
    res = requests.post(f"{BASE_URL}/reset", json={"task_id": task_id})
    obs = res.json()["observation"]

    done = False
    step = 0

    while not done:
        step += 1

        # GET ACTION FROM LLM
        action = get_action_from_llm(obs)

        print(f"\nStep {step}")
        print("Action:", action)

        # STEP ENV
        res = requests.post(f"{BASE_URL}/step", json={"action": action})
        data = res.json()

        obs = data["observation"]
        reward = data["reward"]
        done = data["done"]

        print("Reward:", reward)

        if step > 10:
            print("⚠ Max steps reached")
            break

    # FINAL STATE
    state = requests.get(f"{BASE_URL}/state").json()

    print("\n✅ Final State:")
    print("Engagement:", state.get("engagement"))
    print("Diversity:", state.get("diversity"))
    print("Violations:", state.get("violations"))

    return state


# -------------------------------
# RUN ALL TASKS
# -------------------------------
def run_all():
    tasks = ["easy", "medium", "hard"]
    results = {}

    for t in tasks:
        state = run_episode(t)
        results[t] = state

    return results


# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    run_all()