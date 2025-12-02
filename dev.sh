#!/usr/bin/env bash
# Starts backend and frontend together for local development
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cleanup() {
  [[ -n "${BACK_PID:-}" ]] && kill "$BACK_PID" 2>/dev/null || true
  [[ -n "${FRONT_PID:-}" ]] && kill "$FRONT_PID" 2>/dev/null || true
}

trap 'cleanup' EXIT INT TERM

echo "Starting backend..."
(cd "$BACKEND_DIR" && npm run dev) &
BACK_PID=$!

echo "Starting frontend..."
(cd "$FRONTEND_DIR" && npm run dev -- --host) &
FRONT_PID=$!

echo "Backend PID: $BACK_PID"
echo "Frontend PID: $FRONT_PID"
echo "Press Ctrl+C to stop both."

wait -n
