// pages/api/chatbots/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

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

    const { id } = req.query;

    if (req.method === 'GET') {
      const { data: chatbot, error } = await supabaseAdmin
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !chatbot) {
        return res.status(404).json({ error: 'Chatbot not found' });
      }

      if (chatbot.user_id !== payload.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(200).json(chatbot);
    } else if (req.method === 'PUT') {
      const { data: chatbot, error: fetchError } = await supabaseAdmin
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !chatbot) {
        return res.status(404).json({ error: 'Chatbot not found' });
      }

      if (chatbot.user_id !== payload.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('chatbots')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({ error: 'Failed to update chatbot' });
      }

      return res.status(200).json(updated);
    } else if (req.method === 'DELETE') {
      const { data: chatbot, error: fetchError } = await supabaseAdmin
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !chatbot) {
        return res.status(404).json({ error: 'Chatbot not found' });
      }

      if (chatbot.user_id !== payload.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { error: deleteError } = await supabaseAdmin
        .from('chatbots')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return res.status(500).json({ error: 'Failed to delete chatbot' });
      }

      return res.status(204).send('');
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
