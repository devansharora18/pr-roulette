import requests
import json
import time
import random
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
PRS_PER_REPO = 60
OUTPUT_PATH = "/app/data/prs.json"

REPOS = [
    "facebook/react",
    "vuejs/vue",
    "sveltejs/svelte",
    "angular/angular",
    "withastro/astro",
    "vercel/next.js",
    "sveltejs/kit",
    "remix-run/remix",
    "nuxt/nuxt",
    "microsoft/TypeScript",
    "vitejs/vite",
    "webpack/webpack",
    "babel/babel",
    "prettier/prettier",
    "eslint/eslint",
    "tailwindlabs/tailwindcss",
    "twbs/bootstrap",
    "FortAwesome/Font-Awesome",
    "animate-css/animate.css",
    "jquery/jquery",
    "excalidraw/excalidraw",
    "hoppscotch/hoppscotch",
    "mastodon/mastodon",
    "outline/outline",
    "calcom/cal.com",
    "microsoft/vscode",
    "neovim/neovim",
    "ohmyzsh/ohmyzsh",
    "torvalds/linux",
    "nodejs/node",
]

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

BORING_TITLES = [
    "update readme",
    "fix typo",
    "bump",
    "merge branch",
    "update dependencies",
    "chore:",
    "docs:",
    "ci:",
    "test:",
    "release:",
    "version:",
    "revert:",
]


def is_boring(pr):
    title = pr["title"].lower()

    if any(title.startswith(t) for t in BORING_TITLES):
        return True

    body = pr.get("body") or ""

    if len(body.strip()) < 100:
        return True

    if pr["user"]["type"] == "Bot":
        return True

    if "PULL REQUEST TEMPLATE" in body and body.count("[x]") == 0:
        return True

    return False


def fetch_diff(repo, pr_number):
    res = requests.get(
        f"https://api.github.com/repos/{repo}/pulls/{pr_number}",
        headers={**HEADERS, "Accept": "application/vnd.github.diff"},
    )

    if res.status_code == 403:
        print("  rate limited on diff fetch, waiting 60s...")
        time.sleep(60)
        return fetch_diff(repo, pr_number)

    if res.status_code != 200:
        return None

    return res.text[:5000].strip()


def fetch_prs(repo, repo_index, total_repos):
    prs = []
    page = 1
    skipped = 0

    while len(prs) < PRS_PER_REPO:
        res = requests.get(
            f"https://api.github.com/repos/{repo}/pulls",
            headers=HEADERS,
            params={"state": "closed", "per_page": 100, "page": page},
        )

        if res.status_code == 403:
            print(f"  rate limited on PR list, waiting 60s...")
            time.sleep(60)
            continue

        if res.status_code != 200:
            print(f"  failed with status {res.status_code}, skipping repo")
            break

        data = res.json()
        if not data:
            break

        for pr in data:
            if len(prs) >= PRS_PER_REPO:
                break

            if is_boring(pr):
                skipped += 1
                continue

            diff = fetch_diff(repo, pr["number"])
            time.sleep(0.5)

            prs.append({
                "id": pr["number"],
                "repo": repo,
                "title": pr["title"],
                "body": pr["body"][:2000].strip(),
                "diff": diff,
                "author": pr["user"]["login"],
                "url": pr["html_url"],
                "outcome": "merged" if pr["merged_at"] else "closed",
            })

            print(
                f"  [{repo_index}/{total_repos}] {repo} — "
                f"{len(prs)}/{PRS_PER_REPO} PRs fetched, {skipped} skipped",
                end="\r",
            )

        page += 1
        time.sleep(0.5)

    print(
        f"  [{repo_index}/{total_repos}] {repo} — "
        f"{len(prs)} PRs fetched, {skipped} skipped        "
    )

    return prs


def main():
    if not GITHUB_TOKEN:
        raise ValueError("GITHUB_TOKEN not found in .env")

    print(f"starting fetch for {len(REPOS)} repos, {PRS_PER_REPO} PRs each\n")

    all_prs = []
    total_repos = len(REPOS)

    for i, repo in enumerate(REPOS, start=1):
        print(f"[{i}/{total_repos}] fetching {repo}")
        prs = fetch_prs(repo, i, total_repos)
        all_prs.extend(prs)
        time.sleep(1)

    random.shuffle(all_prs)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(all_prs, f, indent=2)

    merged = sum(1 for p in all_prs if p["outcome"] == "merged")
    closed = sum(1 for p in all_prs if p["outcome"] == "closed")

    print(f"\ndone.")
    print(f"total PRs: {len(all_prs)}")
    print(f"merged: {merged} | closed: {closed}")
    print(f"merge rate: {merged / len(all_prs) * 100:.1f}%")
    print(f"saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()