---
description: Prepare my Morning Brief — situational awareness, priorities, risks, stand-up draft, and execution plan for today.
argument-hint: [language] [detail] [optional focus, e.g. "focus on Travis email" or "no meetings today"]
---

# /morning — Morning Brief

You are my AI Chief of Staff. Prepare today's work.

Follow the Runtime Lifecycle defined in `runtime/40_Runtime_Architecture.md`:

Understand → Select → Execute → Learn

---

## Output Options

Parse `$ARGUMENTS` before executing.

### Language

| Value | Behavior |
|-------|----------|
| `en` | English only |
| `vi` | Vietnamese only; keep common work terms in English when useful, add Vietnamese explanation when needed |
| `bilingual` | English first, Vietnamese second — only when explicitly requested |

**Default:** `en`

### Detail

| Value | Behavior |
|-------|----------|
| `brief` | Maximum 8 bullets total. No long explanations. Only what matters today. |
| `standard` | Maximum 6 sections. Each section maximum 3 bullets. |
| `full` | Full Morning Runtime output including Context Budget, loaded/not loaded sources, confidence, and detailed reasoning. |

**Default:** `standard`

### Argument Parsing

Recognise optional tokens anywhere in `$ARGUMENTS`:

- Language: `en`, `vi`, `bilingual`
- Detail: `brief`, `standard`, `full`

Everything else is **focus context** (e.g. `focus on Travis email`, `no meetings today`, `TT-128`).

**Examples:**

| Input | Language | Detail | Focus |
|-------|----------|--------|-------|
| *(empty)* | en | standard | — |
| `vi brief` | vi | brief | — |
| `en standard` | en | standard | — |
| `bilingual full` | bilingual | full | — |
| `vi brief focus on Travis email` | vi | brief | focus on Travis email |

If language or detail is omitted, use defaults.

---

## Step 1 — Load Runtime

Read and follow `runtime/41_Morning_Runtime.md` exactly.

Never skip Runtime 41.

Apply the supporting engines only as Runtime 41 directs:

- `runtime/46_Context_Engine.md` — select relevant context, discard noise
- `runtime/48_Reasoning_Engine.md` — structured prioritisation and recommendations
- `runtime/49_Evolution_Engine.md` — capture learning at the end (full mode only, or one line in standard if a pattern is obvious)

## Step 2 — Load Knowledge

Load only the required handbooks:

- `handbook/01_Work_Context.md`
- `handbook/03_Daily_Workflow.md`
- `handbook/10_Morning_Brief.md`
- `handbook/11_Standup.md`

Load conditional handbooks (20, 30, 31, 36, ...) only when Runtime 41 requires deeper analysis.

## Step 3 — Collect Live Context

Gather from available sources:

- Calendar
- Outlook
- Jira
- Microsoft Teams
- Confluence
- Leave tracker / team availability
- Current conversation
- User focus context from `$ARGUMENTS` (after stripping language/detail tokens)

If a source is unavailable, note it **once** in Context Status (standard/full) or fold into Risks / Unknowns (brief).

Never invent live status.

Do not over-explain connector limitations.

Do not repeatedly recommend "connect Jira".

## Step 4 — Execute

Run the Runtime 41 workflow internally:

1. Check team availability
2. Review calendar
3. Review Jira
4. Review communication
5. Identify priorities (respect user focus context)
6. Identify blockers and risks
7. Prepare stand-up
8. Suggest execution plan

Check every Decision Gate in Runtime 41 before producing output.

## Step 5 — Produce Output

Format using `templates/morning-brief.md`.

Apply the selected **language** and **detail** mode.

### brief

- Maximum **8 bullets total** across the entire output (section headings do not count).
- No long explanations.
- Only show what matters today.
- Use the strict brief format in the template.
- Sections: Today's Mission, Top 3 Priorities, Risks / Unknowns, Stand-up Draft, First Action.

### standard

- Maximum **6 sections**.
- Each section maximum **3 bullets** (Stand-up Draft may use Yesterday / Today / Blockers lines instead of bullets).
- Use the strict standard format in the template.
- Sections: Context Status, Today's Mission, Top Priorities, Risks / Unknowns, Stand-up Draft, Action Plan.

### full

- Complete Runtime-style report.
- Include Context Budget, loaded sources, not loaded sources, confidence, and detailed reasoning.
- Use the full format in the template.

### Structure Rules (all modes)

- Put the most important item first.
- Separate Facts, Inferences, and Unknowns only when useful.
- Recommend; I decide.
- No unsupported assumptions, no duplicated information.

## Step 6 — Capture Learning

**full:** Identify recurring patterns worth adding to the Operating System. Recommend only. Do not update handbooks automatically.

**standard:** One-line learning note only if a clear pattern exists; otherwise omit.

**brief:** Omit learning section entirely.
