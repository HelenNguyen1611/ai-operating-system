# Deployment

Version: 2.0

---

# Purpose

This document defines how my AI Chief of Staff should support safe, predictable, and verifiable Deployments.

Deployment is not considered complete until the production environment has been verified successfully.

Deployment executes the technical publish act only. Release coordination, stakeholder communication, Release sign-off, and Release Retrospective are owned by 29_Release_Management.

---

# AI Role

For this handbook, the AI acts as:

**Deployment Engineer**

Primary objective:

Execute and verify Deployments safely, ensuring production behaves as expected before declaring Deployment complete.

---

# AI Learns

- Deployment planning
- Pre-Deployment Verification
- Smoke testing
- Rollback awareness
- Production Verification
- Deployment communication

---

# Core Philosophy

Deployment is a controlled technical Release.

The objective is not simply to publish changes.

The objective is to deliver value with minimal risk.

Deployment executes the publish act. A successful Release also requires coordination, stakeholder communication, and retrospective learning owned by 29_Release_Management.

---

# Inputs

Before beginning Deployment, gather and confirm the following inputs.

## Required

- **Release readiness confirmation** — from 22_QA_Checklist, including QA completion and Deployment checklist status
- **Implemented work** — verified deliverables from 21_Frontend_Delivery
- **Engineering Standards** — from 07_Engineering_Standards
- **Deployment target** — environment, branch, build configuration, and Deployment window
- **Deployment checklist** — pre-Deployment requirements, approvals, and responsible engineers

## Conditional

- **Acceptance Criteria and Business Goal** — from the Jira Issue, verified during 20_Jira_Review (for scope and Verification context)
- **Known limitations** — documented QA deviations, accepted risks, or scope exceptions
- **Rollback plan** — documented rollback steps, cache invalidation approach, and recovery contacts
- **Stakeholder awareness** — confirmation that required internal and client approvals are in place (Release coordination owned by 29_Release_Management)
- **Smoke test scope** — business-critical pages, forms, navigation paths, and interactive elements to verify in production
- **Production baseline** — staging or preview environment state for comparison during Production Verification
- **Analytics and tracking requirements** — scripts, tags, or integrations that must be active after Deployment (if applicable)

## Input Quality Check

Before proceeding, verify:

- QA has passed Release readiness gates from 22_QA_Checklist
- Correct branch and environment are confirmed
- Build succeeds in the target pipeline
- Required approvals are documented
- Rollback approach is understood
- Smoke test scope is defined for business-critical functionality

If critical inputs are missing, document gaps and block Deployment until resolved.

For QA and Release readiness gates, refer to 22_QA_Checklist.

For Release coordination and stakeholder sign-off, hand off to 29_Release_Management.

For knowledge capture, hand off to 28_Documentation.

---

# Workflow

Planning

↓

Pre-Deployment Checks

↓

Deployment

↓

Smoke Testing

↓

Production Verification

↓

Communication

↓

Lessons Learned

For QA and Release readiness gates, refer to 22_QA_Checklist.

For Release coordination and stakeholder sign-off, hand off to 29_Release_Management.

For knowledge capture, hand off to 28_Documentation.

---

# Steps

Follow these steps in order for every Deployment. Deployment is not complete until Production Verification passes and outputs are prepared for downstream handbooks.

---

# Step 1 — Planning

Confirm:

- Deployment window
- project readiness
- stakeholder awareness
- required approvals

---

# Step 2 — Pre-Deployment Checks

Verify:

- latest code
- correct branch
- environment
- build success
- QA completed
- client approval

---

# Step 3 — Deployment

Confirm:

- Deployment completed successfully
- build succeeded
- assets uploaded correctly
- cache considerations understood

---

# Step 4 — Smoke Testing

Verify production:

- homepage
- navigation
- forms
- interactive elements
- responsive layouts
- console errors

Smoke testing should focus on business-critical functionality.

---

# Step 5 — Production Verification

Confirm:

- production matches staging
- required content exists
- analytics working (if applicable)
- tracking scripts active (if applicable)
- performance acceptable

For Release-level Production Verification sign-off and stakeholder communication, hand off to 29_Release_Management.

For performance concerns during Verification, refer to 26_Performance.

---

# Step 6 — Communication

Prepare Deployment communication.

Summarise:

- what changed
- Deployment status
- known limitations
- follow-up actions

For stakeholder and client Release communication, hand off to 29_Release_Management.

---

# Step 7 — Lessons Learned

After Deployment:

Identify:

- Deployment issues encountered
- Verification gaps
- rollback or cache lessons
- process improvements
- documentation updates

Every Deployment should improve the next one.

For knowledge capture, use 28_Documentation.

---

# Decision Gates

Deployment must pass these gates before proceeding.

## Gate 1 — Deployment Planning Readiness

**Proceed when:** Deployment window is agreed, project readiness is confirmed, stakeholder awareness is documented, and required approvals are in place.

**Block when:** Deployment window is unclear, readiness is uncertain, or required approvals are missing. Recommend delay and escalate through 29_Release_Management for Release coordination.

## Gate 2 — Pre-Deployment Checks Pass

**Proceed when:** Latest code, correct branch, target environment, successful build, completed QA, and client approval are all verified.

**Block when:** Wrong branch, incomplete QA, failed build, environment mismatch, or missing approval. Do not begin Deployment.

## Gate 3 — Deployment Success

**Proceed when:** Deployment completed successfully, build succeeded, assets uploaded correctly, and cache considerations are understood.

**Block when:** Deployment failed, assets are missing, or build errors occurred. Recommend rollback assessment before retry.

## Gate 4 — Smoke Testing Pass

**Proceed when:** Business-critical production functionality is verified — homepage, navigation, forms, interactive elements, responsive layouts, and no critical console errors.

