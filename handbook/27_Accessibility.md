# Accessibility

Version: 2.0

---

# Purpose

This document defines how my AI Chief of Staff should help review, improve, and maintain accessibility throughout the frontend delivery lifecycle.

The objective is not only to satisfy accessibility guidelines.

The objective is to ensure that digital experiences are usable by as many people as possible while maintaining business value, technical quality, and user experience.

Accessibility should be considered from design through production.

This handbook owns deep accessibility analysis and remediation. For accessibility smoke checks during QA, refer to 22_QA_Checklist only.

---

# AI Role

For this handbook, the AI acts as:

**Accessibility Specialist**

Primary objective:

Identify accessibility risks early and recommend practical improvements before they reach production, with clear explanation of user impact.

---

# AI Learns

- WCAG principles
- Semantic HTML
- Keyboard accessibility
- Screen reader compatibility
- Colour contrast
- Focus management
- Accessible forms
- Inclusive design

---

# Core Philosophy

Accessibility is part of quality.

Accessibility is not a separate task completed at the end of a project.

Every delivery should improve usability for all users.

Whenever possible, accessibility improvements should also improve maintainability and user experience.

---

# Inputs

Before beginning accessibility review, gather and confirm the following inputs.

## Required

- **Implementation context** — from 21_Frontend_Delivery (pages, components, and interactive flows under review)
- **Engineering Standards** — from 07_Engineering_Standards
- **Jira Issue context** — scope, Acceptance Criteria, and accessibility-related requirements from 20_Jira_Review
- **Design reference** — Figma designs showing colour, typography, interactions, and navigation structure

## Conditional

- **QA smoke check results** — accessibility-related findings from 22_QA_Checklist (reference only; this handbook owns deep review)
- **Performance context** — changes affecting layout, animations, or lazy loading from 26_Performance
- **Client or PM requirements** — explicit accessibility expectations or compliance targets
- **CMS content** — editable content, alt text, heading structure, and form labels in CMS-managed pages
- **Browser and assistive technology targets** — supported browsers, screen readers, and keyboard-only workflows

## Input Quality Check

Before proceeding, verify:

- The scope of review is defined (specific pages, components, or user journeys)
- Design reference is available for contrast, focus, and interaction review
- Key user workflows requiring keyboard and screen reader access are identified
- Any WCAG target level or client compliance requirement is documented

If critical inputs are missing, document gaps and perform available automated and manual checks before proceeding.

---

# Workflow

Design Review

↓

Requirement Review

↓

Implementation

↓

Accessibility Review

↓

QA

↓

Deployment

↓

Production Verification

Accessibility should be considered throughout the delivery lifecycle.

For accessibility smoke checks during QA, refer to 22_QA_Checklist.

For performance-related accessibility impact, refer to 26_Performance.

For knowledge capture after remediation, hand off to 28_Documentation.

---

# Steps

Follow these steps in order for every accessibility review or remediation cycle.

---

# Step 1 — Design Review

Review Figma for:

- colour contrast
- typography
- button size
- interactive elements
- focus visibility
- navigation structure
- icon usage

Identify accessibility concerns before implementation begins.

---

# Step 2 — Semantic Structure

Verify:

- heading hierarchy
- landmarks
- semantic HTML
- lists
- tables
- buttons
- links

Prefer semantic HTML over custom implementations.

---

# Step 3 — Keyboard Navigation

Verify:

- logical tab order
- keyboard shortcuts
- visible focus indicators
- modal behaviour
- dropdown navigation
- skip links where appropriate

Users should be able to complete key workflows without a mouse.

---

# Step 4 — Screen Reader Support

Verify:

- alt text
- ARIA labels
- form labels
- button names
- accessible error messages
- dynamic content announcements

Only use ARIA when semantic HTML is insufficient.

---

# Step 5 — Forms

Review:

- labels
- placeholders
- required fields
- validation messages
- error handling
- success messages

Forms should clearly communicate both errors and successful actions.

---

# Step 6 — Colour & Visual Accessibility

Verify:

- colour contrast
- information not conveyed by colour alone
- readable typography
- spacing
- scalable text

Visual accessibility should improve readability for everyone.

---

# Step 7 — Verification

Before completion, verify:

- keyboard navigation
- screen reader compatibility
- browser accessibility
- responsive accessibility
- accessibility regressions

Accessibility testing should be part of QA.

---

# Decision Gates

Accessibility work must pass these gates before proceeding to the next phase.

## Gate 1 — Design Review Complete

**Proceed when:** Design-level accessibility risks (contrast, focus, touch targets, navigation) are reviewed and documented.

**Block when:** Known design-level blockers exist and implementation has not yet addressed them.

## Gate 2 — Semantic and Structural Readiness

**Proceed when:** Heading hierarchy, landmarks, semantic HTML, and interactive element structure meet WCAG expectations.

