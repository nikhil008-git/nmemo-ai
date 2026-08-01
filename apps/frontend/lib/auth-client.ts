import { createAuthClient } from "better-auth/react";

import { clearApiReadCache } from "@/lib/api";

const authClient = createAuthClient();

export const { signIn, useSession } = authClient;

export function signOut(...args: Parameters<typeof authClient.signOut>) {
  clearApiReadCache();
  return authClient.signOut(...args);
}
