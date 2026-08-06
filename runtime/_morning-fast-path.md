# Morning Fast Path (brief / standard)

Condensed rules for Claude App `morning_brief` when `detail` is `brief` or `standard`. Full runtimes (41/46/48) apply only for `detail: full`.

## Speed rules (mandatory — target under 30 seconds)

1. **ONE tool call:** `morning_brief({ language, detail: "standard" })` — nothing else before replying.
2. **Forbidden before reply:** Outlook calendar, Outlook email, Teams/chat search, `jira_get_morning_context`, `team_availability_get_availability`.
3. **Output:** paste returned markdown **verbatim** — complete Morning Card (Jira + team pre-filled).
4. **No reformat:** no timeline, no Needs attention/Resolved sections.
5. **`daily_report_save` after** the user sees the brief — never block the reply on save.

Email/calendar/Teams only when user **explicitly** asked (e.g. "focus on Travis email") or `detail: full`.

## What morning_brief already includes

- Jira Top 3 + Next 2 (from live buckets)
- Team line (from leave snapshot)
- Jira open count + filter link
- Snapshot, Risks, Stand-up skeleton

## Output scan order

Snapshot → At a glance → Priorities → Risks → Stand-up.

User must grasp First action in **10 seconds**, full card in **1 minute**.