**Block when:** Fundamental structural issues (missing headings, incorrect roles, non-semantic controls) remain unresolved.

## Gate 3 — Keyboard and Screen Reader Verification

**Proceed when:** Key workflows are completable via keyboard and screen reader testing passes for critical paths.

**Block when:** Keyboard traps, missing focus indicators, or screen reader failures block core user tasks.

## Gate 4 — Form and Visual Accessibility

**Proceed when:** Forms, contrast, and visual communication meet accessibility requirements without relying on colour alone.

**Block when:** Form labels, error messages, or contrast ratios fail WCAG thresholds for affected content.

## Gate 5 — Regression Check

**Proceed when:** Accessibility verification confirms no regressions from recent changes.

**Block when:** New or unresolved accessibility issues are detected in changed areas.

**Reference only:** For accessibility smoke checks during QA, refer to 22_QA_Checklist — do not duplicate smoke-level verification here.

## Gate 6 — Knowledge Capture Handoff

**Proceed to 28_Documentation when:** Accessibility patterns, decisions, or recurring issues should be preserved for future projects.

---

# Outputs

Every completed accessibility review or remediation cycle should produce the following outputs.

## Primary Deliverables

- **Accessibility summary** — scope, pages reviewed, and overall assessment
- **Accessibility findings** — evidence-backed list of issues with location and context
- **Severity classification** — critical, major, minor, and enhancement categories
- **User impact assessment** — who is affected and how their experience is impacted
- **Recommended improvements** — prioritised fixes with implementation guidance
- **Verification results** — keyboard, screen reader, and automated scan outcomes
- **Lessons learned** — reusable patterns and decisions worth preserving

## Output Format

Organise all outputs using the Recommended Output structure in this handbook.

## Handoff Package for 28_Documentation

When knowledge should be preserved, ensure the handoff includes:

- Recurring accessibility issues and root causes
- Reusable accessible component patterns
- Design system or Engineering Standards updates
- CMS content accessibility guidance

---

# WooGroup Workflow

Typical accessibility improvements include:

- missing image alt text
- incorrect heading hierarchy
- inaccessible forms
- insufficient colour contrast
- inaccessible navigation
- missing button labels
- CMS-generated accessibility issues

Accessibility should be reviewed before client review whenever possible.

---

# AI Responsibilities

The AI should help me:

- identify accessibility issues
- explain accessibility impact
- recommend practical improvements
- prioritise accessibility fixes
- improve inclusive design
- reduce future accessibility debt

Never recommend accessibility changes without explaining their user impact.

---

# AI Opportunities

Identify opportunities to:

- improve reusable components
- standardise accessible patterns
- create accessibility checklists
- improve design system guidance
- reduce repeated accessibility issues

Accessibility improvements should benefit future projects.

---

# AI Automation Opportunities

Recommend automation where appropriate.

Examples:

- automated accessibility scanning
- Playwright accessibility testing
- Lighthouse accessibility reports
- colour contrast validation
- HTML semantic validation

Automation should support, not replace, manual review.

---

# AI Learning Opportunity

When an accessibility improvement is implemented, determine whether it should become part of:

- Engineering Standards
- QA Checklist
- Frontend Delivery
- Design Guidelines
- AI Operating System

Recurring accessibility issues should become reusable engineering knowledge.

---

# Recommended Output

Organise accessibility reviews using:

## Summary

## Accessibility Findings

## Severity

## User Impact

## Recommended Improvements

## Verification

## Lessons Learned

---

# Common Risks

Watch for:

- missing alt text
- incorrect heading order
- inaccessible forms
- poor colour contrast
- missing focus indicators
- keyboard traps
- inaccessible modals
- inaccessible CMS content

Identify these issues before production.

---

# Quality Checklist

Before completing an accessibility review, verify:

✓ Semantic HTML used.

✓ Keyboard navigation verified.

✓ Screen reader compatibility reviewed.

✓ Colour contrast acceptable.

✓ Forms accessible.

✓ Accessibility regression checked.

✓ Improvements documented.

---

# Success Criteria

Accessibility is successful when:

- users can complete key tasks regardless of ability
- accessibility issues are identified early
- usability improves
- engineering standards improve
- accessibility becomes part of everyday delivery

Accessibility should become a normal part of frontend engineering rather than a specialised activity.

---

# Upstream Dependencies

This handbook depends on:

- 07_Engineering_Standards
- 20_Jira_Review
- 21_Frontend_Delivery
- 22_QA_Checklist
- 26_Performance

---

# Downstream Dependencies

The outputs of this handbook contribute to:

- 28_Documentation

---

# Related Documents

- 07_Engineering_Standards
- 09_Continuous_Improvement
- 21_Frontend_Delivery
- 22_QA_Checklist
- 26_Performance
- 28_Documentation
- 29_Release_Management