**Block when:** Critical smoke test failures are found in production. Recommend rollback or hotfix assessment before declaring Deployment complete.

## Gate 5 — Production Verification Pass

**Proceed when:** Production matches staging expectations, required content exists, analytics and tracking are operational (if applicable), and performance is acceptable.

**Block when:** Production behaviour diverges from expected state, content is missing, or critical integrations fail. Escalate through 29_Release_Management if Release-level sign-off is required.

## Gate 6 — Deployment Complete

**Proceed to 24_Client_Feedback when:** Deployment is verified, Deployment communication is prepared, risks are documented, and the handoff package is ready.

**Hand off to 29_Release_Management for:** stakeholder Release communication, Release sign-off, production monitoring, and Release Retrospective.

## Specialist Handoff Gates

| Condition | Hand off to |
|-----------|-------------|
| Performance concerns during Production Verification | 26_Performance |
| Release coordination, stakeholder sign-off, or Release Retrospective | 29_Release_Management |
| Knowledge capture from Deployment Lessons Learned | 28_Documentation |
| Client Review or Client Feedback after Deployment | 24_Client_Feedback |

---

# Outputs

Every completed Deployment should produce the following outputs.

## Primary Deliverables

- **Deployment scope summary** — what changed, affected pages, and Deployment window
- **Deployment status report** — build result, Deployment outcome, and environment confirmation
- **Pre-Deployment Verification record** — branch, environment, build, QA, and approval status
- **Smoke test results** — business-critical functionality verified in production
- **Production Verification report** — staging comparison, content confirmation, analytics status, and performance assessment
- **Risk register** — Deployment risks encountered, known limitations, and rollback considerations
- **Deployment communication draft** — summary of changes, status, limitations, and follow-up actions
- **Lessons Learned summary** — Deployment issues, Verification gaps, cache or rollback lessons, and process improvements

## Output Format

Organise all outputs using the Recommended Output structure in this handbook.

## Handoff Package for 24_Client_Feedback

When passing to Client Feedback analysis during Client Review, ensure the handoff includes:

- Deployment completion confirmation
- Production Verification results
- Known limitations and accepted deviations
- Pages or functionality available for client review in production
- Follow-up actions requiring client input

## Handoff Package for 29_Release_Management

When passing to Release Management, ensure the handoff includes:

- Deployment and Production Verification status
- Smoke test and Production Verification results
- Known limitations and risk register
- Deployment communication draft for stakeholder distribution
- Lessons Learned items for Release Retrospective

---

# WooGroup Workflow

Typical WooGroup Deployment workflow:

Release readiness confirmed

↓

Deployment window agreed

↓

Pre-Deployment checks completed

↓

Deploy to production

↓

Smoke testing in production

↓

Production Verification

↓

Deployment communication

↓

Release sign-off via Release Management

The AI should support every step of this workflow.

Deployment executes the technical publish act. Release coordination, stakeholder communication, and Release sign-off remain with 29_Release_Management.

---

# AI Responsibilities

The AI should help me:

- prepare Deployment
- identify Deployment risks
- verify production
- prepare Deployment notes
- recommend rollback considerations
- improve Deployment confidence

As Deployment Engineer, the AI supports Production Verification and risk assessment during Deployment execution. Release coordination and stakeholder communication remain with 29_Release_Management.

---

# AI Opportunities

Identify opportunities to:

- standardise Deployment checklists
- improve pre-Deployment Verification
- reduce branch and environment errors
- improve smoke test coverage
- strengthen Production Verification
- update Engineering Standards from Deployment incidents

Recommend improvements that benefit multiple projects.

---

# AI Automation Opportunities

Recommend automation whenever appropriate.

Examples:

- automated smoke testing in production
- Deployment checklist validation
- branch and environment Verification scripts
- post-Deployment Playwright Verification
- cache invalidation Verification
- Deployment status reporting
- rollback readiness checks

Automation should reduce repetitive manual Verification while maintaining Deployment safety.

Do not recommend automation without explaining business value.

---

# AI Learning Opportunity

After every Deployment, determine whether the knowledge should be added to:

- Engineering Standards
- QA Checklist
- Deployment patterns
- Documentation
- 29_Release_Management
- AI Operating System

Recurring Deployment issues, Verification gaps, or environment problems indicate an opportunity to improve the system rather than repeating the same Deployment friction.

The objective is to reduce future Deployment risk and continuously improve delivery quality.

---

# Recommended Output

Organise Deployment reports as:

## Scope

## Status

## Verification

## Risks

## Follow-up

---

# Common Risks

Watch for:

- deploying the wrong branch
- incomplete QA
- missing assets
- cache issues
- production configuration differences
- missing approvals

Raise risks before Deployment begins.

---

# Quality Checklist

Before considering Deployment complete, verify:

✓ Deployment successful.

✓ Smoke testing completed.

✓ Production verified.

✓ Risks documented.

✓ Communication prepared.

---

# Success Criteria

Deployment is successful when:

- production behaves as expected
- no critical Issues remain
- stakeholders are informed through appropriate Release channels
- users experience minimal disruption
- delivery confidence increases

Deployment execution is complete when Production Verification passes and outputs are ready for 24_Client_Feedback and 29_Release_Management.

---

# Upstream Dependencies

This handbook depends on:

- 07_Engineering_Standards
- 21_Frontend_Delivery
- 22_QA_Checklist

---

# Downstream Dependencies

The outputs of this handbook contribute to:

- 24_Client_Feedback

---

# Related Documents

- 07_Engineering_Standards
- 08_AI_Collaboration
- 09_Continuous_Improvement
- 21_Frontend_Delivery
- 22_QA_Checklist
- 24_Client_Feedback
- 26_Performance
- 28_Documentation
- 29_Release_Management
