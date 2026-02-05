# Vercel → Hostinger migration checklist

Do these steps in order. Your **Supabase database stays the same**—no DB migration.

---

## Step 1: Get environment variables from Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **tulsi-villa** project.
2. Go to **Settings** → **Environment Variables**.
3. Copy each variable (click value to reveal, then copy).  
   Use the list below and write each value somewhere safe (e.g. a temporary note), or export if Vercel allows.

**Variables to copy:**

| Variable | Required | Copy from Vercel |
|----------|----------|------------------|
| `DATABASE_URL` | ✅ Yes | Full Postgres URI (port 6543 for Supabase pooler) |
| `JWT_SECRET` | ✅ Yes | Same 32+ char secret |
| `ADMIN_EMAIL` | Optional | e.g. admin@yourdomain.com |
| `NEXTAUTH_URL` | Optional | Will change to your new domain in Step 5 |
| `NEXTAUTH_SECRET` | Optional | Same as Vercel |
| `SUPABASE_URL` | If you use uploads | https://xxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | If you use uploads | From Supabase dashboard |
| `SUPABASE_STORAGE_BUCKET` | Optional | Usually `uploads` |

Keep this list; you’ll paste these into Hostinger in **Step 4**.

---

## Step 2: Ensure code is on GitHub

1. In terminal (from your project folder):
   ```bash
   cd "/Users/kriyank/Desktop/tulsi villa"
   git status
   ```
2. If you have uncommitted changes:
   ```bash
   git add .
   git commit -m "Ready for Hostinger migration"
   git push origin main
   ```
3. Confirm the repo is at: **https://github.com/kriyankpatil/tulsi-villa** (branch `main`).

---

## Step 3: Add Node.js app in Hostinger

1. Log in to **Hostinger**: [hPanel](https://hpanel.hostinger.com).
2. Go to **Websites**.
3. Either:
   - **Add Website** and add your domain, or  
   - Select the website you already added for your domain.
4. Open **Node.js Apps** (or **Advanced** → **Node.js**).
5. Click **Create Node.js App** or **Add application**.
6. **Connect GitHub:**
   - Authorize Hostinger with GitHub if asked.
   - Select repository: **kriyankpatil/tulsi-villa**.
   - Branch: **main**.
7. **Build settings:**
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Node version:** 20 (or 18/22).
   - **Root directory:** leave empty (or `.`).
8. Don’t deploy yet—do **Step 4** first.

---

## Step 4: Add environment variables in Hostinger

1. In the same Node.js app in hPanel, find **Environment Variables** (or **Env** / **Config**).
2. Add each variable from **Step 1** (name + value).  
   For **NEXTAUTH_URL**, use your **new** domain, e.g. `https://yourdomain.com`.
3. Save the configuration.

---

## Step 5: Deploy and assign domain

1. Click **Deploy** (or **Save and Deploy**).
2. Wait for the build to finish. If it fails, check build logs and fix (often env or Node version).
3. In the Node.js app settings, **assign your domain** (e.g. `yourdomain.com`, and optionally `www.yourdomain.com`).
4. Note the **DNS instructions** Hostinger shows (A record IP or CNAME target).

---

## Step 6: Point your domain DNS to Hostinger

1. Log in to the place where you bought the domain (registrar or Hostinger DNS).
2. Edit DNS records:
   - **A record:** `@` (or your root domain) → IP address Hostinger gave you, **or**
   - **CNAME:** `@` or `www` → the Hostinger hostname they provided.
3. Save. DNS can take 5–60 minutes (sometimes up to 48 hours).
4. Hostinger will issue SSL (HTTPS) automatically once DNS points to them.

---

## Step 7: Test and switch

1. When DNS has propagated, open `https://yourdomain.com`.
2. Test:
   - [ ] Home page loads
   - [ ] Sign in / sign up
   - [ ] Admin panel (if you use it)
   - [ ] Receipts / expenses
   - [ ] File uploads (if used)
3. If everything works, you can remove or pause the project on Vercel.

---

## Quick reference

- **Full guide:** [HOSTINGER-MIGRATION.md](./HOSTINGER-MIGRATION.md)  
- **Env template:** [env.production](./env.production)  
- **Supabase:** No change; keep using the same project and same `DATABASE_URL`.
