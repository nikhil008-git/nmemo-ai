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
    // Required so Next can stream upstream AI SDK / SSE bodies.
    // @ts-expect-error Node fetch duplex
    duplex: "half",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    console.error("[api/proxy] upstream failed", target.toString(), err);
    const error =
      process.env.NODE_ENV === "production"
        ? "Service temporarily unavailable. Try again shortly."
        : "API unreachable. Is the backend running on :8080?";
    return NextResponse.json({ error }, { status: 502 });
  }

  // OAuth start returns 302 to GitHub/Slack/Notion — pass through to browser.
  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    if (location) {
      return NextResponse.redirect(
        location,
        upstream.status as 301 | 302 | 303 | 307 | 308,
      );
    }
  }

  const resHeaders = new Headers();
  for (const key of [
    "content-type",
    "cache-control",
    "x-vercel-ai-ui-message-stream",
    "x-request-id",
  ]) {
    const value = upstream.headers.get(key);
    if (value) resHeaders.set(key, value);
  }
  // Prevent Next/proxy buffering of AI streams
  resHeaders.set("x-accel-buffering", "no");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
