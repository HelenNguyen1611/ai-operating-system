# Morning Fast Path (brief / standard)

Condensed rules for Claude App `morning_brief` when `detail` is `brief` or `standard`. Full runtimes (41/46/48) apply only for `detail: full`.

## Speed rules (mandatory — target under 30 seconds)

1. Call `morning_brief({ language, detail: "standard" })` exactly once.
2. If Outlook Calendar is available, make **one Calendar call only** for today's next 3 events. Do not search Outlook Mail or infer meetings from email.
3. Replace only the card's `Calendar` / `Lịch` line with those events. If Calendar is unavailable, keep the gateway fallback line unchanged.
4. **Output:** keep every other character and section from the returned Morning Card unchanged, including Jira, Team, weekly leave/WFH tables, and compact mobile list.
5. **No reformat:** no timeline, no Needs attention/Resolved sections. **Forbidden:** rewrite Team/Jira, create a monthly meeting calendar, or omit either leave-calendar representation.
6. **`daily_report_save` after** the user sees the brief — never block the reply on save.

Outlook Mail and Teams are used only when the user **explicitly** asks or selects `detail: full`.

## What morning_brief already includes

- Up to 10 ranked open Jira issues, with `showing / total` count and a full-list link when more remain
- Team line (from leave snapshot)
- **Team month calendar** — Markdown split into weekly tables (maximum 7 day columns each), followed by a compact event-only mobile list
- Today's next 3 meetings — optional single Outlook Calendar lookup; shown only on the `Calendar` / `Lịch` line
- Jira open count + filter link
- Snapshot, Risks, Stand-up skeleton

## Output scan order

Snapshot → At a glance → Priorities → Risks → Stand-up.

User must grasp First action in **10 seconds**, full card in **1 minute**.
