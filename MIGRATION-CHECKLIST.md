# Add Your Hostinger Domain to Vercel

You’re **staying on Vercel**. This checklist only connects the domain you bought from Hostinger so your app is available at your custom URL.

---

## Step 1: Add domain in Vercel

1. [Vercel Dashboard](https://vercel.com/dashboard) → **tulsi-villa** project.
2. **Settings** → **Domains** → **Add**.
3. Enter your domain (e.g. `yourdomain.com`) and add `www.yourdomain.com` if you want both.
4. **Copy the DNS records** Vercel shows (A record for `@`, CNAME for `www`—exact values matter).

---

## Step 2: Add DNS in Hostinger

1. [Hostinger hPanel](https://hpanel.hostinger.com) → **Websites** or **Domains** → your domain.
2. Open **DNS Zone** / **Manage DNS**.
3. Add the records from Vercel:
   - **A** → Name: `@`, Value: the IP Vercel gave (e.g. `76.76.21.21`).
   - **CNAME** → Name: `www`, Value: e.g. `cname.vercel-dns.com` (use Vercel’s value).
4. Save.

---

## Step 3: Wait and update env (if needed)

- Wait for DNS to propagate (minutes to a few hours). Vercel will show the domain as **Valid** in **Settings → Domains** and issue SSL (HTTPS).
- If you use **NEXTAUTH_URL**: Vercel → **Settings** → **Environment Variables** → set `NEXTAUTH_URL` to `https://yourdomain.com` → **Redeploy**.

---

**Full details:** [CUSTOM-DOMAIN-VERCEL.md](./CUSTOM-DOMAIN-VERCEL.md)
