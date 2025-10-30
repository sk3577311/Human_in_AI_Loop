// app/api/livekit/[identity]/[room]/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function GET(
  req: Request,
  { params }: { params: { identity: string; room: string } }
) {
  const { identity, room } = params;
  try {
    const response = await fetch(`${BACKEND_URL}/livekit/token/${identity}/${room}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("LiveKit token error:", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
