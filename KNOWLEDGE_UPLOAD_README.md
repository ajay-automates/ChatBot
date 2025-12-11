# Knowledge Base Upload API

## Overview

The Knowledge Base Upload endpoint allows you to upload FAQ documents in multiple formats (JSON, CSV, Markdown, TXT) to train your chatbot.

## Endpoint

```
POST /api/knowledge/[botId]/upload
```

## Authentication

Requires Bearer token in Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Supported File Formats

### 1. JSON (.json)

**Array Format:**
```json
[
  {
    "question": "What are your business hours?",
    "answer": "We are open Monday through Friday from 9 AM to 6 PM EST."
  },
  {
    "question": "How do I reset my password?",
    "answer": "Click on 'Forgot Password' and follow the instructions."
  }
]
```

**Object Format:**
```json
{
  "What are your business hours?": "We are open Monday through Friday from 9 AM to 6 PM EST.",
  "How do I reset my password?": "Click on 'Forgot Password' and follow the instructions."
}
```

### 2. CSV (.csv)

```csv
question,answer
"What are your business hours?","We are open Monday through Friday from 9 AM to 6 PM EST."
"How do I reset my password?","Click on 'Forgot Password' and follow the instructions."
```

### 3. Markdown (.md)

```markdown
## What are your business hours?

We are open Monday through Friday from 9 AM to 6 PM EST.

## How do I reset my password?

Click on 'Forgot Password' and follow the instructions.
```

### 4. Plain Text (.txt)

```
Q: What are your business hours?
A: We are open Monday through Friday from 9 AM to 6 PM EST.

Q: How do I reset my password?
A: Click on 'Forgot Password' and follow the instructions.
```

## How It Works

1. **File Upload**: User uploads a file (max 10MB)
2. **Parsing**: System parses the file based on extension
3. **Chunking**: Content is split into ~500 character chunks
4. **Embedding**: Each chunk is converted to a vector using Cohere
5. **Storage**:
   - Vectors stored in Pinecone for similarity search
   - Metadata stored in Supabase database
6. **Response**: Returns success with stats

## Request Example (cURL)

```bash
curl -X POST \
  http://localhost:3000/api/knowledge/YOUR_BOT_ID/upload \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'file=@/path/to/faq.json'
```

## Request Example (JavaScript)

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('./faq.json'));

const response = await axios.post(
  'http://localhost:3000/api/knowledge/YOUR_BOT_ID/upload',
  form,
  {
    headers: {
      ...form.getHeaders(),
      Authorization: 'Bearer YOUR_JWT_TOKEN',
    },
  }
);

console.log(response.data);
```

## Success Response

```json
{
  "success": true,
  "message": "Successfully processed 15 chunks from 5 items",
  "stats": {
    "totalItems": 5,
    "chunksCreated": 15,
    "errors": 0
  },
  "details": [
    {
      "question": "What are your business hours?",
      "chunks": 1,
      "status": "success"
    },
    {
      "question": "How do I reset my password?",
      "chunks": 1,
      "status": "success"
    }
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "error": "Unsupported file format: pdf. Supported: JSON, CSV, MD, TXT"
}
```

### 404 Not Found
```json
{
  "error": "Chatbot not found"
}
```

### 500 Server Error
```json
{
  "error": "Failed to upload knowledge base",
  "details": "Error message details"
}
```

## Features

✅ **Multi-format Support**: JSON, CSV, Markdown, TXT
✅ **Smart Chunking**: Automatically splits long content
✅ **Vector Storage**: Stores embeddings in Pinecone
✅ **Database Metadata**: Tracks documents in Supabase
✅ **Error Handling**: Graceful error messages
✅ **Batch Processing**: Handles multiple Q&A items
✅ **Authentication**: Verifies bot ownership

## Chunking Strategy

- **Target Size**: 500 characters per chunk
- **Sentence Aware**: Splits on sentence boundaries
- **Smart Merging**: Combines short sentences
- **Long Content**: Handles content exceeding 500 chars
- **Filter Short**: Removes chunks under 10 characters

## Storage Details

### Pinecone
- Vector ID: `{botId}-{timestamp}-{random}`
- Metadata: `{ botId, title, content }`
- Dimensions: 1024 (Cohere embed-english-v3.0)

### Supabase (kb_documents table)
- `id`: Auto-generated CUID
- `chatbotId`: Foreign key to chatbot
- `title`: Question or section title
- `content`: Full text content
- `sourceType`: 'faq' or 'docs'
- `vectorId`: Reference to Pinecone vector

## Testing

1. Create test files in `test-uploads/` directory
2. Update `test-upload.js` with your bot ID and JWT token
3. Run: `node test-upload.js`

## Limitations

- **Max File Size**: 10MB
- **Supported Formats**: JSON, CSV, MD, TXT only
- **Chunk Size**: ~500 characters
- **Encoding**: UTF-8 only

## Future Enhancements

- [ ] Support for PDF files
- [ ] Support for DOCX files
- [ ] Bulk delete/update
- [ ] Progress tracking for large uploads
- [ ] Duplicate detection
- [ ] Auto-categorization

## Security

- ✅ JWT authentication required
- ✅ Bot ownership verification
- ✅ File size limits enforced
- ✅ Input validation and sanitization
- ✅ Error messages don't leak sensitive info
