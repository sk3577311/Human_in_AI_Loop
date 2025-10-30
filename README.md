# AI Dashboard

A fully interactive AI assistant dashboard simulating real-time AI workflow: question submission → pending requests → resolved → learned answers → voice playback. Built with React (Next.js), Tailwind CSS, and Framer Motion with charts and notifications.

---

## **Tech Stack**

- **Frontend:** React + Next.js (Client Components), Tailwind CSS, Framer Motion  
- **Charts:** Recharts  
- **Voice Playback:** `SpeechSynthesis` API & backend audio files  
- **Notifications:** Radix UI Toast (`ToastProvider`)  
- **Backend:** FastAPI / Node.js (handles `/call`, `/requests`, `/learned`, `/clear`)  

---

## **Project Structure**

ai-dashboard/
├─ app/
│ └─ dashboard/page.tsx # Main Dashboard page
├─ components/
│ ├─ Header.tsx # Dashboard header
│ ├─ ToastProvider.tsx # Global toast notifications
│ ├─ RequestCard.tsx # Pending request card
│ └─ AiCallButton.tsx # Simulate AI call button
├─ public/ # Static assets
├─ styles/ # Tailwind styles
└─ package.json
---

## **Setup & Installation**

### 1️⃣ Clone the repository
```bash
git clone https://github.com/sk3577311/Human_AI_loop/
cd ai-dashboard
2️⃣ Install dependencies
bash
Copy code
npm install
# or
yarn install
3️⃣ Set Environment Variables
Create a .env.local file at the root:

bash
Copy code
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
Running the Project
1️⃣ Start the Backend
Make sure your backend server is running (FastAPI/Node.js). Example for FastAPI:

bash
Copy code
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
2️⃣ Start the Frontend
bash
Copy code
npm run dev
# or
yarn dev
Open http://localhost:3000 in your browser.

Usage
Simulate AI Call:

Type a question in the input box.

Click Simulate Call → AI responds if known or adds to Pending.

Resolve Requests:

Go to Pending tab.

Click Resolve → provide the correct answer → moves to Resolved / Learned.

Learned Answers:

View all previously answered questions.

Re-asking a learned question triggers instant voice response.

Statistics:

Pie chart shows Pending vs Resolved.

Bar chart shows weekly trend.

Clear Data:

Click Clear All Data to reset dashboard.

Features
✅ Unified AI workflow (simulate → pending → resolved → learned → voice)

✅ Voice playback for resolved/learned answers

✅ Auto-refresh pending/resolved lists every 5 seconds

✅ Toast notifications using Radix UI

✅ Responsive dashboard with gradient buttons and animations

✅ Visual charts for analytics (Pie & Bar)

Commands Cheat Sheet
bash
Copy code
# Install dependencies
npm install
yarn install

# Run frontend
npm run dev
yarn dev

# Run backend (example FastAPI)
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Clear all dashboard data
# Use the "Clear All Data" button in Statistics tab
Notes
Make sure NEXT_PUBLIC_BACKEND_URL points to your running backend.

ToastProvider handles all notifications via window.showToast.

AiCallButton component triggers /call endpoint and plays audio if returned.

Dashboard auto-updates every 5 seconds for real-time experience.