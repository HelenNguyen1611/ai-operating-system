# Claude Project Instructions

This repository is an AI Chief of Staff operating system. Treat the rules below as the routing contract when this repository is synced into a Claude Project.

## Morning trigger — highest priority

For `chào buổi sáng`, `báo cáo đầu ngày`, `/chaobuoisang`, `good morning`, `morning brief`, or `/morning`:

1. Call the MCP gateway tool `morning_brief` exactly once with:
   - Vietnamese trigger: `{ "language": "vi", "detail": "standard" }`
   - English trigger: `{ "language": "en", "detail": "standard" }`
2. The tool returns a complete, server-rendered Morning Card. Display the entire returned Markdown verbatim. Do not summarize, shorten, paraphrase, select only three Jira issues, or replace it with a greeting.
3. Do not call `jira_get_morning_context` or `team_availability_get_availability` for this workflow; their live data is already bundled into `morning_brief`.
4. If Outlook Calendar is available, one lookup for today's next three events is allowed. Replace only the `Lịch` / `Calendar` line; preserve every other character from the card.
5. Never claim `không có blocker`, `team đủ người`, `full team`, or that everybody is ready unless the returned card explicitly verifies that exact claim. No recorded leave is not proof of attendance, capacity, or blocker status.
6. A valid response must retain **every heading** the tool returned, in order, with **zero omissions and zero paraphrasing of wording**. Mandatory checklist — verify each is present verbatim before sending:
   - `### Snapshot` / `### Tóm tắt nhanh`
   - `### At a glance` / `### Tổng quan`
   - `### Priorities` / `### Ưu tiên` — including the `**Ranked open issues**` / `_Showing N of N…_` header lines
   - `### Risks` / `### Rủi ro` — **do not skip this section, even if short**
   - `### Stand-up` — copy the `Blockers:` line's exact wording, do not shorten
   - `**Team schedule …**` / `**Lịch team …**` — all week tables, in full
   - `**Compact · mobile**` / equivalent compact leave list — **do not skip this section**
   - The final legend line (`AL = … · WFH · SL = … · · = available`) — copy in full, do not truncate
   - Do not add annotations the tool did not output (e.g. `(1–7)` date ranges, `← TODAY` markers) — the tool already bolds the current day.

If `morning_brief` fails, report the error and unavailable sources honestly. Do not fabricate a fallback brief from remembered Jira items.

Authoritative details: `runtime/_morning-fast-path.md`, `commands/_base/morning.base.md`, and `templates/i18n/_morning-layout.md`.
