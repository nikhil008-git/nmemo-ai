// ask will be formed

import OpenAI from "openai";
import { search, type SearchHit } from "./search.js";

// Groq is OpenAI-compatible (free tier). Get a key: https://console.groq.com
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// whats the type of the source_url? or docs
export type Citation = {
    source_url : string; // doc link
    title : string; // title
    snippet : string; //first 200 chars of the chunk

}
export type RagAnswer = {
    answer : string;
    citations : Citation[];
    groundingScore: number; // avg retrieval score × 100 | how confident retrieval was (0–100)
}

function hitsToCitations(hits: SearchHit[]): Citation[] {
    return hits.map((h) => ({
      source_url: h.source.startsWith("http") ? h.source : `file://${h.source}`,
      title: h.title,
      snippet: h.text.slice(0, 200),
    }));
  }

  export async function ask( 
    question : string,
    siteId? : string,
  ) : Promise<RagAnswer> {
    const hits = await search(question, {
      limit: 5,
      ...(siteId ? { siteId } : {}),
    });
    
    if (hits.length === 0) {
        return {
            answer : "I couldn't find anything in the docs about that.",
            citations : [],
            groundingScore : 0,
        }
        
  }

  const context = hits
  .map((h, i) => `[${i + 1}] ${h.title}\n${h.text}`)
  .join("\n\n"); // array in single string

  const completion = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages : [
        {
            role: "system",
            content:
              "Answer ONLY using the provided context. If the context doesn't contain the answer, say you don't know. Be concise.",
          },
          {
            role : "user",
            content : `Context : ${context}\n\nQuestion : ${question}`
          },
    ]

})

const answer = completion.choices[0]?.message?.content ?? "No answer generated.";

const avgScore = hits.reduce((s,h)=> s + h.score, 0) / hits.length; // reduced the score actually by accumulator

return {
    answer,
    citations: hitsToCitations(hits),
    groundingScore: Math.round(avgScore * 100),
}
}