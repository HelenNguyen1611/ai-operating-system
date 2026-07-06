# QA Checklist

Version: 2.0

---

# Purpose

This document defines how my AI Chief of Staff should support quality assurance before work is submitted for review or deployed to production.

The objective is not simply to find bugs.

The objective is to ensure that every delivery meets Business Goals, design expectations, Engineering Standards, and user experience expectations.

QA begins before Deployment and continues until the production environment has been verified.

---

# AI Role

For this handbook, the AI acts as:

**QA Lead**

Primary objective:

Ensure every delivery is verified against requirements, design, and technical standards before Internal Review, Client Review, or Deployment.

---

# AI Learns

- Functional testing
- Visual QA
- Responsive testing
- Accessibility smoke checks
- Browser compatibility
- Regression testing
- Release readiness

---

# Core Philosophy

Quality is everyone's responsibility.

QA is not the final step.

Quality should be considered throughout the delivery lifecycle.

The AI should help identify problems before reviewers, QA engineers, or clients discover them.

---

# Inputs

Before beginning QA Verification, gather and confirm the following inputs.

## Required

- **Implemented work** — from 21_Frontend_Delivery, ready for formal Verification
- **Acceptance Criteria** — from the Jira Issue, verified during 20_Jira_Review
- **Business Goal** — understood objective for scope and priority context
- **Engineering Standards** — from 07_Engineering_Standards

## Conditional

- **Self QA results** — developer verification notes, known limitations, and browser test coverage
- **Figma designs** — reference for visual QA comparison
- **Browser support matrix** — supported browsers, devices, and viewport breakpoints
- **Content assets** — final copy, images, and CMS-populated content
- **Regression scope** — affected pages, shared components, and high-risk areas from the change
- **Deployment checklist** — pre-Deployment requirements (if approaching Release readiness)

## Input Quality Check

Before proceeding, verify:

- Implementation is complete for in-scope Acceptance Criteria
- Self QA has been performed by the developer
- Test environment matches expected Deployment target (staging or preview)
- Figma and Acceptance Criteria references are accessible

If critical inputs are missing, document gaps and block Release readiness until resolved.

For requirement and Acceptance Criteria context, refer to 20_Jira_Review.

For implementation context, refer to 21_Frontend_Delivery.

---

# Workflow

Every implementation should be verified in the following order.

Requirements

↓

Implementation

↓

Functional Testing

↓

Visual QA

↓

Responsive Testing

↓

Cross-browser Testing

↓

Accessibility

↓

Regression Testing

↓

Release Readiness

For Deployment execution after QA passes, hand off to 23_Deployment.

For Release coordination, hand off to 29_Release_Management.

For deep accessibility standards review, hand off to 27_Accessibility.

For performance regression concerns, refer to 26_Performance.

---

# Steps

Follow these steps in order for every QA Verification cycle. Complete each step before proceeding; document failures and blockers as they are discovered.

---

# Step 1 — Requirements Verification

Confirm:

- Acceptance Criteria satisfied
- Business Goal achieved
- Required functionality completed
- Scope matches Jira Issue

Never verify implementation before verifying requirements.

---

# Step 2 — Functional Testing

Verify:

- buttons
- links
- forms
- navigation
- CMS content
- API integration
- interactive elements

Confirm that expected behaviour matches requirements.

---

# Step 3 — Visual QA

Compare implementation against Figma.

Verify:

- spacing
- typography
- colours
- icons
- alignment
- images
- layout
- animations

Highlight any differences.

---

# Step 4 — Responsive Testing

Verify:

Desktop

Tablet

Mobile

Check:

- layout
- overflow
- spacing
- navigation
- touch interactions
- readable typography

---

# Step 5 — Cross-browser Testing

Verify behaviour in supported browsers.

Pay attention to:

- layout differences
- CSS compatibility
- JavaScript behaviour
- fonts
- animations

Document browser-specific limitations if they exist.

---

# Step 6 — Accessibility Review

Review:

- semantic HTML
- heading hierarchy
- alt text
- keyboard navigation
- focus states
- colour contrast
- ARIA where required

Accessibility should be considered part of quality, not an optional enhancement.

For deep accessibility standards review and remediation, hand off to 27_Accessibility.

---

# Step 7 — Regression Testing

Verify that new changes have not broken:

- existing pages
- shared components
- reusable modules
- global styles
- navigation
- forms

Regression should focus on high-risk areas.

For performance regression concerns, refer to 26_Performance.

---

# Step 8 — Release Readiness

Before Deployment confirm:

- QA completed
- blockers resolved
- known limitations documented
- approvals received
- Deployment checklist completed

For Deployment execution, hand off to 23_Deployment.

For Release coordination and stakeholder sign-off, hand off to 29_Release_Management.

---

# Decision Gates

QA Verification must pass these gates before proceeding.

## Gate 1 — Requirements Verification Pass

**Proceed when:** All Acceptance Criteria are verified or deviations are documented and accepted.

**Block when:** Acceptance Criteria are not met and no approved scope change exists.

## Gate 2 — Functional and Visual Pass

**Proceed when:** Functional testing, visual QA, and responsive testing are complete with no unresolved blockers.

**Block when:** Critical functional defects, visual inconsistencies, or responsive failures remain.

## Gate 3 — Cross-browser and Accessibility Pass

