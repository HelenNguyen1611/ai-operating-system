# Remote Gateway

Version: 0.2 (Phase 1 — Morning Brief tool)

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

# Phase 1 Scope

Implemented — and nothing more:

1. A second MCP tool, `morning_brief`, alongside the unchanged `health_check`.
2. Input: `{ "language": "en" | "vi", "detail": "brief" | "full" }`, validated with Zod.
3. The tool loads seven fixed, repository-relative files and returns their contents as a structured JSON payload (`instructions`, `context.{config, base_workflow, runtime.{morning_runtime, context_engine, reasoning_engine}, template}`, `notes`):
   - `config/runtime.yaml`
   - `commands/_base/morning.base.md`
   - `runtime/41_Morning_Runtime.md`
   - `runtime/46_Context_Engine.md`
   - `runtime/48_Reasoning_Engine.md`
   - `templates/i18n/morning.en.md` **or** `templates/i18n/morning.vi.md` (selected by `language`, not both)
4. Tool registration extracted out of `server.ts` into `src/tools/` (`health-check.ts`, `morning-brief.ts`, `index.ts`) — `server.ts` is transport wiring only, per the Phase 1 tool-extraction obligation in `apps/mcp-gateway/ROADMAP.md`.
5. New supporting modules: `src/lib/repo-paths.ts` (safe repo-relative path resolution with containment check), `src/types/error-envelope.ts` (tool-level error format per `ARCHITECTURE.md` §5), `src/schemas/framework/morning-brief.input.ts` (Zod input schema).
6. Tests (10 total, up from 4): server startup, `GET /health`, `tools/list` shows both tools, `health_check` invocation, `morning_brief` English end-to-end, `morning_brief` Vietnamese end-to-end, invalid-language rejection (pure loader + real MCP call), missing-file handling (pure loader, via a dedicated fixture repo under `tests/fixtures/missing-file-repo/`).
7. `apps/mcp-gateway/docs/manual-test-claude-app.md` still applies unchanged for connecting a client; a `morning_brief` walkthrough is a candidate follow-up, not required to exit Phase 1.

## Deviations from the original Phase 1 description

This document's Future Direction (below) originally sketched `morning_brief(language, detail, focus)`. The approved Phase 1 implementation spec dropped `focus` and restricted `detail` to `"brief" | "full"` (excluding `"standard"`, which `commands/_base/morning.base.md` otherwise defines). Both are documented simplifications, not oversights — recorded in `apps/mcp-gateway/schemas/framework/morning-brief.input.ts` and `ROADMAP.md`. Widening the input shape is a candidate Phase 1.x follow-up.

The tool is named `morning_brief`, not `framework.morning_brief` as `ARCHITECTURE.md` §1 speculated — the approved spec named it explicitly. It is documented in `ARCHITECTURE.md` as a second unnamespaced platform/framework-level tool, consistent with the `health_check` precedent.

## Verified before closing Phase 1

- `npm run typecheck` — clean.
- `npm test` — 10/10 passing.
- Source scan (`grep` across `src/`) confirms no network-client code (`fetch`, `axios`, `http(s).request`) and no reference to Jira/Outlook/Atlassian/Microsoft anywhere in the gateway.
- `package.json` dependencies unchanged from Phase 0 (`@modelcontextprotocol/sdk`, `express`, `zod`) — no new runtime dependency was needed.

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

## Phase 1 Success Criteria

- `npm test` passes in `apps/mcp-gateway` (10 tests: the original 4 plus `morning_brief` discovery, English/Vietnamese end-to-end, invalid input, missing-file handling).
- `morning_brief` returns all seven required files' content for both `language` values, with no call to any external connector.
- Invalid `language`/`detail` never produces a successful payload.
- A missing required file produces a `FRAMEWORK_FILE_MISSING` error, not a crash or a silent partial payload.

---

# Future Direction

Ordered, each phase gated on review of the previous:

1. **Phase 1 — First real tool. Done.** `morning_brief(language, detail)` serving the framework's own files (base workflow, Runtime 41/46/48, i18n templates) as the instruction payload. See "Phase 1 Scope" above for what shipped and how it differs from this original sketch.
2. **Phase 2 — Adapters.** Jira adapter behind the gateway (then Outlook), so live context no longer depends on client-side connectors.
3. **Phase 3 — Hardening.** Authentication (bearer/OAuth), session management, deployment story.
4. **Phase 4 — Runtime orchestration.** The gateway executes runtime workflows server-side instead of shipping instructions to the client.

Each phase must be specified in this document before implementation.

---

# Related

- `apps/mcp-gateway/` — implementation
- `apps/mcp-gateway/docs/manual-test-claude-app.md` — manual verification
- `runtime/40_Runtime_Architecture.md` — execution-layer architecture this gateway extends
