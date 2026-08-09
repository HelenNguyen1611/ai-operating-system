# Morning Brief Skill

Triggers: `chào buổi sáng`, `báo cáo đầu ngày`, `/chaobuoisang`, `good morning`, `morning brief`, `/morning`.

## Objective

Show today's Morning Card in under 30 seconds — no manual formatting, no rewriting.

## Execution (mandatory — do not deviate)

1. Call the MCP gateway tool **`morning_brief` exactly once**:
   - Vietnamese trigger → `{ "language": "vi", "detail": "standard" }`
   - English trigger → `{ "language": "en", "detail": "standard" }`
2. The tool returns a **complete, server-rendered Morning Card** (markdown). **Paste it verbatim** as your reply — do not summarize, shorten, paraphrase, reformat, or replace it with a greeting.
3. **Do not call** `jira_get_morning_context` or `team_availability_get_availability` for this workflow — their live data is already bundled into `morning_brief`.
4. **Do not** use `detail: "full"` unless the user explicitly asks for the full framework/context dump (Runtime 41, Context Engine, Reasoning Engine, raw JSON). `full` is not the default morning workflow.
5. If Outlook Calendar is connected, one lookup for **today's next 3 events** is allowed afterward — replace only the `Lịch` / `Calendar` line, preserving every other character of the card verbatim.
6. Never claim `không có blocker`, `team đủ người`, `full team`, or that everybody is ready unless the card's Team line explicitly says so (🟢). No recorded leave is not proof of attendance or capacity.
7. A valid response retains **every heading, in order, with zero omissions**. Checklist before sending — confirm all are present verbatim:
   - Snapshot / Tóm tắt nhanh
   - At a glance / Tổng quan (Team, Calendar, Jira lines)
   - Priorities / Ưu tiên — including `**Ranked open issues**` header line
   - **Risks / Rủi ro — never skip, even if only 1–2 bullets**
   - Stand-up — copy `Blockers:` wording exactly, do not shorten
   - Team schedule / Lịch team — all week tables in full
   - **Compact · mobile summary — never skip**
   - Final legend line — copy in full (AL, AL?, WFH, SL, ·), do not truncate
   - Do not invent annotations (date ranges, "← TODAY") that the tool did not output.

## Failure handling

If `morning_brief` fails or errors, report the error and unavailable sources honestly. **Never fabricate** a fallback brief from remembered Jira items, and never claim OAuth/authentication is required unless the tool call itself actually returned an auth error — check `tools/list` or retry once before assuming the connector is broken.

## Reference

Authoritative details: `runtime/_morning-fast-path.md`, `commands/_base/morning.base.md`, `templates/i18n/_morning-layout.md`, `CLAUDE.md`.
