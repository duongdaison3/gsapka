import { NextResponse } from "next/server";

// Lưu tạm data trong RAM (Vì là workshop demo nên cách này nhanh nhất)
interface Idea {
  id: string;
  createdAt: string;
  [key: string]: unknown;
}

let ideas: Idea[] = [];

export async function GET() {
  // Admin gọi GET để lấy toàn bộ danh sách ý tưởng
  return NextResponse.json(ideas);
}

export async function POST(req: Request) {
  // Sinh viên gọi POST để nộp bài
  const body = await req.json();
  const newIdea = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
  };
  
  // Đẩy ý tưởng mới lên đầu danh sách
  ideas.unshift(newIdea);
  
  return NextResponse.json({ success: true, idea: newIdea });
}

export async function DELETE() {
  // Nút xóa (Clear) data của Admin để làm lại từ đầu nếu cần
  ideas = [];
  return NextResponse.json({ success: true });
}