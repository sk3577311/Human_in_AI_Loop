import os
import pyttsx3
from db import create_request, get_learned_answers
from livekit.api import AccessToken, VideoGrants

# Salon knowledge
SALON_KNOWLEDGE = {
    "hours": "We are open from 10 AM to 8 PM, Monday to Saturday.",
    "services": "We offer haircuts, coloring, and styling services."
}

# Path to store audio responses
AUDIO_PATH = "./audio_responses"
os.makedirs(AUDIO_PATH, exist_ok=True)

# Convert text to speech
def text_to_speech(text, filename):
    engine = pyttsx3.init()
    path = os.path.join(AUDIO_PATH, filename)
    engine.save_to_file(text, path)
    engine.runAndWait()
    return path

# Handle incoming call
def handle_call(question, caller_id):
    lower_q = question.lower()
    if lower_q in SALON_KNOWLEDGE:
        response_text = SALON_KNOWLEDGE[lower_q]
    elif lower_q in get_learned_answers():
        response_text = get_learned_answers()[lower_q]
    else:
        req = create_request(question, caller_id)
        print(f"[Supervisor Notification] Hey, I need help answering: '{question}' (request id: {req['id']})")
        response_text = "Let me check with my supervisor and get back to you."
    audio_file = text_to_speech(response_text, f"{caller_id}.mp3")
    return {"text": response_text, "audio_file": audio_file}

# LiveKit credentials placeholders
LIVEKIT_URL = "YOUR_LIVEKIT_URL"
LIVEKIT_API_KEY = "YOUR_LIVEKIT_KEY"
LIVEKIT_API_SECRET = "YOUR_LIVEKIT_SECRET"

# Generate LiveKit token
def generate_livekit_token(identity: str, room: str):
    grants = [VideoGrants(room_join=True, room=room)]
    token = AccessToken(
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET,
        identity=identity,
        grants=grants
    )
    jwt = token.to_jwt()
    return jwt
