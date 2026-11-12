# 🖥️ AnonReply — Complete Self-Hosting Guide (Custom Domain & Own Server)

This comprehensive guide explains how to deploy and run **AnonReply** on your own Linux server (Ubuntu, Debian, CentOS, or any VPS from DigitalOcean, Hetzner, AWS, Linode, Contabo, etc.) with a **custom domain** and **free automatic SSL via Let's Encrypt**.

---

## 📑 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Domain & DNS Configuration](#-domain--dns-configuration)
3. [Method A: 1-Command Docker Compose Deployment (Recommended)](#-method-a-docker-compose-deployment-recommended)
4. [Method B: Native Node.js + PM2 Deployment](#-method-b-native-nodejs--pm2-deployment)
5. [Setting Up Nginx Reverse Proxy with HTTPS (Let's Encrypt)](#-setting-up-nginx-reverse-proxy-with-https-lets-encrypt)
6. [Administrator Accounts & Initial Access](#-administrator-accounts--initial-access)
7. [Email Alerts Setup](#-email-alerts-setup)
8. [Database Maintenance & 72-Hour Auto-Deletion](#-database-maintenance--72-hour-auto-deletion)
9. [Updating to Newer Versions](#-updating-to-newer-versions)

---

## 📋 Prerequisites
* A Linux server or VPS (Ubuntu 22.04 / 24.04 LTS recommended).
  - Minimum specs: 1 CPU core, 1 GB RAM, 10 GB disk.
* A registered **custom domain** (e.g. `yourdomain.com` or `support.yourdomain.com`).
* Root or sudo access to your server.

---

## 🌐 Domain & DNS Configuration

Before setting up SSL, point your domain's DNS records to your server's Public IPv4 address:

| Type | Host / Name | Value / Points To | TTL |
| :---: | :--- | :--- | :---: |
| **A** | `@` *(or sub-domain, e.g. `support`)* | `YOUR_SERVER_IP` | 300 |
| **A** | `www` | `YOUR_SERVER_IP` | 300 |

*(Wait ~2-5 minutes for DNS propagation. You can verify with `ping yourdomain.com` or `dig yourdomain.com`)*.

---

## 🐳 Method A: Docker Compose Deployment (Recommended)

Docker Compose provides a fully isolated, production-ready stack including both the **Next.js application** and **MongoDB 7.0 database** with persistent volume storage.

### 1. Install Docker & Docker Compose on your server
```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
```

### 2. Clone or Copy This Repository
```bash
git clone https://github.com/AnvilTriesToCode/AnonReply.git /var/www/anonreply
cd /var/www/anonreply
```

### 3. Configure `.env`
Copy the template and edit your domain and secrets:
```bash
cp .env.example .env
nano .env
```
Ensure you configure:
```ini
NEXTAUTH_SECRET=your-random-32-character-secret-key-here
NEXTAUTH_URL=https://yourdomain.com
ADMIN_PASSWORD=YourStrongAdminPassword123!
ADMIN_EMAIL=admin@yourdomain.com
NOTIFICATION_ROUTING_EMAIL=notifications@yourdomain.com
```

### 4. Start the Application Stack
```bash
docker compose up -d --build
```

### 5. Check Service Health
```bash
docker compose ps
docker compose logs -f app
```
Your application is now running locally on port `3000`! Jump to [Section 5](#-setting-up-nginx-reverse-proxy-with-https-lets-encrypt) to expose it securely to the world via your custom domain.

---

## ⚡ Method B: Native Node.js + PM2 Deployment

If you prefer running directly on bare metal without Docker:

### 1. Install Node.js 20 & MongoDB
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Install PM2 globally
sudo npm install -g pm2

# Install MongoDB Community Edition
sudo apt-get install -y gnupg curl
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
```

### 2. Clone & Build the Application
```bash
git clone https://github.com/AnvilTriesToCode/AnonReply.git /var/www/anonreply
cd /var/www/anonreply

# Install dependencies and build
npm ci
npm run build
```

### 3. Configure `.env.production`
```bash
cp .env.production.example .env.production
nano .env.production
```
Make sure `MONGODB_URI` points to your local MongoDB:
```ini
MONGODB_URI=mongodb://127.0.0.1:27017/anonreply
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secure-32-character-secret-key
ADMIN_PASSWORD=YourStrongAdminPassword123!
```

### 4. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🔒 Setting Up Nginx Reverse Proxy with HTTPS (Let's Encrypt)

Nginx routes requests from port 80/443 directly to your local application port 3000 and handles SSL termination.

### 1. Install Nginx & Certbot
```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx Virtual Host
Copy the provided example file:
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/anonreply
```

Edit the file and replace all occurrences of `yourdomain.com` with your actual domain:
```bash
sudo nano /etc/nginx/sites-available/anonreply
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/anonreply /etc/nginx/sites-enabled/
# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default
```

### 3. Obtain Free SSL Certificate
Run Certbot:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will automatically verify your domain, install SSL certificates, and configure automatic certificate renewal.

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🛡️ Administrator Accounts & Initial Access

AnonReply uses a **Meta Business Suite-style multi-moderator architecture**:
* Individual accounts for up to 5 moderators.
* Outgoing responses and live chat greetings are branded under **`SupportTeam`**.
* Internal moderator attribution (e.g. `SupportTeam via @admin`) prevents duplicate work.

### 1. Synchronize Admin Accounts
Once your website is running, open this URL once in your browser:
👉 **`https://yourdomain.com/api/admin/sync-passwords`**

This provisions all 5 default seats into MongoDB with your configured password:
* **Seat 1:** `admin` (Primary Administrator / Owner)
* **Seat 2:** `moderator1`
* **Seat 3:** `moderator2`
* **Seat 4:** `moderator3`
* **Seat 5:** `moderator4`

### 2. Log in to the Admin Dashboard
Visit:
👉 **`https://yourdomain.com/admin/login`**
* **Username:** `admin`
* **Password:** `ChangeMe123!` *(or the password set in your `.env`)*

From the **Admin Team** tab, you can change passwords and assign custom role titles for any moderator at any time.

---

## 📧 Email Alerts Setup

To route user tickets and real-time live chat requests to your organization's email:
1. Create a free account at **[resend.com](https://resend.com)**.
2. Under **Domains**, add your custom domain and add the 3 DNS records (DKIM, SPF) to your domain registrar.
3. In your `.env`:
   ```ini
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=Support <noreply@yourdomain.com>
   NOTIFICATION_ROUTING_EMAIL=your-team@gmail.com
   ```
4. Restart your app:
   - If using Docker: `docker compose restart app`
   - If using PM2: `pm2 restart anonreply`

---

## ⏰ Database Maintenance & 72-Hour Auto-Deletion

AnonReply utilizes **MongoDB Native TTL (Time-To-Live) indexes** (`expiresAt` with `expireAfterSeconds: 0`).
* MongoDB background processes automatically scan and delete expired documents precisely 72 hours after creation.
* Zero maintenance or manual cleanup cron jobs required!

### Backups (Optional)
To take an instant snapshot backup of your database:
```bash
# If using Docker:
docker exec anonreply_db mongodump --db anonreply --out /data/db/backup_$(date +%F)

# If using native MongoDB:
mongodump --db anonreply --out /var/backups/mongodb/$(date +%F)
```

---

## 🔄 Updating to Newer Versions

```bash
cd /var/www/anonreply
git pull origin main

# If using Docker:
docker compose up -d --build

# If using PM2:
npm ci
npm run build
pm2 restart anonreply
```

---

## 📄 License
Released under the [MIT License](LICENSE). Free for personal and commercial hosting.
