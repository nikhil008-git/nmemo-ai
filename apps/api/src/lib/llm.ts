import OpenAI from "openai";

function groqClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function completeFromPrompt(
  prompt: string,
  apiKey: string,
): Promise<string> {
  const openai = groqClient(apiKey);
  const completion = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "Answer ONLY using the provided context. If the context doesn't contain the answer, say you don't know. Be concise.",
      },
      { role: "user", content: prompt },
    ],
  });

  return completion.choices[0]?.message?.content ?? "No answer generated.";
}
