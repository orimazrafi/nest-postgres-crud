# Deployment guide (Oracle Cloud free VM + Docker)

This guide deploys the full stack (Postgres, Redis, Nest API) on a single Linux VPS using `docker-compose.prod.yml`. GitHub Actions runs tests on every push and deploys to the server when `main` passes CI.

## Architecture

```
GitHub push → CI (lint, test, e2e, docker build)
           → Deploy (SSH to VM → git pull → docker compose up)

Oracle VM (ARM)
  ├── postgres   (internal only)
  ├── redis      (internal only)
  └── app        (port 3000, or Caddy on 443 with --profile proxy)
```

## Oracle Cloud quick reference (this project)

| Item | Value |
|------|--------|
| Server IP | `151.145.93.169` |
| SSH user | `ubuntu` |
| Local private key | `C:\dev\ssh\ssh-key-2026-06-14.key` |
| Deploy path on server | `/opt/nest-postgres-crud` |

Open these ports in the **OCI Security List / NSG**: `22`, `3000`.

## Part 1 — Oracle Cloud VM (one-time)

### 1. Create an Always Free VM

1. Sign up at [Oracle Cloud](https://www.oracle.com/cloud/free/).
2. Create an **Ampere (ARM)** instance with Ubuntu 22.04 or 24.04.
3. Aim for **4 GB RAM** if available (minimum 2 GB).
4. Add your SSH public key at creation time.
5. Open inbound ports in the **Oracle security list / NSG**:
   - `22` (SSH)
   - `3000` (API, first deploy) — or `80`/`443` if using Caddy
6. Note the public IP address.

### 2. Install Docker on the VM

SSH in:

```bash
ssh ubuntu@YOUR_SERVER_IP
```

Then:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
```

Log out and back in so the `docker` group applies.

Optional host firewall:

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 3000
sudo ufw enable
```

### 3. Clone the repository

```bash
sudo mkdir -p /opt/nest-postgres-crud
sudo chown "$USER:$USER" /opt/nest-postgres-crud
git clone https://github.com/YOUR_USER/nest-postgres-crud.git /opt/nest-postgres-crud
cd /opt/nest-postgres-crud
```

### 4. Configure production environment

```bash
cp .env.production.example .env
nano .env
```

Set at minimum:

| Variable | Example |
|----------|---------|
| `POSTGRES_PASSWORD` | Long random string |
| `CORS_ORIGIN` | `https://your-app.vercel.app` or `http://YOUR_SERVER_IP:5173` for dev |
| `APP_BIND` | `0.0.0.0` for direct access on port 3000 |

### 5. First manual deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Verify:

```bash
curl http://localhost:3000/health
```

From your PC:

```bash
curl http://YOUR_SERVER_IP:3000/health
```

Expected:

```json
{"status":"ok","checks":{"database":{"status":"up"},"redis":{"status":"up"}}}
```

---

## Part 2 — GitHub Actions

### 1. Push your code to GitHub

Ensure the repo is on GitHub and the default branch is `main`.

### 2. Create a deploy SSH key

On your **local machine**:

```bash
ssh-keygen -t ed25519 -f ./deploy_key -N "" -C "github-actions-deploy"
```

On the **server**, add the public key:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE deploy_key.pub CONTENTS" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Add GitHub repository secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `SERVER_HOST` | VM public IP or hostname |
| `SERVER_USER` | e.g. `ubuntu` |
| `SSH_PRIVATE_KEY` | Full contents of `deploy_key` (private file) |
| `DEPLOY_PATH` | Optional; default `/opt/nest-postgres-crud` |

### 4. How workflows behave

| Workflow | Trigger | Action |
|----------|---------|--------|
| **CI** (`.github/workflows/ci.yml`) | Every push and PR | Lint, unit tests, E2E, `npm run build`, Docker build |
| **Deploy** (`.github/workflows/deploy.yml`) | CI succeeds on `main` | SSH → `./scripts/deploy.sh` |

After the first server setup, every push to `main` that passes CI redeploys automatically.

---

## Part 3 — HTTPS with Caddy (optional)

When you have a domain pointing to the VM:

1. Set in `.env`:

   ```env
   APP_BIND=127.0.0.1
   DOMAIN=api.yourdomain.com
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

2. Open ports `80` and `443` on Oracle firewall (close public `3000` if desired).

3. Start with the proxy profile:

   ```bash
   docker compose -f docker-compose.prod.yml --profile proxy up -d --build
   ```

Caddy obtains a Let's Encrypt certificate automatically.

---

## Part 4 — Adding React later

1. Deploy the React app to **Vercel** (free).
2. Set `CORS_ORIGIN` on the server to your Vercel URL.
3. Point the frontend API base URL to `http://YOUR_SERVER_IP:3000` or `https://api.yourdomain.com`.
4. Use `fetch(..., { credentials: 'include' })` for cookie-based auth.

---

## Useful commands on the server

```bash
cd /opt/nest-postgres-crud

# Logs
docker compose -f docker-compose.prod.yml logs -f app

# Status
docker compose -f docker-compose.prod.yml ps

# Restart after .env change
docker compose -f docker-compose.prod.yml up -d --build

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop and delete data (careful)
docker compose -f docker-compose.prod.yml down -v
```

---

## Troubleshooting

| Problem | Check |
|---------|--------|
| Deploy SSH fails | `SERVER_HOST`, `SERVER_USER`, key in `authorized_keys`, Oracle port 22 open |
| Health check fails | `docker compose -f docker-compose.prod.yml logs app` |
| Cannot reach API from browser | Oracle NSG allows port 3000; `APP_BIND=0.0.0.0` |
| ARM build errors | Build on the VM (default in deploy script); Oracle Ampere is `linux/arm64` — Node Alpine images support ARM |
| CORS errors from frontend | `CORS_ORIGIN` must exactly match the browser origin (scheme + host + port) |

---

## Local vs production compose

| File | Use |
|------|-----|
| `docker-compose.yml` | Local dev; exposes Postgres/Redis ports |
| `docker-compose.prod.yml` | VPS; Postgres/Redis internal only; strong passwords via `.env` |
