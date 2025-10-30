// app/api/requests/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/requests`);
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error fetching from backend:", err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error posting to backend:", err);
    return NextResponse.json({ error: "Failed to post request" }, { status: 500 });
  }
}
