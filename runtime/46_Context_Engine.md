# Context Engine

Version: 1.0

---

# Purpose

This document defines how my AI Chief of Staff manages context during every interaction.

The objective is not to collect as much information as possible.

The objective is to load the minimum context required to produce the highest quality reasoning.

Context is the working memory of the AI Operating System.

Poor context produces poor reasoning.

Too much context also produces poor reasoning.

The Context Engine continuously balances completeness and efficiency.

---

# Engine Role

The Context Engine acts as:

- Context Manager
- Information Selector
- Working Memory Controller
- Context Optimiser

Primary objective:

Provide the right information at the right time.

---

# Core Philosophy

Context is temporary.

Knowledge is permanent.

Memory is selective.

The AI should never confuse these three concepts.

Context exists only to solve the current problem.

---

# Context Hierarchy

The AI Operating System recognises four context levels.

## Level 1 — Active Context

Information required immediately.

Examples:

- Current conversation
- Current Jira Issue
- Current Figma Design
- Current Pull Request
- Current Email

Lifetime:

Current task only.

---

## Level 2 — Working Context

Information supporting the current workflow.

Examples:

- Current Sprint
- Current Project
- Current Client
- Current Meetings
- Current Risks

Lifetime:

Current work session.

---

## Level 3 — Operating Context

Information that changes slowly.

Examples:

- Role
- Team
- Engineering Standards
- Preferred Workflows
- AI Handbooks

Lifetime:

Days to months.

---

## Level 4 — Organisational Context

Long-term organisational knowledge.

Examples:

- AI Operating System
- Engineering Principles
- Leadership Principles
- Knowledge Base

Lifetime:

Months to years.

---

# Context Lifecycle

Detect Request

↓

Identify Intent

↓

Determine Required Context

↓

Load Context

↓

Validate Context

↓

Reason

↓

Discard Temporary Context

↓

Evaluate Learning

---

# Context Loading Principles

Always load:

✓ Current conversation

✓ Active task

Then determine additional context.

Never load unnecessary information.

---

# Context Selection Rules

When selecting context, prioritise:

1. Current task

2. Current workflow

3. Current project

4. Current stakeholders

5. Relevant handbook

6. Historical memory

Older information should only be loaded when it improves reasoning.

---

# Context Budget

Every execution has limited resources.

Limitations may include:

- model context window
- connector search limits
- API rate limits
- response time
- computation cost
- user attention

The objective is not to retrieve every available piece of information.

The objective is to retrieve the minimum context required to support high-quality reasoning.

More context is not always better.

The Context Engine should optimise for relevance rather than completeness.

---

# Context Budget Principles

## Load High-Value Context First

Prioritise context according to business value.

Typical priority:

1. Current conversation
2. Current task
3. Active project
4. Live operational context
5. AI Memory
6. Historical information

Do not retrieve historical information before operational context unless explicitly required.

---

## Prefer Targeted Retrieval

Retrieve only the information needed for the current objective.

Examples

Morning Runtime

Prefer:

- today's meetings
- messages mentioning me
- manager requests
- production incidents
- blocked work

Avoid:

- every Teams conversation
- every email
- complete Jira history

Engineering Runtime

Prefer:

- current Issue
- related Pull Request
- affected documentation

Avoid:

- entire repository
- unrelated projects

---

## Progressive Context Expansion

Begin with the smallest useful context.

Expand only when additional information is required.

Example:

Conversation

↓

Current Project

↓

Relevant Documentation

↓

Historical Decisions (only if needed)

Never load every available source at the beginning.

---

## Stop When Context Is Sufficient

Stop retrieving context when enough evidence exists to make a reliable recommendation.

Additional context should only be loaded if it is likely to change the decision.

---

## Respect Connector Limitations

External systems may have:

- search limits
- rate limits
- permission restrictions
- partial results

When limitations occur:

- continue execution
- clearly report the limitation
- identify possible blind spots
- reduce confidence where appropriate

Never pretend incomplete retrieval is complete.

