<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20,26,32&height=170&section=header&text=SupportBot&fontSize=52&fontAlignY=35&animation=twinkling&fontColor=ffffff&desc=RAG-Powered%20Customer%20Support%20Chatbot%20SaaS&descAlignY=55&descSize=18" width="100%" />

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](.)
[![OpenAI](https://img.shields.io/badge/GPT--4-RAG-412991?style=for-the-badge&logo=openai&logoColor=white)](.)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-000000?style=for-the-badge)](.)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Upload your FAQ. Get an embeddable AI chatbot that handles 80% of customer support automatically.**

[Features](#features) · [Quick Start](#installation) · [Embed](#embed-on-your-website) · [Architecture](#project-structure)

</div>

---

## Architecture

```
Customer visits your website
        │
        ▼
Embeddable chat widget (JS snippet)
        │
        ▼
POST /api/chat/[botId]/message
        │
        ├──→ Embed question (text-embedding-3-small)
        ├──→ Search Pinecone for relevant FAQ chunks
        ├──→ Send context + question to GPT-4
        └──→ Generate grounded answer
        │
        ▼
Response with source citations
```

---

## Features

| Feature | Details |
|---------|---------|
| **RAG-Powered** | Answers grounded in YOUR knowledge base — no hallucination |
| **Easy Setup** | Upload FAQ in JSON, CSV, or Markdown |
| **Embeddable Widget** | One script tag to add chatbot to any website |
| **Full Analytics** | Track conversations, satisfaction, response times |
| **Slack Integration** | Route complex issues to your team automatically |
| **Multi-Tenant** | Each customer gets their own isolated chatbot |
| **Pricing Tiers** | Free / Pro ($500/mo) / Business ($2K/mo) with Stripe |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Next.js, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | PostgreSQL (Prisma ORM) |
| **AI/ML** | OpenAI GPT-4 + Pinecone (Vector DB) |
| **Hosting** | Vercel |

---

## Installation

```bash
git clone https://github.com/ajay-automates/ChatBot.git
cd ChatBot
npm install
cp .env.local.example .env.local    # Fill in your keys
npx prisma migrate dev --name init
npm run dev                          # http://localhost:3000
```

---

## Embed on Your Website

```html
<script src="https://your-domain.com/api/chatbots/BOT_ID/widget.js"></script>
```

The widget appears in the bottom-right corner. Visitors can start chatting immediately.

---

## Knowledge Base Upload

Upload FAQ as JSON, CSV, or Markdown. The system embeds and indexes everything in Pinecone for instant retrieval.

```json
[
  {
    "question": "How do I reset my password?",
    "answer": "Go to login page, click 'Forgot password', and follow the instructions."
  }
]
```

---

## Tech Stack

`Next.js 14` `React` `TypeScript` `Tailwind CSS` `OpenAI GPT-4` `Pinecone` `Prisma` `PostgreSQL` `Vercel`

---

## Related Projects

| Project | Description |
|---------|-------------|
| [AI Support Agent](https://github.com/ajay-automates/ai-support-agent) | LangChain + LangSmith version with observability |
| [EmailBlast](https://github.com/ajay-automates/EmailBlast) | AI-powered cold email automation |
| [Social Media Automator](https://github.com/ajay-automates/social-media-automator) | Multi-platform social media SaaS |

---

<div align="center">

**Built by [Ajay Kumar Reddy Nelavetla](https://github.com/ajay-automates)** · December 2025

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20,26,32&height=100&section=footer" width="100%" />

</div>
