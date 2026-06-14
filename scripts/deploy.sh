#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/health}"

echo "Pulling latest code..."
git pull --ff-only origin "${DEPLOY_BRANCH:-master}"

echo "Building and starting containers..."
docker compose -f "$COMPOSE_FILE" up -d --build

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for the health check. Install with: sudo apt install -y curl"
  exit 1
fi

echo "Waiting for health check..."
attempt=0
max_attempts=30
until curl -sf "$HEALTH_URL" >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Health check failed after ${max_attempts} attempts."
    docker compose -f "$COMPOSE_FILE" logs --tail=50 app
    exit 1
  fi
  sleep 2
done

echo "Deploy successful."
curl -s "$HEALTH_URL"
echo
