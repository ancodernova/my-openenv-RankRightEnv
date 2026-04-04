import os
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# -------------------------------
# CONFIG (STRICTLY AS REQUIRED)
# -------------------------------
API_BASE_URL = os.getenv("API_BASE_URL", "https://api.groq.com/openai/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-oss-120b")
# Try multiple environment variable names for the API key
API_KEY = os.getenv("HF_TOKEN") or os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")

if not API_KEY:
    raise ValueError(
        "API key not found. Please set one of these environment variables:\n"
        "  - HF_TOKEN (Hugging Face token)\n"
        "  - GROQ_API_KEY (Groq API key)\n"
        "  - OPENAI_API_KEY (OpenAI API key)\n"
    )

BASE_URL = "https://aniket-2004-rankright-env.hf.space"

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
- 'activate_signals'
- 'deactivate_signals'
- 'set_weights'
- 'rank'
- 'rerank'
- 'finalize'

FORMAT EXACTLY:
{
  "action_type": "<one of the valid types above>",
  "params": {}
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
    print(f"START task={task_id}")

    # RESET
    res = requests.post(f"{BASE_URL}/reset", json={"task_id": task_id})
    obs = res.json()["observation"]

    done = False
    step = 0

    while not done:
        step += 1

        action = get_action_from_llm(obs)

        res = requests.post(f"{BASE_URL}/step", json={"action": action})
        
        # Debug: Check response status and content
        if res.status_code != 200:
            print(f"ERROR API response status={res.status_code}")
            print(f"ERROR API response={res.text}")
            break
        
        data = res.json()
        
        # Debug: Print response if missing expected keys
        if "observation" not in data or "reward" not in data or "done" not in data:
            print(f"ERROR API response missing keys: {list(data.keys())}")
            print(f"ERROR Full response: {data}")
            break

        obs = data["observation"]
        reward = data["reward"]
        done = data["done"]

        print(f"STEP step={step} action={action} reward={reward}")

        if step > 10:
            print(f"STEP step={step} message=max_steps_reached")
            break

    # FINAL STATE
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
        state = run_episode(t)
        results[t] = state

    return results


# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    run_all()