// pages/api/chatbots/[id]/widget.ts
// TODO: Implement widget generation with Supabase
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(501).json({ error: 'Widget endpoint coming soon' });
}

