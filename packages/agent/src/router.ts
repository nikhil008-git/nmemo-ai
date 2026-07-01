import type { RouteDecision } from "@repo/shared";

export function routeMessage(_message: string): RouteDecision {
  return "retrieve";
}
