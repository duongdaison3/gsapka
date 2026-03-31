// src/app/api/game/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const gameState = await kv.get('gameState') || { isStarted: false, endTime: 0, currentQuest: 1 };
    return NextResponse.json(gameState);
  } catch (error) {
    // Bắt lỗi nếu KV chưa kết nối được để web không sập
    return NextResponse.json({ isStarted: false, endTime: 0, currentQuest: 1 });
  }
}

interface GameState {
  isStarted: boolean;
  endTime: number;
  currentQuest: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gameState: GameState = await kv.get('gameState') || { isStarted: false, endTime: 0, currentQuest: 1 };

    if (body.action === "start") {
      gameState.isStarted = true;
      gameState.endTime = Date.now() + 15 * 60 * 1000;
    } else if (body.action === "reset") {
      gameState.isStarted = false;
      gameState.endTime = 0;
    } else if (body.action === "setQuest") {
      gameState.currentQuest = body.quest;
    }

    await kv.set('gameState', gameState);
    return NextResponse.json({ success: true, gameState });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}