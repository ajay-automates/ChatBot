# SupportBot - AI-Powered Support Chatbot SaaS

A complete, production-ready SaaS platform for building and deploying AI-powered support chatbots. Handle 80% of customer support questions automatically with RAG (Retrieval-Augmented Generation).

## Features

✨ **Smart AI Responses** - Trained on your knowledge base using RAG
🚀 **Easy Setup** - Upload FAQ in JSON, CSV, or Markdown
📊 **Full Analytics** - Track conversations, satisfaction, response times
🔔 **Slack Integration** - Route complex issues to your team automatically
💰 **Simple Pricing** - Free tier + Pro/Business plans
🎯 **Production Ready** - Built with Next.js, Prisma, Pinecone, OpenAI

## Tech Stack

- **Frontend**: React + Next.js + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Node.js
- **Database**: PostgreSQL (Prisma ORM)
- **AI/ML**: OpenAI GPT-4 + Pinecone (Vector DB)
- **Infrastructure**: Vercel (hosting)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Pinecone account (free tier available)
- OpenAI API key
- Supabase account (optional, for Auth)

## Installation

### 1. Clone and Install

```bash
git clone <repo-url>
cd supportbot-saas
npm install
```

### 2. Setup Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/supportbot

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=chatbot-docs

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Authentication
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Database

```bash
# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Setup Pinecone

1. Go to [Pinecone.io](https://pinecone.io)
2. Create a new account (free tier available)
3. Create an index named `chatbot-docs` with:
   - Dimensions: 1536 (for text-embedding-3-small)
   - Metric: cosine
4. Copy your API key to `.env.local`

### 5. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Add to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app!

## Project Structure

```
supportbot-saas/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup.ts
│   │   │   └── login.ts
│   │   ├── chatbots/
│   │   │   ├── index.ts
│   │   │   ├── [id].ts
│   │   │   └── [id]/widget.ts
│   │   ├── chat/
│   │   │   └── [botId]/message.ts
│   │   ├── knowledge/
│   │   │   └── [botId]/upload.ts
│   │   └── analytics/
│   │       └── [botId].ts
│   ├── dashboard/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── index.tsx (Landing page)
│   ├── login.tsx
│   ├── signup.tsx
│   ├── _app.tsx
│   └── _document.tsx
├── lib/
│   ├── pinecone.ts (Vector DB utilities)
│   ├── auth.ts (JWT utilities)
│   └── supabase.ts (Auth utilities)
├── styles/
│   └── globals.css
├── prisma/
│   └── schema.prisma (Database schema)
├── .env.local (Environment variables)
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

## Key API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account

### Chatbots
- `GET /api/chatbots` - Get all user's chatbots
- `POST /api/chatbots` - Create new chatbot
- `GET /api/chatbots/[id]` - Get chatbot details
- `PUT /api/chatbots/[id]` - Update chatbot
- `DELETE /api/chatbots/[id]` - Delete chatbot
- `GET /api/chatbots/[id]/widget.ts` - Get embed script

### Chat & Knowledge Base
- `POST /api/chat/[botId]/message` - Send chat message (RAG enabled)
- `POST /api/knowledge/[botId]/upload` - Upload knowledge base files
- `GET /api/analytics/[botId]` - Get bot analytics

## Usage

### 1. Create a Chatbot

```typescript
// POST /api/chatbots
{
  "name": "My Support Bot",
  "websiteUrl": "https://mycompany.com"
}
```

### 2. Upload Knowledge Base

Upload a JSON file with your FAQ:

```json
[
  {
    "question": "How do I reset my password?",
    "answer": "Go to login page, click 'Forgot password', and follow the instructions."
  },
  {
    "question": "What are your business hours?",
    "answer": "We're available 9 AM - 5 PM EST, Monday to Friday."
  }
]
```

Or use CSV format:

```csv
question,answer
"How do I reset my password?","Go to login page, click 'Forgot password'..."
"What are your business hours?","We're available 9 AM - 5 PM EST..."
```

### 3. Embed on Your Website

Copy the embed code from the dashboard:

```html
<script src="https://your-domain.com/api/chatbots/BOT_ID/widget.js"></script>
```

### 4. Chat with Your Bot

The widget will appear in the bottom-right corner of your website. Visitors can start chatting!

## Pricing Tiers

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Conversations/month | 100 | 5,000 | Unlimited |
| KB Documents | 5 | Unlimited | Unlimited |
| Slack Integration | ✗ | ✓ | ✓ |
| Priority Support | ✗ | ✗ | ✓ |
| Price | Free | $500/mo | $2,000/mo |

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel settings
4. Deploy!

```bash
# One-click deploy button available on GitHub
```

### Manual Deployment

```bash
npm run build
npm run start
```

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (dev only!)
npx prisma migrate reset
```

### Monitoring

- Check Pinecone dashboard for vector DB metrics
- Monitor OpenAI API usage in platform
- Track database queries with Prisma Studio

## Troubleshooting

### "Pinecone API Key not found"
- Make sure `PINECONE_API_KEY` is set in `.env.local`
- Restart the dev server after updating env vars

### "OpenAI API error"
- Check your API key is valid
- Ensure you have credits in your OpenAI account
- Check OpenAI status page

### "Database connection error"
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

### "Chatbot not returning answers"
- Upload knowledge base documents first
- Check Pinecone index has embeddings
- Review conversation history for context

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/yourname/supportbot-saas/issues)
- Email: support@supportbot.ai
- Docs: [Full Documentation](https://docs.supportbot.ai)

## Roadmap

- [ ] Phone call integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom branding for widget
- [ ] A/B testing for responses
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Custom domain support

## Credits

Built with ❤️ using Next.js, OpenAI, and Pinecone

---

**Ready to build?** Start with `npm run dev` 🚀
