// pages/api/knowledge/[botId]/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { storeDocument } from '@/lib/pinecone';

export const config = {
  api: { bodyParser: false },
};

// Chunk text into smaller pieces for better retrieval
function chunkText(text: string, maxChunkSize: number = 500): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    // If single sentence exceeds max size, split it by character count
    if (trimmedSentence.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // Split long sentence into chunks
      for (let i = 0; i < trimmedSentence.length; i += maxChunkSize) {
        chunks.push(trimmedSentence.substring(i, i + maxChunkSize).trim());
      }
      continue;
    }

    // Check if adding this sentence would exceed the limit
    if (currentChunk.length + trimmedSentence.length + 2 > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence + '.';
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence + '.';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 10); // Filter out very short chunks
}

// Parse JSON FAQ format
function parseJSON(content: string): Array<{ question: string; answer: string }> {
  try {
    const data = JSON.parse(content);

    // Support array of Q&A objects
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        question: item.question || item.q || item.title || 'Untitled',
        answer: item.answer || item.a || item.content || '',
      }));
    }

    // Support object with questions as keys
    if (typeof data === 'object') {
      return Object.entries(data).map(([question, answer]) => ({
        question,
        answer: String(answer),
      }));
    }

    return [];
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
}

// Parse CSV format (question,answer)
function parseCSV(content: string): Array<{ question: string; answer: string }> {
  const lines = content.split('\n').filter(line => line.trim());
  const results: Array<{ question: string; answer: string }> = [];

  // Skip header if it looks like a header
  const startIndex = lines[0]?.toLowerCase().includes('question') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quotes)
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];

    if (parts.length >= 2) {
      const question = parts[0].replace(/^"|"$/g, '').trim();
      const answer = parts.slice(1).join(',').replace(/^"|"$/g, '').trim();

      if (question && answer) {
        results.push({ question, answer });
      }
    }
  }

  return results;
}

// Parse Markdown format (looking for Q&A patterns)
function parseMarkdown(content: string): Array<{ question: string; answer: string }> {
  const results: Array<{ question: string; answer: string }> = [];

  // Match H2/H3 headings as questions with content as answers
  const sections = content.split(/^#{2,3}\s+/m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const question = lines[0]?.trim();
    const answer = lines.slice(1).join('\n').trim();

    if (question && answer) {
      results.push({ question, answer });
    }
  }

  // If no headings found, treat as single document
  if (results.length === 0 && content.trim()) {
    results.push({
      question: 'General Information',
      answer: content.trim(),
    });
  }

  return results;
}

// Parse plain text (split by double newlines or numbered lists)
function parseText(content: string): Array<{ question: string; answer: string }> {
  const results: Array<{ question: string; answer: string }> = [];

  // Try to split by double newlines
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

  // Look for Q&A patterns (Q: ... A: ...)
  const qaPattern = /Q:\s*(.+?)\s*A:\s*(.+?)(?=Q:|$)/gis;
  const matches = [...content.matchAll(qaPattern)];

  if (matches.length > 0) {
    matches.forEach(match => {
      results.push({
        question: match[1].trim(),
        answer: match[2].trim(),
      });
    });
  } else if (paragraphs.length > 1) {
    // Treat each paragraph as a separate piece of information
    paragraphs.forEach((para, idx) => {
      results.push({
        question: `Information ${idx + 1}`,
        answer: para.trim(),
      });
    });
  } else {
    // Single block of text
    results.push({
      question: 'General Information',
      answer: content.trim(),
    });
  }

  return results;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { botId } = req.query;
    if (!botId || typeof botId !== 'string') {
      return res.status(400).json({ error: 'Bot ID is required' });
    }

    // Verify user owns this chatbot
    const supabase = getSupabaseClient();
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', botId)
      .eq('userId', user.userId)
      .single();

    if (chatbotError || !chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Parse uploaded file using formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
    });

    const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, _fields, files) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    const fileArray = files.file;
    if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    // Read file content
    const fileContent = await fs.readFile(file.filepath, 'utf-8');
    const fileName = file.originalFilename || 'untitled';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Parse based on file type
    let qaItems: Array<{ question: string; answer: string }> = [];
    let sourceType = 'manual';

    switch (fileExtension) {
      case 'json':
        qaItems = parseJSON(fileContent);
        sourceType = 'faq';
        break;
      case 'csv':
        qaItems = parseCSV(fileContent);
        sourceType = 'faq';
        break;
      case 'md':
      case 'markdown':
        qaItems = parseMarkdown(fileContent);
        sourceType = 'docs';
        break;
      case 'txt':
        qaItems = parseText(fileContent);
        sourceType = 'docs';
        break;
      default:
        return res.status(400).json({
          error: `Unsupported file format: ${fileExtension}. Supported: JSON, CSV, MD, TXT`
        });
    }

    if (qaItems.length === 0) {
      return res.status(400).json({
        error: 'No valid content found in file. Please check the file format.'
      });
    }

    // Process each Q&A item
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const item of qaItems) {
      try {
        // Combine question and answer for better context
        const fullContent = `Q: ${item.question}\n\nA: ${item.answer}`;

        // Chunk the content
        const chunks = chunkText(fullContent, 500);

        // Store each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const title = chunks.length > 1
            ? `${item.question} (Part ${i + 1}/${chunks.length})`
            : item.question;

          // Store in Pinecone and get vector ID
          const vectorId = await storeDocument(botId, title, chunk);

          // Store metadata in database
          const { error: dbError } = await supabase
            .from('kb_documents')
            .insert({
              chatbotId: botId,
              title,
              content: chunk,
              sourceType,
              vectorId,
            });

          if (dbError) {
            console.error('Database error:', dbError);
            errorCount++;
          } else {
            successCount++;
          }
        }

        results.push({
          question: item.question,
          chunks: chunks.length,
          status: 'success',
        });
      } catch (error) {
        console.error('Error processing item:', error);
        errorCount++;
        results.push({
          question: item.question,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${successCount} chunks from ${qaItems.length} items`,
      stats: {
        totalItems: qaItems.length,
        chunksCreated: successCount,
        errors: errorCount,
      },
      details: results,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Failed to upload knowledge base',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
