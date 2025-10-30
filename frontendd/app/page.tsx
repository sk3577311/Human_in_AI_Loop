"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import ToastProvider from "@/components/ToastProvider";
import RequestCard from "@/components/RequestCard";
import AiCallButton from "@/components/AiCallButton";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, PieChart as PieIcon } from "lucide-react";

export default function Dashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [resolved, setResolved] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  // 🔊 Speak out loud when a learned answer is added
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.pitch = 1.05;
    utterance.rate = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };
  // 🧭 Fetch requests + learned answers
  const fetchRequests = async () => {
    try {
      const [reqRes, learnedRes] = await Promise.all([
        fetch(`${BACKEND_URL}/requests`),
        fetch(`${BACKEND_URL}/learned`),
      ]);
      if (!reqRes.ok || !learnedRes.ok) throw new Error("Bad status");

      const data = await reqRes.json();
      const learned = await learnedRes.json();

      const resolvedList = Object.entries(learned).map(([q, a]) => ({
        question: q,
        answer: a,
        learned_answer: a,
      }));

      setRequests(data);
      setResolved(resolvedList);
    } catch {
      // @ts-ignore
      window.showToast("⚠️ Failed to load data");
    }
  };

  // ✅ Resolve request + update instantly
  const resolveRequest = async (id: string, answer: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/requests/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      if (res.ok) {
        const data = await res.json();
        // Remove from pending instantly
        setRequests((prev) => prev.filter((r) => r.id !== id));
        // Add to resolved list instantly
        setResolved((prev) => [
          ...prev,
          { question: data.question, answer: data.answer, learned_answer: data.answer },
        ]);

        // 🎙️ Speak learned response aloud
        speakText(`Got it! ${data.answer}`);

        // @ts-ignore
        window.showToast("✅ Request resolved and learned!");
      } else {
        // @ts-ignore
        window.showToast("❌ Failed to resolve request!");
      }
    } catch {
      // @ts-ignore
      window.showToast("⚠️ Server not responding!");
    }
  };

  // 🔹 Auto refresh every 5s
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = requests.length;
  const resolvedCount = resolved.length;

  const COLORS = ["#00C49F", "#FF8042"];
  const statsData = [
    { name: "Resolved", value: resolvedCount },
    { name: "Pending", value: pendingCount },
  ];
  const trendData = [
    {
      name: "Week 1",
      Resolved: Math.max(1, resolvedCount - 1),
      Pending: Math.max(0, pendingCount - 2),
    },
    { name: "Week 2", Resolved: resolvedCount, Pending: pendingCount },
  ];

  // 🔹 Clear all data
  const clearData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/clear`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setRequests([]);
      setResolved([]);
      // @ts-ignore
      window.showToast("🧹 All data cleared successfully!");
    } catch {
      // @ts-ignore
      window.showToast("❌ Failed to clear data!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 p-6 text-white">
      <ToastProvider />
      <Header />

      {/* Animated AI Orb */}
      <motion.div
        className="mx-auto my-10 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xl"
        animate={{
          scale: [1, 1.2, 1],
          boxShadow: [
            "0 0 20px rgba(99,102,241,0.5)",
            "0 0 40px rgba(139,92,246,0.8)",
            "0 0 20px rgba(99,102,241,0.5)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <AiCallButton BACKEND_URL={BACKEND_URL} />
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {["pending", "resolved", "learned", "statistics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${activeTab === tab
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105"
              : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
          >
            {tab === "pending"
              ? "Pending"
              : tab === "resolved"
                ? "Resolved"
                : tab === "statistics"
                  ? "Statistics"
                  : "Learned Answers"}
          </button>
        ))}
      </div>

      {/* Pending Requests */}
      {activeTab === "pending" && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            <p className="text-center text-gray-400 mt-4">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-400 mt-4">
              No pending requests 🎉
            </p>
          ) : (
            requests.map((r) => (
              <RequestCard key={r.id} request={r} onResolve={resolveRequest} />
            ))
          )}
        </motion.div>
      )}

      {/* Resolved Requests */}
      {activeTab === "resolved" && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {resolved.length === 0 ? (
            <p className="text-center text-gray-400">No resolved requests yet.</p>
          ) : (
            resolved.map((r, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-900/40 to-green-700/30 backdrop-blur-lg border border-green-500/30 p-6 rounded-2xl shadow-lg"
              >
                <h3 className="font-semibold text-green-300 mb-2">{r.question}</h3>
                <p className="text-green-100">{r.answer}</p>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Learned Answers */}
      {activeTab === "learned" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
        >
          {resolved.length === 0 ? (
            <p className="text-center text-gray-500">No learned answers yet.</p>
          ) : (
            resolved.map((r, i) => (
              <motion.div
                key={i}
                className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200 shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="font-semibold text-indigo-800 mb-1">{r.question}</h3>
                <p className="text-indigo-700">{r.answer}</p>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Statistics */}
      {activeTab === "statistics" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
        >
          <div className="col-span-full flex justify-end mb-4">
            <button
              onClick={clearData}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md"
            >
              Clear All Data 🧹
            </button>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <PieIcon size={20} /> Request Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statsData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 size={20} /> Weekly Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Resolved" fill="#00C49F" />
                <Bar dataKey="Pending" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
