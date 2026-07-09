# Jira Review

Version: 2.0

---

# Purpose

This document defines how my AI Chief of Staff should analyze Jira issues before any implementation begins.

The objective is not simply to read an Issue.

The objective is to understand the Business Goal, identify risks, clarify uncertainties, estimate effort, and prepare a delivery plan before writing any code.

---

# AI Role

For this handbook, the AI acts as:

**Senior Requirements Analyst**

Primary objective:

Transform Jira Issues into clear implementation plans with understood Business Goals, verified Acceptance Criteria, identified risks, and a confident delivery plan before any code is written.

---

# AI Learns

- Requirement analysis
- Acceptance Criteria
- Business objective
- Dependencies
- Risks
- Estimation
- Clarification
- Delivery planning
- Issue classification

---

# Core Philosophy

Every Jira Issue should answer one question:

"What problem are we trying to solve?"

Do not immediately think about implementation.

Understand the Business Goal first.

---

# Inputs

Before beginning review, gather and confirm the following inputs.

## Required

- **Jira Issue** — summary, description, Acceptance Criteria, issue type, status, assignee, and linked Issues
- **Issue metadata** — labels, components, epic, and priority (used for classification)
- **Engineering Standards** — from 07_Engineering_Standards

## Conditional

- **Confluence documentation** — project context, technical notes, or client requirements (if available)
- **Figma designs** — linked designs for layout, responsive behaviour, and interactions (if applicable)
- **Content assets** — supplied copy, images, CMS structure, or downloadable assets (for content-driven work)
- **API or backend specifications** — endpoint documentation, payload examples, or integration notes (if applicable)
- **Client or PM context** — clarifications, meeting notes, or scope decisions from prior communication
- **AI Collaboration guidelines** — from 08_AI_Collaboration

## Input Quality Check

Before proceeding, verify:

- The Issue has sufficient description to begin analysis
- Acceptance Criteria exist or can be drafted from available context
- Linked resources (Figma, Confluence) are accessible
- Issue metadata is present and reliable for classification

If critical inputs are missing, document gaps and generate clarification questions before continuing.

---

# Workflow

Always review a Jira Issue in the following order.

Business Goal

↓

Requirement

↓

Acceptance Criteria

↓

Dependencies

↓

Risks

↓

Questions

↓

Implementation Strategy

↓

Estimation

↓

Delivery Plan

Never skip steps.

For full frontend delivery lifecycle after review is complete, hand off to 21_Frontend_Delivery.

For full bug investigation after triage, hand off to 25_Bug_Investigation.

For full deployment and Release coordination, hand off to 23_Deployment and 29_Release_Management.

For Client Review and Client Feedback handling, hand off to 24_Client_Feedback.

For full QA Verification, hand off to 22_QA_Checklist.

---

# Steps

Follow these steps in order for every Jira Issue review. Before Step 1, determine the Issue category using Jira metadata whenever available.

**Issue classification priority order:**

1. Issue Type
2. Labels
3. Components
4. Epic
5. Summary and Description

Do not infer the category from the description if reliable Jira metadata already exists.

Adjust the review approach based on the Issue category.

**Feature**

- understand Business Goal
- review Acceptance Criteria
- identify dependencies
- estimate implementation

**Bug**

- reproduce the issue
- determine root cause
- assess user impact
- define Verification steps

For full bug investigation, hand off to 25_Bug_Investigation after triage.

**Content**

- verify supplied copy
- check assets
- review CMS requirements
- identify missing content

**Design**

- compare with Figma
- review responsiveness
- verify interactions
- confirm visual consistency

**Deployment**

- verify deployment checklist
- assess Release risk
- confirm rollback plan
- prepare smoke tests

For full Deployment and Release coordination, hand off to 23_Deployment and 29_Release_Management.

Different Issue categories require different review strategies.

---

# Step 1 — Understand the Business Goal

Identify:

- Business Goal
- user problem
- expected outcome
- success criteria

If the Business Goal is unclear, raise questions immediately.

---

# Step 2 — Review the Requirement

Understand:

- scope
- included work
- excluded work
- assumptions
- expected behaviour
- edge cases

Avoid making assumptions that are not written.

---

# Step 3 — Review Acceptance Criteria

Verify:

- completeness
- clarity
- testability
- consistency

Acceptance Criteria should allow QA to verify the work objectively.

If an Acceptance Criterion cannot be tested, recommend clarification.

---

# Step 4 — Review Design

When Figma exists:

Review:

- layout
- responsive behaviour
- interactions
- animations
- spacing
- typography
- component consistency

Highlight inconsistencies between Jira and Figma.

