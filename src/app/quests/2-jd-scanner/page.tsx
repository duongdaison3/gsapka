"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, CheckCircle2, ArrowRight, Briefcase, Percent, Target, Download, FileText } from "lucide-react";
import confetti from "canvas-confetti";

// Data map thẳng vào thư mục public của cậu
const JDS = [
  { 
    id: "mkt", 
    title: "Marketing Intern", 
    jdFile: "/jd/mkt.md",
    cvFile: "/cv/lmt-mkt.jpeg",
    rac: {
      role: "Đóng vai là một chuyên gia Tuyển dụng Marketing (Marketing HR Specialist) giàu kinh nghiệm.",
      action: "Hãy phân tích mức độ phù hợp giữa CV và JD. Trả về cho tôi 3 thông tin: (1) Chấm điểm % độ match, (2) Liệt kê 3 kỹ năng tôi còn thiếu, (3) Gợi ý 2 cách viết lại CV cho ấn tượng hơn.",
      context: "Tôi là ứng viên ứng tuyển vị trí Marketing Intern. Dưới đây là Job Description (JD) và CV tôi đính kèm bằng hình ảnh."
    }
  },
  { 
    id: "sale", 
    title: "Nhân viên Tuyển sinh", 
    jdFile: "/jd/sale.md",
    cvFile: "/cv/lmt-sale.jpeg",
    rac: {
      role: "Đóng vai là một chuyên gia Tuyển dụng Sales/Tuyển sinh (Sales HR Specialist).",
      action: "Hãy phân tích mức độ phù hợp giữa CV và JD. Trả về cho tôi 3 thông tin: (1) Chấm điểm % độ match, (2) Liệt kê 3 kỹ năng tôi còn thiếu, (3) Gợi ý 2 cách viết lại CV cho ấn tượng hơn.",
      context: "Tôi đang ứng tuyển vị trí Nhân viên Tuyển sinh. Dưới đây là Job Description (JD) và CV tôi đính kèm bằng hình ảnh."
    }
  },
  { 
    id: "web", 
    title: "Frontend Web Dev", 
    jdFile: "/jd/web.md",
    cvFile: "/cv/ntd-web.jpeg",
    rac: {
      role: "Đóng vai là một Tech Recruiter chuyên mảng Frontend Web Developer.",
      action: "Hãy phân tích mức độ phù hợp giữa CV và JD. Trả về cho tôi 3 thông tin: (1) Chấm điểm % độ match, (2) Liệt kê 3 công nghệ/kỹ năng tôi còn thiếu, (3) Gợi ý 2 cách tối ưu lại dự án trong CV.",
      context: "Tôi đang ứng tuyển vị trí Frontend Web Developer. Dưới đây là Job Description (JD) và CV tôi đính kèm bằng hình ảnh."
    }
  },
  { 
    id: "cs", 
    title: "Nhân viên CSKH", 
    jdFile: "/jd/cs.md",
    cvFile: "/cv/nth-cs.jpeg",
    rac: {
      role: "Đóng vai là một chuyên gia Tuyển dụng Dịch vụ Khách hàng (Customer Service HR).",
      action: "Hãy phân tích mức độ phù hợp giữa CV và JD. Trả về cho tôi 3 thông tin: (1) Chấm điểm % độ match, (2) Liệt kê 3 kỹ năng giao tiếp/xử lý tình huống còn thiếu, (3) Gợi ý 2 cách viết lại CV.",
      context: "Tôi đang ứng tuyển vị trí Nhân viên Chăm sóc Khách hàng. Dưới đây là Job Description (JD) và CV tôi đính kèm bằng hình ảnh."
    }
  },
];

