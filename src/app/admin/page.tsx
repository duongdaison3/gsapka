"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Trash2, Rocket, Star, Users, FileText, Target, Mic, Lightbulb } from "lucide-react";
import confetti from "canvas-confetti";

interface SubmissionRecord {
  id: string;
  playerName: string;
  createdAt: string;
  data: {
    cvType?: string;
    result?: string;
    targetJD?: string;
    matchScore?: number;
    missingSkills?: string;
    completedQuestions?: number;
    brandName?: string;
    slogan?: string;
    idea?: string;
  };
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState({ q1: [], q2: [], q3: [], q4: [] });
  const [activeTab, setActiveTab] = useState(4); // Mặc định mở Boss Cuối
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);

  // Polling Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const subRes = await fetch("/api/submissions");
        setSubmissions(await subRes.json());

        const gameRes = await fetch("/api/game");
        const gameData = await gameRes.json();
        setIsStarted(gameData.isStarted);
        if (gameData.isStarted && gameData.endTime > 0) {
          setTimeLeft(Math.max(0, Math.floor((gameData.endTime - Date.now()) / 1000)));
        } else setTimeLeft(900);
      } catch (error) { console.error("Lỗi lấy dữ liệu:", error); }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
      return () => clearInterval(interval);
    }
  }, [isStarted, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleStartGame = async () => {
    await fetch("/api/game", { method: "POST", body: JSON.stringify({ action: "start" }) });
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.3 } });
  };

  const handleClear = async () => {
    if (confirm("Xóa toàn bộ dữ liệu của sinh viên?")) {
      await fetch("/api/submissions", { method: "DELETE" });
      setSubmissions({ q1: [], q2: [], q3: [], q4: [] });
    }
  };

  const currentData = submissions[`q${activeTab}` as keyof typeof submissions] || [];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 overflow-hidden">
      {/* HEADER & CONTROL PANEL */}
      <header className="flex items-center justify-between bg-gray-900 border border-gray-800 p-6 rounded-3xl mb-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-4 rounded-2xl"><Rocket size={32} /></div>
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Gemini Quest - Control Center</h1>
            <p className="text-gray-400 font-medium tracking-wide">Workshop Live Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Time (Boss Cuối)</p>
            <div className={`text-5xl font-black tabular-nums ${timeLeft <= 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{formatTime(timeLeft)}</div>
          </div>
          <div className="flex items-center gap-3 border-l border-gray-800 pl-8">
            {!isStarted ? (
              <button onClick={handleStartGame} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold flex items-center gap-2"><Play size={20} /> START BOSS</button>
            ) : (
              <button onClick={() => fetch("/api/game", { method: "POST", body: JSON.stringify({ action: "reset" }) })} className="px-4 py-3 bg-orange-500 rounded-xl font-bold flex items-center gap-2"><Square size={20} /> Stop</button>
            )}
            <button onClick={handleClear} className="p-3 bg-gray-800 hover:text-red-400 rounded-xl"><Trash2 size={24} /></button>
          </div>
        </div>
      </header>

      {/* TABS CHUYỂN TRẠM */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 1, name: "Trạm 1: Sửa CV", icon: <FileText size={18}/> },
          { id: 2, name: "Trạm 2: Quét JD", icon: <Target size={18}/> },
          { id: 3, name: "Trạm 3: HR Voice", icon: <Mic size={18}/> },
          { id: 4, name: "Trạm 4: Startup", icon: <Lightbulb size={18}/> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
          >
            {tab.icon} {tab.name}
            <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">{submissions[`q${tab.id}` as keyof typeof submissions].length}</span>
          </button>
        ))}
      </div>

      {/* RENDER DATA THEO TAB */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        <AnimatePresence mode="popLayout">
          {currentData.map((record: SubmissionRecord, index: number) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-800">
                <span className="text-emerald-400 font-bold flex items-center gap-2"><Users size={16}/> {record.playerName}</span>
                <span className="text-gray-600 text-xs">{new Date(record.createdAt).toLocaleTimeString()}</span>
              </div>

              {/* Tùy chỉnh hiển thị theo từng trạm */}
              {activeTab === 1 && (
                <>
                  <p className="text-xs text-blue-400 mb-2">{record.data.cvType}</p>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{record.data.result}</p>
                </>
              )}
              {activeTab === 2 && (
                <>
                  <p className="text-xs text-purple-400 mb-2">Mục tiêu: {record.data.targetJD}</p>
                  <div className="text-3xl font-black text-white mb-2">{record.data.matchScore}% <span className="text-sm font-normal text-gray-500">Độ match</span></div>
                  <p className="text-gray-400 text-sm"><span className="text-red-400">Thiếu:</span> {record.data.missingSkills}</p>
                </>
              )}
              {activeTab === 3 && (
                <div className="text-center py-4">
                  <Mic size={40} className="mx-auto text-blue-500 mb-2 opacity-50"/>
                  <p className="text-gray-300">Đã luyện tập</p>
                  <div className="text-4xl font-black text-emerald-400">{record.data.completedQuestions}/5 <span className="text-lg">câu</span></div>
                </div>
              )}
              {activeTab === 4 && (
                <>
                  <h3 className="text-xl font-black text-white mb-1">{record.data.brandName}</h3>
                  <p className="text-emerald-400 font-medium italic text-sm mb-3">&quot;{record.data.slogan}&quot;</p>
                  <div className="bg-black/30 p-3 rounded-lg overflow-y-auto max-h-[150px] custom-scrollbar">
                    <p className="text-gray-400 text-sm">{record.data.idea}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {currentData.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-600 font-medium">
            Chưa có dữ liệu ở trạm này. Đang đợi sinh viên thực hành...
          </div>
        )}
      </div>
    </main>
  );
}