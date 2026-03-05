import { NextRequest, NextResponse } from "next/server";
import { getOutcome } from "@/lib/prs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prId, repo } = body as { prId: number; repo: string };

  try {
    const outcome = await getOutcome(repo, prId);
    return NextResponse.json({ outcome });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch outcome";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