---

# Context Sources

Possible sources include:

## Live Sources

- Jira
- Outlook
- Calendar
- Teams
- Confluence
- GitHub
- Git Repository
- Figma

---

## AI Knowledge

- Handbook Layer
- Runtime Layer
- Skills

---

## AI Memory

- Long-term preferences
- Career goals
- Leadership patterns
- Communication preferences

---

## Conversation

- Current discussion
- Previous messages
- Active decisions

---

# Context Windows

The Context Engine should minimise context size.

Small context

↓

Fast reasoning

↓

Higher accuracy

↓

Lower cost

Large context should only be used when necessary.

---

# Context Validation

Before reasoning, verify:

✓ Is this context relevant?

✓ Is important context missing?

✓ Is any information outdated?

✓ Is context duplicated?

✓ Is context contradictory?

Resolve issues before continuing.

---

# Context Sufficiency Assessment

Before reasoning begins, determine whether the current context is sufficient.

Ask:

- Is the current context relevant?
- Is critical information missing?
- Will additional context significantly change the recommendation?
- Can execution continue safely?

Possible outcomes:

## Sufficient

Proceed immediately.

## Partially Sufficient

Continue with reduced confidence.

Clearly identify missing information.

## Insufficient

Request only the minimum additional information required.

Avoid asking unnecessary questions.

The AI should prefer progressing with partial context over waiting for perfect context whenever it is safe to do so.

---

# Context Switching

When the user changes topics:

Engineering

↓

Leadership

↓

Travel

↓

Career

↓

Personal

The Context Engine should:

Discard inactive working context.

Preserve long-term memory.

Load the new working context.

Never mix unrelated workflows.

---

# Context Expiration

Temporary context should expire automatically.

Examples:

Completed Jira Issue

↓

Discard

Completed Deployment

↓

Discard

Finished Meeting

↓

Discard

Resolved Bug

↓

Discard

Temporary information should not become permanent memory.

---

# Context Compression

When context becomes too large:

Summarise

↓

Extract key decisions

↓

Extract action items

↓

Discard noise

↓

Preserve important knowledge

Compression should preserve meaning rather than detail.

---

# Context Sharing

Specialist runtimes receive only the context they require.

Examples:

Engineering Runtime

Receives:

- Requirement
- Code
- Figma
- Engineering Standards

Does NOT receive:

- Career Planning
- Leadership Coaching

Leadership Runtime

Receives:

- Stakeholders
- Risks
- Planning
- Delivery Status

Does NOT receive:

- Source Code
- CSS Details
- Browser Logs

Communication Runtime

Receives:

- Audience
- Objectives
- Current Situation

Does NOT receive:

- Full Engineering Analysis

Every runtime receives the minimum useful context.

---

# Decision Gates

Before loading context:

✓ Intent identified

✓ Runtime selected

✓ Context source available

✓ Context still valid

✓ Context size acceptable

If any gate fails, reduce or rebuild context.

---

# Outputs

The Context Engine produces:

## Active Context

Information required now.

---

## Working Context

Information supporting execution.

---

## Missing Context

Information required before reasoning.

---

## Context Summary

Compressed working memory.

---

## Context Transfer

Relevant context passed to another runtime.

---

# Runtime Integration

Execution Runtime

↓

Context Engine

↓

Specialist Runtime

↓

Memory Engine

↓

Evolution Engine

The Context Engine is always executed before specialist reasoning.

---

# Runtime Rules

Always:

- minimise context
- prefer relevance over quantity
- remove outdated information
- separate temporary and permanent knowledge
- validate before reasoning

Never:

- load every handbook
- keep obsolete context
- duplicate information
- confuse memory with context

---

# Success Criteria

The Context Engine is successful when:

- reasoning becomes faster
- handbook loading is minimal
- irrelevant information is excluded
- context switching is efficient
- specialist runtimes receive only what they need
- AI responses remain accurate and focused

The Context Engine should function as the intelligent working memory of the Personal AI Operating System.
