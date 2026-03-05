import { NextResponse } from "next/server";
import { getRandomPR } from "@/lib/prs";

export async function GET() {
  try {
    const pr = await getRandomPR();
    return NextResponse.json(pr);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch PR";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
