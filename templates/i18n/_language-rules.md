# Language Rules

Apply to Morning commands and any command that references this file.

---

## en

Output English only.

---

## vi

Output Vietnamese only.

Keep common workplace terms in English when natural, such as:

Jira · stand-up · deploy · PR · staging · blocker

Do not over-explain. Keep prose concise.

---

## bilingual

English first, Vietnamese second — on the same line or immediately below.

Use **only** when the user explicitly passes `bilingual`.

Never use bilingual by default.

---

## Stand-up draft

Stand-up draft defaults to **English** because the team context is Australian / English-speaking.

This applies even when the main report is Vietnamese (`vi`).

Override only when the user explicitly requests Vietnamese stand-up (e.g. `standup vi`, `stand-up tiếng Việt`).

Stand-up format:

```
Yesterday:
Today:
Blockers:
```
