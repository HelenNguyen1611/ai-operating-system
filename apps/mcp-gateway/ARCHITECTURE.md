# MCP Gateway — Architecture

Status: Design reference (Phase 0.5). Describes conventions for code that does not exist yet as much as it describes what does.

Scope: `apps/mcp-gateway` only. Does not change `runtime/`, `commands/`, `handbook/`, or `templates/`.

This document is the contract new adapters, tools, and resources must follow. `ROADMAP.md` describes *when* each part gets built; this document describes *how* it must be shaped when it is.

---

## 0. Current State (baseline this document extends)

As of Phase 0, the entire gateway is two files:

```
src/
  index.ts     — process entry point, reads PORT, starts the HTTP listener
  server.ts    — createApp(): Express wiring + one inline MCP tool (health_check)
tests/
  gateway.test.ts
docs/
  manual-test-claude-app.md
```

`server.ts` currently does three jobs at once: HTTP transport wiring, MCP server construction, and tool registration. That collapse is correct at one tool — it would not be correct at five. Section 8 defines the split point.

There is no adapter, no schema, no shared-types module, no logger, and no versioning policy beyond the single `package.json` version. This document proposes all of those; none are implemented by this document.

---

## 1. Tool Naming Conventions

**Convention:** `<domain>.<action>`, snake_case action, lowercase domain.

Examples for future phases: `jira.search_issues`, `jira.get_issue`, `outlook.search_email`, `outlook.create_draft`.

**Reserved domain:** `gateway.*` is reserved for platform/meta tools that describe the gateway itself, not an external system — health, version, capability introspection.

**Exception, documented not fixed:** the Phase 0 tool is named `health_check`, not `gateway.health_check`. It predates this convention. It is **not** renamed retroactively — renaming a published tool is a breaking change for any connected client, and Phase 0's entire point was proving the client connection works. Section 4 (Versioning) governs when renames are allowed.

**Rules:**
- Action verbs are explicit: `search_`, `get_`, `create_`, `update_`, `list_`. Never a bare noun.
- No abbreviations that aren't already standard in the target domain (`issue`, not `iss`).
- A tool name must not encode the *client* (no `claude_app.morning_brief`) — tools are client-agnostic by construction (see Section 7).

---

## 2. Resource Naming Conventions

MCP resources are not implemented yet (explicit Phase 0 non-goal). When they are:

**Convention:** URI scheme `aios://<domain>/<path>`.

Examples: `aios://runtime/50_remote_gateway`, `aios://jira/issue/TRIN-79`, `aios://config/runtime`.

**Rules:**
- `aios://runtime/*` and `aios://config/*` expose this repository's own files (Phase 1 territory — see `runtime/50_Remote_Gateway.md`).
- `aios://<external-domain>/*` exposes adapter-backed live data (Phase 2 territory) and must go through the adapter's read path, never fetch the external system directly from resource-handling code.
- Resource URIs are read paths only. Mutating actions are always tools, never resources, even if MCP's spec permits otherwise — keeping the split strict avoids ambiguity about what's safe to call automatically.

---

## 3. Prompt Exposure Strategy

MCP defines a third primitive, `prompts`, distinct from `tools` and `resources` — user-selectable templates a client can surface directly (e.g. a slash-command-like menu).

**Decision: defer, not adopt yet.** Two candidate designs exist and the gateway should not commit until Phase 1 forces the question:

- **Option A — tool-shaped:** `morning_brief(language, detail, focus)` as a *tool*. The client's model decides when to call it; output is the base workflow + runtime + template text as instruction payload.
- **Option B — prompt-shaped:** expose `/morning` and `/chaobuoisang` as MCP *prompts*. The human explicitly selects them from the client's UI, closer to how they work today as Claude Code slash commands.

**Why deferred:** Option B is architecturally truer to what `commands/` already is (user-invoked entry points), but MCP prompt support varies by client and is less certain to work in the Claude App than tools. Runtime 50's Phase 1 already commits to the tool shape (Option A) for the first real capability, precisely because it's the more portable choice. Prompts are not ruled out — they're a strategy to revisit once Option A ships and its limitations (if any) are known.

**Rule when this is picked up:** whichever option is chosen, `commands/_base/*.base.md` remains the single source of workflow logic. Neither a tool nor a prompt implementation may fork that logic — both must load and pass through the same base file.

---

## 4. Versioning Strategy

Three independent version surfaces. Do not conflate them.

| Surface | Where | Changes on |
|---|---|---|
| **Service version** | `package.json` `version`, echoed in `health_check` / `GET /health` | Every release, semver |
| **MCP protocol version** | Negotiated by the SDK during `initialize` | Never manually set — SDK-owned |
| **Per-tool contract version** | Not yet needed at 1 tool; convention below applies once it is | Only on breaking input/output schema change |

