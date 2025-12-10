// pages/api/chatbots/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'GET') {
      // Get all chatbots for user
      const { data: chatbots, error } = await supabaseAdmin
        .from('chatbots')
        .select('*')
        .eq('user_id', payload.userId);

      if (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch chatbots' });
      }

      return res.status(200).json(chatbots || []);
    } else if (req.method === 'POST') {
      // Create new chatbot
      const { name, websiteUrl } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Chatbot name is required' });
      }

      const { data: chatbot, error } = await supabaseAdmin
        .from('chatbots')
        .insert({
          id: uuidv4(),
          name,
          website_url: websiteUrl,
          user_id: payload.userId,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Create error:', error);
        return res.status(500).json({ error: 'Failed to create chatbot' });
      }

      return res.status(201).json(chatbot);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