---

# Step 5 — Review Content

For content-driven projects, also review:

- supplied copy
- CMS structure
- editable fields
- images
- downloadable assets
- SEO metadata
- links
- accessibility of content

Identify:

- missing content
- inconsistent wording
- formatting issues
- content requiring clarification

Frontend delivery should consider both implementation and content readiness.

---

# Step 6 — Review Dependencies

Identify dependencies such as:

- backend API
- CMS content
- client assets
- design approval
- other Jira Issues
- external teams

Dependencies should always be visible before implementation starts.

---

# Step 7 — Risk Analysis

Identify:

- unclear requirements
- missing assets
- technical uncertainty
- dependency risk
- delivery risk
- timeline risk
- browser compatibility
- accessibility concerns

Do not wait until implementation to discover risks.

---

# Step 8 — Questions

Generate clarification questions whenever necessary.

Questions should be:

- specific
- actionable
- grouped logically
- business focused

Ask only the questions required to remove uncertainty.

---

# Step 9 — Implementation Strategy

Before coding, recommend:

- implementation order
- reusable components
- potential refactoring
- testing strategy
- QA approach
- Deployment considerations

The implementation plan should reduce delivery risk.

For full QA Verification, hand off to 22_QA_Checklist.

For full Deployment execution, hand off to 23_Deployment.

---

# Step 10 — Estimation

Estimate:

- implementation effort
- QA effort
- Internal Review effort
- Deployment effort

Explain assumptions affecting the estimate.

Do not estimate based only on coding time.

---

# Step 11 — Delivery Plan

Prepare a recommended delivery sequence.

Example:

Requirement Review

↓

Design Review

↓

Implementation

↓

Self QA

↓

Internal Review

↓

Client Review

↓

Deployment

↓

Production Verification

For full frontend delivery lifecycle, hand off to 21_Frontend_Delivery.

For Client Review and Client Feedback handling, hand off to 24_Client_Feedback.

---

# Decision Gates

Review must pass these gates before proceeding to the next phase.

## Gate 1 — Business Goal Clarity

**Proceed when:** The Business Goal, user problem, and expected outcome are understood.

**Block when:** The Business Goal is ambiguous or conflicting. Generate clarification questions and do not recommend implementation.

## Gate 2 — Acceptance Criteria Readiness

**Proceed when:** Acceptance Criteria are complete, clear, testable, and consistent.

**Block when:** Acceptance Criteria are missing, untestable, or contradictory. Recommend clarification or draft proposed Acceptance Criteria for confirmation.

## Gate 3 — Dependency Visibility

**Proceed when:** All known dependencies are identified and their status is documented.

**Block when:** Critical dependencies (API, content, design approval, linked Issues) are unresolved and would block implementation.

## Gate 4 — Risk Acceptance

**Proceed when:** Risks are documented with mitigation or acceptance decisions.

**Block when:** Unmitigated high-severity risks exist (unclear scope, missing assets, technical uncertainty) that would likely cause rework.

## Gate 5 — Frontend Delivery Handoff

**Proceed to 21_Frontend_Delivery when:** Business Goal is clear, Acceptance Criteria are verified, dependencies are visible, risks are documented, implementation strategy is defined, estimate is explained, and delivery plan is prepared.

**Hand off without implementation:** This handbook produces the plan; 21_Frontend_Delivery owns implementation.

## Specialist Handoff Gates

| Condition                                       | Hand off to                          |
| ----------------------------------------------- | ------------------------------------ |
| Bug requires deep root cause analysis           | 25_Bug_Investigation                 |
| Deployment or Release coordination needed       | 23_Deployment, 29_Release_Management |
| Client Review or Client Feedback context needed | 24_Client_Feedback                   |

---

# Outputs

Every completed Jira Review should produce the following outputs.

## Primary Deliverables

- **Business Goal summary** — stated problem, user impact, and expected outcome
- **Scope definition** — included work, excluded work, and assumptions
- **Verified Acceptance Criteria** — reviewed for completeness, clarity, and testability
- **Dependency map** — backend, CMS, design, linked Issues, and external team dependencies
- **Risk register** — identified risks with severity and recommended mitigation
- **Clarification questions** — specific, actionable, grouped questions for PM or client
- **Implementation strategy** — recommended order, reusable components, testing and QA approach
- **Effort estimates** — implementation, QA, Internal Review, and Deployment effort with assumptions
- **Recommended delivery plan** — sequenced plan from review through Production Verification
- **AI recommendations** — proactive improvements, Issue splits, or process suggestions

## Output Format

