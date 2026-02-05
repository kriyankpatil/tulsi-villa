# Tulsi Villa: Migrate from Vercel to Hostinger

This guide covers moving your Tulsi Villa app from Vercel to Hostinger while **keeping your existing Supabase database**. No database migration is needed—only the app hosting and your domain change.

---

## What Stays the Same

| Item | Action |
|------|--------|
| **Supabase** | Keep using the same project. No changes. |
| **Database (PostgreSQL)** | Same `DATABASE_URL`; set it in Hostinger env. |
| **Storage (Supabase)** | Same `SUPABASE_*` env vars if you use uploads. |
| **Your domain** | Point DNS to Hostinger instead of Vercel. |

---

## Option A: Hostinger Managed Node.js (Easiest)

**Requirements:** Hostinger **Business** or **Cloud** plan (Cloud Startup, Professional, or Enterprise).  
These plans support **Node.js Apps** with GitHub deploy.

### 1. Prepare the repo

- Code should be on GitHub (e.g. `kriyankpatil/tulsi-villa`).
- Ensure `package.json` has:
  - `"build": "prisma generate && NODE_NO_WARNINGS=1 next build"`
  - `"start": "next start"`
  - `"engines": { "node": "18.x || 20.x || 22.x" }`

### 2. In Hostinger hPanel

1. Log in to [hPanel](https://hpanel.hostinger.com).
2. **Websites** → **Add Website** (or select the site if you already added the domain).
3. Choose **Node.js Apps** (or “Advanced” → Node.js).
4. **Deploy from GitHub:**
   - Connect your GitHub account and select `tulsi-villa`.
   - Branch: `main`.
5. **Build settings** (Hostinger often auto-detects Next.js):
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Output directory:** leave default or `.` (Next.js uses `.next` internally).
6. **Node version:** 18, 20, or 22 (match `engines` in `package.json`).

### 3. Environment variables in hPanel

In the Node.js app settings, add **Environment Variables** (same as Vercel):

| Variable | Description | Example |
|----------|-------------|--------|
| `DATABASE_URL` | **Required.** Supabase connection string (use **pooler**, port **6543**) | `postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require` |
| `JWT_SECRET` | **Required.** Min 32 characters, random | Your existing JWT secret from Vercel |
| `ADMIN_EMAIL` | Optional | `admin@yourdomain.com` |
| `NEXTAUTH_URL` | Your live URL | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Optional | Same as on Vercel if you use NextAuth |
| `SUPABASE_URL` | If you use file uploads | `https://[project-ref].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | If you use storage | From Supabase → Settings → API |
| `SUPABASE_STORAGE_BUCKET` | Optional | `uploads` |

**Where to get `DATABASE_URL`:**
- Supabase Dashboard → **Project Settings** → **Database**.
- Use **Connection string** → **URI** with **Connection pooling** (Transaction mode, port **6543**).
- Replace `[YOUR-PASSWORD]` with your database password (URL-encode if it has special characters).

### 4. Deploy

- Click **Deploy** / **Save and deploy**.
- Wait for the build to finish. Fix any errors using the build logs.

### 5. Custom domain

- In hPanel, add your domain to this hosting account (if not already).
- In the Node.js app, assign your domain (e.g. `yourdomain.com` and optionally `www.yourdomain.com`).
- **DNS at your domain registrar:**  
  - Either **A record** to the IP Hostinger gives you for the app, or  
  - **CNAME** to the Hostinger hostname they show (e.g. `something.hostingersite.com`).  
- After DNS propagates, Hostinger will usually provision SSL (HTTPS) automatically.

### 6. Post-migration

- Set **NEXTAUTH_URL** (and any other URL-dependent vars) to `https://yourdomain.com`.
- Test: login, admin, receipts, expenses, file uploads.
- When everything works, you can remove the project from Vercel or leave it as a backup.

---

## Option B: Hostinger VPS (Full control)

Use this if you have a **VPS** plan and want to run the app yourself.

### 1. Get VPS details

- Note the VPS **IP** and ensure you can **SSH** (e.g. `ssh root@YOUR_VPS_IP`).

### 2. Point your domain

- At your domain registrar, add an **A record**: `@` → VPS IP.
- Optionally `www` → same IP or a CNAME to the main domain.

### 3. SSH and install Node.js (use real nvm, not the Python package)

On your Mac, use the **real** nvm (Node Version Manager), not `pip install nvm`:

```bash
# Install nvm (run in terminal)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart terminal, then:
nvm install --lts
nvm use --lts
```

On the **VPS** (Ubuntu), after SSH:

```bash
# Install Node.js via NodeSource (or nvm)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm on the server
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc   # or ~/.zshrc
nvm install 20
nvm use 20
```

### 4. Install PM2 and Nginx

```bash
sudo npm install -g pm2
sudo apt update && sudo apt install -y nginx
```

### 5. Deploy the app on the VPS

```bash
# Clone your repo (or upload/rsync)
cd /var/www
sudo git clone https://github.com/kriyankpatil/tulsi-villa.git
sudo chown -R $USER:$USER tulsi-villa
cd tulsi-villa

# Create .env from your production values
nano .env
# Paste DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, NEXTAUTH_URL, SUPABASE_* etc.

# Build and start
npm install
npm run build
NODE_ENV=production pm2 start npm --name "tulsi-villa" -- start
pm2 save
pm2 startup
```

### 6. Nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/tulsi-villa
```

Add (replace `yourdomain.com` with your domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/tulsi-villa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7. SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Summary checklist

- [ ] Supabase: no change; keep same project and DB.
- [ ] Copy all env vars from Vercel to Hostinger (Node.js app or `.env` on VPS).
- [ ] Use **pooled** `DATABASE_URL` (port 6543) for Supabase.
- [ ] Set **NEXTAUTH_URL** to `https://yourdomain.com` after go-live.
- [ ] Point domain DNS to Hostinger (A or CNAME).
- [ ] Test login, admin, receipts, expenses, uploads.
- [ ] Optionally remove or pause the Vercel project after verification.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Build fails | Build logs in hPanel; ensure `prisma generate` runs (in `npm run build`). |
| DB connection errors | `DATABASE_URL` uses port **6543** and `?pgbouncer=true&connection_limit=1&sslmode=require`. |
| 502 Bad Gateway (VPS) | App running: `pm2 list`; Nginx `proxy_pass` to correct port (3000). |
| Auth/session issues | `JWT_SECRET` and `NEXTAUTH_*` set; `NEXTAUTH_URL` matches the URL users use. |

For **managed Node.js**, use Hostinger’s support if deploy or env configuration is unclear. For **VPS**, use the build and PM2 logs plus Nginx error log: `sudo tail -f /var/log/nginx/error.log`.
