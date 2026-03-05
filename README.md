# PR Roulette

You have 60 seconds to read a real pull request from a popular open-source repo and decide: **Accept** or **Reject**. Submit your verdict and find out if you would have called it right.

## How it works

1. A random PR is fetched live from the GitHub API across 28 popular open-source repos (React, Vue, Next.js, VS Code, Linux, and more).
2. You have 60 seconds to read the title, description, and optionally the diff.
3. Hit **Accept** (or press `A`) if you think it was merged, **Reject** (or press `R`) if you think it was closed.
4. The reveal screen shows whether you were right, the actual outcome, and your running stats.

Stats (accuracy, streak, best streak) are stored locally in `localStorage` — no account needed.

## Getting started

```bash
npm install
```

Create a `.env` file with a GitHub personal access token:

```
GITHUB_TOKEN=ghp_...
```

Then start the dev server:

```bash
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
    pr/random/      # GET — fetches a random PR from GitHub (outcome hidden)
    vote/           # POST — fetches the actual outcome from GitHub
lib/
  prs.ts            # Live GitHub API fetching + filtering
  session.ts        # localStorage stats helpers