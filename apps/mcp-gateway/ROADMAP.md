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

## Phase 2 — Adapters: Jira done, Outlook not started

**Goal:** the architectural point of the whole gateway — Jira first, then Outlook, live behind the gateway instead of behind client-specific connectors.

```
Claude App → AI OS Gateway → Jira Adapter → Jira
```

**Shipped (Jira only):** three new read-only tools — `jira_search_issues`, `jira_get_issue`, `jira_get_morning_context` — backed by `src/adapters/jira/`. Full detail in `runtime/50_Remote_Gateway.md` → "Phase 2 Scope."

**Architecture obligations, as actually resolved:**
- `src/adapters/jira/` created per the Section 8 five-file shape — confirmed workable, will be copied for Outlook.
- `src/schemas/jira/` created per Section 9. **Correction:** Zod stopped being unused one phase earlier than this document originally said — Phase 1's `morning_brief` already needed it; Phase 2 just added a second domain folder.
- `src/types/error-envelope.ts` **already existed from Phase 1** (same correction) — Phase 2 extended its `ErrorCode` union (`ADAPTER_NOT_CONFIGURED`, `ADAPTER_TIMEOUT`) rather than creating the file.
- Logging strategy (Section 6) — **not implemented in Phase 2**, despite this document flagging adapters as the natural trigger point. Still two `console.log` lines total, no correlation ids, no structured output. This is now a growing, explicitly-acknowledged gap rather than a deferred-and-forgotten item — strongly recommended before Outlook is added, since debugging two adapters with zero request correlation will be materially harder than debugging one.
- `gateway.health_check` aggregating adapter health — **not implemented**, still a reserved, unwired seam (`ARCHITECTURE.md` §7). The Jira adapter has no `healthCheck()` method.
- **New, not anticipated by this document:** `loadJiraConfig()` returns `null` on missing config rather than failing fast at boot (`ARCHITECTURE.md` §7's "Deviation" note) — required to keep Phase 1 tools working with zero Jira configuration present. This is now the standing pattern for any future adapter's config loader, not a Jira-specific choice.
- **New:** a shared `src/tools/jira-error-mapping.ts` translates typed adapter errors (`src/adapters/jira/errors.ts`) into the MCP error envelope, reused by all three Jira tools rather than duplicated per tool.

**Verified:** `npm run typecheck` clean; `npm test` 31/31 passing (10 original Phase 1 tests unchanged — zero regression — plus 16 Jira adapter unit tests with a mocked/injected `fetch`, plus 5 Jira MCP-tool integration tests); source scan confirms no `postJson`/`putJson`/`deleteJson`/transition/comment code exists anywhere in the Jira adapter or tools; no `.env` file committed, only `.env.example` with placeholders.

**Sequencing within Phase 2:** Jira shipped first, matching the original approval. **Outlook has not been started** — this phase is not closed, only its Jira increment is done. Each adapter remains its own reviewable increment, not a combined PR.

**Non-goals still held:** authentication scheme for the gateway itself (the Jira adapter has its own credentials to Jira; that is separate from who is allowed to call the gateway — still Phase 3). No write/transition/comment capability — verified structurally, not just by convention.

**Phase 2.1 (post-launch fix):** a real call against live Jira surfaced `HTTP 410` — Atlassian had removed `GET /rest/api/3/search`. Migrated to `GET /rest/api/3/search/jql` with cursor-based (`nextPageToken`/`isLast`) pagination, replacing the offset-based (`startAt`/`total`) model; `jira_search_issues`'s output changed `total: number` → `is_last: boolean` (a forced breaking change — Atlassian's replacement endpoint has no total-count field). This is exactly the risk this document's Jira notes flagged as worth watching — it materialized within the same review cycle, not hypothetically. Full detail: `runtime/50_Remote_Gateway.md` → "Phase 2.1" and the Operations Handbook §18.9. Lesson for Outlook: mocked tests cannot catch upstream API removals — real-endpoint verification (the manual test steps) is not optional polish, it's how this was actually caught.

**Phase 2.2 (post-launch fix):** a live acceptance test showed `jira_get_morning_context`'s `assigned_open` incorrectly including many Done issues. Root cause: the original JQL (`assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC`) relied on Jira's `resolution` field to mean "not done" — unreliable in this workspace, where the Done transition doesn't set `resolution` (confirmed live: `GO-37`/`IN-152`/`IN-232`/`TRIN-34` all matched `resolution = Unresolved` while `status = "Done"`). Fixed by dropping the `resolution` clause entirely (JQL was `assignee = currentUser() ORDER BY updated DESC`, further bounded in Phase 2.3 below) and filtering client-side on `status.statusCategory.key === "done"` instead — Jira's own designed-for-this field, not the workspace-dependent `resolution` field or the potentially-mislabeled `status.name`. `recently_updated` is now derived from the *unfiltered* result set rather than from `assigned_open`, so a Done issue updated moments ago can still appear there even though it's excluded from `assigned_open`; `due_today`/`overdue` remain scoped to `assigned_open` only, unchanged. No MCP tool contract changed — `statusCategory` is used for internal filtering only, never added to the public `JiraIssueSummary` output. Full detail: `runtime/50_Remote_Gateway.md` → "Phase 2.2" and the Operations Handbook §18. Lesson for Outlook: a workspace-specific field like `resolution` should never be trusted as a universal "is this done" signal without live verification — prefer the platform-normalised field (`statusCategory`) even when a workspace-specific field looks like it should work.

**Phase 2.3 (optimisation, approved):** `getMorningContext()`'s JQL is now `assignee = currentUser() AND updated >= -{lookbackDays}d ORDER BY updated DESC` — a configurable recency bound added alongside Phase 2.2's fix, **not** a reintroduction of `resolution`. `{lookbackDays}` comes from a new `MORNING_CONTEXT_LOOKBACK_DAYS` env var, resolved by the same `loadJiraConfig()` function that already resolves Jira credentials (`JiraConfig` gained one field, `lookbackDays`), following the existing config pattern rather than introducing a new one. Validation: positive integer only, capped at 365; anything else (missing, non-numeric, decimal, zero, negative, >365) falls back to 30 — this field, unlike credentials, always resolves to a usable value, so an invalid setting never prevents the gateway from starting or a call from succeeding. `assigned_open`/`recently_updated`/`due_today`/`overdue` semantics are byte-for-byte unchanged from Phase 2.2; only the upstream query's time window changed. No MCP tool contract changed. Full detail: `runtime/50_Remote_Gateway.md` → "Phase 2.3" and the Operations Handbook §18.

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
