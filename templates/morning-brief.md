# Morning Brief Output Template

Use this template after executing `commands/morning.md` and Runtime 41.

Select **one** format below based on parsed detail level: `brief`, `standard`, or `full`.

Defaults when arguments are omitted: **language = en**, **detail = standard**.

---

# Language Rules

## en

Output only English.

## vi

Output only Vietnamese.

Keep common work terms in English when useful (Jira, stand-up, deploy, PR, staging).

Add Vietnamese explanation when the term alone would be unclear.

## bilingual

English first, Vietnamese second on the same line or immediately below.

Use **only** when the user explicitly passes `bilingual`.

Never use bilingual by default.

---

# brief

**Limits:** Maximum 8 bullets total. No long explanations. Headings do not count toward the bullet limit.

**Include:** Today's Mission · Top 3 Priorities · Risks / Unknowns · Stand-up Draft · First Action

**Strict format:**

```markdown
# Morning Brief

## Today's Mission
One sentence.

## Top 3 Priorities
1.
2.
3.

## Risks / Unknowns
-

## Stand-up Draft
Yesterday:
Today:
Blockers:

## First Action
-
```

**Notes:**

- If a live source is missing, mention it once under Risks / Unknowns — do not add a separate Context Status section.
- Stand-up Draft lines are not bullets; the bullet budget applies to priority and risk items only.
- Apply language rules above to all text.

---

# standard

**Limits:** Maximum 6 sections. Each section maximum 3 bullets.

Stand-up Draft uses Yesterday / Today / Blockers lines instead of bullets.

**Include:** Context Status · Today's Mission · Top Priorities · Risks / Unknowns · Stand-up Draft · Action Plan

**Strict format:**

```markdown
# Morning Brief

## Context Status
- Available:
- Missing:
- Confidence:

## Today's Mission
-

## Top Priorities
1.
2.
3.

## Risks / Unknowns
-

## Stand-up Draft
Yesterday:
Today:
Blockers:

## Action Plan
Now:
Next:
Later:
```

**Notes:**

- Context Status: list available and missing sources once each; do not repeat connector advice.
- Confidence: High / Medium / Low with one short reason.
- Apply language rules above to all text.

---

# full

**Limits:** No bullet or section cap. Complete Runtime-style report.

Use when detail = `full`.

**Include:**

- Executive Summary (readable in under two minutes)
- Context Budget (what was loaded, token/context rationale)
- Context Status (available, missing, confidence)
- Team Availability
- Calendar Overview
- Jira / Delivery Status
- Communication Highlights
- Today's Mission
- Top Priorities (with reasoning)
- Risks / Unknowns (Facts · Inferences · Unknowns when useful)
- Stand-up Draft (Yesterday / Today / Blockers)
- Action Plan (Now · Next · Later)
- Decision Gates checked
- Learning / Evolution notes (recommendations only — do not auto-update handbooks)

**Structure rules:**

- Put the most important item first.
- Separate Facts, Inferences, and Unknowns when ambiguity affects decisions.
- Mention each missing source once in Context Status — do not repeatedly recommend connecting integrations.
- Apply language rules above to all text.

---

# Quick Reference

| Detail | Sections | Bullet limit | Context Budget | Learning |
|--------|----------|--------------|----------------|----------|
| brief | 5 | 8 total | No | No |
| standard | 6 | 3 per section | Summary only | Optional 1 line |
| full | All | None | Yes | Yes |

| Language | Default | When to use |
|----------|---------|-------------|
| en | Yes | Always unless specified |
| vi | No | User passes `vi` |
| bilingual | No | User passes `bilingual` only |
