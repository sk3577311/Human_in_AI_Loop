import time
import threading
import json
import os
from typing import Dict, List, Optional

# Thread lock for safe concurrent operations
_lock = threading.Lock()

# In-memory stores
PENDING_REQUESTS: Dict[str, dict] = {}
LEARNED_ANSWERS: Dict[str, str] = {}
REQUEST_COUNTER = 1

# Optional persistence
DB_PATH = "./db_store.json"

# ---------- Utility Persistence (Optional) ----------
def _save_db():
    """Save current state to a JSON file."""
    try:
        with open(DB_PATH, "w") as f:
            json.dump({
                "pending": PENDING_REQUESTS,
                "learned": LEARNED_ANSWERS,
                "counter": REQUEST_COUNTER
            }, f, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save DB: {e}")

def _load_db():
    """Load previous state if JSON exists."""
    global PENDING_REQUESTS, LEARNED_ANSWERS, REQUEST_COUNTER
    if os.path.exists(DB_PATH):
        try:
            with open(DB_PATH, "r") as f:
                data = json.load(f)
                PENDING_REQUESTS = data.get("pending", {})
                LEARNED_ANSWERS = data.get("learned", {})
                REQUEST_COUNTER = data.get("counter", 1)
        except Exception as e:
            print(f"[WARN] Failed to load DB: {e}")

_load_db()

# ---------- Core Operations ----------
def create_request(question: str, caller_id: str) -> dict:
    """Creates a new pending supervisor request."""
    global REQUEST_COUNTER
    with _lock:
        request_id = f"req_{REQUEST_COUNTER}"
        REQUEST_COUNTER += 1
        new_req = {
            "id": request_id,
            "question": question,
            "caller_id": caller_id,
            "status": "pending",
            "timestamp": int(time.time()),
            "answer": None
        }
        PENDING_REQUESTS[request_id] = new_req
        _save_db()
        return new_req

def get_pending_requests() -> List[dict]:
    """Returns all pending requests (sorted by newest first)."""
    with _lock:
        return sorted(
            [r for r in PENDING_REQUESTS.values() if r["status"] == "pending"],
            key=lambda x: x["timestamp"],
            reverse=True
        )

def resolve_request(request_id: str, answer: str) -> Optional[dict]:
    """Marks a pending request as resolved and stores learned answer."""
    with _lock:
        req = PENDING_REQUESTS.get(request_id)
        if req:
            req["status"] = "resolved"
            req["answer"] = answer
            LEARNED_ANSWERS[req["question"].lower()] = answer
            _save_db()
            return req
        return None

def get_request(request_id: str) -> Optional[dict]:
    """Fetches a request by ID."""
    return PENDING_REQUESTS.get(request_id)

def get_learned_answers() -> Dict[str, str]:
    """Returns all learned Q&A pairs."""
    return LEARNED_ANSWERS