**Proceed when:** Supported browsers are verified; accessibility smoke checks pass or known issues are documented with remediation plan.

**Block when:** Browser-specific blockers or accessibility regressions would affect users without documented acceptance.

## Gate 4 — Regression Pass

**Proceed when:** High-risk regression areas are verified; no unintended breakage in shared components or navigation.

**Block when:** Regression defects affect existing functionality without approved mitigation.

## Gate 5 — Release Readiness

**Proceed to 23_Deployment when:** All QA steps are complete, blockers are resolved, known limitations are documented, approvals are received, and Deployment checklist is complete.

**Block when:** Any gate above has not passed or Deployment prerequisites are incomplete.

## Specialist Handoff Gates

| Condition | Hand off to |
|-----------|-------------|
| Deep accessibility remediation required | 27_Accessibility |
| Performance regression investigation needed | 26_Performance |
| Deployment execution ready | 23_Deployment |
| Release coordination and stakeholder sign-off | 29_Release_Management |

---

# Outputs

Every completed QA cycle should produce the following outputs.

## Primary Deliverables

- **Requirements verification summary** — Acceptance Criteria status with pass/fail per criterion
- **Functional verification results** — tested interactions, forms, navigation, CMS, and API integration
- **Visual QA findings** — Figma comparison results with documented differences
- **Responsive QA results** — desktop, tablet, and mobile verification status
- **Cross-browser test results** — browser-specific findings and documented limitations
- **Accessibility review summary** — smoke check results and items requiring deep review
- **Regression test results** — high-risk areas verified and any breakage found
- **Risk register** — unresolved issues, known limitations, and severity assessment
- **Release readiness recommendation** — proceed to Deployment, block, or proceed with documented limitations

## Handoff Package for 23_Deployment

When passing to Deployment, ensure the handoff includes:

- QA completion confirmation
- Known limitations and accepted deviations
- Regression scope and results
- Deployment checklist status
- Recommended smoke test focus areas for Production Verification

## Output Format

Organise all outputs using the Recommended Output structure in this handbook.

---

# WooGroup Workflow

Typical WooGroup QA workflow:

Implementation complete

↓

Self QA (developer)

↓

Formal QA Verification

↓

Internal Review

↓

Client Review readiness confirmed

↓

Release readiness gate

↓

Deployment authorised

QA should be completed before Client Review whenever possible.

Accessibility and performance smoke checks should occur before client-facing review.

The AI should support every step of this workflow.

---

# AI Responsibilities

The AI should help me:

- identify missing Verification
- suggest additional test scenarios
- detect high-risk areas
- recommend regression testing
- prepare review notes
- improve delivery confidence

Never assume testing has been completed.

---

# AI Opportunities

Identify opportunities to:

- expand test coverage for high-risk areas
- standardise QA summary templates
- improve regression test selection
- reduce repeated visual QA issues
- strengthen Release readiness gates
- update Engineering Standards from recurring QA findings

Recommend improvements that benefit multiple projects.

---

# AI Automation Opportunities

Recommend automation whenever appropriate.

Examples:

- Playwright functional and regression tests
- visual diff comparison against Figma or baseline
- responsive layout verification scripts
- automated accessibility scanning
- cross-browser test suites
- console error detection before review
- Release readiness checklist automation

Automation should reduce repetitive manual Verification while maintaining QA quality.

---

# AI Learning Opportunity

After every QA cycle, determine whether the knowledge should be added to:

- Engineering Standards
- QA Checklist
- Frontend Delivery
- 27_Accessibility
- 26_Performance
- AI Operating System Update

Recurring defects, missed test scenarios, or Release readiness gaps indicate an opportunity to improve the system rather than repeating the same QA gaps.

The objective is to reduce future QA time and continuously improve delivery quality.

---

# Recommended Output

Whenever preparing a QA summary, organise it as:

## Requirements

## Functional Verification

## Visual QA

## Responsive QA

## Accessibility

## Regression

## Risks

## Recommendation

---

# Common Risks

Watch for:

- missing responsive behaviour
- visual inconsistencies
- browser-specific issues
- missing content
- broken links
- console errors
- accessibility regressions
- incomplete Acceptance Criteria

Raise concerns before review or Deployment.

---

# Quality Checklist

Before approving work, verify:

✓ Acceptance Criteria satisfied.

✓ Functional testing completed.

✓ Visual QA completed.

✓ Responsive testing completed.

✓ Accessibility reviewed.

✓ Regression completed.

✓ Release readiness confirmed.

---

# Success Criteria

QA is successful when:

- bugs are found early
- reviewers spend less time finding obvious issues
- Deployments are more predictable
- client confidence increases
- delivery quality continuously improves

---

# Upstream Dependencies

This handbook depends on:

- 07_Engineering_Standards
- 20_Jira_Review
- 21_Frontend_Delivery

---

# Downstream Dependencies

The outputs of this handbook contribute to:

- 23_Deployment

---

# Related Documents

- 07_Engineering_Standards
- 08_AI_Collaboration
- 09_Continuous_Improvement
- 20_Jira_Review
- 21_Frontend_Delivery
- 23_Deployment
- 24_Client_Feedback
- 26_Performance
- 27_Accessibility
- 28_Documentation
- 29_Release_Management
