// pages/api/knowledge/[botId]/upload.ts
// TODO: Implement knowledge base upload with Supabase
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(501).json({ error: 'Knowledge upload endpoint coming soon' });
}

