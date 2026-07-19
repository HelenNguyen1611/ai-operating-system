# Remote Gateway

Version: 0.3 (Phase 2 — Jira read-only integration)

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

# Phase 2 Scope

Implemented — Jira only, read-only, and nothing more:

1. Three new MCP tools: `jira_search_issues`, `jira_get_issue`, `jira_get_morning_context` — alongside unchanged `health_check` and `morning_brief`.
2. Configuration via three environment variables, read at call time (not boot time): `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`. No auto-loading `.env` file — see `apps/mcp-gateway/.env.example` for the documented manual-export or `node --env-file` approach.
3. `src/adapters/jira/` (`index.ts`, `client.ts`, `mapper.ts`, `errors.ts`, `config.ts`) — a read-only wrapper around the Jira Cloud REST API v3. `client.ts` exposes exactly one HTTP method, `getJson()`; there is structurally no write/transition/comment capability anywhere in the adapter.
4. Request timeout (`AbortController`-based, default 10s) and cursor-based pagination (`nextPageToken`/`isLast`, capped at 100 items / 20 pages per call) — both in `src/adapters/jira/client.ts`. **Corrected post-launch** — see "Phase 2.1" below; originally implemented and documented as offset-based (`startAt`/`maxResults`/`total`) against `GET /rest/api/3/search`, which Atlassian removed (HTTP 410) during real-world use.
5. `jira_search_issues` input: `{ jql: string, maxResults?: number }` (server-side capped at 50 regardless of requested value). `jira_get_issue` input: `{ key: string }` (validated against an issue-key pattern before any network call). `jira_get_morning_context` input: `{}` (queries `assignee = currentUser() AND updated >= -{lookbackDays}d ORDER BY updated DESC` for the account behind `JIRA_EMAIL`, where `{lookbackDays}` is configurable via `MORNING_CONTEXT_LOOKBACK_DAYS` (default 30) — see "Phase 2.2" for why this JQL has no `resolution` clause and how open/Done filtering actually works, and "Phase 2.3" for the configurable lookback window).
6. `jira_get_morning_context` output buckets: `assigned_open`, `recently_updated`, `due_today`, `overdue` — each issue mapped to `{ key, summary, status, priority, assignee, updated, due_date, url }`. Classification compares dates formatted in **Asia/Ho_Chi_Minh** wall-clock time (via `Intl.DateTimeFormat`, matching `config/runtime.yaml`'s `jira.display_timezone`), not the raw UTC/offset timestamp Jira returns — a timestamp near a day boundary can classify differently than a naive UTC comparison would produce.
7. Error taxonomy extended (not replaced) with `ADAPTER_NOT_CONFIGURED` and `ADAPTER_TIMEOUT` in `src/types/error-envelope.ts`, translated from typed Jira errors by a shared `src/tools/jira-error-mapping.ts` used by all three tools.
8. Tests: 21 new (16 adapter-level with an injected/mocked `fetch` — config, search, get-issue, pagination across two pages, 401/404/500 responses, timeout, timezone boundary-crossing, due/overdue bucketing — plus 5 MCP-tool-level, exercising the "not configured" path end-to-end through a real MCP client). Combined with Phase 1's 10, total suite is 31 tests, 0 regressions.

## Deviations from the Phase 2 task description

- **Config validation timing:** the task description implied adapters validate config at startup; the implementation deliberately does the opposite — `loadJiraConfig()` returns `null` rather than throwing, checked per tool call. Required by "Keep Phase 1 behaviour unchanged": the gateway must boot and serve `health_check`/`morning_brief` with zero Jira environment variables present, and it does.
- **No `.env` auto-loading was built.** Considered and explicitly rejected in favor of documenting `node --env-file=.env` / manual shell export — see `apps/mcp-gateway/.env.example`. No new dependency, no custom parser to maintain.
- **Logging was not implemented in this phase**, despite `ROADMAP.md` flagging Phase 2 as the natural trigger point. Explicitly carried forward as a gap to close before Outlook, not silently dropped.

## Verified before closing the Jira increment of Phase 2

- `npm run typecheck` — clean.
- `npm test` — 31/31 passing, including all 10 original Phase 1 tests unchanged (zero regression).
- Source scan (`grep` across `src/adapters/jira/` and `src/tools/jira-*.ts`) confirms no `postJson`/`putJson`/`deleteJson`/transition/comment code exists anywhere — the only matches are doc-comments describing their absence.
- No `.env` file present in the repository; only `.env.example` with placeholder values.
- `health_check` and `morning_brief` registration and behavior are byte-for-byte unchanged from Phase 1 — the three `jira_*` registrations in `src/tools/index.ts` are purely additive.

## Phase 2.1 — Search endpoint migration (live-discovered fix)

Shortly after Phase 2 was reported complete, a real call to `jira_get_morning_context` against a live Jira Cloud site returned `HTTP 410 Gone`: `GET /rest/api/3/search` had been removed by Atlassian in favor of `GET /rest/api/3/search/jql` (migration: https://developer.atlassian.com/changelog/#CHANGE-2046). This was flagged as a risk to watch in `apps/mcp-gateway/ARCHITECTURE.md`/`ROADMAP.md`'s Jira notes and in the Operations Handbook §15 — it materialized during real use rather than being caught in advance, since Phase 2's test suite mocked HTTP responses and therefore could not detect a change in what the real API actually accepts.

**Fixed:**
- Both `searchIssues()` and `getMorningContext()` in `src/adapters/jira/index.ts` now call `GET /rest/api/3/search/jql` instead of `GET /rest/api/3/search`.
- Pagination changed from offset-based (`startAt`/`maxResults`/`total`) to cursor-based (`nextPageToken`/`isLast`) — Atlassian's replacement endpoint has no total-count field at all (dropped for performance as part of the same migration), not just a renamed one.
- `JiraSearchResult`'s `total: number` field is now `is_last: boolean` — a **breaking change to `jira_search_issues`'s output shape**, made necessary by Atlassian removing the underlying data, not a voluntary API design change on the gateway's part.
- All 3 test fixtures (`tests/fixtures/jira/search-*.json`) and the corresponding assertions in `tests/adapters/jira.test.ts` updated to the new response shape.

**Verified against a live response.** A real `jira_search_issues` call against `wootech.atlassian.net` (JQL `assignee = currentUser() ORDER BY updated DESC`, `maxResults: 5`) returned `HTTP 200` with 5 correctly-mapped issues and `"is_last":false` — confirming `nextPageToken`/`isLast` are the correct field names on `GET /rest/api/3/search/jql`'s real response, not just an inference from the migration notice.

**Verified:** `npm run typecheck` clean; `npm test` 31/31 passing with the corrected fixtures.

## Phase 2.2 — Status-filtering fix (live-discovered bug)

A live acceptance test showed `assigned_open` incorrectly including many Done issues. Root cause: `getMorningContext()`'s original JQL, `assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC`, used Jira's `resolution` field as a proxy for "is this issue still open." **In this Jira workspace, that proxy is unreliable** — the workflow does not set `resolution` on the "Done" transition for many issues, so a `resolution = Unresolved` query returns issues that are, in fact, Done. Confirmed live: `GO-37`, `IN-152`, `IN-232`, `TRIN-34` all matched `resolution = Unresolved` while their `status` was `"Done"`.

**Actual behaviour, as fixed:**

1. **Query.** `assignee = currentUser() ORDER BY updated DESC` — no `resolution` clause. The full set of the user's most-recently-updated issues is fetched (bounded by cursor pagination, capped at 100 items / 20 pages, per Phase 2.1), regardless of status. **Superseded by Phase 2.3**, which adds a configurable `updated >= -{lookbackDays}d` bound to this same query — see below.
2. **Open/Done filtering happens client-side, not in JQL** — each issue's `fields.status.statusCategory.key` is checked; `"done"` means excluded from `assigned_open`. `statusCategory` is Jira's own platform-normalised field for this purpose, always present alongside `status` in the response (no extra field request needed), and more reliable than either `resolution` (proven unreliable above) or `status.name` (custom workflow statuses can be misleadingly named — a status literally named `"WT Done"` was observed in this workspace with `statusCategory` `"indeterminate"`, i.e. **not** actually done).
3. **`recently_updated` is derived from the unfiltered result set** — not from `assigned_open`. A Done issue closed minutes ago is still "recently updated" and may legitimately appear here, even though it can never appear in `assigned_open`. (The previous implementation derived `recently_updated` by filtering `assigned_open`, which — once `assigned_open` correctly excludes Done issues — would have made it impossible for `recently_updated` to ever include Done work. Decoupling these two was necessary to satisfy both requirements at once.)
4. **`due_today` and `overdue` are derived only from `assigned_open`**, unchanged from before this fix — a due date on a completed issue isn't operationally "due" or "overdue."

**No MCP tool contract changed** — `jira_get_morning_context`'s input (`{}`) and output shape (`assigned_open`/`recently_updated`/`due_today`/`overdue`, each an array of the same per-issue shape) are identical to before. `statusCategory` is used internally for filtering only; it is not added to the public `JiraIssueSummary` shape returned by any of the three Jira tools.

**Verified (at the time this fix closed):**
- `npm run typecheck` clean; `npm test` 32/32 passing (31 previous + 1 new regression test using a mixed fixture of open and Done issues, asserting `assigned_open` excludes both a recently-Done and a long-Done issue, `recently_updated` includes the recently-Done one, and `due_today` excludes a Done issue even when its due date is today).
- Live-verified against `wootech.atlassian.net`: `jira_get_morning_context`'s `assigned_open` returned 0 issues with `status: "Done"` (previously included at least 4).

## Phase 2.3 — Configurable lookback window (optimisation)

**Goal:** bound `getMorningContext()`'s query to recent activity instead of relying solely on the pagination cap (`MORNING_CONTEXT_MAX_ITEMS = 100`) as the only limit, and make that window operator-tunable.

**Change:**

- JQL is now `assignee = currentUser() AND updated >= -{lookbackDays}d ORDER BY updated DESC` — an `updated` bound added alongside the existing (Phase 2.2) clause. **No `resolution` clause reintroduced** — status filtering remains exactly as Phase 2.2 left it, entirely client-side via `status.statusCategory.key !== "done"`.
- `{lookbackDays}` is read from a new environment variable, `MORNING_CONTEXT_LOOKBACK_DAYS`, resolved by `loadJiraConfig()` in `src/adapters/jira/config.ts` — the same function and file that already resolves `JIRA_BASE_URL`/`JIRA_EMAIL`/`JIRA_API_TOKEN`, extended with a new field (`JiraConfig.lookbackDays`) rather than a separate config path. See `apps/mcp-gateway/.env.example` for the documented variable.
- **Validation:** must be a positive integer, capped at 365. Missing, non-numeric, decimal, zero, negative, or greater-than-365 values all fall back to the default of **30** — silently, never a startup failure or a call error. This is a deliberate asymmetry with the required credential fields in the same `JiraConfig` object: credentials have no safe default (missing → `null`, all Jira tools return `ADAPTER_NOT_CONFIGURED`), while a lookback window does (defaulted, `loadJiraConfig()` still succeeds).
- **Unaffected:** `assigned_open` filtering (`isDoneStatusCategory`), `recently_updated` (still derived from the same unfiltered, now-lookback-bounded result set — a Done issue updated within the window can still appear there), `due_today`/`overdue` (still scoped to `assigned_open` only). No MCP tool contract changed — `get_morning_context`'s input remains `{}`; the lookback window is an operator-side environment setting, invisible to the calling client.

**Verified:** `npm run typecheck` clean; `npm test` 44/44 passing (32 previous + 12 new: default-30 config test, valid-7 config test, max-365 config test, 6 invalid-value-falls-back-to-30 cases, JQL-reflects-default-30 test, JQL-reflects-configured-7 test, JQL-never-contains-"resolution" test).

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

## Phase 2 Success Criteria (Jira increment)

- `npm test` passes in `apps/mcp-gateway` (44 tests as of Phase 2.3: the original 10 unchanged, plus 21 from the initial Jira increment, plus 1 status-filtering regression test (2.2), plus 12 lookback-window tests (2.3)).
- `jira_search_issues`, `jira_get_issue`, and `jira_get_morning_context` all appear in `tools/list` regardless of whether Jira is configured.
- Calling any `jira_*` tool with no `JIRA_*` environment variables set returns `ADAPTER_NOT_CONFIGURED`, never a crash and never a real network call.
- `jira_get_morning_context`'s `due_today`/`overdue`/`recently_updated` buckets are computed from Asia/Ho_Chi_Minh-normalised dates, verified by a test that crosses a UTC/+07:00 day boundary.
- `jira_get_morning_context`'s `assigned_open` contains only issues whose `status.statusCategory.key` is not `"done"` — verified by both a live call against `wootech.atlassian.net` and a mixed-fixture regression test (Phase 2.2).
- `MORNING_CONTEXT_LOOKBACK_DAYS` accepts only a positive integer capped at 365; any other value (missing, non-numeric, decimal, zero, negative, >365) falls back to 30 without failing config resolution (Phase 2.3).
- No write, transition, or comment capability exists anywhere in the Jira code path — verified by source scan, not just by intent.
- `health_check` and `morning_brief` are unaffected — same 10 Phase 1 tests, unmodified assertions (only the shared `tools/list` count assertion in `gateway.test.ts` was updated to include the 3 new names).

---

# Future Direction

Ordered, each phase gated on review of the previous:

1. **Phase 1 — First real tool. Done.** `morning_brief(language, detail)` serving the framework's own files (base workflow, Runtime 41/46/48, i18n templates) as the instruction payload. See "Phase 1 Scope" above for what shipped and how it differs from this original sketch.
2. **Phase 2 — Adapters. Jira done, Outlook not started.** Jira adapter shipped (`jira_search_issues`, `jira_get_issue`, `jira_get_morning_context`), read-only, behind the gateway — see "Phase 2 Scope" above. Outlook is unchanged from before this phase: not implemented, not scheduled. Live Jira context no longer depends on the calling client's own Atlassian connector.
3. **Phase 3 — Hardening.** Authentication (bearer/OAuth), session management, deployment story.
4. **Phase 4 — Runtime orchestration.** The gateway executes runtime workflows server-side instead of shipping instructions to the client.

Each phase must be specified in this document before implementation.

---

# Related

- `apps/mcp-gateway/` — implementation
- `apps/mcp-gateway/docs/manual-test-claude-app.md` — manual verification
- `runtime/40_Runtime_Architecture.md` — execution-layer architecture this gateway extends
