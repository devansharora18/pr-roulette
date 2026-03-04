import prs from "@/app/data/prs.json";

type PR = (typeof prs)[number];
type PRWithoutOutcome = Omit<PR, "outcome">;

export function getRandomPR(): PRWithoutOutcome {
  const pr = prs[Math.floor(Math.random() * prs.length)];
  const { outcome: _outcome, ...rest } = pr;
  return rest;
}

export function getOutcome(repo: string, id: number): string | undefined {
  return prs.find((pr) => pr.repo === repo && pr.id === id)?.outcome;
}
