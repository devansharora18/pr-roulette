"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Stats = {
  correct: number;
  total: number;
  streak: number;
  best: number;
};

type VoteResult = {
  correct: boolean;
  outcome: string;
  stats: Stats;
  reason: string | null;
  url: string;
};

export default function RevealPage() {
  const router = useRouter();
  const [result, setResult] = useState<VoteResult | null | "loading">("loading");

  useEffect(() => {
    const raw = sessionStorage.getItem("vote_result");
    if (!raw) {
      router.replace("/play");
      return;
    }
    try {
      setResult(JSON.parse(raw) as VoteResult);
    } catch {
      router.replace("/play");
    }
  }, [router]);

  if (result === "loading" || result === null) return null;

  const { correct, outcome, stats, reason, url } = result;
  const accuracy =
    stats?.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const outcomeLabel =
    outcome === "merged"
      ? "This PR was merged"
      : "This PR was closed without merging";

  function handleNext() {
    sessionStorage.removeItem("vote_result");
    router.push("/play");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-md flex-col gap-8">
        {/* Correct / Incorrect indicator */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className={[
              "text-6xl font-black tracking-tight",
              correct ? "text-green-500" : "text-red-500",
            ].join(" ")}
          >
            {correct ? "✓ Correct" : "✗ Incorrect"}
          </span>
          <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">
            {outcomeLabel}
          </p>
        </div>

        {/* Reason */}
        {reason && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Your reason
            </p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              {reason}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-3xl font-bold text-foreground">
              {stats?.streak}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Current streak
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-3xl font-bold text-foreground">{accuracy}%</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Accuracy ({stats?.correct}/{stats?.total})
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleNext}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-base font-semibold text-background transition-opacity hover:opacity-80"
          >
            Next PR
          </button>
          <div className="flex items-center justify-center gap-6 text-sm">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-400"
            >
              View on GitHub ↗
            </a>
            <Link
              href="/stats"
              className="text-zinc-500 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-400"
            >
              My Stats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
