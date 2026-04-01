from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict

from app.env import RankRightEnv


app = FastAPI(title="RankRightEnv API")

env = RankRightEnv()


# -------------------------------
# REQUEST MODELS
# -------------------------------
class ResetRequest(BaseModel):
    task_id: str


class StepRequest(BaseModel):
    action: Dict


# -------------------------------
# HEALTH CHECK
# -------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# -------------------------------
# RESET
# -------------------------------
@app.post("/reset")
def reset(req: ResetRequest):
    try:
        obs = env.reset(req.task_id)
        return {"observation": obs}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------------
# STEP
# -------------------------------
@app.post("/step")
def step(req: StepRequest):
    try:
        obs, reward, done, info = env.step(req.action)

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