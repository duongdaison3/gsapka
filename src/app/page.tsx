"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Rocket, Sparkles } from "lucide-react";

export default function LobbyPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Lưu tên người chơi vào localStorage để dùng cho các trạm sau
      localStorage.setItem("gemini_player_name", name);
      router.push("/quests/1-cv-rescue");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-white/20"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-blue-500 p-4 rounded-full shadow-lg shadow-blue-500/50">
            <Rocket size={48} className="text-white" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          Gemini Quest <Sparkles className="text-yellow-400" />
        </h1>
        <p className="text-blue-200 mb-8">Trợ lý AI - Nâng cấp bản thân</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Nhập tên/nickname của bạn..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            Bắt đầu hành trình
          </button>
        </form>
      </motion.div>
    </main>
  );
}