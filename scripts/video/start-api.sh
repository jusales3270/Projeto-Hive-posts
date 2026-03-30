#!/bin/sh
set -e

echo "[startup] Running database migrations..."
npx prisma migrate deploy || echo "[startup] Migrations skipped (may already be applied)"

echo "[startup] Starting video worker in background..."
node /app/scripts/video/worker.mjs 2>&1 &

echo "[startup] Starting API server..."
exec node /app/dist/index.js
