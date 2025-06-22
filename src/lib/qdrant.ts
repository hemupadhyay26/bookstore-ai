// src/lib/qdrant.ts
import { QdrantClient } from '@qdrant/js-client-rest'
import { env } from '../config/env'

/**
 * A singleton Qdrant client that every part of the app can import.
 * If you later enable API‑key auth, just add `apiKey: env.QDRANT_API_KEY`.
 */
export const qdrantClient = new QdrantClient({
  url: env.QDRANT_URL,          // e.g. http://localhost:6333
})
