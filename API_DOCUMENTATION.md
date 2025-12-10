# SupportBot API Documentation

Complete API reference for all endpoints.

## Base URL

```
https://your-domain.com/api
```

## Authentication

All endpoints (except auth endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by signing up or logging in.

---

## 🔐 Authentication Endpoints

### Sign Up

Create a new user account.

**Endpoint**: `POST /auth/signup`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Errors**:
- 400: Missing required fields
- 409: User already exists

---

### Login

Authenticate and get JWT token.

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "plan": "free"
  }
}
```

**Errors**:
- 400: Missing email or password
- 401: Invalid credentials

---

## 🤖 Chatbot Endpoints

### List All Chatbots

Get all chatbots for the authenticated user.

**Endpoint**: `GET /chatbots`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
[
  {
    "id": "bot_123",
    "name": "My Support Bot",
    "websiteUrl": "https://example.com",
    "plan": "free",
    "slackWebhookUrl": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "_count": {
      "conversations": 5,
      "kbDocuments": 3
    }
  },
  {
    "id": "bot_456",
    "name": "Sales Bot",
    "websiteUrl": "https://example.com/sales",
    "plan": "pro",
    "slackWebhookUrl": "https://hooks.slack.com/...",
    "createdAt": "2024-01-10T14:22:00Z",
    "_count": {
      "conversations": 142,
      "kbDocuments": 12
    }
  }
]
```

---

### Create Chatbot

Create a new chatbot.

**Endpoint**: `POST /chatbots`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "name": "Customer Support Bot",
  "websiteUrl": "https://example.com"
}
```

**Response** (201):
```json
{
  "id": "bot_789",
  "name": "Customer Support Bot",
  "websiteUrl": "https://example.com",
  "plan": "free",
  "slackWebhookUrl": null,
  "createdAt": "2024-01-20T08:15:00Z"
}
```

**Errors**:
- 400: Chatbot name is required
- 401: Unauthorized

---

### Get Chatbot

Get details of a specific chatbot.

**Endpoint**: `GET /chatbots/{botId}`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "bot_123",
  "name": "My Support Bot",
  "websiteUrl": "https://example.com",
  "plan": "free",
  "slackWebhookUrl": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "kbDocuments": [
    {
      "id": "doc_1",
      "title": "How to reset password?",
      "content": "To reset your password...",
      "sourceType": "faq",
      "vectorId": "vec_123"
    }
  ],
  "_count": {
    "conversations": 5
  }
}
```

**Errors**:
- 404: Chatbot not found
- 403: Forbidden (not your bot)

---

### Update Chatbot

Update chatbot settings.

**Endpoint**: `PUT /chatbots/{botId}`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "name": "Updated Bot Name",
  "websiteUrl": "https://new-url.com",
  "slackWebhookUrl": "https://hooks.slack.com/services/..."
}
```

**Response** (200):
```json
{
  "id": "bot_123",
  "name": "Updated Bot Name",
  "websiteUrl": "https://new-url.com",
  "slackWebhookUrl": "https://hooks.slack.com/services/..."
}
```

---

### Delete Chatbot

Delete a chatbot and all its data.

**Endpoint**: `DELETE /chatbots/{botId}`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (204): No content

**Warning**: This action cannot be undone!

---

## 💬 Chat Endpoints

### Send Message

Send a message to the chatbot (RAG-enabled).

**Endpoint**: `POST /chat/{botId}/message`

**Note**: This endpoint does NOT require authentication (public for website visitors)

**Request**:
```json
{
  "message": "How do I reset my password?",
  "conversationId": "conv_123",
  "visitorId": "visitor_abc123"
}
```

**Response** (200):
```json
{
  "reply": "To reset your password, go to the login page and click 'Forgot Password'...",
  "conversationId": "conv_123",
  "escalated": false
}
```

**How it works**:
1. Embeds your message using OpenAI
2. Searches Pinecone for relevant documents
3. Sends context + conversation history to GPT-4
4. Returns AI-generated response
5. Saves to database
6. Escalates to Slack if needed

**Errors**:
- 400: Missing required fields
- 404: Chatbot not found

---

## 📚 Knowledge Base Endpoints

### Upload Knowledge Base

Upload FAQ documents (JSON, CSV, or Markdown).

**Endpoint**: `POST /knowledge/{botId}/upload`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request**:
```
multipart/form-data:
- file: <your-file.json|.csv|.md>
```

**Supported Formats**:

JSON:
```json
[
  {
    "question": "How do I...?",
    "answer": "You can..."
  },
  {
    "question": "What is...?",
    "answer": "It is..."
  }
]
```

CSV:
```csv
question,answer
"How do I...?","You can..."
"What is...?","It is..."
```

Markdown (split by ## headers):
```markdown
## How do I reset my password?

