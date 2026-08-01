import OpenAI from "openai";

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

function groqClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function completeFromPrompt(
  contextPrompt: string,
  apiKey: string,
  question?: string,
): Promise<string> {
  const openai = groqClient(apiKey);
  const userContent =
    question?.trim() || "Answer based on the provided context.";

  const completion = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `${contextPrompt}\n\n${PLAYGROUND_SYSTEM_PREFIX}`,
      },
      { role: "user", content: userContent },
    ],
  });

  return completion.choices[0]?.message?.content ?? "No answer generated.";
}
