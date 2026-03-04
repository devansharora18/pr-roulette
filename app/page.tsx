import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <main className="flex max-w-lg flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            PR Roulette
          </h1>
          <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            You have 60 seconds to read a real pull request and decide to
            Approve or Request Changes. Submit your verdict and find out if you
            would have called it right.
          </p>
        </div>
        <Link
          href="/play"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-semibold text-background transition-opacity hover:opacity-80"
        >
          Start Playing
        </Link>
      </main>
    </div>
  );
}
