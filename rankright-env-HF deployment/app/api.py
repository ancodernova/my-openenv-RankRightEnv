from fastapi import FastAPI, HTTPException, Body
from typing import Dict, Optional

from app.env import RankRightEnv


app = FastAPI(title="RankRightEnv API")

env = RankRightEnv()


# -------------------------------
# HEALTH CHECK
# -------------------------------
@app.get("/")
def root():
    return {
        "message": "RankRightEnv is running",
        "endpoints": ["/reset", "/step", "/state"]
    }


@app.get("/health")
def health():
    return {"status": "ok"}


# -------------------------------
# RESET (FIXED FOR OPENENV)
# -------------------------------
@app.post("/reset")
def reset(req: Optional[Dict] = Body(default={})):
    try:
        # ✅ allow missing body
        task_id = req.get("task_id", "easy")

        obs = env.reset(task_id)

        return {"observation": obs}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------------
# STEP (FIXED FOR OPENENV)
# -------------------------------
@app.post("/step")
def step(req: Optional[Dict] = Body(default={})):
    try:
        # ✅ allow missing body
        action = req.get("action", {
            "action_type": "rank",
            "params": {}
        })

        obs, reward, done, info = env.step(action)

        return {
            "observation": obs,
            "reward": reward,
            "done": done,
            "info": info
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------------
# STATE (DEBUG)
# -------------------------------
@app.get("/state")
def get_state():
    try:
        state = env.get_state()

        if state is None:
            return {"message": "Environment not initialized"}

        return state.dict()

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))