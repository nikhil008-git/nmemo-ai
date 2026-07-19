import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: authGet, POST: authPost } = toNextJsHandler(auth);

async function withAuthErrors(
  handler: (req: Request) => Promise<Response>,
  req: Request,
) {
  try {
    return await handler(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Auth failed";
    console.error("[api/auth]", message, err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export function GET(req: Request) {
  return withAuthErrors(authGet, req);
}

export function POST(req: Request) {
  return withAuthErrors(authPost, req);
}
