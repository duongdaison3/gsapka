"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2, ArrowRight, Zap, Download, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti";

// Data 2 mẫu CV theo chuẩn R-A-C
const CV_DATA = [
  {
    id: 1,
    tab: "CV 1: Chăm sóc Khách hàng",
    imagePath: "/cv-1.png", // Đảm bảo cậu đã bỏ file cv-1.png vào folder public
    rac: {
      role: "Đóng vai là một chuyên gia tuyển dụng (HR Manager) giàu kinh nghiệm.",
      action: "Hãy phân tích, chỉnh sửa và viết lại đoạn Mục tiêu nghề nghiệp trong ảnh đính kèm thành 3 phiên bản chuyên nghiệp: (1) Ngắn gọn & đi thẳng vào vấn đề, (2) Nhấn mạnh kỹ năng, (3) Nhấn mạnh mục tiêu phát triển.",
      context: "Đây là CV của một ứng viên ứng tuyển vị trí Nhân viên Chăm sóc Khách hàng. CV gốc đang dùng ngôn từ quá suồng sã, thiếu nghiêm túc ('làm việc nhẹ nhàng', 'không bị mắng'). Hãy biến nó thành văn phong chuẩn mực nhưng vẫn năng động."
    }
  },
  {
    id: 2,
    tab: "CV 2: Intern Web Developer",
    imagePath: "/cv-2.png", // Đảm bảo cậu đã bỏ file cv-2.png vào folder public
    rac: {
      role: "Đóng vai là một Tech Recruiter (Chuyên gia tuyển dụng IT) giàu kinh nghiệm.",
      action: "Hãy phân tích, chỉnh sửa và viết lại đoạn Mục tiêu nghề nghiệp trong ảnh đính kèm thành 3 phiên bản chuyên nghiệp: (1) Ngắn gọn & đi thẳng vào vấn đề, (2) Nhấn mạnh tinh thần học hỏi, (3) Định hướng phát triển rõ ràng.",
      context: "Đây là CV của một sinh viên ứng tuyển Thực tập sinh Web Developer. CV gốc đang có mục tiêu quá viển vông ('Senior sau 6 tháng', 'cạnh tranh Google'). Hãy điều chỉnh lại cho thực tế, thể hiện thái độ khiêm tốn và cầu tiến."
    }
  }
];

export default function QuestOnePage() {
  const [activeCV, setActiveCV] = useState(0);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState("");
  const router = useRouter();

  const currentCV = CV_DATA[activeCV];
  // Ghép nối prompt để copy
  const fullPrompt = `[ROLE]: ${currentCV.rac.role}\n[ACTION]: ${currentCV.rac.action}\n[CONTEXT]: ${currentCV.rac.context}`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    if (result.trim().length > 20) {
      // BẮN DATA TRẠM 1
      fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({ quest: 1, playerName, data: { cvType: CV_DATA[activeCV].tab, result } })
      }).catch(e => console.error(e));

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => router.push("/quests/2-jd-scanner"), 2500);
    } else {
      alert("Hãy nhập kết quả xịn sò từ Gemini vào nhé!");
    }
  };

  const playerName = typeof window !== "undefined" ? localStorage.getItem("gemini_player_name") || "Chiến thần AI" : "Chiến thần AI";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 pb-24">
      <div className="max-w-6xl mx-auto pt-8">
        <header className="mb-8 text-center">
          <h2 className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-1">Trạm 1</h2>
          <h1 className="text-3xl font-black mb-2">Giải Cứu CV Thảm Họa</h1>
          <p className="text-gray-600">Sẵn sàng biến hình chưa, {playerName}?</p>
        </header>

        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            {CV_DATA.map((cv, index) => (
              <button
                key={cv.id}
                onClick={() => setActiveCV(index)}
                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeCV === index 
                    ? "bg-blue-50 text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {cv.tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Cột trái: Hiển thị CV & Nút Tải */}
          <motion.div 
            key={`img-${activeCV}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold w-full">
              <ImageIcon size={20} className="text-purple-500" />
              <h3>Ảnh CV cần giải cứu</h3>
            </div>
            <div className="flex-1 w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative group flex items-center justify-center min-h-[300px]">
              {/* Hiển thị ảnh (Cần file thực tế trong folder public) */}
              <img 
                src={currentCV.imagePath} 
                alt={currentCV.tab} 
                className="w-full h-auto object-contain max-h-[400px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Chưa+có+ảnh+trong+thư+mục+public';
                }}
              />
            </div>
            <a 
              href={currentCV.imagePath} 
              download={`CV_Thảm_Họa_${currentCV.id}.png`}
              className="mt-4 w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors"
            >
              <Download size={18} /> Tải ảnh CV này về máy
            </a>
          </motion.div>

          {/* Cột giữa: Nhiệm vụ & Prompt R-A-C */}
          <motion.div 
            key={`prompt-${activeCV}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold">
              <Zap size={20} />
              <h3>Nhiệm vụ của bạn</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              1. <strong>Tải ảnh CV</strong> bên trái về máy.<br/>
              2. <strong>Copy Prompt mẫu</strong> theo khung R-A-C bên dưới.<br/>
              3. Mở Gemini, tải ảnh lên kèm Prompt và xem phép thuật.<br/>
              4. Dán kết quả vào ô bên phải để qua màn!
            </p>
            
            <div className="relative bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm leading-relaxed">
              <div className="mb-2">
                <span className="font-bold text-blue-800 uppercase text-xs tracking-wider bg-blue-200 px-2 py-1 rounded mr-2">Role</span>
                <span className="text-gray-700">{currentCV.rac.role}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold text-green-800 uppercase text-xs tracking-wider bg-green-200 px-2 py-1 rounded mr-2">Action</span>
                <span className="text-gray-700">{currentCV.rac.action}</span>
              </div>
              <div>
                <span className="font-bold text-orange-800 uppercase text-xs tracking-wider bg-orange-200 px-2 py-1 rounded mr-2">Context</span>
                <span className="text-gray-700">{currentCV.rac.context}</span>
              </div>

              <button 
                onClick={handleCopyPrompt}
                className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm hover:bg-blue-100 transition-colors"
                title="Copy Prompt"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} className="text-blue-500" />}
              </button>
            </div>
          </motion.div>

          {/* Cột phải: Khung dán kết quả */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
          >
            <h3 className="font-bold mb-4 text-gray-800">Kết quả từ Gemini 🪄</h3>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Dán Profile Summary mới của bạn vào đây..."
              className="flex-1 w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all font-sans"
            />
            <button
              onClick={handleComplete}
              className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Hoàn thành <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}