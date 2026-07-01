import { z } from "zod";

export const citationSchema = z.object({
  source_url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
});

export const agentAnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(citationSchema),
});

export type Citation = z.infer<typeof citationSchema>;
export type AgentAnswer = z.infer<typeof agentAnswerSchema>;
export type RouteDecision = "retrieve" | "tool" | "both";
