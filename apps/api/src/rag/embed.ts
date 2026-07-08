import axios from "axios";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = "voyage-4";

export const VECTOR_SIZE = 1024;

export async function embed(
  texts: string[],
  inputType: "document" | "query"
): Promise<number[][]> {
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
    }
  );

  return res.data.data.map((d: { embedding: number[] }) => d.embedding);
}