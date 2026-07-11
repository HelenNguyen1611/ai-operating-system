# Remote Gateway

Version: 0.1 (Phase 0 — compatibility spike)

Status: Experimental

Code: `apps/mcp-gateway/` (self-contained package; repository root remains package-less)

---

# Purpose

The Remote Gateway makes the AI Operating System reachable from AI clients outside this repository — starting with the Claude App — over the Model Context Protocol (MCP).

Phase 0 exists to answer one question only:

**Can the Claude App connect to a self-hosted Streamable HTTP MCP server and invoke a tool on it?**

Nothing in Phase 0 is intended to be useful for daily work yet.

---

# Architectural Direction

The Gateway is intended to **remove dependency on AI-client-specific connectors**.

Today, live context (Jira, Outlook) reaches the AI only through connectors owned by the AI client. The target architecture inverts that ownership:

Claude App

↓

AI OS Gateway

↓

Jira Adapter

↓

Jira

The AI client is **not** assumed to provide Jira, Outlook, or any other connector. Adapters live behind the Gateway and are owned by this framework.

---

# Phase 0 Scope

Implemented — and nothing more:

1. A minimal Remote MCP server using **Streamable HTTP** transport (`POST /mcp`), running stateless (a fresh server instance per request, no sessions).
2. One MCP tool, `health_check`, returning:

```json
{
  "status": "ok",
  "service": "ai-operating-system-mcp-gateway",
  "version": "0.1.0"
}
```

3. One HTTP monitoring endpoint: `GET /health`, returning the same payload.
4. Local automated tests: server startup, MCP tool discovery, `health_check` invocation, `GET /health` (`apps/mcp-gateway/tests/gateway.test.ts`).
5. A manual test document for connecting the Claude App: `apps/mcp-gateway/docs/manual-test-claude-app.md`.

## Implementation notes and assumptions

- Built on the official `@modelcontextprotocol/sdk` (TypeScript) with Express.
- **Streamable HTTP, not SSE** — the deprecated HTTP+SSE transport is intentionally avoided (industry direction; e.g. Atlassian retired SSE on 30 Jun 2026).
- Stateless mode (`sessionIdGenerator: undefined`) chosen for Phase 0 simplicity; `GET /mcp` and `DELETE /mcp` return 405 because there is no session stream to serve.
- SDK API details (tool registration shape, transport constructor) were implemented from current SDK knowledge without external doc verification; if a future SDK major release changes these, the tests will catch it.

---

# Non-Goals (Phase 0)

Explicitly **not** implemented, by decision:

- No `morning_brief` tool or any framework-aware tool.
- No reading of `commands/`, `runtime/` documents, `templates/`, or `config/runtime.yaml` by the gateway.
- No Jira or Outlook adapters.
- No MCP resources.
- No authentication or authorization.
- No runtime orchestration.
- No workspace conversion — the repository root stays package-less; `apps/mcp-gateway/` is the only package.
- No changes to any existing folder.

---

# Success Criteria

Phase 0 is successful when:

- `npm test` passes in `apps/mcp-gateway/` (4 tests: startup, discovery, invocation, health endpoint).
- `GET /health` on a deployed instance returns the exact payload above.
- The Claude App, configured per the manual test document, discovers and successfully invokes `health_check`.

The last criterion is the actual point of the spike — it validates the Claude App → Gateway path before any real capability is built.

---

# Future Direction

Ordered, each phase gated on review of the previous:

1. **Phase 1 — First real tool.** `morning_brief(language, detail, focus)` serving the framework's own files (base workflow, Runtime 41, i18n templates) as the instruction payload.
2. **Phase 2 — Adapters.** Jira adapter behind the gateway (then Outlook), so live context no longer depends on client-side connectors.
3. **Phase 3 — Hardening.** Authentication (bearer/OAuth), session management, deployment story.
4. **Phase 4 — Runtime orchestration.** The gateway executes runtime workflows server-side instead of shipping instructions to the client.

Each phase must be specified in this document before implementation.

---

# Related

- `apps/mcp-gateway/` — implementation
- `apps/mcp-gateway/docs/manual-test-claude-app.md` — manual verification
- `runtime/40_Runtime_Architecture.md` — execution-layer architecture this gateway extends