export default function QuestTwoPage() {
  const [activeTab, setActiveTab] = useState(JDS[0].id);
  const [jdContent, setJdContent] = useState("Đang tải nội dung JD...");
  const [copied, setCopied] = useState(false);
  const [matchScore, setMatchScore] = useState("");
  const [missingSkills, setMissingSkills] = useState("");
  const router = useRouter();

  const activeData = JDS.find((j) => j.id === activeTab) || JDS[0];

  // Fetch nội dung file Markdown mỗi khi đổi Tab
  useEffect(() => {
    fetch(activeData.jdFile)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy file");
        return res.text();
      })
      .then((text) => setJdContent(text))
      .catch(() => setJdContent("⚠️ Lỗi: Không thể tải JD. Vui lòng kiểm tra lại đường dẫn file trong thư mục public/jd/"));
  }, [activeData.jdFile]);

  // Nối R-A-C và nội dung JD thành 1 prompt hoàn chỉnh
  const fullPrompt = `[ROLE]: ${activeData.rac.role}\n[ACTION]: ${activeData.rac.action}\n[CONTEXT]: ${activeData.rac.context}\n\n[CHI TIẾT JOB DESCRIPTION]:\n${jdContent}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    if (matchScore && missingSkills.trim()) {
      // BẮN DATA TRẠM 2
      const playerName = localStorage.getItem("gemini_player_name") || "Chiến thần AI";
      fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({ quest: 2, playerName, data: { targetJD: activeData.title, matchScore, missingSkills } })
      }).catch(e => console.error(e));

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => router.push("/quests/3-hr-ai"), 2500);
    } else {
      alert("Hãy nhập % độ phù hợp và kỹ năng còn thiếu nhé!");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 pb-24">
      <div className="max-w-6xl mx-auto pt-8">
        <header className="mb-8 text-center">
          <h2 className="text-sm font-bold text-green-600 tracking-wider uppercase mb-1">Trạm 2</h2>
          <h1 className="text-3xl font-black mb-2">Máy Quét JD & Bác Sĩ CV</h1>
          <p className="text-gray-600">Đo lường độ &quot;match&quot; giữa bạn và nhà tuyển dụng</p>
        </header>

        {/* Khu vực chọn JD */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-center">
          <div className="flex flex-wrap gap-2 justify-center">
            {JDS.map((jd) => (
              <button
                key={jd.id}
                onClick={() => setActiveTab(jd.id)}
                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === jd.id 
                    ? "bg-green-500 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {jd.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Cột Trái: JD Viewer & Nút tải CV */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                <FileText size={20} className="text-green-500"/> Chi tiết Job Description
              </h3>
              <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-y-auto max-h-[400px]">
                {/* Render Markdown đơn giản bằng whitespace-pre-wrap */}
                <pre className="text-sm text-gray-700 font-sans whitespace-pre-wrap break-words">
                  {jdContent}
                </pre>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-2 text-gray-800">Bạn chưa có sẵn CV?</h3>
              <p className="text-sm text-gray-600 mb-4">Tải CV mẫu của vị trí này để thực hành ngay nhé.</p>
              <a 
                href={activeData.cvFile} 
                download={`CV_Mau_${activeData.id}.jpeg`}
                className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-200 transition-colors"
              >
                <Download size={18} /> Tải CV Mẫu ({activeData.title})
              </a>
            </div>
          </motion.div>

          {/* Cột Phải: Prompt R-A-C & Báo cáo kết quả */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Prompt Block */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-gray-800">
                  <Target size={20} className="text-blue-500"/> Lấy Prompt thần chú (R-A-C)
                </h3>
                <button 
                  onClick={handleCopy} 
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center gap-2 hover:bg-blue-200 transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />} 
                  {copied ? "Đã chép tất cả!" : "Copy Prompt + JD"}
                </button>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm leading-relaxed mb-2">
                <div className="mb-2">
                  <span className="font-bold text-blue-800 uppercase text-xs tracking-wider bg-blue-200 px-2 py-1 rounded mr-2">Role</span>
                  <span className="text-gray-700">{activeData.rac.role}</span>
                </div>
                <div className="mb-2">
                  <span className="font-bold text-green-800 uppercase text-xs tracking-wider bg-green-200 px-2 py-1 rounded mr-2">Action</span>
                  <span className="text-gray-700">{activeData.rac.action}</span>
                </div>
                <div>
                  <span className="font-bold text-orange-800 uppercase text-xs tracking-wider bg-orange-200 px-2 py-1 rounded mr-2">Context</span>
                  <span className="text-gray-700">{activeData.rac.context}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">*Nhấn nút Copy ở trên, mở tab Gemini, tải ảnh CV lên rồi dán (Ctrl+V) vào để phân tích nhé. Text copy đã tự động bao gồm cả nội dung JD.</p>
            </div>

            {/* Báo cáo kết quả */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-6 text-gray-800">
                  <Percent size={20} className="text-purple-500"/> Báo cáo từ Gemini
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gemini chấm bạn bao nhiêu %?</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={matchScore}
                        onChange={(e) => setMatchScore(e.target.value)}
                        placeholder="VD: 75"
                        className="w-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none font-bold text-lg"
                      />
                      <span className="text-2xl font-black text-gray-300">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kỹ năng nào bạn còn thiếu?</label>
                    <textarea
                      value={missingSkills}
                      onChange={(e) => setMissingSkills(e.target.value)}
                      placeholder="Ghi lại ngắn gọn những kỹ năng Gemini nhắc nhở bạn..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-green-400 outline-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="mt-6 w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                Ghi nhận & Đi tiếp <ArrowRight size={18} />
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}