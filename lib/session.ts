const SESSION_KEY = "session_id";

export type Stats = {
  correct: number;
  total: number;
  streak: number;
  best: number;
};

const DEFAULT_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0 };

export function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getStats(): Stats {
  const id = getOrCreateSessionId();
  const raw = localStorage.getItem(`stats:${id}`);
  if (!raw) return { ...DEFAULT_STATS };
  try {
    return JSON.parse(raw) as Stats;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: Stats): void {
  const id = getOrCreateSessionId();
  localStorage.setItem(`stats:${id}`, JSON.stringify(stats));
}
