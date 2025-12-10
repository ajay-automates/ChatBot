// pages/api/chat/[botId]/message.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Anthropic } from '@anthropic-ai/sdk';
import { searchDocuments } from '@/lib/pinecone';
import { supabaseAdmin } from '@/lib/supabase';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { botId } = req.query;
    const { message, conversationId, visitorId } = req.body;

    if (!message || !botId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get chatbot config
    const { data: chatbot, error: botError } = await supabaseAdmin
      .from('chatbots')
      .select('*')
      .eq('id', String(botId))
      .single();

    if (botError || !chatbot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Create or get conversation
    let conversation = conversationId;
    if (!conversation) {
      const { data: c, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          id: uuidv4(),
          chatbot_id: String(botId),
          visitor_id: visitorId || `visitor_${Date.now()}`,
        })
        .select()
        .single();

      if (convError || !c) {
        return res.status(500).json({ error: 'Failed to create conversation' });
      }
      conversation = c.id;
    }

    // Search knowledge base for relevant documents
    const searchResults = await searchDocuments(String(botId), message, 3);

    // Build context from retrieved documents
    const context = searchResults
      .map((match) => {
        const metadata = match.metadata as any;
        return `${metadata.title}: ${metadata.content}`;
      })
      .join('\n\n');

    // Get conversation history
    const { data: conversationHistory, error: historyError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('History fetch error:', historyError);
    }

    // Build system prompt
    const systemPrompt = `You are a helpful support chatbot for ${chatbot.name}.
You have access to a knowledge base. Use it to answer questions accurately and helpfully.
If you don't know the answer based on the knowledge base, be honest and offer to escalate the issue.
Keep responses under 150 words.
Be friendly, professional, and helpful.

Knowledge Base:
${context || 'No relevant documents found in knowledge base.'}`;

    // Build messages for Anthropic (only user and assistant, system is separate)
    const userMessages = (conversationHistory || []).map((m: any) => ({
      role: (m.author === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));
    userMessages.push({ role: 'user' as const, content: message });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      system: systemPrompt,
      messages: userMessages,
    });

    const botReply = response.content[0].type === 'text' ? response.content[0].text : '';

    // Determine if should escalate
    const shouldEscalate =
      botReply.includes("I'm not sure") ||
      botReply.includes('escalate') ||
      (searchResults.length === 0 && message.length > 50);

    // Save messages to database
    const { error: insertError } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          id: uuidv4(),
          conversation_id: conversation,
          author: 'user',
          content: message,
          metadata: { tokens: 50 },
          created_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          conversation_id: conversation,
          author: 'bot',
          content: botReply,
          metadata: {
            tokens: response.usage?.output_tokens || 0,
            confidence: searchResults[0]?.score || 0,
            matchedDocuments: searchResults.map((m) => (m.metadata as any).title),
          },
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error('Message insertion error:', insertError);
    }

    // Escalate to Slack if needed
    if (shouldEscalate && chatbot.slack_webhook_url) {
      try {
        await axios.post(chatbot.slack_webhook_url, {
          text: `🚨 Chatbot escalation for ${chatbot.name}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Visitor:* ${visitorId}\n*Message:* ${message}\n*Bot couldn't answer - needs human help*\n*Conversation:* ${conversation}`,
              },
            },
          ],
        });

        await supabaseAdmin
          .from('conversations')
          .update({ escalated: true })
          .eq('id', conversation);
      } catch (slackError) {
        console.error('Slack notification failed:', slackError);
      }
    }

    return res.status(200).json({
      reply: botReply,
      conversationId: conversation,
      escalated: shouldEscalate,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
