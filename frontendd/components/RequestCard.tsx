"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SendHorizonal, Volume2 } from "lucide-react";

export default function RequestCard({ request, onResolve }: any) {
  const [answer, setAnswer] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      // @ts-ignore
      window.showToast("⚠️ Please enter an answer first");
      return;
    }

    await onResolve(request.id, answer);
    setAnswer("");
  };

  // 🔊 Optional: Speak answer aloud when AI learns / resolves
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.pitch = 1.05;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // 🗣️ Auto-speak when an answer is learned or already exists
  useEffect(() => {
    if (request.learned_answer) {
      speakText(request.learned_answer);
    }
  }, [request.learned_answer]);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 250 }}
      className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/30 border border-indigo-500/30 backdrop-blur-xl rounded-2xl shadow-xl p-6"
      style={{ zIndex: 10 }}
    >
      <div className="flex flex-col h-full">
        <h3 className="font-semibold text-lg text-indigo-200 mb-3">
          {request.question}
        </h3>
        <p className="text-sm text-gray-300 mb-6">
          ID: <span className="text-gray-400">{request.id}</span>
        </p>

        {/* Input box */}
        <div className="flex items-center mt-auto gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 bg-white/10 focus:bg-white/20 border border-white/20 text-white placeholder-gray-400 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          />
          <button
            onClick={handleSubmit}
            className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:opacity-90 transition-all flex items-center justify-center"
          >
            <SendHorizonal size={18} className="text-white" />
          </button>
        </div>

        {/* Voice animation when AI is speaking */}
        {isSpeaking && (
          <motion.div
            className="absolute bottom-3 left-3 flex gap-1 items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                animate={{
                  height: [5, 15, 8, 20, 10][i % 5],
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
                className="w-1 bg-indigo-400 rounded-full"
              />
            ))}
            <Volume2 size={14} className="text-indigo-300 ml-2" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
