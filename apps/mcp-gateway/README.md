# MCP Gateway

A self-contained Remote MCP (Model Context Protocol) server that exposes parts of the Personal AI Operating System framework — and, as of Phase 2, read-only Jira access — to external AI clients such as Claude Desktop, over Streamable HTTP.

Status: **Experimental.** Phase 2 complete (Jira read-only). See `../../runtime/50_Remote_Gateway.md` for the authoritative phase-status spec, `ARCHITECTURE.md` for stable design conventions, and `ROADMAP.md` for what's next.

For the full operational runbook (setup, running, Cloudflare Tunnel, Claude Desktop connector, troubleshooting, security) see **`../../runtime/51_MCP_Gateway_Operations_Handbook.md`** — this README is a quick-start pointer, not a replacement for it.

---

## Quick start

```bash
cd apps/mcp-gateway
npm install
npm run typecheck && npm test   # should print 31/31 passing
npm run dev                       # listens on :3000
```

```bash
curl -s http://localhost:3000/health
# {"status":"ok","service":"ai-operating-system-mcp-gateway","version":"0.1.0"}
```

## Tools exposed

| Tool | Phase | Input | Requires Jira env vars? |
|---|---|---|---|
| `health_check` | 0 | none | No |
| `morning_brief` | 1 | `{ language: "en"\|"vi", detail: "brief"\|"full" }` | No |
| `jira.search_issues` | 2 | `{ jql: string, maxResults?: number }` | Yes |
| `jira.get_issue` | 2 | `{ key: string }` | Yes |
| `jira.get_morning_context` | 2 | `{}` | Yes |

All five are read-only — see `ARCHITECTURE.md` and the Security section of the Operations Handbook for how that's enforced structurally, not just by convention.

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

Without Jira configured, `health_check` and `morning_brief` work exactly as before, and the three `jira.*` tools still appear in `tools/list` but return a clear `ADAPTER_NOT_CONFIGURED` error when called — the gateway never crashes or silently degrades. Full detail: `runtime/51_MCP_Gateway_Operations_Handbook.md` §18.

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
  adapters/jira/    Read-only Jira Cloud REST API v3 client (Phase 2)
  schemas/          Zod input validation, one folder per domain
  types/             Shared cross-cutting types (currently: the error envelope)
  lib/                Infrastructure helpers (safe repo-relative paths)
tests/             Vitest — 31 tests, see the Operations Handbook §11
```

See the Operations Handbook §3 for the fully annotated version of this tree.
