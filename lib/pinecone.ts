// lib/pinecone.ts
import { Pinecone } from '@pinecone-database/pinecone';
import axios from 'axios';

// Note: Using Cohere's free embeddings API since Anthropic doesn't provide embeddings
// You can switch to OpenAI embeddings if you have an API key
const COHERE_API_KEY = process.env.COHERE_API_KEY;

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export async function getIndex() {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME!;
  return client.Index(indexName);
}

export async function createEmbedding(text: string): Promise<number[]> {
  // Using free Cohere embeddings API
  // Alternative: Use OpenAI embeddings if you have OPENAI_API_KEY
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts: [text],
        model: 'embed-english-v3.0',
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.embeddings[0];
  } catch (error) {
    console.error('Error creating embedding:', error);
    // Fallback: return a dummy embedding (1024 dimensions for Cohere v3)
    return Array(1024).fill(0);
  }
}

export async function storeDocument(
  botId: string,
  title: string,
  content: string
): Promise<string> {
  const embedding = await createEmbedding(content);
  const vectorId = `${botId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const index = await getIndex();

  // Store in Pinecone
  await index.upsert([
    {
      id: vectorId,
      values: embedding,
      metadata: {
        botId,
        title,
        content: content.substring(0, 1000),
      } as Record<string, any>,
    },
  ]);

  return vectorId;
}

export async function searchDocuments(
  botId: string,
  query: string,
  topK: number = 3
): Promise<any[]> {
  const embedding = await createEmbedding(query);
  const index = await getIndex();

  const results = await index.query({
    vector: embedding,
    topK,
    filter: {
      botId: { $eq: botId },
    },
    includeMetadata: true,
  });

  return results.matches || [];
}

export async function deleteDocumentVectors(_botId: string): Promise<void> {
  // Note: Pinecone doesn't have a direct "delete by filter" in free tier
  // You'll need to track vector IDs separately and delete them
  // This is a limitation to handle in the DB schema
  // TODO: Implement vector deletion when upgrading Pinecone
}
