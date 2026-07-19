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
  hasContext: boolean;
  fallbackText: string;
  onFinishText?: (text: string) => void;
}) {
  const {
    res,
    question,
    groqKey,
    context,
    hasContext,
    fallbackText,
    onFinishText,
  } = opts;

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

        if (!hasContext) {
          const id = crypto.randomUUID();
          writer.write({ type: "text-start", id });
          writer.write({ type: "text-delta", id, delta: fallbackText });
          writer.write({ type: "text-end", id });
          writer.write({ type: "finish" });
          onFinishText?.(fallbackText);
          return;
        }

        const result = streamText({
          model: groq.chat("llama-3.3-70b-versatile"),
          system:
            "Answer ONLY using the provided context. If the context doesn't contain the answer, say you don't know. Be concise.",
          prompt: context.prompt.includes(question)
            ? context.prompt
            : `${context.prompt}\n\n${question}`,
          onFinish: ({ text }) => {
            onFinishText?.(text);
          },
        });

        writer.merge(result.toUIMessageStream({ sendStart: false }));
      },
    }),
  });
}
