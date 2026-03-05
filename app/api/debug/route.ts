// app/api/debug/route.ts
export async function GET() {
  return Response.json({
    hasToken: !!process.env.GITHUB_TOKEN,
    tokenPrefix: process.env.GITHUB_TOKEN?.slice(0, 15) ?? "missing",
  })
}