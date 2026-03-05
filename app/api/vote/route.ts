import { NextRequest, NextResponse } from "next/server";
import { getOutcome } from "@/lib/prs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prId, repo } = body as { prId: number; repo: string };

  const outcome = getOutcome(repo, prId);
  if (!outcome) {
    return NextResponse.json({ error: `Unknown PR: ${repo}#${prId}` }, { status: 400 });
  }

  return NextResponse.json({ outcome });
}
