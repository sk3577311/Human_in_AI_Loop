const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ Await params
  const { answer } = await req.json();

  const res = await fetch(`${BACKEND_URL}/requests/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  });

  if (!res.ok) {
    return Response.json({ error: "Failed to resolve request" }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
