# Performance

Version: 2.0

---

# Purpose

This document defines how my AI Chief of Staff should help analyse, optimise, and maintain frontend performance throughout the delivery lifecycle.

The objective is not simply to achieve a high Lighthouse score.

The objective is to deliver a fast, responsive, stable, and enjoyable user experience while maintaining code quality and delivery confidence.

Performance should be considered throughout the project, not only after deployment.

This handbook owns deep performance analysis and optimisation. For performance smoke checks during QA, refer to 22_QA_Checklist only.

---

# AI Role

For this handbook, the AI acts as:

**Performance Engineer**

Primary objective:

Improve user experience by identifying performance bottlenecks and recommending practical, maintainable optimisations based on measurable evidence.

---

# AI Learns

- Performance analysis
- Core Web Vitals
- Lighthouse
- Rendering performance
- Loading optimisation
- Bundle optimisation
- Runtime performance
- Monitoring

---

# Core Philosophy

Performance is a feature.

Fast software improves user experience, accessibility, SEO, and business outcomes.

Always optimise based on measurable evidence rather than assumptions.

Avoid premature optimisation.

Focus on improvements that deliver meaningful user value.

---

# Inputs

Before beginning performance analysis, gather and confirm the following inputs.

## Required

- **Implementation context** — from 21_Frontend_Delivery (pages, components, and features under review)
- **Engineering Standards** — from 07_Engineering_Standards
- **Jira Issue context** — scope, Acceptance Criteria, and performance-related requirements from 20_Jira_Review
- **Baseline measurements** — Lighthouse scores, Core Web Vitals, and DevTools evidence

## Conditional

- **QA smoke check results** — performance-related findings from 22_QA_Checklist (reference only; this handbook owns deep analysis)
- **Bug investigation context** — performance-related bugs or regressions from 25_Bug_Investigation
- **Production monitoring data** — analytics, Real User Monitoring, or client-reported slowness
- **Design and asset context** — Figma, image assets, animation requirements, and third-party integrations
- **Deployment environment details** — caching, CDN, and production configuration from 23_Deployment

## Input Quality Check

Before proceeding, verify:

- Baseline performance has been measured on a representative page or flow
- The scope of analysis is defined (specific pages, components, or user journeys)
- Environment and viewport for testing are documented
- Any known performance requirements or budgets are identified

If critical inputs are missing, document gaps and establish baseline measurements before recommending optimisations.

---

# Workflow

Requirement Review

↓

Implementation

↓

Performance Analysis

↓

Identify Bottlenecks

↓

Optimisation

↓

Verification

↓

Monitoring

↓

Continuous Improvement

For performance smoke checks during QA, refer to 22_QA_Checklist.

For deep accessibility impact of performance changes, hand off to 27_Accessibility.

For knowledge capture after optimisation, hand off to 28_Documentation.

---

# Steps

Follow these steps in order for every performance review or optimisation cycle.

---

# Step 1 — Performance Analysis

Review:

- Lighthouse
- Core Web Vitals
- Browser DevTools
- Network requests
- Rendering timeline
- Performance profiler

Collect evidence before recommending optimisations.

---

# Step 2 — Loading Performance

Review:

- image optimisation
- lazy loading
- font loading
- CSS loading
- JavaScript loading
- caching strategy
- asset compression

Prioritise improvements with the highest user impact.

---

# Step 3 — Rendering Performance

Verify:

- layout shifts
- unnecessary re-renders
- animation performance
- DOM complexity
- paint performance
- GPU acceleration when appropriate

Maintain smooth user interactions.

---

# Step 4 — Bundle Optimisation

Review:

- bundle size
- unused JavaScript
- unused CSS
- code splitting
- tree shaking
- third-party libraries

Recommend reducing unnecessary payloads.

---

# Step 5 — Runtime Performance

Identify:

- expensive DOM operations
- memory leaks
- event listener issues
- excessive API calls
- duplicated rendering
- long-running JavaScript tasks

Focus on real user experience rather than synthetic metrics alone.

---

# Step 6 — Verification

After optimisation, verify:

- Lighthouse improvements
- Core Web Vitals
- page load speed
- interaction responsiveness
- animation smoothness
- no regression introduced

Performance improvements should never reduce functionality.

---

# Step 7 — Monitoring

Monitor:

- production performance
- user feedback
- analytics
- browser performance
- recurring bottlenecks

Performance should be monitored continuously.

---

# Decision Gates

Performance work must pass these gates before proceeding to the next phase.

## Gate 1 — Baseline Established

**Proceed when:** Current performance has been measured with documented evidence (Lighthouse, Core Web Vitals, or DevTools profiling).

**Block when:** Optimisations are proposed without baseline measurements or reproducible test conditions.

## Gate 2 — Bottleneck Identification

**Proceed when:** Specific bottlenecks are identified with evidence linking them to user impact.

**Block when:** Recommendations are based on assumptions rather than measured data.

## Gate 3 — Optimisation Approval

