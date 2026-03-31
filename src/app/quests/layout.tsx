"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function QuestsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentQuest, setCurrentQuest] = useState(1);

  // Polling để nghe ngóng tín hiệu mở khóa từ Admin
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("/api/game");
        // THÊM 1 DÒNG NÀY ĐỂ CHECK LỖI API:
        if (!res.ok) throw new Error("API đang bị lỗi hoặc chưa kết nối Database");
        
        const data = await res.json();
        setCurrentQuest(data.currentQuest || 1);
      } catch (e) {
        // Tắt log đỏ lòm trên console, thay bằng fallback tĩnh
        console.warn("Chưa đồng bộ được trạng thái game, đang thử lại...");
      }
    };
    
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tự động nhận diện sinh viên đang ở Trạm mấy dựa vào URL
  let requiredQuest = 1;
  if (pathname.includes("2-jd-scanner")) requiredQuest = 2;
  if (pathname.includes("3-hr-ai")) requiredQuest = 3;
  if (pathname.includes("4-startup-arena")) requiredQuest = 4;

  // Nếu Trạm hiện tại lớn hơn tiến độ Admin cho phép -> Khóa!
  if (currentQuest < requiredQuest) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4 text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl text-center max-w-lg border border-white/20 shadow-2xl"
        >
          <div className="bg-blue-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={48} className="text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Trạm này chưa mở!</h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Đừng vội nhé! Hãy chờ diễn giả hoàn thành phần thuyết trình và cấp quyền truy cập trên màn hình lớn.
          </p>
        </motion.div>
      </main>
    );
  }

  // Nếu hợp lệ, cho phép render nội dung trang bên trong
  return <>{children}</>;
}