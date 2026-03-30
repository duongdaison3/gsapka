import { kv } from '@vercel/kv';
import { NextResponse } from "next/server";

export async function GET() {
  // Lấy toàn bộ danh sách từ Vercel KV (Redis)
  const q1 = await kv.lrange('q1', 0, -1) || [];
  const q2 = await kv.lrange('q2', 0, -1) || [];
  const q3 = await kv.lrange('q3', 0, -1) || [];
  const q4 = await kv.lrange('q4', 0, -1) || [];
  
  return NextResponse.json({ q1, q2, q3, q4 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { quest, playerName, data } = body;
  
  const newRecord = {
    id: Date.now().toString(),
    playerName: playerName || "Chiến thần AI",
    data,
    createdAt: new Date().toISOString(),
  };
  
  // kv.lpush giúp đẩy data mới nhất lên đầu danh sách (giống unshift)
  await kv.lpush(`q${quest}`, newRecord);
  
  return NextResponse.json({ success: true, record: newRecord });
}

export async function DELETE() {
  // Xóa sạch các key khi Admin bấm Reset
  await kv.del('q1', 'q2', 'q3', 'q4');
  return NextResponse.json({ success: true });
}