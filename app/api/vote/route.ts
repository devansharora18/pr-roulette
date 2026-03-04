import { NextRequest, NextResponse } from "next/server";
import { submitVote, type VoteInput } from "@/lib/vote";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as VoteInput;
  const { prId, repo, decision, reason, timeSpent } = body;

  try {
    const result = submitVote({ prId, repo, decision, reason, timeSpent });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