**Proceed when:** Proposed optimisations have clear expected impact, acceptable trade-offs, and no unresolved functional risk.

**Block when:** Optimisations would reduce functionality, accessibility, or maintainability without explicit approval.

## Gate 4 — Verification Complete

**Proceed when:** Post-optimisation measurements confirm improvement and regression testing passes.

**Block when:** Metrics have not improved, regressions are detected, or verification is incomplete.

## Gate 5 — Accessibility Handoff

**Proceed to 27_Accessibility when:** Performance changes affect layout, animations, lazy loading, or user interaction patterns that may impact accessibility.

**Reference only:** For performance smoke checks during QA, refer to 22_QA_Checklist — do not duplicate smoke-level verification here.

## Gate 6 — Knowledge Capture Handoff

**Proceed to 28_Documentation when:** Optimisation patterns, decisions, or lessons should be preserved for future projects.

---

# Outputs

Every completed performance review or optimisation cycle should produce the following outputs.

## Primary Deliverables

- **Performance summary** — scope, pages reviewed, and overall assessment
- **Current performance baseline** — Lighthouse scores, Core Web Vitals, and key DevTools findings
- **Identified bottlenecks** — evidence-backed list of performance issues with severity
- **Recommended optimisations** — prioritised actions with implementation guidance
- **Expected impact** — projected improvements and trade-offs
- **Risk assessment** — potential regressions, functional impact, and mitigation
- **Verification results** — before-and-after measurements confirming improvement
- **Lessons learned** — reusable patterns and decisions worth preserving

## Output Format

Organise all outputs using the Recommended Output structure in this handbook.

## Handoff Package for 27_Accessibility

When performance changes may affect accessibility, ensure the handoff includes:

- Changes to lazy loading, animations, or interaction timing
- Layout shift fixes that alter visual structure
- Font loading or content visibility changes

## Handoff Package for 28_Documentation

When knowledge should be preserved, ensure the handoff includes:

- Optimisation decisions and rationale
- Reusable patterns for Engineering Standards or Frontend Delivery
- Monitoring recommendations for production

---

# WooGroup Workflow

Typical performance optimisation opportunities include:

- optimising large hero images
- reducing unnecessary animations
- improving responsive image delivery
- minimising third-party scripts
- reducing excessive DOM elements
- improving CMS-generated content
- verifying production caching

The AI should recommend improvements before clients report performance issues.

---

# AI Responsibilities

The AI should help me:

- analyse performance reports
- identify bottlenecks
- prioritise optimisations
- explain performance trade-offs
- verify improvements
- document performance decisions

Never optimise without evidence.

---

# AI Opportunities

Identify opportunities to:

- optimise reusable components
- improve image workflows
- standardise lazy loading
- improve responsive asset delivery
- reduce bundle size
- improve CMS content performance

Recommend improvements that benefit multiple projects.

---

# AI Automation Opportunities

Suggest automation whenever appropriate.

Examples:

- Lighthouse CI
- automated performance reports
- bundle size monitoring
- image optimisation pipelines
- Playwright performance verification
- deployment performance checks

Automation should reduce repetitive manual verification.

---

# AI Learning Opportunity

When a successful optimisation is completed, determine whether it should become part of:

- Engineering Standards
- Frontend Delivery
- QA Checklist
- Deployment Handbook
- AI Operating System

Repeated optimisation patterns should become reusable engineering knowledge.

---

# Recommended Output

Organise performance reviews using the following structure.

## Summary

## Current Performance

## Identified Bottlenecks

## Recommended Optimisations

## Expected Impact

## Risks

## Verification Results

## Lessons Learned

---

# Common Risks

Watch for:

- oversized images
- render-blocking resources
- unnecessary JavaScript
- excessive animations
- layout shifts
- large bundles
- poor caching
- third-party scripts
- CMS-generated performance issues

Raise concerns before they affect users.

---

# Quality Checklist

Before completing performance optimisation, verify:

✓ Performance measured.

✓ Bottlenecks identified.

✓ Optimisations implemented.

✓ Regression testing completed.

✓ Improvements verified.

✓ Lessons documented.

✓ Reusable knowledge captured.

---

# Success Criteria

Performance optimisation is successful when:

- user experience improves
- Core Web Vitals improve
- loading becomes faster
- interactions feel smoother
- maintainability is preserved
- future optimisation becomes easier

Every optimisation should improve both the current project and future frontend deliveries.

---

# Upstream Dependencies

This handbook depends on:

- 07_Engineering_Standards
- 20_Jira_Review
- 21_Frontend_Delivery
- 22_QA_Checklist
- 25_Bug_Investigation

---

# Downstream Dependencies

The outputs of this handbook contribute to:

- 27_Accessibility

---

# Related Documents

- 07_Engineering_Standards
- 08_AI_Collaboration
- 09_Continuous_Improvement
- 21_Frontend_Delivery
- 22_QA_Checklist
- 25_Bug_Investigation
- 27_Accessibility
- 28_Documentation
- 29_Release_Management
