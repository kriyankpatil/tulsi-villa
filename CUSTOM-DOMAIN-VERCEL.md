# Use Your Hostinger Domain with Vercel

Your app **stays on Vercel**. You only connect the domain you bought from Hostinger so the site is available at your custom URL (e.g. `https://yourdomain.com`).

---

## Step 1: Add the domain in Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **tulsi-villa** project.
2. Go to **Settings** → **Domains**.
3. Click **Add** and enter your domain (e.g. `yourdomain.com`).
4. Add `www.yourdomain.com` as well if you want both to work.
5. Vercel will show you which **DNS records** to create. It usually looks like:

   **For root domain (`yourdomain.com`):**
   - **A record**  
     - Name: `@` (or leave blank)  
     - Value: `76.76.21.21`  
     - (Vercel may show a different IP; use what they display.)

   **For `www`:**
   - **CNAME record**  
     - Name: `www`  
     - Value: `cname.vercel-dns.com`  
     - (Again, use the exact value Vercel shows.)

   Note the exact values Vercel gives you—you’ll add them in Hostinger next.

---

## Step 2: Add DNS records in Hostinger

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Websites** → select the domain you bought (or **Domains** → your domain).
3. Open **DNS / DNS Zone** or **Manage DNS**.
4. Add the records Vercel showed you:

   | Type  | Name | Value / Target           | TTL (optional) |
   |-------|------|--------------------------|----------------|
   | **A** | `@`  | `76.76.21.21`            | 3600 or default |
   | **CNAME** | `www` | `cname.vercel-dns.com` | 3600 or default |

   Use the **exact** values from Vercel (they might differ slightly).  
   Remove or leave any old A/CNAME for `@` or `www` that pointed somewhere else, so only Vercel’s records apply.

5. Save.

---

## Step 3: Wait for DNS and SSL

- DNS can take from a few minutes up to 24–48 hours.
- Vercel will automatically issue an SSL certificate (HTTPS) when DNS is correct.
- In Vercel → **Domains**, the domain will show as **Valid** when it’s ready.

---

## Step 4: Update NEXTAUTH_URL (if you use it)

If your app uses `NEXTAUTH_URL`:

1. Vercel → **Settings** → **Environment Variables**.
2. Edit **NEXTAUTH_URL** and set it to `https://yourdomain.com` (your new domain).
3. Redeploy the project (e.g. **Deployments** → … → **Redeploy**) so the new value is used.

---

## Summary

| Where        | What you do |
|-------------|-------------|
| **Vercel**  | Add domain in Settings → Domains; note the A and CNAME values. |
| **Hostinger** | In DNS for your domain, add the A record for `@` and CNAME for `www` to Vercel. |
| **Vercel**  | Set `NEXTAUTH_URL` to `https://yourdomain.com` and redeploy if needed. |

Your app keeps running on Vercel; only the domain is the one you bought from Hostinger.
