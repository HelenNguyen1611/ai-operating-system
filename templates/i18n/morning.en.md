# Morning Brief — English Output Template

Use with `commands/_base/morning.base.md` and `templates/i18n/_morning-layout.md`.

**Unified Morning Card** — same layout on Claude App desktop, mobile, and Claude Code. Optimised for a **1-minute scan**.

```markdown
# Morning Brief
**{weekday}, {date}** · {timezone} · {brief|standard|full}

---

### Snapshot
**First action →** {single concrete next step}
**Mission →** {one sentence}
**Confidence →** {High|Medium|Low} · Jira {✓|○} · Team {✓|○} · Calendar {✓|○} · Email {✓|○}

---

### At a glance
- **Team:** {copy `live.team_summary.line_en` verbatim — 🟢 green = full team; 🟡 yellow = leave/WFH today}
- **Team schedule:** {weekly Markdown tables, maximum 7 day columns per table, followed by a compact mobile list}
- **Calendar:** {next event or "no meetings" — times in local TZ}
- **Jira:** {open_count} open · due today {n} · overdue {n} · [View all open tasks →]({filter_url})

---

### Priorities

**Ranked open issues**
_{showing} of {total} open issues_
1. **[Q_]** [{KEY}]({url}) — {why}
2. **[Q_]** [{KEY or action}]({url if any}) — {why}
...
10. **[Q_]** [{KEY}]({url}) — {why}

{View all open issues link when total > showing}

---

### Risks
- {risk or unknown — max 3 in brief/standard}

---

### Stand-up
Yesterday: {one line}
Today: {one line}
Blockers: {one line or None}

---
```

## Rendering rules

**Snapshot:** mandatory first content after title. User must grasp First action + Mission in **10 seconds**.

**At a glance:** mandatory. Team line and Team schedule are always present when team availability is loaded. Team schedule uses weekly tables with no more than 7 day columns per table, followed by the compact mobile list. Jira line always present when `jira_get_morning_context` was called; otherwise `Jira: not loaded`.

**Priorities:** show up to 10 ranked open issues. Always state `showing / total`; when truncated, include the full Jira link. Jira keys must be links.

**Risks:** brief/standard max **3** bullets. Fold missing non-team sources here (not in Snapshot).

**Stand-up:** English by default (see `_language-rules.md`).

**Quadrant tags:** `[Q1]` Do now · `[Q2]` Schedule · `[Q3]` Coordinate · `[Q4]` Review — from Runtime 48; not Jira priority.

**brief:** Same card structure — shorter lines only; omit optional footer; Risks max 3.

**standard:** Default for Claude App — use this template as written.

**full:** After the card, append: Context Budget, expanded Team (Verified/Inferred/Unknown), calendar detail, communication highlights, optional Priority Matrix, learning note.

```markdown
## Priority Matrix (full only, optional)
| | Important | Not Important |
|---|---|---|
| **Urgent** | Q1: | Q3: |
| **Not Urgent** | Q2: | Q4: |
```

Q4 means defer/review for human confirmation — never auto-delete or close.
