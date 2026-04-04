import os
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# -------------------------------
# CONFIG (STRICTLY AS REQUIRED)
# -------------------------------
API_BASE_URL = os.getenv("API_BASE_URL", "https://api.groq.com/openai/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-oss-120b")

API_KEY = (
    os.getenv("HF_TOKEN")
    or os.getenv("GROQ_API_KEY")
    or os.getenv("OPENAI_API_KEY")
)

BASE_URL = os.getenv(
    "ENV_BASE_URL",
    "http://localhost:8000"
)

client = OpenAI(
    api_key=API_KEY,
    base_url=API_BASE_URL
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

VALID ACTION TYPES (ONLY USE THESE):
- activate_signals
- deactivate_signals
- set_weights
- rank
- finalize

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
                temperature=0.0  # ✅ deterministic
            )

            content = response.choices[0].message.content.strip()
            action = safe_parse_json(content)

            if validate_action(action):
                return action

        except Exception as e:
            print(f"ERROR attempt={attempt+1} message={str(e)}")

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
# STRICT ACTION VALIDATION
# -------------------------------
def validate_action(action):
    if not isinstance(action, dict):
        return False

    if "action_type" not in action:
        return False

    if "params" not in action:
        return False

    allowed_actions = [
        "activate_signals",
        "deactivate_signals",
        "set_weights",
        "rank",
        "finalize"
    ]

    if action["action_type"] not in allowed_actions:
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
    print(f"START task={task_id}")

    res = requests.post(f"{BASE_URL}/reset", json={"task_id": task_id})

    if res.status_code != 200:
        print(f"ERROR reset failed status={res.status_code}")
        print(res.text)
        return {}

    obs = res.json()["observation"]

    done = False
    step = 0

    while not done:
        step += 1

        action = get_action_from_llm(obs)

        res = requests.post(f"{BASE_URL}/step", json={"action": action})

        if res.status_code != 200:
            print(f"ERROR step failed status={res.status_code}")
            print(res.text)
            break

        data = res.json()

        if not all(k in data for k in ["observation", "reward", "done"]):
            print(f"ERROR invalid response keys={list(data.keys())}")
            break

        obs = data["observation"]
        reward = data["reward"]
        done = data["done"]

        # ✅ Clean logs
        print(f"STEP step={step} reward={reward}")

        if step > 10:
            print(f"STEP step={step} message=max_steps_reached")
            break

    state = requests.get(f"{BASE_URL}/state").json()

    print(
        f"END task={task_id} "
        f"engagement={state.get('engagement')} "
        f"diversity={state.get('diversity')} "
        f"violations={state.get('violations')}"
    )

    return state

# -------------------------------
# RUN ALL TASKS
# -------------------------------
def run_all():
    tasks = ["easy", "medium", "hard"]
    results = {}

    for t in tasks:
        print("\n-----------------------------")
        state = run_episode(t)
        results[t] = state

    return results

# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    run_all()