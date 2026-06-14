#!/usr/bin/env sh
# One-time Ubuntu server setup for Oracle Cloud (Docker + Compose v2 + firewall).
# Run on the VM as ubuntu: bash scripts/server-bootstrap.sh

set -eu

echo "==> Updating packages..."
sudo apt update && sudo apt upgrade -y

echo "==> Installing git and curl..."
sudo apt install -y git curl ca-certificates

echo "==> Installing Docker (includes Compose v2 plugin)..."
curl -fsSL https://get.docker.com | sh

echo "==> Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

echo "==> Adding ubuntu user to docker group..."
sudo usermod -aG docker ubuntu

echo "==> Configuring UFW firewall..."
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp comment 'Nest API'
sudo ufw --force enable

echo "==> Docker version:"
docker --version
docker compose version

echo ""
echo "Bootstrap complete. Log out and SSH back in so the docker group applies."
echo "Then clone the repo to /opt/nest-postgres-crud and run ./scripts/deploy.sh"
