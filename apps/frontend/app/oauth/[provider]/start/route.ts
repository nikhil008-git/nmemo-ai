import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

const PROVIDERS = new Set(["github", "slack", "notion"]);

/**
 * Same-origin entry for Connect buttons.
 * Forwards the session cookie to the API OAuth start handler.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!PROVIDERS.has(provider)) {
    return NextResponse.redirect(
      new URL("/connectors?error=unknown_provider", _req.url),
    );
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/oauth/${provider}/start`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      redirect: "manual",
    });
  } catch {
    return NextResponse.redirect(
      new URL(
        "/connectors?error=" +
          encodeURIComponent("API unreachable — is the backend running?"),
        _req.url,
      ),
    );
  }

  const location = upstream.headers.get("location");
  if (location) {
    return NextResponse.redirect(location);
  }

  const text = await upstream.text();
  return NextResponse.redirect(
    new URL(
      `/connectors?error=${encodeURIComponent(text.slice(0, 200) || "OAuth start failed")}`,
      _req.url,
    ),
  );
}
