"use client";
import { motion } from "framer-motion";

export default function Header() {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex items-center justify-between bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-lg overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent)] animate-pulse"
      />
      <h1 className="text-white font-bold text-2xl z-10">💬 AI Supervisor Dashboard</h1>
      <div className="text-sm text-white/80 z-10">
        {time} • Real-Time Monitoring
      </div>
      
    </motion.header>
  );
}
