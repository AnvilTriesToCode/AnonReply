#!/bin/bash
# ==============================================================================
# AnonReply — Ubuntu / Debian Server Automated Setup Script
# ==============================================================================
# Usage: curl -fsSL https://raw.githubusercontent.com/.../setup-server.sh | bash
# Or run locally: chmod +x setup-server.sh && sudo ./setup-server.sh
# ==============================================================================

set -e

echo "=========================================================="
echo "🛡️  AnonReply — Self-Hosted Server Setup"
echo "=========================================================="

# Check root privileges
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run this script as root (sudo ./setup-server.sh)"
  exit 1
fi

echo "📦 1. Updating package lists..."
apt-get update -y
apt-get upgrade -y

echo "🔧 2. Installing system dependencies (git, curl, ufw, nginx, certbot)..."
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
  echo "🟢 3. Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "✅ Node.js $(node -v) is already installed."
fi

# Install Docker & Docker Compose if desired
if ! command -v docker &> /dev/null; then
  echo "🐳 4. Installing Docker & Docker Compose..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "✅ Docker $(docker -v) is already installed."
fi

# Configure UFW firewall
echo "🔥 5. Configuring UFW Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=========================================================="
echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Configure your domain DNS A record pointing to this server IP."
echo "2. Deploy with Docker: 'docker compose up -d'"
echo "3. Or deploy with PM2 / Nginx (see SELF_HOSTING_GUIDE.md)"
echo "=========================================================="