**Service semver policy:**
- **Patch** — bug fixes, no observable contract change.
- **Minor** — new tool, new resource, new optional input field. Additive only.
- **Major** — any breaking change: removing a tool, renaming a tool, changing a tool's required inputs, changing a response shape a client may depend on.

**Per-tool breaking changes:** when a tool's contract must break, do not silently mutate it. Either:
1. Bump the service major version and change the tool in place (acceptable pre-1.0, i.e. now), or
2. Post-1.0: publish `<domain>.<action>_v2` alongside the old tool for one deprecation window, then remove the old one in a later major.

**Rule:** `SERVICE_VERSION` in `src/server.ts` and `package.json` `version` must never diverge — one is the source of truth (`package.json`) and the other reads it at build time once this is enforced (currently they are two hand-maintained literals; unifying them is a Phase 0.5 follow-up, not done by this document — see `ROADMAP.md`).

---

## 5. Error Response Format

Two error layers exist in MCP and must not be conflated:

**Layer 1 — JSON-RPC / transport errors.** Malformed requests, unsupported methods, protocol violations. Already implemented in `server.ts` (`/mcp` GET/DELETE → 405 with a JSON-RPC error object; internal failures → 500). This layer follows the JSON-RPC 2.0 spec as-is — no gateway-specific convention needed, don't invent one.

**Layer 2 — Tool-level errors.** A tool call that reaches the handler but fails for a domain reason (adapter unreachable, auth expired, validation failed, upstream 404). MCP represents this as a normal tool result with `isError: true`, not a JSON-RPC error — the call succeeded at the protocol level; the *operation* failed.

**Proposed envelope for Layer 2** (to be adopted starting with the first adapter-backed tool, Phase 2):

```jsonc
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "{\"error\":{\"code\":\"ADAPTER_AUTH_FAILED\",\"domain\":\"jira\",\"message\":\"...\",\"retryable\":false}}"
  }]
}
```

