# Deployment Guide - SupportBot

Complete guide to deploy SupportBot to production.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the creator of Next.js and has first-class support.

#### Prerequisites
- GitHub account with your code pushed
- Vercel account (free)

#### Steps

1. **Connect GitHub to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repo
   - Click "Import"

2. **Configure Environment Variables**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add all variables from `.env.local`:
     - `DATABASE_URL`
     - `PINECONE_API_KEY`
     - `OPENAI_API_KEY`
     - `JWT_SECRET`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your-domain.com)
     - `NEXT_PUBLIC_APP_URL` (your-domain.com)

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site is live!

4. **Setup Custom Domain**
   - In Settings → Domains
   - Add your custom domain
   - Point DNS to Vercel
   - Wait for SSL certificate

#### Cost
- Free tier: 100GB bandwidth/month (usually enough)
- Pro: $20/month for unlimited

### Option 2: Railway (Good Alternative)

Railway is simple and great for databases.

#### Steps

1. **Connect GitHub**
   - Go to https://railway.app
   - Click "Deploy Now"
   - Select your repo

2. **Add PostgreSQL**
   - Click "Add Service"
   - Select PostgreSQL
   - Railway creates database for you

3. **Set Environment Variables**
   - In Railway dashboard, add all your env vars
   - Use the PostgreSQL connection string from Railway

4. **Deploy**
   - Railway auto-deploys on push to main
   - Get your domain

#### Cost
- Free tier: Limited usage
- Pay-as-you-go after free credits

### Option 3: Self-Hosted (Advanced)

For complete control, deploy on your own server.

#### Prerequisites
- Linux server (Ubuntu recommended)
- SSH access
- Domain name

#### Steps

1. **Setup Server**
   ```bash
   # SSH into your server
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Clone Repository**
   ```bash
   cd /var/www
   git clone <your-repo>
   cd supportbot-saas
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   nano .env.production
   ```

4. **Setup PostgreSQL**
   ```bash
   # Install PostgreSQL
   apt-get install -y postgresql postgresql-contrib
   
   # Create database
   sudo -u postgres createdb supportbot
   
   # Get connection string and update .env.production
   ```

5. **Build and Start**
   ```bash
   # Build Next.js
   npm run build
   
   # Start with PM2
   pm2 start npm --name "supportbot" -- start
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   apt-get install -y nginx
   
   # Edit nginx config
   nano /etc/nginx/sites-available/default
   ```

   Add this config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Test and reload
   nginx -t
   systemctl reload nginx
   ```

7. **Setup SSL (Let's Encrypt)**
   ```bash
   apt-get install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

## Environment Variables (Production)

Make sure these are set correctly:

```env
# Database (use production PostgreSQL)
DATABASE_URL=postgresql://user:pass@prod-host:5432/supportbot

# Use production Pinecone project
PINECONE_API_KEY=pk_prod_xxx

# Use production OpenAI account
OPENAI_API_KEY=sk_prod_xxx

# Set strong secrets
JWT_SECRET=very_long_random_string_at_least_32_chars
NEXTAUTH_SECRET=another_random_secret

# Production URLs
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Database Migrations

When deploying, run migrations:

```bash
# On your production server or in CI/CD
npx prisma migrate deploy
```

## Monitoring

### Setup Logging

```bash
# With PM2, view logs
pm2 logs supportbot

# Or setup log aggregation
# - Datadog
# - LogRocket
# - Sentry
```

### Monitor OpenAI Costs

- Go to https://platform.openai.com/account/billing
- Set usage limits to avoid surprises

### Monitor Pinecone

- Go to https://app.pinecone.io
- Check index size and query count
- Upgrade if needed

## Performance Optimization

1. **Enable Caching**
   - Configure Vercel/nginx caching headers
   - Cache static assets

2. **Optimize Database**
   - Add indexes to frequently queried fields
   - Monitor slow queries

3. **Rate Limiting**
   - Implement rate limits for chat API
   - Prevent abuse

4. **CDN**
   - Use Cloudflare for faster delivery
   - Cache widgets globally

## Backup Strategy

### PostgreSQL Backups

```bash
# Automated daily backup
0 2 * * * pg_dump supportbot > /backups/supportbot_$(date +\%Y\%m\%d).sql

# Keep last 30 days
find /backups -name "supportbot_*.sql" -mtime +30 -delete
```

### Vercel Automatic Backups

- Vercel automatically backs up environment variables
- Source code backed up in GitHub

## Troubleshooting

### Deployment Failed

1. Check build logs in Vercel/Railway dashboard
2. Common issues:
   - Missing environment variables
   - Database connection error
   - Node version incompatibility

### Site is Slow

1. Check database performance
2. Verify Pinecone embeddings are working
3. Monitor OpenAI API response times
4. Enable caching

### Chatbot Not Responding

1. Check if embeddings were uploaded to Pinecone
2. Verify OpenAI API key is valid
3. Check database connections
4. Review error logs

## Cost Estimation (Monthly)

- **Vercel**: $0-20 (depending on traffic)
- **PostgreSQL**: $0-50 (Supabase/Railway)
- **Pinecone**: $0-50 (vector DB)
- **OpenAI**: $0-500+ (usage-based)
- **Domain**: $10-15
- **Total**: $10-635/month (varies widely)

## Scaling Checklist

As you grow:

- [ ] Monitor database connections
- [ ] Consider database read replicas
- [ ] Increase Pinecone index size
- [ ] Setup OpenAI account for higher limits
- [ ] Implement rate limiting
- [ ] Setup CDN for static assets
- [ ] Monitor and optimize slow queries
- [ ] Consider load balancing

## Post-Deployment

1. **Test Everything**
   - Create test chatbot
   - Upload test knowledge base
   - Test embedding on website

2. **Monitor**
   - Check logs daily
   - Monitor API costs
   - Track uptime

3. **Update DNS**
   - Point domain to Vercel/your server
   - Wait for DNS propagation

4. **Announce Launch**
   - Tell customers about chatbot
   - Share embed instructions
   - Track adoption

---

Good luck with your deployment! 🚀
