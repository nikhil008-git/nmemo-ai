import {
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  streamText,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { Response } from "express";
import type { GetContextResult } from "@contextengine/core";

export type AskStreamMeta = {
  citations: {
    source_url: string;
    title: string;
    snippet: string;
  }[];
  groundingScore: number;
  context: {
    diagnostics: GetContextResult["diagnostics"];
    tokenUsage: GetContextResult["tokenUsage"];
    sources: GetContextResult["sources"];
  };
};

const PLAYGROUND_SYSTEM_PREFIX = [
  "You are a concise, helpful assistant for a context-engine playground.",
  "Use connected context as the source of truth when it is relevant.",
  "Never claim a fact came from connected sources unless the provided context supports it.",
  "For greetings and general questions without relevant context, answer naturally.",
  "Evidence-only instructions in the supplied context apply to source claims, not to casual conversation.",
  "For workspace-specific questions without grounded context, say you do not have enough connected context rather than inventing workspace facts.",
  "Write a short, natural reply in plain language.",
  "Do NOT dump, quote, or restate the full context.",
  "Do NOT invent Notion/GitHub/Slack sections or numbered source reports.",
].join(" ");

function groqProvider(apiKey: string) {
  return createOpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

/** Stream playground answer via Vercel AI SDK UI message protocol. */
export function pipeAskStream(opts: {
  res: Response;
  question: string;
  groqKey: string;
  context: GetContextResult;
  onFinishText?: (text: string) => void;
}) {
  const { res, question, groqKey, context, onFinishText } = opts;

  const avgScore =
    context.documents.length === 0
      ? 0
      : context.documents.reduce((s, d) => s + d.score, 0) /
        context.documents.length;

  const meta: AskStreamMeta = {
    citations: context.citations.map((c) => ({
      source_url:
        c.url ?? (c.source.startsWith("http") ? c.source : `file://${c.source}`),
      title: c.title,
      snippet: c.snippet,
    })),
    groundingScore: Math.round(avgScore * 100),
    context: {
      diagnostics: context.diagnostics,
      tokenUsage: context.tokenUsage,
      sources: context.sources,
    },
  };

  const groq = groqProvider(groqKey);

  pipeUIMessageStreamToResponse({
    response: res,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: "start" });
        writer.write({
          type: "data-context",
          data: meta,
        });

        const result = streamText({
          model: groq.chat("llama-3.3-70b-versatile"),
          system: `${context.prompt}\n\n${PLAYGROUND_SYSTEM_PREFIX}`,
          prompt: question,
          onFinish: ({ text }) => {
            onFinishText?.(text);
          },
        });

        writer.merge(result.toUIMessageStream({ sendStart: false }));
      },
    }),
  });
}