**Code taxonomy (namespaced, extend, don't rename):**
- `VALIDATION_FAILED` — input rejected by schema (Section 9) before it reached an adapter.
- `ADAPTER_UNAVAILABLE` — adapter couldn't reach the external system (network, timeout).
- `ADAPTER_AUTH_FAILED` — adapter reached the system but was rejected (expired token, missing scope).
- `ADAPTER_NOT_FOUND` — upstream resource doesn't exist.
- `GATEWAY_INTERNAL` — bug in gateway code, not attributable to input or adapter.

**Rule:** adapters never leak raw upstream error shapes (a raw Jira 401 body, an Axios stack trace) into tool output. Every adapter is responsible for translating its own failures into this taxonomy (see Section 7).

---

## 6. Logging Strategy

**Current state:** two `console.log` lines in `index.ts` at startup. Nothing per-request.

**Proposed policy (not implemented by this document):**

- **Structured, not string-concatenated.** One JSON object per line: `{ts, level, msg, ...fields}`. Grep-ability over prettiness.
- **Levels:** `error`, `warn`, `info`, `debug`. Default `info` in production, `debug` available via `LOG_LEVEL` env var.
- **Correlation:** every `/mcp` request gets a request id (generate if the client doesn't supply one); the id is attached to every log line produced while handling that request, including inside adapters. Without this, debugging a failed tool call across an adapter boundary is guesswork.
- **What is never logged:** request/response bodies containing tool arguments or results by default (they may carry PII or business data — Jira issue content, email bodies). Log shapes and outcomes (`tool=jira.search_issues status=ok duration_ms=142`), not payloads. A future `LOG_PAYLOADS=true` escape hatch for local debugging is acceptable; it must default off.
- **Access log vs application log:** HTTP-level access logging (method, path, status, duration) is a separate concern from application logging (tool execution, adapter calls) even if they end up in the same stream. Don't merge them into one log statement.
- **No dependency added yet.** When this is implemented, prefer a minimal structured logger (e.g. `pino`) over hand-rolled JSON — but that choice belongs to the phase that implements it, not this document.

---

## 7. Future Adapter Architecture

**Principle (restated from `runtime/50_Remote_Gateway.md`):** the gateway owns integrations. The AI client is never assumed to provide Jira, Outlook, or any other connector.

```
Tool handler (src/tools/jira/search_issues.ts)
        ↓ calls
Adapter (src/adapters/jira/index.ts)
        ↓ owns auth, calls
External SDK / HTTP client (e.g. Jira REST API)
```

**Adapter contract (conceptual — no interface is written yet):**

- An adapter is the **only** code in the gateway allowed to hold credentials for its external system, and the only code allowed to make network calls to it.
- An adapter exposes domain methods (`searchIssues(jql)`, not `get(url)`) — it is not a thin HTTP passthrough. Tool handlers never construct upstream requests themselves.
- An adapter translates **every** upstream failure into the Section 5 taxonomy before returning. A tool handler should never need to know what "Jira" returns on auth failure.
- An adapter is responsible for its own config validation at startup (missing API token → fail fast at boot, not on first call).
- An adapter exposes a lightweight `healthCheck()` so that a future `gateway.health_check` (or a dedicated `gateway.status`) can report per-adapter reachability without the caller needing adapter-specific knowledge. Not wired up in Phase 0; the seam is reserved.

**What an adapter is not:** it is not a tool. Tools are the MCP-facing surface (Section 1); adapters are the integration-facing surface. A tool file imports an adapter; an adapter never imports MCP SDK types.

---

## 8. Folder Structure — Connectors / Adapters

```
src/
  adapters/
    jira/
      index.ts       — public adapter API (searchIssues, getIssue, ...)
      client.ts       — thin wrapper around the vendor SDK/HTTP client
      mapper.ts        — upstream shape → gateway-internal shape
      errors.ts        — upstream error → Section 5 taxonomy
      config.ts        — env/config schema for this adapter (Zod, see Section 9)
    outlook/
      (same shape)
```

**Rule:** one top-level folder per external domain under `src/adapters/`, same five-file shape every time. A new adapter is a copy of this shape, not a novel structure — consistency here is what makes the "Gateway → Adapter → External" pattern actually swappable later (e.g. replacing a REST-based Jira adapter with an MCP-passthrough one without touching any tool file).

**Extraction trigger:** the `src/adapters/` folder does not exist until the first adapter is built (Phase 2). Do not scaffold it empty in Phase 0.5.

---

## 9. Folder Structure — Schemas

```
src/
  schemas/
    jira/
      search_issues.input.ts
      search_issues.output.ts
    outlook/
      ...
```

- **Library:** Zod (already a Phase 0 dependency, currently unused — this is its intended purpose).
- **One schema pair per tool**, named after the tool's action, not the tool's full namespaced name (the folder already supplies the domain).
- Input schemas are the single source of truth for a tool's `inputSchema` passed to `server.registerTool` — the schema is written once and consumed by both MCP registration and any internal validation, never duplicated.
- Output schemas are optional for internal tools but **required** for any tool whose result another part of the gateway consumes programmatically (defensive parsing of your own adapter's output is cheap insurance against upstream shape drift).
- Schemas import nothing from `adapters/` or `tools/` — they are leaves. Adapters and tools import schemas, never the reverse.

**Extraction trigger:** same as adapters — created with the first schema-bearing tool (Phase 2), not scaffolded empty now.

---

## 10. Folder Structure — Shared Types

```
src/
  types/
    error-envelope.ts   — the Section 5 Layer-2 error shape, as a TS type + a builder fn
    mcp-content.ts       — small helpers for building {type:"text", text} content blocks
    config.ts            — shared config primitives (e.g. a generic "required env var" helper)
```

**Rule — what belongs here vs. what doesn't:**
- `src/types/` holds cross-cutting concerns used by *multiple* domains (the error envelope shape is used by every adapter; a Jira-specific `IssueKey` type is not).
- Domain-specific types live next to their schema (`src/schemas/jira/*.ts` exports its own types) or their adapter (`src/adapters/jira/index.ts`), not in `src/types/`.
- If a type is needed in exactly one domain folder, it does not belong in `src/types/` even if it feels "shared" in spirit. Move it here only when a second domain needs the same shape.

**Extraction trigger:** `src/types/error-envelope.ts` is created the moment Section 5's Layer 2 format is first implemented (Phase 2) — this one *can* precede adapters by a few commits since tools need it before adapters do, but it does not exist today.

---

## What Stays Stable

These are treated as a public contract from Phase 0 onward. Changing them is a **major version** event (Section 4):

- The service name `ai-operating-system-mcp-gateway`.
- The HTTP surface shape: `GET /health` returns `{status, service, version}`; `POST /mcp` is Streamable HTTP per the MCP spec.
- Stateless-by-default posture (`sessionIdGenerator: undefined`). Adding an *optional* stateful mode later must not remove the stateless path — clients that never send a session id must keep working.
- The tool naming convention (Section 1) and the error taxonomy namespace (Section 5), once a second tool exists — the *values* in the taxonomy can grow, the *shape* must not change.
- `commands/_base/*.base.md` as the single source of workflow logic for any framework-facing tool or prompt (Section 3).

## What Is Intentionally Deferred

Not designed further than stated above, on purpose — designing these now would be guessing ahead of real requirements:

- Concrete adapter implementations (Jira, Outlook, GitHub, anything).
- The Section 3 prompts-vs-tools decision.
- Authentication/authorization scheme.
- Logging library choice and log shipping destination.
- Session management for the stateful MCP mode.
- Resource URI scheme *enforcement* (Section 2 states the convention; nothing consumes it yet).
- Multi-tenant / multi-user config.

See `ROADMAP.md` for when each deferred item is picked back up.
