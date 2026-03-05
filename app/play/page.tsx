"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STATS_KEY } from "@/lib/session";

function diffLineClass(line: string): string {
  if (line.startsWith("+")) return "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-300";
  if (line.startsWith("-")) return "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-300";
  if (line.startsWith("@@")) return "text-zinc-400 dark:text-zinc-500";
  return "text-zinc-700 dark:text-zinc-300";
}

function DiffViewer({ diff }: { diff: string }) {
  const [open, setOpen] = useState(false);
  const lines = diff.split("\n");

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-zinc-600 hover:text-foreground dark:text-zinc-400 dark:hover:text-foreground"
      >
        <span>Diff</span>
        <span className="text-xs">{open ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-zinc-200 dark:border-zinc-800">
          <pre className="p-0 text-xs leading-5 font-mono">
            {lines.map((line, i) => (
              <div key={i} className={`px-4 ${diffLineClass(line)}`}>
                {line || " "}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}

type PR = {
  id: number;
  repo: string;
  title: string;
  body: string;
  diff?: string;
  author: string;
  url: string;
};

type PageState =
  | { status: "loading" }
  | { status: "success"; pr: PR }
  | { status: "error" };

function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

const TIMER_START = 60;

export default function PlayPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchedRef = useRef(false);

  async function fetchPR() {
    setState({ status: "loading" });
    setTimeLeft(null);
    setSubmitted(false);
    try {
      const res = await fetch("/api/pr/random");
      if (!res.ok) throw new Error("Failed to fetch");
      const pr: PR = await res.json();
      setState({ status: "success", pr });
      setTimeLeft(TIMER_START);
    } catch {
      setState({ status: "error" });
    }
  }

  async function handleVote(decision: "merged" | "closed" | null) {
    if (submitted || state.status !== "success") return;
    setSubmitted(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const timeSpent = TIMER_START - (timeLeft ?? 0);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prId: state.pr.id, repo: state.pr.repo }),
      });
      const { outcome } = await res.json();
      const correct = decision !== null && decision === outcome;

      // Update stats in localStorage
      let stats = { correct: 0, total: 0, streak: 0, best: 0 };
      try {
        const raw = localStorage.getItem(STATS_KEY);
        if (raw) stats = JSON.parse(raw);
      } catch {}
      const streak = correct ? stats.streak + 1 : 0;
      stats = {
        correct: stats.correct + (correct ? 1 : 0),
        total: stats.total + 1,
        streak,
        best: Math.max(stats.best, streak),
      };
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));

      sessionStorage.setItem(
        "vote_result",
        JSON.stringify({
          correct,
          outcome,
          stats,
          decision,
          reason: decision === null ? "time's up" : null,
          url: state.pr.url,
          timeSpent,
        }),
      );
    } catch {
      sessionStorage.setItem("vote_result", JSON.stringify(null));
    }

    router.push("/reveal");
  }

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      handleVote(null);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (submitted) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" || e.key === "A") handleVote("merged");
      if (e.key === "r" || e.key === "R") handleVote("closed");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, state, timeLeft]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPR();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urgent = timeLeft !== null && timeLeft <= 10;

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {state.status === "loading" && <LoadingSkeleton />}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              Failed to load a pull request.
            </p>
            <button
              onClick={fetchPR}
              className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {state.status === "success" && (
          <div className="flex flex-col gap-6">
            {/* Timer */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {state.pr.repo}{" "}
                <span className="text-foreground">#{state.pr.id}</span>
              </p>
              {timeLeft !== null && (
                <span
                  className={[
                    "tabular-nums text-2xl font-bold",
                    urgent
                      ? "animate-pulse text-red-500"
                      : "text-foreground",
                  ].join(" ")}
                >
                  {timeLeft}s
                </span>
              )}
            </div>

            <article className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold leading-snug text-foreground">
                {state.pr.title}
              </h1>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                by{" "}
                <span className="font-medium text-foreground">
                  @{state.pr.author}
                </span>
              </p>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {state.pr.body || (
                    <span className="italic text-zinc-400">No description provided.</span>
                  )}
                </p>
              </div>

              {state.pr.diff && <DiffViewer diff={state.pr.diff} />}
            </article>

            {/* Vote controls */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex gap-3">
                <button
                  disabled={submitted}
                  onClick={() => handleVote("merged")}
                  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 border-green-500 bg-green-50 py-3 font-semibold text-green-700 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-green-950 dark:text-green-300"
                >
                  Accept
                  <span className="text-xs font-normal opacity-60">press A</span>
                </button>
                <button
                  disabled={submitted}
                  onClick={() => handleVote("closed")}
                  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 border-red-500 bg-red-50 py-3 font-semibold text-red-700 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-red-950 dark:text-red-300"
                >
                  Reject
                  <span className="text-xs font-normal opacity-60">press R</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
