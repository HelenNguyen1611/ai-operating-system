#!/usr/bin/env bash
# Stop MCP gateway and Cloudflare tunnel started by start-stack.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATEWAY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUN_DIR="${GATEWAY_DIR}/.run"
GATEWAY_PID_FILE="${RUN_DIR}/gateway.pid"
TUNNEL_PID_FILE="${RUN_DIR}/tunnel.pid"

stop_pid_file() {
  local name="$1"
  local pid_file="$2"
  if [[ ! -f "${pid_file}" ]]; then
    echo "${name}: not running (no pid file)"
    return 0
  fi
  local pid
  pid="$(cat "${pid_file}")"
  if kill -0 "${pid}" 2>/dev/null; then
    kill "${pid}" 2>/dev/null || true
    for _ in $(seq 1 10); do
      if ! kill -0 "${pid}" 2>/dev/null; then
        break
      fi
      sleep 0.3
    done
    if kill -0 "${pid}" 2>/dev/null; then
      kill -9 "${pid}" 2>/dev/null || true
    fi
    echo "${name}: stopped (pid ${pid})"
  else
    echo "${name}: not running (stale pid ${pid})"
  fi
  rm -f "${pid_file}"
}

stop_pid_file "Tunnel" "${TUNNEL_PID_FILE}"
stop_pid_file "Gateway" "${GATEWAY_PID_FILE}"

echo "Stack stopped."
