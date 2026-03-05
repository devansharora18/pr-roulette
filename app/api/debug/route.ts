// app/api/debug/route.ts
export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  
  // test the token against github api
  const res = await fetch("https://api.github.com/rate_limit", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    }
  });

  const data = await res.json();

  return Response.json({
    hasToken: !!token,
    tokenPrefix: token?.slice(0, 15) ?? "missing",
    githubStatus: res.status,
    rateLimit: data
  })
