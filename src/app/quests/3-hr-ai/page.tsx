"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, CheckCircle2, ArrowRight, Play, Square, Mic, CheckSquare, Target } from "lucide-react";
import confetti from "canvas-confetti";

export default function QuestThreePage() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const [isActive, setIsActive] = useState(false);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const router = useRouter();

  // Danh sách 5 câu hỏi phỏng vấn phổ biến từ slide
  const questions = [
    "Giới thiệu về bản thân",
    "Tại sao bạn muốn vị trí này?",
    "Điểm mạnh của bạn là gì?",
    "Điểm yếu của bạn là gì?",
    "Bạn đã từng làm việc nhóm chưa?"
  ];

  // Prompt chuẩn R-A-C tối ưu cho Gemini Live (Voice)
  const racPrompt = {
    role: "Đóng vai là một Chuyên gia Tuyển dụng (HR Manager) thực tế và mang tính xây dựng.",
    action: "Hãy phỏng vấn tôi bằng hình thức hỏi đáp từng câu một (tổng cộng 5 câu) bao gồm có giới thiệu bản thân, lý do ứng tuyển, điểm mạnh, điểm yếu, và kinh nghiệm làm việc nhóm. Trọng tâm: Sau khi tôi trả lời mỗi câu, hãy nhận xét nhanh điểm tốt, điểm cần khắc phục, và gợi ý cách trả lời hay hơn rồi mới hỏi câu tiếp theo.",
    context: "Tôi là ứng viên đang thực hành phỏng vấn qua tính năng Voice (Live) của bạn. Hãy phản hồi ngắn gọn, tự nhiên như đang nói chuyện trực tiếp, không cần dùng format văn bản phức tạp."
  };

  const fullPrompt = `[ROLE]: ${racPrompt.role}\n[ACTION]: ${racPrompt.action}\n[CONTEXT]: ${racPrompt.context}`;

  // Logic đếm ngược thời gian
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setIsActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

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

  const handleCheck = (index: number) => {
    if (checkedItems.includes(index)) {
      setCheckedItems(checkedItems.filter(i => i !== index));
    } else {
      setCheckedItems([...checkedItems, index]);
    }
  };

  const handleComplete = () => {
    if (checkedItems.length >= 3) {
      // BẮN DATA TRẠM 3
      const playerName = localStorage.getItem("gemini_player_name") || "Chiến thần AI";
      fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({ quest: 3, playerName, data: { completedQuestions: checkedItems.length } })
      }).catch(e => console.error(e));

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => router.push("/quests/4-startup-arena"), 2500);
    } else {
      alert("Hãy luyện tập và tick ít nhất 3 câu hỏi để tự tin đi tiếp nhé!");
    }
  };
  
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 pb-24">
      <div className="max-w-4xl mx-auto pt-8">
        <header className="mb-8 text-center">
          <h2 className="text-sm font-bold text-red-500 tracking-wider uppercase mb-1">Trạm 3</h2>
          <h1 className="text-3xl font-black mb-2">Đối Mặt &quot;HR AI&quot;</h1>
          <p className="text-gray-600">Bật Gemini Live trên điện thoại và bắt đầu trò chuyện nào!</p>
        </header>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Cột trái: Đồng hồ & Prompt */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-6 space-y-6">
            
            {/* Đồng hồ đếm ngược */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <h3 className="font-bold text-gray-500 mb-2 uppercase text-sm tracking-widest">Thời gian thực hành</h3>
              <div className={`text-6xl font-black tabular-nums my-4 ${timeLeft <= 60 && timeLeft > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={toggleTimer}
                className={`px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto transition-colors ${
                  isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isActive ? <><Square size={18} /> Tạm dừng</> : <><Play size={18} /> {timeLeft < 300 ? 'Tiếp tục' : 'Bắt đầu tính giờ'}</>}
              </button>
            </div>

            {/* Khung Prompt R-A-C */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-gray-800">
                  <Target size={20} className="text-blue-500"/> Lấy Prompt R-A-C
                </h3>
                <button 
                  onClick={handleCopy} 
                  className="p-2 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center gap-2 hover:bg-blue-200 transition-colors"
                  title="Copy Prompt"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} 
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">Mở app Gemini, bấm vào biểu tượng Gemini Live <Mic size={14} className="inline text-blue-500"/> và đọc/dán câu lệnh này:</p>
              
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
                  <span className="text-gray-700">{racPrompt.context}</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Cột phải: Checklist */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="md:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-gray-800 text-xl">
              <CheckSquare size={24} className="text-orange-500"/> Checklist Luyện Tập
            </h3>
            
            <div className="space-y-3 flex-1">
              {questions.map((q, index) => (
                <div 
                  key={index}
                  onClick={() => handleCheck(index)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    checkedItems.includes(index) 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    checkedItems.includes(index) ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                  }`}>
                    {checkedItems.includes(index) && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className={`font-medium ${checkedItems.includes(index) ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                    {q}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleComplete}
              className="mt-6 w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
            >
              Hoàn thành & Đi Boss Cuối <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}