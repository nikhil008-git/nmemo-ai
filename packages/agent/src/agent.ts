import { agentAnswerSchema } from "@repo/shared";

import { retrieve } from "./retrieval.js";
import { routeMessage } from "./router.js";

export async function runAgent(message: string) {
  const decision = routeMessage(message);

  if (decision === "retrieve" || decision === "both") {
    await retrieve(message);
  }

  return agentAnswerSchema.parse({
    answer: "Agent pipeline not implemented yet.",
    citations: [],
  });
}
