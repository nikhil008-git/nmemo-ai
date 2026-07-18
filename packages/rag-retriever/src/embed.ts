import axios, { isAxiosError } from "axios";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = "voyage-4";

export const VECTOR_SIZE = 1024;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function embed(
  texts: string[],
  inputType: "document" | "query",
): Promise<number[][]> {
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error("VOYAGE_API_KEY is not set");
  }
  if (!texts.length) return [];

  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await axios.post(
        VOYAGE_URL,
        {
          input: texts,
          model: MODEL,
          input_type: inputType,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
          },
        },
      );

      return res.data.data.map((d: { embedding: number[] }) => d.embedding);
    } catch (err) {
      lastError = err;
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 429 && attempt < 3) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      break;
    }
  }

  if (isAxiosError(lastError)) {
    const detail =
      typeof lastError.response?.data === "string"
        ? lastError.response.data
        : JSON.stringify(lastError.response?.data ?? lastError.message);
    throw new Error(
      `Voyage embeddings failed (${lastError.response?.status ?? "network"}): ${detail}`,
    );
  }
  throw lastError;
}
