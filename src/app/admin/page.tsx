"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Trash2, Rocket, Star, Users, FileText, Target, Mic, Lightbulb, Lock, Unlock, KeyRound } from "lucide-react";
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
  // --- AUTH STATE (Bảo mật màn hình Admin) ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_auth_gemini") === "true";
    }
    return false;
  });
  const [passcode, setPasscode] = useState("");

  const [submissions, setSubmissions] = useState({ q1: [], q2: [], q3: [], q4: [] });
  const [activeTab, setActiveTab] = useState(4); 
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [currentQuest, setCurrentQuest] = useState(1);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ĐỔI MẬT KHẨU CỦA CẬU Ở ĐÂY:
    if (passcode === "pea2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth_gemini", "true"); // Lưu lại để F5 không bị văng ra
    } else {
      alert("Mật khẩu không chính xác! Hãy nhập lại.");
      setPasscode("");
    }
  };


  // Polling Data (Chỉ gọi API khi đã đăng nhập thành công để tiết kiệm tài nguyên)
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const subRes = await fetch("/api/submissions");
        setSubmissions(await subRes.json());

        const gameRes = await fetch("/api/game");
        const gameData = await gameRes.json();
        
        setIsStarted(gameData.isStarted);
        setCurrentQuest(gameData.currentQuest || 1);

        if (gameData.isStarted && gameData.endTime > 0) {
          setTimeLeft(Math.max(0, Math.floor((gameData.endTime - Date.now()) / 1000)));
        } else setTimeLeft(900);
      } catch (error) { console.error("Lỗi lấy dữ liệu:", error); }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
    if (confirm("⚠️ Xóa toàn bộ dữ liệu bài nộp của sinh viên?")) {
      await fetch("/api/submissions", { method: "DELETE" });
      setSubmissions({ q1: [], q2: [], q3: [], q4: [] });
    }
  };

  const handleUnlockQuest = async (questId: number) => {
    const actionText = currentQuest >= questId ? "đặt lại tiến độ về" : "MỞ KHÓA";
    if (confirm(`⚠️ XÁC NHẬN: Bạn có chắc chắn muốn ${actionText} Trạm ${questId} cho toàn bộ hội trường không?`)) {
      await fetch("/api/game", { 
        method: "POST", 
        body: JSON.stringify({ action: "setQuest", quest: questId }) 
      });
    }
  };

  const currentData = submissions[`q${activeTab}` as keyof typeof submissions] || [];

  // === MÀN HÌNH KHÓA (BẢO MẬT) ===
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center"
        >
          <div className="bg-blue-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound size={40} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Khu Vực Tuyệt Mật</h1>
          <p className="text-gray-400 mb-6">Chỉ dành cho Ban Tổ Chức (Speaker).</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Nhập mật khẩu truy cập..."
              className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-4 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-center tracking-widest text-lg"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
            >
              Vào Dashboard
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  // === GIAO DIỆN ADMIN CHÍNH ===
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
            <button onClick={handleClear} className="p-3 bg-gray-800 hover:text-red-400 rounded-xl" title="Xóa toàn bộ Data"><Trash2 size={24} /></button>
          </div>
        </div>
      </header>

      {/* THANH ĐIỀU KHIỂN TIẾN ĐỘ SỰ KIỆN */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl mb-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            Điều khiển Luồng sự kiện
          </h2>
          <p className="text-sm text-gray-400">Sinh viên sẽ bị chặn lại nếu cố tình đi trước tiến độ.</p>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((q) => (
            <button
              key={q}
              onClick={() => handleUnlockQuest(q)}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                currentQuest >= q
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-800 text-gray-500 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {currentQuest >= q ? <Unlock size={18} /> : <Lock size={18} />}
              Mở Trạm {q}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CHUYỂN TRẠM */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 1, name: "Data Trạm 1", icon: <FileText size={18}/> },
          { id: 2, name: "Data Trạm 2", icon: <Target size={18}/> },
          { id: 3, name: "Data Trạm 3", icon: <Mic size={18}/> },
          { id: 4, name: "Data Trạm 4", icon: <Lightbulb size={18}/> },
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