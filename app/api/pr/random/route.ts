import { NextResponse } from "next/server";
import { getRandomPR } from "@/lib/prs";

export function GET() {
  const pr = getRandomPR();
  return NextResponse.json(pr);
}
