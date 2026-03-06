const REPOS = [
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
	"jquery/jquery",
	"excalidraw/excalidraw",
	"hoppscotch/hoppscotch",
	"mastodon/mastodon",
	"outline/outline",
	"calcom/cal.com",
	"microsoft/vscode",
	"neovim/neovim",
	"ohmyzsh/ohmyzsh",
	"nodejs/node",
	"torvalds/linux",
];

type GitHubPR = {
	number: number;
	title: string;
	body: string | null;
	user: { login: string; type: string };
	html_url: string;
	merged_at: string | null;
};

export type PR = {
	id: number;
	repo: string;
	title: string;
	body: string;
	diff: string | null;
	author: string;
	url: string;
};

function headers() {
	const h: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "pr-roulette",
	};
	const token = process.env.GITHUB_TOKEN;
	if (token) h.Authorization = `Bearer ${token}`;
	return h;
}

function isBoring(pr: GitHubPR): boolean {
	const body = pr.body ?? "";
	if (body.trim().length < 50) return true;
	if (pr.user.type === "Bot") return true;
	return false;
}

async function fetchDiff(
	repo: string,
	prNumber: number,
): Promise<string | null> {
	const res = await fetch(
		`https://api.github.com/repos/${repo}/pulls/${prNumber}`,
		{ headers: { ...headers(), Accept: "application/vnd.github.diff" } },
	);
	if (!res.ok) return null;
	const text = await res.text();
	return text.slice(0, 20000).trim() || null;
}

export async function getRandomPR(): Promise<PR> {
	const repo = REPOS[Math.floor(Math.random() * REPOS.length)];
	// Pick a random page of closed PRs (pages 1-10 for variety)
	const page = Math.floor(Math.random() * 10) + 1;

	const res = await fetch(
		`https://api.github.com/repos/${repo}/pulls?state=closed&per_page=30&page=${page}`,
		{ headers: headers() },
	);
	
	console.log(res)

	if (!res.ok) {
		console.log(res.status, await res.text());
		throw new Error(`GitHub API error: ${res.status}`);
	}

	const prs: GitHubPR[] = await res.json();
	// Filter out boring PRs and pick a random one
	const interesting = prs.filter((pr) => !isBoring(pr));

	if (interesting.length === 0) {
		throw new Error("No interesting PRs found, try again");
	}

	// 50/50 split: target merged or rejected PRs
	const wantMerged = Math.random() < 0.5;
	const filtered = interesting.filter((pr) =>
		wantMerged ? pr.merged_at !== null : pr.merged_at === null,
	);
	const pool = filtered.length > 0 ? filtered : interesting;

	const pr = pool[Math.floor(Math.random() * pool.length)];
	const diff = await fetchDiff(repo, pr.number);

	return {
		id: pr.number,
		repo,
		title: pr.title,
		body: (pr.body ?? "").slice(0, 2000).trim(),
		diff,
		author: pr.user.login,
		url: pr.html_url,
	};
}

export async function getOutcome(
	repo: string,
	prNumber: number,
): Promise<string> {
	const res = await fetch(
		`https://api.github.com/repos/${repo}/pulls/${prNumber}`,
		{ headers: headers() },
	);

	if (!res.ok) {
		throw new Error(`GitHub API error: ${res.status}`);
	}

	const pr: GitHubPR = await res.json();
	return pr.merged_at ? "merged" : "closed";
}
