"use client";

import { useState } from "react";

interface AiCallButtonProps {
  BACKEND_URL: string;
  refreshPendingRequests?: () => void; // callback to refresh dashboard
}

export default function AiCallButton({ BACKEND_URL, refreshPendingRequests }: AiCallButtonProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSimulatedCall = async () => {
    if (!newQuestion.trim()) {
      window.showToast("❌ Enter a question first!");
      return;
    }

    setLoading(true);

    try {
      // Show initial feedback
      window.showToast("⏳ Simulating AI call...");

      const res = await fetch(`${BACKEND_URL}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caller_id: "dashboard_user", question: newQuestion }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      // Show AI response
      window.showToast(`📞 ${data.response_text}`);

      // Play audio if available
      if (data.audio_file) new Audio(`${BACKEND_URL}${data.audio_file}`).play();

      // Clear input
      setNewQuestion("");

      // Refresh dashboard pending/resolved requests
      if (refreshPendingRequests) refreshPendingRequests();
    } catch (err) {
      console.error(err);
      window.showToast("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center gap-3 mb-8">
      <input
        type="text"
        placeholder="Type a question..."
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        className="px-4 py-2 rounded-lg w-1/2 text-black bg-white"
      />
      <button
        onClick={handleSimulatedCall}
        disabled={loading}
        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all"
      >
        {loading ? "Simulating..." : "Simulate Call"}
      </button>
    </div>
  );
}
