export const STATS_KEY = "pr_roulette_stats";

export type Stats = {
  correct: number;
  total: number;
  streak: number;
  best: number;
};

const DEFAULT_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0 };

export function getStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return JSON.parse(raw) as Stats;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: Stats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
