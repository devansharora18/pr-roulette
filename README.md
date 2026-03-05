# PR Roulette

You have 60 seconds to read a real pull request from a popular open-source repo and decide: **Accept** or **Reject**. Submit your verdict and find out if you would have called it right.

## How it works

1. A random PR is pulled from a dataset of 1,680 real pull requests across repos like `microsoft/vscode`, `vuejs/vue`, `vitejs/vite`, and more.
2. You have 60 seconds to read the title, description, and optionally the diff.
3. Hit **Accept** (or press `A`) if you think it was merged, **Reject** (or press `R`) if you think it was closed.
4. The reveal screen shows whether you were right, the actual outcome, and your running stats.

Stats (accuracy, streak, best streak) are stored locally in `localStorage` — no account needed.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/play` | Active game — timer, PR viewer, diff, vote buttons |
| `/reveal` | Result screen — correct/incorrect, outcome, stats |
| `/stats` | All-time stats dashboard |

## Project structure

```
app/
  page.tsx          # Landing page
  play/page.tsx     # Game screen
  reveal/page.tsx   # Result screen
  stats/page.tsx    # Stats dashboard
  api/
    pr/random/      # GET — returns a random PR (outcome hidden)
    vote/           # POST — returns the actual outcome
  data/prs.json     # Dataset of 1,680 real PRs
lib/
  prs.ts            # PR lookup helpers
  session.ts        # localStorage stats helpers
  vote.ts           # Vote logic types
```