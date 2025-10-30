import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/learned`);
  const data = await res.json();
  return NextResponse.json(data);
}
