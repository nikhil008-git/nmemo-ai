import OpenAI from "openai";

const PLAYGROUND_SYSTEM_PREFIX = [
  "You are a concise assistant for a context-engine playground.",
  "Answer the user's question using ONLY the context that follows.",
  "Write a short, natural reply in plain language.",
  "Do NOT dump, quote, or restate the full context.",
  "Do NOT invent Notion/GitHub/Slack sections or numbered source reports.",
  "If the context does not contain the answer, reply with one short sentence that you don't know.",
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
    question?.trim() ||
    "Answer based on the provided context.";

  const completion = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `${PLAYGROUND_SYSTEM_PREFIX}\n\n${contextPrompt}`,
      },
      { role: "user", content: userContent },
    ],
  });

  return completion.choices[0]?.message?.content ?? "No answer generated.";
}
