"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, CheckCircle2, Rocket, Lightbulb, PenTool, Sparkles, Send, Lock, Target } from "lucide-react";
import confetti from "canvas-confetti";

export default function QuestFourPage() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form State
  const [brandName, setBrandName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [idea, setIdea] = useState("");

  // Prompt R-A-C siêu xịn cho việc gọi vốn
  const racPrompt = {
    role: "Đóng vai là một Chuyên gia Khởi nghiệp (Startup Founder) và Giám đốc Sáng tạo (Creative Director) thế hệ Gen Z.",
    action: "Hãy tư vấn xây dựng bộ nhận diện thương hiệu cho dự án của tôi. Gợi ý 3 lựa chọn thật 'catchy', bao gồm: (1) Tên thương hiệu, (2) Slogan ngắn gọn, (3) Tuyên ngôn giá trị (Core value) gói gọn trong 1 câu.",
    context: "Tôi đang tham gia cuộc thi Start-up 0 đồng. Ý tưởng của tôi là: [ĐIỀN Ý TƯỞNG CỦA BẠN VÀO ĐÂY]. Mục tiêu là giải quyết vấn đề thực tế một cách sáng tạo và thu hút giới trẻ."
  };

  const fullPrompt = `[ROLE]: ${racPrompt.role}\n[ACTION]: ${racPrompt.action}\n[CONTEXT]: ${racPrompt.context}`;

  // Sync thời gian với Server API
  useEffect(() => {
    let syncInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    // 1. Hàm kiểm tra tín hiệu từ Admin
    const fetchGameState = async () => {
      try {
        const res = await fetch("/api/game");
        const data = await res.json();
        
        setIsStarted(data.isStarted);
        
        if (data.isStarted && data.endTime > 0) {
          const remaining = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
          setTimeLeft(remaining);
        } else {
          setTimeLeft(900); // Reset về 15 phút nếu chưa bắt đầu
        }
      } catch (error) {
        console.error("Lỗi đồng bộ thời gian:", error);
      }
    };

    // Gọi lần đầu khi load trang
    fetchGameState();

    // 2. Polling mỗi 2 giây để check xem Admin đã bấm Start chưa
    if (!isStarted && !isSubmitted) {
      syncInterval = setInterval(fetchGameState, 2000);
    }

    // 3. Nếu Admin đã bấm Start, tự đếm ngược ở Client cho mượt
    if (isStarted && !isSubmitted && timeLeft > 0) {
      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      clearInterval(syncInterval);
      clearInterval(countdownInterval);
    };
  }, [isStarted, isSubmitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStarted) {
      alert("Chưa đến giờ nộp bài! Hãy chờ Admin phát lệnh nhé.");
      return;
    }

    if (brandName && slogan && idea) {
      setIsSubmitted(true);
      
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      // MỚI: Bắn dữ liệu lên Server
      const playerName = localStorage.getItem("gemini_player_name") || "Chiến thần AI";
      fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({ quest: 4, playerName, data: { brandName, slogan, idea } })
      }).catch(err => console.error("Lỗi gửi bài:", err));
      
    } else {
      alert("Hãy điền đủ Tên, Slogan và Ý tưởng để chuẩn bị gọi vốn nhé!");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 pb-24">
      <div className="max-w-6xl mx-auto pt-8">
        <header className="mb-8 text-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-block bg-yellow-100 p-3 rounded-full mb-4">
            <Sparkles size={32} className="text-yellow-600" />
          </motion.div>
          <h2 className="text-sm font-bold text-yellow-600 tracking-wider uppercase mb-1">Boss Cuối</h2>
          <h1 className="text-4xl font-black mb-2">Đấu Trường Khởi Nghiệp</h1>
          <p className="text-gray-600">Start-up 0 đồng với sức mạnh của Gemini</p>
        </header>

        {isSubmitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-3xl shadow-xl border border-yellow-200 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">Hồ sơ đã bay lên màn hình lớn!</h2>
            <p className="text-gray-600 text-lg mb-8">Bạn có <strong>1 phút</strong> để Pitching (Thuyết trình gọi vốn) nếu được gọi tên!</p>
            <div className="p-6 bg-gray-50 rounded-2xl text-left border border-gray-100">
              <h3 className="font-bold text-xl text-blue-600 mb-1">{brandName}</h3>
              <p className="text-sm text-gray-500 italic mb-4">&quot;{slogan}&quot;</p>
              <p className="text-gray-700">{idea}</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Cột trái: Đồng hồ & Hướng dẫn */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 space-y-6">
              
              {/* KHU VỰC ĐỒNG HỒ - CÓ OVERLAY KHI CHƯA BẮT ĐẦU */}
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-8 rounded-3xl shadow-lg text-white text-center relative overflow-hidden min-h-[200px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Rocket size={100} /></div>
                
                {!isStarted ? (
                  <div className="relative z-10 flex flex-col items-center justify-center animate-pulse">
                    <Lock size={40} className="text-blue-300 mb-4" />
                    <h3 className="font-bold text-xl text-white">Đang chờ Admin mở khóa...</h3>
                    <p className="text-sm text-blue-200 mt-2">Hãy thảo luận nhóm trước nhé!</p>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <h3 className="font-bold text-blue-200 mb-2 uppercase text-sm tracking-widest">Thời gian chuẩn bị</h3>
                    <div className={`text-7xl font-black tabular-nums my-4 ${timeLeft <= 300 ? 'text-red-400' : 'text-white'}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <p className="text-sm text-blue-100">Gấp rút hoàn thiện Pitch Deck nào!</p>
                  </div>
                )}
              </div>

              {/* KHU VỰC PROMPT R-A-C */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2 text-gray-800">
                    <Target size={20} className="text-blue-500"/> Prompt Gọi Vốn (R-A-C)
                  </h3>
                  <button 
                    onClick={handleCopy} 
                    className="p-2 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center gap-2 hover:bg-blue-200 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} 
                  </button>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm leading-relaxed mb-2">
                  <div className="mb-2">
                    <span className="font-bold text-blue-800 uppercase text-xs tracking-wider bg-blue-200 px-2 py-1 rounded mr-2">Role</span>
                    <span className="text-gray-700">{racPrompt.role}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-bold text-green-800 uppercase text-xs tracking-wider bg-green-200 px-2 py-1 rounded mr-2">Action</span>
                    <span className="text-gray-700">{racPrompt.action}</span>
                  </div>
                  <div>
                    <span className="font-bold text-orange-800 uppercase text-xs tracking-wider bg-orange-200 px-2 py-1 rounded mr-2">Context</span>
                    <span className="text-gray-700 font-medium text-orange-700 italic">
                      Tôi đang tham gia cuộc thi Start-up 0 đồng. Ý tưởng của tôi là: [ĐIỀN Ý TƯỞNG CỦA BẠN VÀO ĐÂY]. Mục tiêu là...
                    </span>
                  </div>
                </div>
              </div>

            </motion.div>

            {/* Cột phải: Form nhập liệu (Giữ nguyên) */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold flex items-center gap-2 mb-8 text-gray-800 text-2xl border-b pb-4">
                  <PenTool size={24} className="text-blue-500"/> Hoàn thiện Pitch Deck
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">1. Tên Thương Hiệu (Brand Name)</label>
                    <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} disabled={!isStarted} placeholder="VD: FoodMate..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-lg font-bold text-blue-600 disabled:opacity-50" required />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">2. Slogan siêu cuốn</label>
                    <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)} disabled={!isStarted} placeholder="VD: Tìm đồ ăn rẻ quanh trường chỉ 30 giây..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition-all italic text-gray-700 disabled:opacity-50" required />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">3. Mô tả ngắn gọn Sản phẩm / Dịch vụ</label>
                    <textarea value={idea} onChange={(e) => setIdea(e.target.value)} disabled={!isStarted} placeholder="Giải quyết vấn đề gì? Khác biệt ở đâu?..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-400 outline-none transition-all text-gray-700 disabled:opacity-50" rows={4} required />
                  </div>

                  <button type="submit" disabled={!isStarted} className={`w-full py-5 mt-4 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-transform shadow-lg ${isStarted ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-blue-500/30' : 'bg-gray-400 cursor-not-allowed'}`}>
                    Gửi Ý Tưởng Lên Sân Khấu <Send size={24} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}