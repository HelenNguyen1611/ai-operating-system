#!/usr/bin/env bash
# Show MCP gateway + tunnel status.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATEWAY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUN_DIR="${GATEWAY_DIR}/.run"
PORT="${PORT:-3000}"
GATEWAY_PID_FILE="${RUN_DIR}/gateway.pid"
TUNNEL_PID_FILE="${RUN_DIR}/tunnel.pid"
TUNNEL_URL_FILE="${RUN_DIR}/tunnel.url"

check_pid() {
  local name="$1"
  local pid_file="$2"
  if [[ -f "${pid_file}" ]]; then
    local pid
    pid="$(cat "${pid_file}")"
    if kill -0 "${pid}" 2>/dev/null; then
      echo "${name}: running (pid ${pid})"
      return 0
    fi
    echo "${name}: stale pid file (${pid})"
    return 1
  fi
  echo "${name}: not running"
  return 1
}

check_pid "Gateway" "${GATEWAY_PID_FILE}" || true
check_pid "Tunnel" "${TUNNEL_PID_FILE}" || true

echo ""
if curl -sf "http://127.0.0.1:${PORT}/health" 2>/dev/null; then
  echo "Health: ok (http://127.0.0.1:${PORT}/health)"
else
  echo "Health: unreachable on :${PORT}"
fi

if [[ -f "${TUNNEL_URL_FILE}" ]]; then
  TUNNEL_URL="$(cat "${TUNNEL_URL_FILE}")"
  echo "Tunnel URL: ${TUNNEL_URL}"
  echo "MCP endpoint: ${TUNNEL_URL}/mcp"
else
  echo "Tunnel URL: (not recorded — run npm run stack:start)"
fi
