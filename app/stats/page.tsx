"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStats, type Stats } from "@/lib/session";

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  const accuracy =
    stats && stats.total > 0
      ? Math.round((stats.correct / stats.total) * 100)
      : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">My Stats</h1>
        </div>

        {/* Hero accuracy */}
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-7xl font-black tabular-nums text-foreground">
            {accuracy}%
          </span>
          <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
            Accuracy
          </span>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 py-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {stats?.total ?? 0}
            </span>
            <span className="text-center text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Reviewed
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 py-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {stats?.streak ?? 0}
            </span>
            <span className="text-center text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Streak
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 py-5 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {stats?.best ?? 0}
            </span>
            <span className="text-center text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Best streak
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/play"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-base font-semibold text-background transition-opacity hover:opacity-80"
          >
            Keep Playing
          </Link>
          <div className="flex justify-center">
            <Link
              href="/"
              className="text-sm text-zinc-500 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-400"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
