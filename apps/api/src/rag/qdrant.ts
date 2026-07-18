//# client + collection helpers

import { QdrantClient } from "@qdrant/js-client-rest";
import { VECTOR_SIZE } from "./embed.js";

export const COLLECTION =   process.env.QDRANT_COLLECTION ?? "documents";
//// Qdrant Database → Collection → Vector (Embedding + Payload)


export const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL ?? "http://localhost:6333",
    ...(process.env.QDRANT_API_KEY
      ? { apiKey: process.env.QDRANT_API_KEY }
      : {}),
  });
/**
 * methods of qdrant client
 * qdrant.getCollections()

qdrant.createCollection()

qdrant.upsert()

qdrant.search()
 * 
 */

export async function ensureCollection(){
    const { collections } = await qdrant.getCollections();
    // collection table
    // vector as always one embedding
    const exists = collections.some((c)=> c.name === COLLECTION);
    if(!exists){
        await qdrant.createCollection(COLLECTION,{
            vectors: {
                size : VECTOR_SIZE,
                distance : "Cosine",
            }
        })
    }
}
/**
 * {
  id: "uuid",
  vector: [0.12, -0.03, ...],  // 1024 numbers
  payload: {
    text: "Returns within 30 days...",
    source: "https://acme.com/refund",
    title: "Refund Policy",
    chunk_index: 0,
    site_id: "site_abc"
  }
}
 */

// cosine distance?
/*
   Query
            ↗
           /
          /
         /
        ↗ Document
Cosine:
      ↗
     ↗
Small angle = Similar Meaning 

Euclidean:
●-------------●
Large distance = Less Similar 

Cosine → compares direction (semantic meaning)
Euclidean → compares numeric distance */