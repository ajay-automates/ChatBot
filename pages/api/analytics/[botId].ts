// pages/api/analytics/[botId].ts
// TODO: Implement analytics with Supabase
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(501).json({ error: 'Analytics endpoint coming soon' });
}
