# Morning Brief — English Output Template

Use with `commands/_base/morning.base.md`.

Keep short and scannable. Standard mode uses this structure as-is.

```markdown
# Morning Brief

## Context
- Available:
- Missing:
- Confidence:
- Times shown in local timezone.

## Today's Mission
-

## Top 3 Priorities
1. [Q_] — (short why grounded in evidence)
2. [Q_] — (short why grounded in evidence)
3. [Q_] — (short why grounded in evidence)

## Risks / Unknowns
-

## Stand-up Draft
Yesterday:
Today:
Blockers:

## First Action
-
```

**Quadrant tags:** use `[Q1]` Do Now, `[Q2]` Schedule, `[Q3]` Delegate/Coordinate/Batch, `[Q4]` Defer/Review. Tags reflect Eisenhower classification from Runtime 48 — not Jira priority.

**brief:** Omit Context section. Fold missing sources into Risks / Unknowns. Top 3 tags and one-line why only — no matrix.

**standard:** Same structure; each Top 3 item keeps tag + short why. No full matrix.

**full:** Expand Context into Context Budget; add executive summary, team, calendar, Jira detail, and learning note. Optionally add:

```markdown
## Priority Matrix (optional)
| | Important | Not Important |
|---|---|---|
| **Urgent** | Q1: | Q3: |
| **Not Urgent** | Q2: | Q4: |
```

Include confidence or missing context only when evidence is thin. Q4 means defer or review for human confirmation — not automatic delete or close.
