# AI Dashboard: Human-in-the-Loop AI System

A full-stack AI Dashboard that simulates an interactive AI assistant capable of learning user responses.  
- Frontend: Next.js + Recharts + TailwindCSS  
- Backend: FastAPI + Python  
- Features: Pending requests, learned answers, real-time updates, voice playback, statistics

---

## Features

- Simulate AI calls directly from the dashboard
- Track pending and resolved requests
- Automatic speech synthesis for learned responses
- Real-time updates every 5 seconds
- Visual statistics: pie charts and weekly trends

---

## Project Structure
/frontendd # Next.js dashboard
/backend # FastAPI backend
README.md
.gitignore
---

## Requirements

- Node.js ≥ 18
- Python ≥ 3.10
- pip / virtualenv
- Git

---

## Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/Human_in_AI_Loop.git
cd Human_in_AI_Loop
```
2️⃣ Backend Setup (FastAPI)
```
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# Linux/Mac
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install fastapi uvicorn

# If you have requirements.txt
pip install -r requirements.txt

# Run backend
uvicorn main:app --reload
```
## Backend Environment Variables (LiveKit Token)

Before running the backend, create a .env file inside backend/ with the following:

# .env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

3️⃣ Frontend Setup (Next.js)
```bash
# Open a new terminal
cd frontendd

# Install dependencies
npm install

# Run development server
npm run dev
```
4️⃣ Using the Dashboard

1.Open the dashboard in browser: http://localhost:3000
2. Type a question in “Simulate Call”
3. Click Send → request appears in Pending Requests
4. Resolve the request → moves to Learned Answers with voice playback
5. Check Statistics tab for charts

5️⃣ Clear all data (Optional)

1. Click Clear All Data button in the Statistics tab
Or via backend:
curl -X POST http://127.0.0.1:8000/clear

### Author
### Sameer Khan

