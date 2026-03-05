import { getOutcome } from "@/lib/prs";
import { getStats, saveStats, type Stats } from "@/lib/session";

export type VoteInput = {
  prId: number;
  repo: string;
  decision: "merged" | "closed" | null;
  reason?: string;
  timeSpent: number;
};

export type VoteResult = {
  correct: boolean;
  outcome: string;
  stats: Stats;
};

export function submitVote({ prId, repo, decision }: VoteInput): VoteResult {
  const outcome = getOutcome(repo, prId);
  if (!outcome) throw new Error(`Unknown PR: ${repo}#${prId}`);

  const correct = decision !== null && decision === outcome;
  const prev = getStats();

  const streak = correct ? prev.streak + 1 : 0;
  const stats: Stats = {
    correct: prev.correct + (correct ? 1 : 0),
    total: prev.total + 1,
    streak,
    best: Math.max(prev.best, streak),
  };

  saveStats(stats);

  return { correct, outcome, stats };
}
