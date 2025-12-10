# Quick Start Guide - SupportBot

Get up and running with SupportBot in 5 minutes!

## Step 1: Prerequisites (2 minutes)

Before starting, get these API keys:

1. **Pinecone** (Free)
   - Go to https://app.pinecone.io
   - Sign up for free
   - Create index: `chatbot-docs` (dimensions: 1536, metric: cosine)
   - Copy API key

2. **OpenAI** (Paid)
   - Go to https://platform.openai.com/account/api-keys
   - Create new secret key
   - Copy API key

3. **PostgreSQL** (Free or Local)
   - Install locally: https://www.postgresql.org/download/
   - Or use Railway/Supabase for cloud hosting
   - Get connection string (DATABASE_URL)

## Step 2: Clone & Setup (2 minutes)

```bash
# Clone repository
git clone <YOUR_REPO_URL>
cd supportbot-saas

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

## Step 3: Fill Environment Variables (1 minute)

Edit `.env.local` and add your API keys:

```env
# Paste Pinecone API key
PINECONE_API_KEY=pk_xxx...

# Paste OpenAI API key
OPENAI_API_KEY=sk-xxx...

# Paste your PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/supportbot

# Generate random JWT secret (just any random string)
JWT_SECRET=your_random_secret_key_here_12345

# Leave these as default for local dev
NEXTAUTH_SECRET=dev_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Setup Database (Just Run Commands!)

```bash
# Create database tables automatically
npx prisma migrate dev --name init

# You'll see: "✔ Generated Prisma Client"
```

## Step 5: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - You should see the landing page! 🎉

## Step 6: Create Your First Chatbot

1. Click "Sign Up" button
2. Create an account
3. Click "New Chatbot"
4. Name it: "My Test Bot"
5. Click Create

## Step 7: Upload Your Knowledge Base

1. Click on your bot to open it
2. Go to "Knowledge Base" tab
3. Download and use `sample-faq.json` from the repo
4. Click upload
5. Wait for it to process ✓

## Step 8: Embed on Your Website

1. Go to "Embed" tab
2. Copy the code
3. Paste it in your website's HTML (before `</body>` tag)
4. Done!

## Step 9: Test the Chat

1. Refresh your website
2. Chat widget should appear in bottom-right
3. Try asking: "How do I reset my password?"
4. Bot should answer from your knowledge base!

## Troubleshooting

**"Cannot find module" error?**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**"Pinecone API key not found"?**
- Check `.env.local` has `PINECONE_API_KEY`
- Restart dev server: `npm run dev`

**"Database error"?**
- Make sure PostgreSQL is running
- Check DATABASE_URL is correct

**"OpenAI error"?**
- Check API key is valid
- Verify you have credits in OpenAI account

## Next Steps

1. **Deploy to Vercel** (5 minutes)
   - Push code to GitHub
   - Go to vercel.com
   - Connect your repo
   - Add environment variables
   - Deploy!

2. **Customize** (Optional)
   - Change colors in `tailwind.config.js`
   - Update landing page copy in `pages/index.tsx`
   - Add your logo

3. **Go Live**
   - Set up domain
   - Configure SSL
   - Test in production

## Production Checklist

- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Use production PostgreSQL database
- [ ] Set strong `JWT_SECRET`
- [ ] Configure custom domain
- [ ] Setup email notifications (optional)
- [ ] Enable SSL/HTTPS
- [ ] Monitor OpenAI costs
- [ ] Setup Slack integration

## Getting Help

- **Docs**: Read README.md for full documentation
- **Issues**: Check GitHub issues section
- **API Docs**: Visit OpenAI, Pinecone, and Prisma docs

---

That's it! You're ready to deploy SupportBot. Good luck! 🚀
