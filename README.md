# 🖥️ AnonReply — Self-Hosted Edition (Custom Domain & Server)

> **AnonReply** is a secure, strictly confidential anonymous support and real-time live chat platform.
> This edition is pre-configured for **self-hosting on your own VPS or dedicated server** (Ubuntu, Debian, CentOS, Docker, PM2) with a **custom domain** and **Nginx reverse proxy with SSL**.

---

## ⚡ 1-Command Quick Start (Docker Compose)

Deploy the entire production stack (Next.js app + MongoDB container) in 2 minutes:

```bash
# 1. Clone this repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git /var/www/anonreply
cd /var/www/anonreply

# 2. Configure your domain and secrets
cp .env.example .env
nano .env

# 3. Start the application stack
docker compose up -d --build

# 4. View logs
docker compose logs -f
```

Your app is now running locally on port `3000` with an isolated MongoDB container!

---

## 🌐 Custom Domain & Free SSL Setup (Nginx + Certbot)

### 1. Point DNS Records
Point your domain's DNS `A` records to your server's Public IP address:
* `@` (or subdomain, e.g. `support`) &rarr; `YOUR_SERVER_IP`
* `www` &rarr; `YOUR_SERVER_IP`

### 2. Configure Nginx
Copy the included production Nginx configuration:
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/anonreply
sudo sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN.COM/g' /etc/nginx/sites-available/anonreply
sudo ln -s /etc/nginx/sites-available/anonreply /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Generate Free SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot automatically secures your site and sets up auto-renewal.

---

## 🛠️ Included Deployment Artifacts

| File | Purpose |
| :--- | :--- |
| **`Dockerfile`** | High-efficiency multi-stage production Docker build based on `node:20-alpine` |
| **`docker-compose.yml`** | Production stack bundling the Next.js app and persistent MongoDB 7.0 container |
| **`nginx.conf.example`** | Production reverse proxy with WebSocket support for live chat, SSL/TLS, and security headers |
| **`ecosystem.config.js`** | PM2 clustered process manager config for bare-metal Node.js hosting |
| **`anonreply.service.example`** | systemd service unit file for Linux system service managers |
| **`scripts/setup-server.sh`** | Automated shell script to bootstrap a clean Ubuntu/Debian server |

---

## 🔑 Default Administrator Credentials

| Seat | Admin Username | Role | Initial Password |
| :---: | :--- | :--- | :--- |
| **1** | **`admin`** | Primary Administrator (Owner) | `ChangeMe123!` |
| **2** | **`moderator1`** | Support Moderator | `ChangeMe123!` |
| **3** | **`moderator2`** | Support Moderator | `ChangeMe123!` |
| **4** | **`moderator3`** | Support Moderator | `ChangeMe123!` |
| **5** | **`moderator4`** | Support Moderator | `ChangeMe123!` |

*(Admin sign-in portal: `/admin/login`. Once signed in, customize role titles and update passwords inside `/admin`).*

---

## 📖 Deep Technical Guide
For bare-metal PM2 setups, systemd configuration, firewall rules, and database maintenance, read:
👉 **[SELF_HOSTING_GUIDE.md](./SELF_HOSTING_GUIDE.md)**

---

## 📄 License
MIT License. Free for personal, organizational, and educational use.
