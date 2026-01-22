# Pointing GoDaddy Domain to Vercel

This guide explains how to connect your GoDaddy domain (`jameymcelveen.com`) to your Vercel deployment.

## Prerequisites

- Domain registered with GoDaddy
- Vercel account with your site deployed
- Access to both GoDaddy and Vercel dashboards

## Step 1: Add Domain to Vercel

1. Go to your Vercel project dashboard: https://vercel.com
2. Navigate to your project: `jameymcelveen.com`
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain: `jameymcelveen.com`
6. Click **Add**

Vercel will show you the DNS records you need to configure.

## Step 2: Configure DNS in GoDaddy

### Option A: Use Vercel's Nameservers (Recommended)

This is the simplest approach:

1. Log into GoDaddy: https://www.godaddy.com
2. Go to **My Products** → **DNS** (or **Domains** → **DNS**)
3. Find your domain `jameymcelveen.com`
4. Scroll to **Nameservers** section
5. Click **Change**
6. Select **Custom** (or **I'll use my own nameservers**)
7. Replace the nameservers with Vercel's:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
8. Click **Save**

**Note:** DNS changes can take 24-48 hours to propagate, but usually happen within a few hours.

### Option B: Use A/CNAME Records (Keep GoDaddy Nameservers)

If you want to keep using GoDaddy's nameservers:

1. In GoDaddy, go to **DNS Management** for your domain
2. Add/Edit the following records:

   **For root domain (`jameymcelveen.com`):**
   - Type: `A`
   - Name: `@` (or leave blank)
   - Value: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)
   - TTL: `600` (or default)

   **For www subdomain (`www.jameymcelveen.com`):**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com.` (note the trailing dot)
   - TTL: `600` (or default)

3. Remove any conflicting A or CNAME records
4. Click **Save**

## Step 3: Verify in Vercel

1. Go back to Vercel dashboard
2. Check **Settings** → **Domains**
3. You should see:
   - ✅ `jameymcelveen.com` - Valid Configuration
   - ✅ `www.jameymcelveen.com` - Valid Configuration (if configured)

## Step 4: Wait for Propagation

DNS changes can take time to propagate globally:

- **Minimum:** 5-10 minutes
- **Typical:** 1-4 hours
- **Maximum:** 24-48 hours

You can check propagation status at:
- https://dnschecker.org
- https://www.whatsmydns.net

## Step 5: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. Once DNS is configured correctly, SSL will be enabled automatically (usually within a few minutes).

## Troubleshooting

### Domain not resolving?

1. **Check DNS propagation:** Use dnschecker.org to see if changes have propagated
2. **Verify records:** Double-check the DNS records match exactly what Vercel shows
3. **Clear DNS cache:** 
   - Windows: `ipconfig /flushdns`
   - Mac/Linux: `sudo dscacheutil -flushcache` or `sudo systemd-resolve --flush-caches`
4. **Wait longer:** Sometimes it just takes time

### SSL certificate not issued?

- Wait 5-10 minutes after DNS is fully propagated
- Check Vercel dashboard for any errors
- Ensure DNS records are correct

### Still having issues?

- Check Vercel's domain troubleshooting guide: https://vercel.com/docs/concepts/projects/domains
- Contact Vercel support if needed

## Additional Resources

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [GoDaddy DNS Help](https://www.godaddy.com/help/manage-dns-records-680)
- [DNS Propagation Checker](https://dnschecker.org)
