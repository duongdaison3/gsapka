import { kv } from '@vercel/kv';
import { NextResponse } from "next/server";

export async function GET() {
  // Lấy trạng thái game, nếu chưa có thì trả về mặc định
  const gameState = await kv.get('gameState') || { isStarted: false, endTime: 0 };
  return NextResponse.json(gameState);
}

export async function POST(req) {
  const body = await req.json();
  let newState = { isStarted: false, endTime: 0 };

  if (body.action === "start") {
    newState = { isStarted: true, endTime: Date.now() + 15 * 60 * 1000 };
  }

  // Lưu đè trạng thái mới lên Cloud
  await kv.set('gameState', newState);

  return NextResponse.json({ success: true, gameState: newState });
}