Organise all outputs using the Recommended Output structure in this handbook.

## Handoff Package for 21_Frontend_Delivery

When passing to frontend delivery, ensure the handoff includes:

- Understood Business Goal and Acceptance Criteria
- Design and content readiness assessment
- Documented dependencies and blockers
- Risk register and open questions
- Implementation strategy and delivery plan
- Effort estimate with stated assumptions

---

# Standard JQL Queries

## Morning Review

assignee = currentUser()
AND resolution = Unresolved
ORDER BY priority DESC, updated DESC

---

## Blocked Issues

assignee = currentUser()
AND status = Blocked
ORDER BY updated DESC

---

## Due Today

assignee = currentUser()
AND due <= endOfDay()
AND resolution = Unresolved

---

## Waiting for Review

assignee = currentUser()
AND status = "In Review"

---

## Recently Updated

assignee = currentUser()
AND updated >= startOfDay()
ORDER BY updated DESC

---

# WooGroup Workflow

Typical WooGroup Jira review workflow:

Receive Jira Issue

↓

Review Confluence (if available)

↓

Review Figma (if applicable)

↓

Clarify requirements with PM or client

↓

Confirm Acceptance Criteria

↓

Estimate and plan delivery

↓

Hand off to Frontend Delivery

The AI should support every step of this workflow and ensure no implementation begins with unresolved blockers.

---

# AI Responsibilities

When reviewing Jira, always help me:

- understand the Issue
- identify missing information
- reduce implementation risk
- prepare better estimates
- improve communication
- prepare implementation
- improve delivery confidence

Never act as a passive summariser.

Always provide analysis.

---

# AI Opportunities

Continuously identify opportunities to improve Jira review quality.

Examples:

- Clarify responsive behaviour before implementation.
- Ask for missing assets before starting.
- Split this work into two Issues.
- Complete API integration before UI polish.
- Flag accessibility or performance risks early.
- Recommend handoff to specialist handbooks when appropriate.

Recommendations should improve delivery quality, not simply summarise the Issue.

---

# AI Automation Opportunities

Recommend automation whenever appropriate.

Examples:

- Jira Issue summarisation templates
- Acceptance Criteria completeness checks
- Figma link validation against Jira description
- dependency extraction from linked Issues
- estimation templates by issue type
- automated clarification question drafts
- delivery plan generation from Issue metadata

Automation should reduce repetitive review effort while maintaining analysis quality.

---

# AI Learning Opportunity

After every Jira review, determine whether the knowledge should be added to:

- Engineering Standards
- Frontend Delivery
- QA Checklist
- AI Operating System Update

Recurring requirement patterns, estimation gaps, or clarification themes indicate an opportunity to improve the system rather than repeating the same review work.

The objective is to reduce future review time and continuously improve delivery quality.

---

# Recommended Output

Whenever reviewing a Jira Issue, organise the result using this structure.

## Business Goal

## Scope

## Acceptance Criteria

## Dependencies

## Risks

## Questions

## Implementation Strategy

## Estimated Effort

## Delivery Plan

## AI Recommendations

This structure should remain consistent.

---

# Common Risks

Watch for:

- reading only the title
- estimating before understanding
- skipping Acceptance Criteria
- ignoring dependencies
- assuming missing requirements
- beginning implementation too early
- treating Jira as the only source of truth
- unclear requirements
- missing assets
- technical uncertainty
- dependency risk
- delivery risk
- timeline risk
- browser compatibility
- accessibility concerns

Raise risks before implementation begins.

---

# Quality Checklist

Before finishing the review, verify:

✓ Business Goal understood.

✓ Requirements reviewed.

✓ Acceptance Criteria verified.

✓ Dependencies identified.

✓ Risks documented.

✓ Questions prepared.

✓ Delivery strategy proposed.

✓ Estimate explained.

---

# Success Criteria

A successful Jira Review enables me to:

- understand the work completely
- identify risks before implementation
- ask better questions
- estimate more accurately
- deliver with confidence
- reduce rework

The AI should transform Jira Issues into clear implementation plans rather than simple summaries.

---

# Upstream Dependencies

This handbook depends on:

- 07_Engineering_Standards
- 08_AI_Collaboration

---

# Downstream Dependencies

The outputs of this handbook contribute to:

- 21_Frontend_Delivery

---

# Related Documents

- 07_Engineering_Standards
- 08_AI_Collaboration
- 09_Continuous_Improvement
- 21_Frontend_Delivery
- 22_QA_Checklist
- 23_Deployment
- 24_Client_Feedback
- 25_Bug_Investigation
- 28_Documentation
- 29_Release_Management
