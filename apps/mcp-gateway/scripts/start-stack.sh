#!/usr/bin/env bash
# Start MCP gateway + Cloudflare quick tunnel for Claude Desktop connector.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATEWAY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUN_DIR="${GATEWAY_DIR}/.run"
PORT="${PORT:-3000}"
GATEWAY_PID_FILE="${RUN_DIR}/gateway.pid"
TUNNEL_PID_FILE="${RUN_DIR}/tunnel.pid"
GATEWAY_LOG="${RUN_DIR}/gateway.log"
TUNNEL_LOG="${RUN_DIR}/tunnel.log"
TUNNEL_URL_FILE="${RUN_DIR}/tunnel.url"

mkdir -p "${RUN_DIR}"

is_running() {
  local pid_file="$1"
  if [[ -f "${pid_file}" ]]; then
    local pid
    pid="$(cat "${pid_file}")"
    if kill -0 "${pid}" 2>/dev/null; then
      return 0
    fi
    rm -f "${pid_file}"
  fi
  return 1
}

if is_running "${GATEWAY_PID_FILE}"; then
  echo "Gateway already running (pid $(cat "${GATEWAY_PID_FILE}"))."
elif curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  echo "Gateway already responding on :${PORT} (started outside stack scripts)."
else
  if [[ ! -f "${GATEWAY_DIR}/.env" ]]; then
    echo "Missing ${GATEWAY_DIR}/.env — copy from .env.example and configure." >&2
    exit 1
  fi

  cd "${GATEWAY_DIR}"
  nohup node --import tsx --env-file=.env src/index.ts >>"${GATEWAY_LOG}" 2>&1 &
  echo $! >"${GATEWAY_PID_FILE}"

  echo -n "Waiting for gateway on :${PORT}"
  for _ in $(seq 1 30); do
    if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
      echo " ok"
      break
    fi
    echo -n "."
    sleep 0.5
  done
  echo

  if ! curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    echo "Gateway failed to start — see ${GATEWAY_LOG}" >&2
    exit 1
  fi
  echo "Gateway started (pid $(cat "${GATEWAY_PID_FILE}"))."
fi

if is_running "${TUNNEL_PID_FILE}"; then
  echo "Tunnel already running (pid $(cat "${TUNNEL_PID_FILE}"))."
else
  if ! command -v cloudflared >/dev/null 2>&1; then
    echo "cloudflared not found — install: brew install cloudflared" >&2
    exit 1
  fi

  : >"${TUNNEL_LOG}"
  nohup cloudflared tunnel --url "http://127.0.0.1:${PORT}" >>"${TUNNEL_LOG}" 2>&1 &
  echo $! >"${TUNNEL_PID_FILE}"

  echo -n "Waiting for tunnel URL"
  TUNNEL_URL=""
  for _ in $(seq 1 60); do
    TUNNEL_URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "${TUNNEL_LOG}" | head -1 || true)"
    if [[ -n "${TUNNEL_URL}" ]]; then
      echo " ok"
      break
    fi
    echo -n "."
    sleep 1
  done
  echo

  if [[ -z "${TUNNEL_URL}" ]]; then
    echo "Tunnel failed to expose URL — see ${TUNNEL_LOG}" >&2
    exit 1
  fi

  echo "${TUNNEL_URL}" >"${TUNNEL_URL_FILE}"
  echo "Tunnel started (pid $(cat "${TUNNEL_PID_FILE}"))."
fi

TUNNEL_URL="$(cat "${TUNNEL_URL_FILE}" 2>/dev/null || true)"
echo ""
echo "MCP endpoint: ${TUNNEL_URL}/mcp"
echo "Health:       http://127.0.0.1:${PORT}/health"
echo ""
echo "Update Claude Desktop connector URL if it changed, then: npm run stack:status"
