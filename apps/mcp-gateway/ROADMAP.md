# MCP Gateway — Roadmap

Status: Planning document. No phase below Phase 0 is implemented by this document.

Companion to `ARCHITECTURE.md` (the stable design each phase must follow) and `runtime/50_Remote_Gateway.md` (the runtime-layer spec of record for phase status). If this roadmap and `runtime/50_Remote_Gateway.md` ever disagree on what's "current," the runtime doc wins — update this file to match, not the other way around.

Each phase is gated on review of the previous one. No phase starts implementation before its entry here is written and agreed.

---

## Phase 0 — Compatibility Spike (done)

**Goal:** prove an AI client can reach a self-hosted Streamable HTTP MCP server at all.

**Shipped:** one tool (`health_check`), one HTTP endpoint (`GET /health`), stateless transport, 4 automated tests, a manual Claude App connection test.

**Explicitly not touched:** any business integration, any framework file (`commands/`, `runtime/` docs other than its own spec, `templates/`, `config/runtime.yaml`).

---

## Phase 0.5 — Architecture Standardisation (this phase)

**Goal:** write down the conventions in `ARCHITECTURE.md` *before* a second tool or first adapter exists, so growth doesn't retrofit structure onto ad hoc code.

**Shipped:** `ARCHITECTURE.md`, `ROADMAP.md`. Documentation only — `src/` is unchanged.

**Why now and not later:** Phase 1 adds the first tool beyond the platform `health_check`. Every naming, error-shape, and folder decision made under real time pressure during Phase 1 becomes a de facto standard whether or not it was a good one. Phase 0.5 exists to make those decisions once, deliberately, while the cost of changing them is zero.

**Exit criteria:** this document and `ARCHITECTURE.md` reviewed and approved. No code changes required or permitted to exit this phase.

---

## Phase 1 — First Real Tool: `morning_brief` (done)

**Goal:** serve the framework's own files through the gateway, per `runtime/50_Remote_Gateway.md`'s original Phase 1 definition — `morning_brief(language, detail, focus)` returning the base workflow + Runtime 41 + the matching i18n template as instruction payload.

**Shipped:** `morning_brief(language, detail)` — see `runtime/50_Remote_Gateway.md` → "Phase 1 Scope" for the full file list, payload shape, and the two deliberate deviations from the original sketch (`focus` dropped; `detail` restricted to `"brief" | "full"`).

**Architecture obligations from this phase, as actually resolved:**
- Naming: shipped as the bare tool name `morning_brief` (per the approved spec), not `framework.morning_brief` as originally speculated. Documented in `ARCHITECTURE.md` §1 as a second unnamespaced platform-level tool, alongside `health_check`.
- Tools-vs-prompts (§3): shipped as a **tool**. The prompts option remains open and undecided for future work.
- No adapters — confirmed by source scan, no network-client code or external-service references anywhere in `src/`. `src/adapters/` still does not exist.
- Tool registration extracted out of `server.ts` into `src/tools/` (`health-check.ts`, `morning-brief.ts`, `index.ts`) exactly as this section required. `server.ts` is transport wiring only.
- New, not originally listed here but required by the approved spec: `src/lib/repo-paths.ts` (safe path resolution), `src/types/error-envelope.ts` (Section 5 Layer-2 format, first real use), `src/schemas/framework/morning-brief.input.ts` (first Zod schema — Zod stops being an unused dependency one phase earlier than Section 9 anticipated, since Phase 1 needed input validation).

**Verified:** `npm run typecheck` clean; `npm test` 10/10 passing (tools/list, English brief, Vietnamese brief, invalid input ×2, missing-file handling ×2, plus the original 4); no Jira/Outlook/Atlassian/Microsoft references or fetch/axios/http-client code anywhere in `src/`; `package.json` dependencies unchanged from Phase 0.

**Non-goals held (unchanged from Runtime 50):** no Jira, no Outlook, no auth, no resources, no workflow execution — the gateway loads and returns framework context only; the calling client still does the reasoning.

---

## Phase 2 — Adapters

**Goal:** the architectural point of the whole gateway — Jira first, then Outlook, live behind the gateway instead of behind client-specific connectors.

```
Claude App → AI OS Gateway → Jira Adapter → Jira
```

**Architecture obligations introduced by this phase:**
- `src/adapters/jira/` created per the Section 8 five-file shape.
- `src/schemas/jira/` created per Section 9 — Zod schemas stop being an unused dependency.
- `src/types/error-envelope.ts` created per Section 10 — first real use of the Section 5 Layer-2 error format.
- Logging strategy (Section 6) should be implemented no later than this phase — adapter failures are exactly the case correlation ids and structured logs exist for. Implementing it before the first adapter is also acceptable if Phase 1's tool extraction makes the gap obvious sooner.
- `gateway.health_check` (or a new `gateway.status`) may be extended to aggregate `adapter.healthCheck()` results — optional for this phase, not required to exit it.

**Sequencing within Phase 2:** Jira before Outlook, matching the original approval. Each adapter is its own reviewable increment, not a combined PR.

**Non-goals still held:** authentication scheme for the gateway itself (the adapter has its own credentials to the external system; that is separate from who is allowed to call the gateway — see Phase 3).

---

## Phase 3 — Hardening

**Goal:** the gateway stops being safe-only-on-localhost-behind-a-tunnel.

**In scope:**
- Authentication/authorization for the `/mcp` endpoint (bearer token minimum; OAuth if the target client ecosystem needs it).
- Session management for MCP (moving off `sessionIdGenerator: undefined` where beneficial — per `ARCHITECTURE.md`'s stability note, the stateless path must keep working for clients that don't opt in).
- A real deployment target (currently only "run locally + tunnel," per the Phase 0 manual test doc).
- Rate limiting / abuse protection, given the gateway will hold real credentials to Jira/Outlook by this point.

**Explicitly deferred to Phase 3, not earlier:** none of this blocks Phase 1 or Phase 2 because both are still expected to run behind a manually-managed tunnel for internal use, as documented in `apps/mcp-gateway/docs/manual-test-claude-app.md`'s "known limitations." Phase 3 is what makes that limitation acceptable to lift.

---

## Phase 4 — Runtime Orchestration

**Goal:** the gateway executes runtime workflows server-side instead of shipping instruction text to the client and trusting it to follow along.

**What changes:** today (and through Phase 2), tools like `morning_brief` return *instructions* — the client's model still does the reasoning. Phase 4 is the point where the gateway itself could run a workflow (call Jira, call Outlook, apply Runtime 41's decision gates) and return a finished Morning Brief, not a recipe for producing one.

**Why this is last:** it's the highest-leverage and highest-risk phase — it moves reasoning from the (expensive, flexible, human-supervised) client model into the (cheaper, rigid, unsupervised) gateway. It should not be attempted before Phase 2's adapters are proven reliable and Phase 3's auth story means the gateway isn't running arbitrary workflows for anyone who has the URL.

**Not specified further here.** Phase 4 gets its own planning pass, informed by whatever Phases 1–3 actually taught us, when it's reached.

---

## Cross-Phase Rules

- No phase implements another phase's non-goals early "since we're in there anyway." Scope creep between phases is exactly what Phase 0.5 exists to prevent.
- Every phase that adds a tool, resource, or adapter must conform to `ARCHITECTURE.md` as written at the time, or update `ARCHITECTURE.md` first if the convention itself needs to change (with the reasoning recorded, not silently).
- `runtime/50_Remote_Gateway.md` is updated at the end of each phase to reflect what actually shipped, same as it was after Phase 0.
