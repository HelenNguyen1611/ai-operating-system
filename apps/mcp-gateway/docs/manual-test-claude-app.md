# Manual Test — Connect Claude App to the MCP Gateway

Phase 0 verification: confirm the Claude App can discover and call the `health_check` tool on a deployed gateway.

---

## Prerequisites

- The gateway deployed and reachable over **HTTPS** (Claude App requires HTTPS for remote MCP servers; plain HTTP is only usable for local development tools).
- The public MCP endpoint URL, e.g. `https://<your-host>/mcp`.
- A Claude account on a plan that supports custom connectors (remote MCP).

For a quick public HTTPS endpoint during the spike, tunnel a local instance:

```bash
cd apps/mcp-gateway
npm run dev           # listens on port 3000
# in another terminal:
ngrok http 3000       # or: cloudflared tunnel --url http://localhost:3000
```

Use the generated `https://…/mcp` URL below.

---

## Step 1 — Verify the deployment before touching Claude

```bash
curl https://<your-host>/health
```

Expected:

```json
{"status":"ok","service":"ai-operating-system-mcp-gateway","version":"0.1.0"}
```

If this fails, stop — fix the deployment first.

---

## Step 2 — Add the gateway as a custom connector

1. Open **claude.ai** (web) → **Settings** → **Connectors**.
2. Choose **Add custom connector**.
3. Name: `AI OS Gateway (Phase 0)`.
4. URL: `https://<your-host>/mcp`.
5. Leave authentication empty — Phase 0 has no auth (see non-goals in `runtime/50_Remote_Gateway.md`).
6. Save. Connectors added on the web are then available in the Claude mobile/desktop apps under the same account.

## Step 3 — Verify tool discovery

1. Start a new chat.
2. Open the tools/connectors menu and confirm `AI OS Gateway (Phase 0)` is listed and enabled.
3. Confirm it exposes exactly one tool: **health_check**.

## Step 4 — Invoke the tool

Prompt:

> Use the health_check tool on the AI OS Gateway and show me the raw result.

Expected: Claude calls the tool and reports:

```json
{"status":"ok","service":"ai-operating-system-mcp-gateway","version":"0.1.0"}
```

## Step 5 — Record the result

| Check | Pass/Fail | Notes |
|---|---|---|
| `/health` reachable over HTTPS | | |
| Connector saved without error | | |
| `health_check` visible in tool list | | |
| Tool invocation returns the exact payload | | |
| Works from Claude mobile app (not just web) | | |

---

## Known limitations (Phase 0, by design)

- **No authentication** — anyone with the URL can call the tool. Do not leave a tunnel running unattended; tear it down after testing.
- **Stateless server** — every request creates a fresh MCP session; no notifications, no resumability.
- **Voice mode** — tool support in Claude voice conversations is limited; verify in text chat first and treat voice as best-effort.
