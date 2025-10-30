from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from gtts import gTTS
from ai_agent import handle_call, generate_livekit_token, AUDIO_PATH
from db import (
    get_pending_requests,
    resolve_request as db_resolve_request,
    get_learned_answers,
    PENDING_REQUESTS,
    LEARNED_ANSWERS,
)
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime, timedelta
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CallRequest(BaseModel):
    caller_id: str
    question: str


class ResolveRequest(BaseModel):
    answer: str


REQUESTS_FILE = "requests.json"
LEARNED_FILE = "learned.json"


def ensure_files_exist():
    """Ensure required JSON files exist"""
    if not os.path.exists(REQUESTS_FILE):
        with open(REQUESTS_FILE, "w") as f:
            json.dump([], f)
    if not os.path.exists(LEARNED_FILE):
        with open(LEARNED_FILE, "w") as f:
            json.dump({}, f)


def cleanup_old_requests():
    """Mark pending requests as unresolved if older than 5 minutes"""
    ensure_files_exist()
    with open(REQUESTS_FILE, "r") as f:
        requests = json.load(f)

    updated = False
    now = datetime.utcnow()

    for req in requests:
        if req["status"] == "pending":
            created_time = datetime.fromisoformat(req["timestamp"])
            if now - created_time > timedelta(minutes=5):
                req["status"] = "unresolved"
                updated = True
                print(f"⏳ Marked request '{req['question']}' as unresolved (timeout).")

    if updated:
        with open(REQUESTS_FILE, "w") as f:
            json.dump(requests, f, indent=2)


@app.post("/call")
def receive_call(req: CallRequest):
    # --- 1️⃣ Load learned answers ---
    try:
        with open("learned.json", "r") as f:
            learned = json.load(f)
    except FileNotFoundError:
        learned = {}

    # --- 2️⃣ If question already learned, use it instantly ---
    if req.question in learned:
        answer = learned[req.question]
        print(f"🧠 Learned response reused for: {req.question}")

        # Generate audio for the learned response
        audio_filename = f"{req.caller_id}.mp3"
        audio_path = os.path.join(AUDIO_PATH, audio_filename)
        tts = gTTS(answer)
        tts.save(audio_path)

        return {
            "response_text": answer,
            "audio_file": f"/audio/{audio_filename}"
        }

    # --- 3️⃣ If not learned, handle normally ---
    result = handle_call(req.question, req.caller_id)

    try:
        with open("requests.json", "r") as f:
            requests = json.load(f)
    except FileNotFoundError:
        requests = []

    new_request = {
        "id": f"req_{len(requests) + 1}",
        "caller_id": req.caller_id,
        "question": req.question,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "pending",
    }

    requests.append(new_request)
    with open("requests.json", "w") as f:
        json.dump(requests, f, indent=2)

    print(f"📞 New pending request logged: {req.question}")

    return {
        "response_text": result["text"],
        "audio_file": f"/audio/{req.caller_id}.mp3"
    }

@app.get("/audio/{filename}")
def get_audio(filename: str):
    path = os.path.join(AUDIO_PATH, filename)
    if os.path.exists(path):
        return FileResponse(path)
    return {"error": "File not found"}


@app.get("/requests")
def view_requests():
    """Fetch all pending requests"""
    try:
        cleanup_old_requests()
        ensure_files_exist()
        with open(REQUESTS_FILE, "r") as f:
            data = json.load(f)
        pending = [r for r in data if r.get("status") == "pending"]
        return JSONResponse(content=pending)
    except Exception as e:
        print(f"[ERROR] /requests failed: {e}")
        return JSONResponse(content={"error": "Failed to fetch requests"}, status_code=500)


@app.post("/requests/{id}/resolve")
def resolve_request(id: str, data: ResolveRequest):
    """Resolve a pending request and add it to learned answers"""
    ensure_files_exist()

    with open(REQUESTS_FILE, "r") as f:
        requests = json.load(f)

    found = False
    for r in requests:
        if r["id"] == id:
            question = r["question"]
            requests.remove(r)
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Request not found")

    # Save updated requests
    with open(REQUESTS_FILE, "w") as f:
        json.dump(requests, f, indent=2)

    # Update learned answers
    with open(LEARNED_FILE, "r") as f:
        learned = json.load(f)
    learned[question] = data.answer
    with open(LEARNED_FILE, "w") as f:
        json.dump(learned, f, indent=2)

    print(f"✅ Request '{id}' resolved: {question} → {data.answer}")
    return {"message": "Request resolved", "question": question, "answer": data.answer}


@app.get("/learned")
def view_learned():
    """View learned Q&A pairs"""
    try:
        ensure_files_exist()
        with open(LEARNED_FILE, "r") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    except Exception as e:
        print(f"[ERROR] /learned failed: {e}")
        return JSONResponse(content={"error": "Failed to fetch learned"}, status_code=500)


@app.get("/livekit/token/{identity}/{room}")
def livekit_token(identity: str, room: str):
    token = generate_livekit_token(identity, room)
    return {"token": token}


@app.post("/clear")
def clear_data():
    """Clear all pending requests and learned answers"""
    ensure_files_exist()
    with open(REQUESTS_FILE, "w") as f:
        json.dump([], f)
    with open(LEARNED_FILE, "w") as f:
        json.dump({}, f)
    PENDING_REQUESTS.clear()
    LEARNED_ANSWERS.clear()
    print("🧹 All data cleared successfully!")
    return {"message": "All data cleared successfully!"}