To reset your password, go to the login page and click 'Forgot Password'...

## What payment methods do you accept?

We accept credit cards, PayPal, and bank transfers.
```

**Response** (200):
```json
{
  "imported": 10,
  "message": "Successfully imported 10 documents"
}
```

**Process**:
1. Parses file (JSON/CSV/MD)
2. Creates embeddings (OpenAI)
3. Stores in Pinecone vector DB
4. Saves metadata to PostgreSQL

**Errors**:
- 400: No file uploaded
- 403: Forbidden (not your bot)
- 413: File too large

---

## 📊 Analytics Endpoints

### Get Analytics

Get metrics for a chatbot.

**Endpoint**: `GET /analytics/{botId}`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "totalConversations": 156,
  "totalMessages": 892,
  "avgResponseTimeMs": 1250,
  "customerSatisfaction": 4.2,
  "escalationRate": 0.08,
  "last7Days": {
    "conversations": 23,
    "messages": 156
  },
  "botStatus": "active"
}
```

**Metrics Explained**:
- `totalConversations`: Number of unique visitor sessions
- `totalMessages`: Total messages in all conversations
- `avgResponseTimeMs`: Average bot response time
- `customerSatisfaction`: Average rating (1-5)
- `escalationRate`: Percentage escalated to humans
- `last7Days`: Last 7 days metrics

**Errors**:
- 404: Chatbot not found
- 403: Forbidden (not your bot)

---

## 🔗 Widget & Embed Endpoints

### Get Embed Script

Get the JavaScript code to embed chatbot on your website.

**Endpoint**: `GET /chatbots/{botId}/widget.js`

**Note**: This endpoint is public (no auth required)

**Response** (200):
```javascript
// Returns a complete JavaScript file
// Copy this code and paste in your HTML:
<script src="https://your-domain.com/api/chatbots/BOT_ID/widget.js"></script>
```

The script:
- Creates chat widget div
- Adds CSS styling
- Handles message input
- Communicates with API
- Stores visitor ID in localStorage

---

## ⚠️ Error Handling

All endpoints return consistent error responses:

**400 - Bad Request**:
```json
{
  "error": "Missing required fields"
}
```

**401 - Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

**403 - Forbidden**:
```json
{
  "error": "Forbidden"
}
```

**404 - Not Found**:
```json
{
  "error": "Chatbot not found"
}
```

**500 - Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```

---

## 🔑 JWT Token Details

### Token Payload

```json
{
  "userId": "user_123",
  "email": "john@example.com",
  "iat": 1704067200,
  "exp": 1704672000
}
```

### Token Expiration

- Tokens expire in 30 days
- Re-login to get new token
- Store token in localStorage

---

## 📈 Rate Limits

**Free Plan**: 100 requests/hour
**Pro Plan**: 10,000 requests/hour
**Business Plan**: Unlimited

Returns 429 status when exceeded.

---

## 🧪 Example: Full Workflow

### 1. Sign Up

```bash
curl -X POST https://your-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "secure123"
  }'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": { "id": "user_123", "email": "jane@example.com" }
}
```

### 2. Create Bot

```bash
curl -X POST https://your-domain.com/api/chatbots \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Bot",
    "websiteUrl": "https://example.com"
  }'
```

Response:
```json
{
  "id": "bot_123",
  "name": "Support Bot"
}
```

### 3. Upload FAQ

```bash
curl -X POST https://your-domain.com/api/knowledge/bot_123/upload \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@faq.json"
```

Response:
```json
{
  "imported": 10,
  "message": "Successfully imported 10 documents"
}
```

### 4. Get Embed Code

```bash
curl https://your-domain.com/api/chatbots/bot_123/widget.js
```

Response: JavaScript file

### 5. Chat with Bot

```bash
curl -X POST https://your-domain.com/api/chat/bot_123/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I reset password?",
    "visitorId": "visitor_abc"
  }'
```

Response:
```json
{
  "reply": "To reset your password...",
  "conversationId": "conv_456",
  "escalated": false
}
```

---

## 📞 Support

- GitHub Issues: [Project Issues](https://github.com/yourname/supportbot-saas)
- Email: support@supportbot.ai
- Docs: [Full Documentation](https://docs.supportbot.ai)

---

Last updated: January 2024
