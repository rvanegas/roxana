# Domain Migration Plan

## Migration 1: roxana.rvanegas.co (Amplify)

Move `tryroxana.com` → `roxana.rvanegas.co`

### Step 1 — Add domain in Amplify Console
1. Go to Amplify Console → roxana app (ID: `d1gtwcafz2d83t`) → **Domain management** → **Add domain**
2. Enter `rvanegas.co`, click **Configure domain**
3. Set subdomain to `roxana` (maps master branch → `roxana.rvanegas.co`)
4. Click **Save** — Amplify will generate DNS records (takes ~1 min)

### Step 2 — Add DNS records in Namecheap
1. Namecheap → Domain List → `rvanegas.co` → Manage → **Advanced DNS**
2. Add the records Amplify provides, typically:
   - `CNAME` | Host: `roxana` | Value: `[something].cloudfront.net`
   - `TXT` record for domain ownership verification (if required)

### Step 3 — Wait for propagation
- SSL provisioning + DNS propagation: 15–30 min
- Verify at `https://roxana.rvanegas.co`

### Step 4 — Remove old domain
- Amplify Console → Domain management → remove `tryroxana.com`

---

## Migration 2: noesis.rvanegas.co (Lightsail)

Move `rvanegas.com` → `noesis.rvanegas.co` (one Lightsail instance, Python + nginx + Let's Encrypt)

### Step 1 — Get Lightsail static IP
- Lightsail Console → your instance → **Networking** tab → copy static IP

### Step 2 — Add DNS record in Namecheap
1. Namecheap → Domain List → `rvanegas.co` → Manage → **Advanced DNS**
2. Add: `A` | Host: `noesis` | Value: `<lightsail-static-ip>` | TTL: Automatic

### Step 3 — Update nginx config (SSH into instance)
```bash
sudo nano /etc/nginx/sites-available/default  # or whichever config file is active
```
Add `noesis.rvanegas.co` to the `server_name` line:
```nginx
server_name rvanegas.com www.rvanegas.com noesis.rvanegas.co;
```
Test and reload:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Step 4 — Expand Let's Encrypt certificate
```bash
sudo certbot --nginx -d rvanegas.com -d www.rvanegas.com -d noesis.rvanegas.co
```
Certbot will expand the existing cert to include the new subdomain and update nginx automatically.

### Step 5 — Verify new domain
- Check `https://noesis.rvanegas.co` is live and SSL is valid

### Step 6 — Switch to new domain only
Once confirmed working, update nginx to serve only `noesis.rvanegas.co`:
```nginx
server_name noesis.rvanegas.co;
```
Re-run certbot if you want to drop `rvanegas.com` from the cert:
```bash
sudo certbot --nginx -d noesis.rvanegas.co
```
Reload nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Step 7 — Remove rvanegas.com DNS (optional)
Once traffic has fully moved, remove the `A`/`CNAME` records for `rvanegas.com` from Namecheap.
