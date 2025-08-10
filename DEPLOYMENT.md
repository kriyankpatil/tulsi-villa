# 🚀 Tulsi Villa - Deployment Guide

## **Quick Deploy to Vercel (Recommended)**

### **1. Prepare Your Repository**
```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **2. Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./tulsi-villa`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### **3. Set Environment Variables in Vercel**
Go to Project Settings → Environment Variables and add:

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_very_long_random_secret_key
ADMIN_EMAIL=admin@example.com
```

### **4. Deploy Database**
You have several options:

#### **Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string
4. Run migrations:
```bash
npx prisma db push
```

#### **Option B: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Run migrations

#### **Option C: Railway**
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Get connection string
4. Run migrations

### **5. Update Database URL**
Replace `DATABASE_URL` in Vercel with your production database connection string.

## **Alternative Deployment Options**

### **Railway Deployment**
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL service
4. Deploy app service
5. Set environment variables

### **Netlify Deployment**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Set environment variables

## **Production Checklist**

### **Before Deploying:**
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] File upload storage configured
- [ ] SSL certificate enabled
- [ ] Domain configured (optional)

### **After Deploying:**
- [ ] Test all functionality
- [ ] Verify file uploads work
- [ ] Test admin panel
- [ ] Check mobile responsiveness
- [ ] Monitor error logs

## **Environment Variables Reference**

```env
# Required
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=minimum_32_character_random_string

# Optional
ADMIN_EMAIL=admin@yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=another_random_string
```

## **Custom Domain Setup**

1. In Vercel: Go to Domains → Add Domain
2. Update DNS records with your domain provider
3. Wait for SSL certificate (automatic)
4. Update environment variables if needed

## **Monitoring & Maintenance**

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Check Vercel function logs
- **Database Monitoring**: Use your database provider's dashboard
- **Backup**: Regular database backups recommended

## **Support**

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connection
4. Check build logs for errors

---

**Ready to deploy? Start with Vercel - it's the easiest option for Next.js apps!**
