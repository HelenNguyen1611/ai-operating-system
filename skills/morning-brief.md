# Morning Brief Skill

Triggers: `chào buổi sáng`, `báo cáo đầu ngày`, `/chaobuoisang`, `good morning`, `morning brief`, `/morning`.

## Objective

Show today's Morning Card in under 30 seconds — formatted per Helen's template with all content verbatim.

## Execution (mandatory — do not deviate)

1. Call the MCP gateway tool **`morning_brief` exactly once**:
   - Vietnamese trigger → `{ "language": "vi", "detail": "standard" }`
   - English trigger → `{ "language": "en", "detail": "standard" }`
2. The tool returns a **complete, server-rendered Morning Card** (markdown). **Format and display it per template structure:**
   - **Preserve ALL content verbatim** — no omissions, no paraphrasing, no shortening of issues or text
   - **Reorganize Team Schedule section ONLY:**
     - Keep calendar tables but add week date ranges as headers: `**Week 1** (1–7)`, `**Week 2** (8–14)`, etc.
     - Identify current week from `**9**` (or today's date) and mark it: `**Week 2** (8–14) ← **TODAY**`
     - Keep all rows and columns intact
   - Do not summarize, shorten content, select only three Jira issues, or replace with a greeting
3. **Do not call** `jira_get_morning_context` or `team_availability_get_availability` — their live data is bundled into `morning_brief`.
4. **Do not** use `detail: "full"` unless user explicitly asks. `standard` is the default.
5. If Outlook Calendar is connected, one lookup for **today's next 3 events** is allowed — replace only the `Calendar` line, preserving every other character.
6. Never claim `không có blocker`, `team đủ người`, `full team`, or availability unless the card explicitly verifies it. No recorded leave ≠ proof of attendance.
7. A valid response retains **every heading, in order, with zero omissions**. Checklist before sending:
   - Snapshot / Tóm tắt nhanh (verbatim)
   - At a glance / Tổng quan (verbatim)
   - Priorities / Ưu tiên — **display up to 10 open issues, split into Top 3 + Other 7**:
     - `**Top 3**` — first 3 ranked issues, shown prominently
     - `**Other 7**` — next 7 ranked issues (issues 4–10)
     - If ≤10 issues total: show all available, header reads `_Showing N of N…_`
     - If >10 issues exist: show top 10 (3+7), header reads `_Showing 10 of N…_` + add link `[View all open tasks →](Jira URL)`
   - **Risks / Rủi ro — never skip**
   - Stand-up — copy `Blockers:` wording exactly
   - Team schedule / Lịch team — **reorganized by week with date ranges and current-week marking** (content verbatim)
   - **Compact · mobile summary — never skip**
   - Final legend line — copy in full, do not truncate

## Failure handling

If `morning_brief` fails or errors, report the error and unavailable sources honestly. **Never fabricate** a fallback brief from remembered Jira items, and never claim OAuth/authentication is required unless the tool call itself actually returned an auth error — check `tools/list` or retry once before assuming the connector is broken.

## Reference

Authoritative details: `runtime/_morning-fast-path.md`, `commands/_base/morning.base.md`, `templates/i18n/_morning-layout.md`, `CLAUDE.md`.
