import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const target = new URL(`${API_URL}/${targetPath}`);
  target.search = req.nextUrl.search;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const headers = new Headers();
  if (cookieHeader) headers.set("cookie", cookieHeader);

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    console.error("[api/proxy] upstream failed", target.toString(), err);
    return NextResponse.json(
      { error: "API unreachable. Is the backend running on :8080?" },
      { status: 502 },
    );
  }

  // OAuth start returns 302 to GitHub/Slack/Notion — pass through to browser.
  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    if (location) {
      return NextResponse.redirect(location, upstream.status as 301 | 302 | 303 | 307 | 308);
    }
  }

  const body = await upstream.arrayBuffer();
  const resHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) resHeaders.set("content-type", upstreamType);

  return new NextResponse(body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
