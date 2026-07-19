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

**Convention:** `<domain>_<action>`, snake_case throughout, lowercase domain. Originally specified as `<domain>.<action>` (dot-separated); revised because MCP tool names must match `^[a-zA-Z0-9_-]{1,64}$` — a literal dot is not a legal character, and a dotted name fails client-side schema validation (e.g. Claude's `FrontendRemoteMcpToolDefinition.name`) as soon as the tool is actually listed. Caught and fixed after Phase 2 shipped three dotted tool names; see `ROADMAP.md`'s Phase 2.4 entry.

Examples for future phases: `jira_search_issues`, `jira_get_issue`, `outlook_search_email`, `outlook_create_draft`.

**Reserved domain:** `gateway_` is reserved for platform/meta tools that describe the gateway itself, not an external system — health, version, capability introspection.

**Exception, documented not fixed:** the Phase 0 tool is named `health_check`, not `gateway_health_check`. It predates this convention. It is **not** renamed retroactively — renaming a published tool is a breaking change for any connected client, and Phase 0's entire point was proving the client connection works. Section 4 (Versioning) governs when renames are allowed.

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

**Envelope for Layer 2** (adopted starting with the first adapter-backed tools, Phase 2 — Jira):

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
- `ADAPTER_UNAVAILABLE` — adapter couldn't reach the external system (network error, non-2xx response other than auth/not-found).
- `ADAPTER_AUTH_FAILED` — adapter reached the system but was rejected (expired token, missing scope; Jira 401/403).
- `ADAPTER_NOT_FOUND` — upstream resource doesn't exist (Jira 404).
- `ADAPTER_NOT_CONFIGURED` *(added Phase 2)* — required adapter env vars are missing. Distinct from `ADAPTER_UNAVAILABLE`: this means the gateway never attempted a network call at all, not that the call failed.
- `ADAPTER_TIMEOUT` *(added Phase 2)* — the adapter's own request timeout elapsed (`AbortController`-based, per-adapter default). Distinct from `ADAPTER_UNAVAILABLE` because it's retryable in a different sense (the same call might succeed with more time, not just on a later attempt).
- `GATEWAY_INTERNAL` — bug in gateway code, not attributable to input or adapter.

**Rule:** adapters never leak raw upstream error shapes (a raw Jira 401 body, an Axios stack trace) into tool output. Every adapter is responsible for translating its own failures into this taxonomy (see Section 7).

---

## 6. Logging Strategy

**Current state:** two `console.log` lines in `index.ts` at startup. Nothing per-request.

**Proposed policy (not implemented by this document):**

- **Structured, not string-concatenated.** One JSON object per line: `{ts, level, msg, ...fields}`. Grep-ability over prettiness.
- **Levels:** `error`, `warn`, `info`, `debug`. Default `info` in production, `debug` available via `LOG_LEVEL` env var.
- **Correlation:** every `/mcp` request gets a request id (generate if the client doesn't supply one); the id is attached to every log line produced while handling that request, including inside adapters. Without this, debugging a failed tool call across an adapter boundary is guesswork.
- **What is never logged:** request/response bodies containing tool arguments or results by default (they may carry PII or business data — Jira issue content, email bodies). Log shapes and outcomes (`tool=jira_search_issues status=ok duration_ms=142`), not payloads. A future `LOG_PAYLOADS=true` escape hatch for local debugging is acceptable; it must default off.
- **Access log vs application log:** HTTP-level access logging (method, path, status, duration) is a separate concern from application logging (tool execution, adapter calls) even if they end up in the same stream. Don't merge them into one log statement.
- **No dependency added yet.** When this is implemented, prefer a minimal structured logger (e.g. `pino`) over hand-rolled JSON — but that choice belongs to the phase that implements it, not this document.

---

## 7. Future Adapter Architecture

**Principle (restated from `runtime/50_Remote_Gateway.md`):** the gateway owns integrations. The AI client is never assumed to provide Jira, Outlook, or any other connector.

```
Tool handler (src/tools/jira-search-issues.ts)
        ↓ calls
Adapter (src/adapters/jira/index.ts)
        ↓ owns auth, calls
External SDK / HTTP client (e.g. Jira REST API)
```

**Adapter contract, as implemented by the Jira adapter (Phase 2):**

- An adapter is the **only** code in the gateway allowed to hold credentials for its external system, and the only code allowed to make network calls to it. (`src/adapters/jira/client.ts` is the sole holder of the Basic Auth header; no other file constructs it.)
- An adapter exposes domain methods (`searchIssues(jql)`, `getIssue(key)`, `getMorningContext()`), not a thin HTTP passthrough. Tool handlers never construct upstream requests themselves.
- An adapter translates **every** upstream failure into typed errors (`src/adapters/jira/errors.ts`); the tools layer then translates those into the Section 5 taxonomy (`src/tools/jira-error-mapping.ts`, shared across all three Jira tools). A tool handler never sees a raw Jira HTTP response.
- **Deviation from the original speculation:** this section originally said "fail fast at boot" on missing config. The implemented behavior is the opposite, deliberately — `loadJiraConfig()` returns `null` rather than throwing, so the gateway still boots and `health_check`/`morning_brief` are unaffected with zero Jira configuration present. Each Jira tool checks for `null` config *per call* and returns `ADAPTER_NOT_CONFIGURED` — config is validated at call time, not boot time. This was required by "Keep Phase 1 behaviour unchanged" (Phase 2's own constraint) and is now the standing rule for any future adapter, not just Jira.
- An adapter exposes a lightweight `healthCheck()` so that a future `gateway.health_check` (or a dedicated `gateway.status`) can report per-adapter reachability without the caller needing adapter-specific knowledge. **Still not implemented** — the Jira adapter has no `healthCheck()` method yet; this remains a reserved, unwired seam.
- An adapter's HTTP client exposes **read methods only** — `src/adapters/jira/client.ts` has exactly one method, `getJson()`. There is structurally no `postJson`/`putJson`/`deleteJson` anywhere in the file. This is the enforcement mechanism for "no write requests, no transitions, no comments, no issue updates" — a capability that doesn't exist in code cannot be called by mistake.

**What an adapter is not:** it is not a tool. Tools are the MCP-facing surface (Section 1); adapters are the integration-facing surface. A tool file imports an adapter; an adapter never imports MCP SDK types.

---

## 8. Folder Structure — Connectors / Adapters

```
src/
  adapters/
    jira/                  — implemented, Phase 2
      index.ts               — public adapter API (searchIssues, getIssue, getMorningContext)
      client.ts               — thin wrapper around fetch; getJson() only, no write methods
      mapper.ts                — upstream shape → gateway-internal shape (JiraIssueSummary)
      errors.ts                 — typed errors (JiraAuthError, JiraTimeoutError, ...)
      config.ts                  — env var resolution (JIRA_BASE_URL/EMAIL/API_TOKEN); returns null, doesn't throw
    outlook/
      (same shape — not yet implemented)
```

**Rule:** one top-level folder per external domain under `src/adapters/`, same five-file shape every time. A new adapter is a copy of this shape, not a novel structure — consistency here is what makes the "Gateway → Adapter → External" pattern actually swappable later (e.g. replacing a REST-based Jira adapter with an MCP-passthrough one without touching any tool file).

**File naming, as actually implemented:** kebab-case (`error-envelope.ts`, not `error_envelope.ts`), matching every other file in `src/` — this section originally sketched snake_case examples; the codebase convention (kebab-case throughout) is what actually shipped and is now the rule.

**Config, as actually implemented:** `config.ts` does **not** use a Zod schema (unlike Section 9's schemas, which validate MCP tool input). It's a plain `process.env` read with a presence check — see "Deviation" note in Section 7. Zod is reserved for validating data coming from an MCP client (untrusted, structured input), not for validating the operator's own environment configuration (a different trust boundary).

**Extraction trigger:** the `src/adapters/` folder was created in Phase 2 with the Jira adapter — the first (and, as of Phase 2, only) adapter. Follow this exact shape for Outlook when that phase starts.

---

## 9. Folder Structure — Schemas

```
src/
  schemas/
    framework/                          — Phase 1
      morning-brief.input.ts
    jira/                                 — Phase 2
      search-issues.input.ts
      get-issue.input.ts
      get-morning-context.input.ts
    outlook/
      ...                                  — not yet implemented
```

- **Library:** Zod (a Phase 0 dependency, unused until Phase 1's `morning-brief.input.ts` — this is its intended purpose).
- **One schema pair per tool**, named after the tool's action, not the tool's full namespaced name (the folder already supplies the domain). As implemented, only **input** schemas exist so far — no tool has needed an output schema yet (see the rule below on when one is required).
- Input schemas are the single source of truth for a tool's `inputSchema` passed to `server.registerTool` — the schema is written once and consumed by both MCP registration and any internal validation, never duplicated.
- Output schemas are optional for internal tools but **required** for any tool whose result another part of the gateway consumes programmatically (defensive parsing of your own adapter's output is cheap insurance against upstream shape drift).
- Schemas import nothing from `adapters/` or `tools/` — they are leaves. Adapters and tools import schemas, never the reverse.

**Extraction trigger, corrected:** `src/schemas/` was actually created in **Phase 1** (`framework/morning-brief.input.ts`), one phase earlier than this document originally predicted — `morning_brief` needed input validation before any adapter existed. Phase 2 added the `jira/` subfolder alongside it, matching the original prediction for *that* domain.

---

## 10. Folder Structure — Shared Types

```
src/
  types/
    error-envelope.ts   — the Section 5 Layer-2 error shape, as a TS type + a builder fn (Phase 1)
```

(`mcp-content.ts` and `config.ts`, sketched here originally, have not been needed — see the rule below on why nothing has been added since Phase 1.)

**Rule — what belongs here vs. what doesn't:**
- `src/types/` holds cross-cutting concerns used by *multiple* domains (the error envelope shape is used by `morning_brief` **and** all three Jira tools — confirmed cross-cutting, not speculative, now that a second domain actually uses it).
- Domain-specific types live next to their schema (`src/schemas/jira/*.ts` exports its own types) or their adapter (`src/adapters/jira/mapper.ts` exports `JiraIssueSummary`), not in `src/types/`. Phase 2 followed this exactly — no Jira-specific type was added to `src/types/`.
- If a type is needed in exactly one domain folder, it does not belong in `src/types/` even if it feels "shared" in spirit. Move it here only when a second domain needs the same shape.
- **New in Phase 2:** the error-code *mapping* function (raw adapter error → `ErrorEnvelope`) is domain-specific translation logic, not a shared type — it lives in `src/tools/jira-error-mapping.ts`, not `src/types/`, even though it consumes the shared `ErrorCode` union. Only the taxonomy itself is shared; how a given adapter's errors map onto it is not.

**Extraction trigger, corrected:** `src/types/error-envelope.ts` was actually created in **Phase 1** (needed by `morning_brief`'s `FRAMEWORK_FILE_MISSING` case), one phase earlier than originally predicted here — same pattern as the schemas correction above. Phase 2 extended its `ErrorCode` union (`ADAPTER_NOT_CONFIGURED`, `ADAPTER_TIMEOUT`) rather than creating a new file, per the "extend-only" rule in Section 5.

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

- Concrete adapter implementations for **Outlook, GitHub, or anything beyond Jira** (Jira shipped in Phase 2 — see above).
- Adapter `healthCheck()` — the seam is reserved (Section 7) but not implemented for Jira either.
- The Section 3 prompts-vs-tools decision.
- Authentication/authorization scheme for the gateway's `/mcp` endpoint itself (distinct from the Jira adapter's own credentials, which Phase 2 did implement).
- Logging library choice and log shipping destination — still two `console.log` lines total; Phase 2 did not add structured/correlated logging despite `ROADMAP.md` flagging adapters as the natural trigger point for it. Flagged as a growing gap, not resolved.
- Session management for the stateful MCP mode.
- Resource URI scheme *enforcement* (Section 2 states the convention; nothing consumes it yet).
- Multi-tenant / multi-user config.

See `ROADMAP.md` for when each deferred item is picked back up.
