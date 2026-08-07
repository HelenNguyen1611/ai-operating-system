# MCP Gateway

A self-contained Remote MCP (Model Context Protocol) server that exposes parts of the Personal AI Operating System framework, read-only Jira and Team Availability context, and local Daily Report persistence to external AI clients such as Claude Desktop, over Streamable HTTP.

Status: **Experimental.** Phase 2 extensions are shipped; Phase 3 authentication and deployment hardening have not started. See `../../runtime/50_Remote_Gateway.md` for the authoritative phase history, `ARCHITECTURE.md` for stable design conventions, and `ROADMAP.md` for the current snapshot and what's next.

For the full operational runbook (setup, running, Cloudflare Tunnel, Claude Desktop connector, troubleshooting, security) see **`../../runtime/51_MCP_Gateway_Operations_Handbook.md`** — this README is a quick-start pointer, not a replacement for it.

---

## Quick start

```bash
cd apps/mcp-gateway
npm install
npm run typecheck && npm test   # currently 118 tests
npm run dev                       # listens on :3000
```

```bash
curl -s http://localhost:3000/health
# {"status":"ok","service":"ai-operating-system-mcp-gateway","version":"0.1.0"}
```

## Tools exposed

| Tool | Capability | Input | Configuration |
|---|---|---|---|
| `health_check` | Gateway health | none | None |
| `morning_brief` | Morning Card/context | `{ language: "en"\|"vi", detail: "brief"\|"standard"\|"full" }` | Jira and Team Availability are best-effort in fast modes |
| `jira_search_issues` | Jira read-only search | `{ jql: string, maxResults?: number }` | `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` |
| `jira_get_issue` | Jira read-only issue lookup | `{ key: string }` | Jira variables |
| `jira_get_morning_context` | Jira morning context | `{}` | Jira variables |
| `team_availability_get_availability` | Team leave/WFH snapshot | `{ date?: "YYYY-MM-DD", team_scope?: "all" }` | `TEAM_AVAILABILITY_SNAPSHOT_PATH` |
| `daily_report_save` | Save today's local report | `{ summary?: string }` | Optional `DAILY_REPORT_STORE_DIR` |
| `daily_report_get` | Read a local report | `{ date?: "YYYY-MM-DD" }` | Optional `DAILY_REPORT_STORE_DIR` |

The three Jira tools and Team Availability tool are read-only. `daily_report_save` writes only to the configured local report store; it does not modify Jira or the Team Availability source. See `ARCHITECTURE.md` and the Security section of the Operations Handbook for the integration boundaries.

## Jira configuration

Copy `.env.example` to `.env` and fill in real values, or export the three variables in your shell:

```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-api-token   # https://id.atlassian.com/manage-profile/security/api-tokens
```

There is **no automatic `.env` loading** — this is deliberate (see `ARCHITECTURE.md` / `ROADMAP.md` Phase 2). Launch with Node's native flag to actually load the file:

```bash
npx tsx --env-file=.env src/index.ts
```

Without Jira configured, all tools still appear in `tools/list`; direct `jira_*` calls return a clear `ADAPTER_NOT_CONFIGURED` error. Morning Brief and Daily Report treat unavailable integrations as best-effort context instead of preventing the gateway from starting. Full detail: `runtime/51_MCP_Gateway_Operations_Handbook.md` §18.

## Documentation map

| Document | Answers |
|---|---|
| This file | "How do I start it and what does it expose?" |
| `../../runtime/50_Remote_Gateway.md` | "What phase are we in, and what exactly shipped in each?" (spec of record) |
| `ARCHITECTURE.md` | "What are the stable naming/error/folder conventions for adding a tool or adapter?" |
| `ROADMAP.md` | "What's the plan, phase by phase, and what's explicitly out of scope right now?" |
| `../../runtime/51_MCP_Gateway_Operations_Handbook.md` | "How do I run, verify, deploy, debug, or secure this day to day?" (the full runbook) |
| `docs/manual-test-claude-app.md` | "How do I connect Claude Desktop/App and confirm it actually works?" |

## Project layout

```
src/
  index.ts       Entry point (reads PORT, starts the HTTP listener)
  server.ts       Express + MCP transport wiring only — no tool logic
  tools/           One file per MCP tool, plus the tool registry (index.ts)
  adapters/          Jira, Team Availability, and Daily Report boundaries
  schemas/          Zod input validation, one folder per domain
  types/             Shared cross-cutting types (currently: the error envelope)
  lib/                Infrastructure helpers (safe repo-relative paths)
tests/             Vitest — currently 118 tests across 11 test files
```

See the Operations Handbook §3 for the fully annotated version of this tree.
