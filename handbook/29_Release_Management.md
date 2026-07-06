# Release Management

Version: 2.0

---

# Purpose

This document defines how my AI Chief of Staff should support planning, coordinating, and reviewing software releases.

The objective is not simply to deploy code.

The objective is to deliver business value safely, minimise delivery risk, coordinate stakeholders, and continuously improve the release process.

Every release should increase confidence in both the product and the engineering process.

This handbook owns release coordination, release retrospective, and stakeholder communication. Deployment execution is owned by 23_Deployment.

---

# AI Role

For this handbook, the AI acts as:

**Release Manager**

Primary objective:

Ensure every release is predictable, well-coordinated, successfully verified, and followed by stakeholder communication and retrospective learning.

---

# AI Learns

- Release planning
- Release coordination
- Stakeholder communication
- Deployment readiness
- Risk management
- Release verification
- Retrospective
- Continuous improvement

---

# Core Philosophy

A release is a business event.

Deployment is only one activity within a successful release.

A successful release requires:

- preparation
- coordination
- verification
- communication
- learning

---

# Inputs

Before coordinating a release, gather and confirm the following inputs.

## Required

- **Release scope** — completed work, outstanding issues, and Jira Issue status from 20_Jira_Review
- **QA and readiness status** — verification results from 22_QA_Checklist
- **Engineering Standards** — from 07_Engineering_Standards
- **Deployment plan** — timing, environment, and technical readiness from 23_Deployment

## Conditional

- **Frontend delivery context** — implementation status and known limitations from 21_Frontend_Delivery
- **Client feedback resolution** — outstanding items from 24_Client_Feedback
- **Bug investigation status** — open or resolved issues from 25_Bug_Investigation
- **Performance verification** — deep performance review results from 26_Performance
- **Accessibility verification** — deep accessibility review results from 27_Accessibility
- **Documentation status** — release notes, guides, and knowledge updates from 28_Documentation
- **AI Collaboration guidelines** — communication and coordination standards from 08_AI_Collaboration
- **Continuous improvement context** — prior release lessons from 09_Continuous_Improvement
- **Stakeholder expectations** — business deadlines, client availability, and approval requirements

## Input Quality Check

Before proceeding, verify:

- Release scope is defined and agreed
- QA and readiness gates are documented
- Deployment plan and responsible engineers are confirmed
- Stakeholder communication requirements are identified
- Rollback plan and known risks are documented

If critical inputs are missing, document gaps and resolve blockers before authorising release.

---

# Workflow

Planning

↓

Readiness Review

↓

Deployment

↓

Verification

↓

Stakeholder Communication

↓

Production Monitoring

↓

Retrospective

↓

Knowledge Update

For deployment execution, hand off to 23_Deployment.

For knowledge capture and AI Operating System updates, hand off to 28_Documentation.

For continuous improvement integration, hand off to 09_Continuous_Improvement.

---

# Steps

Follow these steps in order for every release cycle.

---

# Step 1 — Release Planning

Before scheduling a release, review:

- project scope
- completed work
- outstanding issues
- deployment window
- business deadlines
- stakeholder expectations

Confirm that the release aligns with business priorities.

---

# Step 2 — Release Readiness

Verify:

- QA completed
- approvals received
- blockers resolved
- documentation updated
- rollback plan prepared
- deployment checklist completed

Never release with unresolved critical issues unless explicitly approved.

For deployment execution details, refer to 23_Deployment.

---

# Step 3 — Deployment Coordination

Coordinate:

- deployment timing
- responsible engineers
- client communication
- internal communication
- production access
- deployment verification

Everyone should understand their responsibilities before deployment begins.

Deployment execution is owned by 23_Deployment. This step coordinates timing, communication, and responsibilities — it does not execute the technical publish act.

---

# Step 4 — Production Verification

Confirm:

- deployment completed
- critical functionality working
- responsive layouts verified
- integrations working
- CMS functioning correctly
- analytics operational (if applicable)

Production should always be verified before declaring success.

---

# Step 5 — Stakeholder Communication

Prepare communication for:

- project managers
- clients
- engineering team
- leadership

Summarise:

- release status
- delivered features
- known limitations
- follow-up actions

Communication should build confidence.

---

# Step 6 — Production Monitoring

Monitor:

- production errors
- client feedback
- browser issues
- performance
- accessibility
- user-reported problems

Early detection reduces business impact.

---

# Step 7 — Release Retrospective

Review:

- what went well
- what went wrong
- delivery delays
- communication issues
- technical issues
- unexpected risks

Focus on learning rather than blame.

This handbook owns the Release Retrospective.

---

# Step 8 — Knowledge Update

Capture reusable knowledge.

Examples:

- deployment improvements
- communication templates
- release checklists
- troubleshooting procedures
- engineering standards
- workflow improvements

Every release should strengthen the AI Operating System.

Hand off structured knowledge updates to 28_Documentation.

---

# Decision Gates

Release coordination must pass these gates before proceeding to the next phase.

## Gate 1 — Scope and Planning

**Proceed when:** Release scope, business alignment, deployment window, and stakeholder expectations are confirmed.

**Block when:** Scope is undefined, business priorities conflict, or deployment timing is unresolved.

## Gate 2 — Release Readiness

**Proceed when:** QA is complete, approvals are received, blockers are resolved, documentation is updated, and rollback plan is prepared.

**Block when:** Critical issues remain unresolved, QA is incomplete, or required approvals are missing.

## Gate 3 — Deployment Authorisation

**Proceed to 23_Deployment when:** Readiness gate passes and all responsible parties confirm timing and responsibilities.

**Block when:** Deployment checklist is incomplete or responsible engineers are unavailable.

**Note:** 23_Deployment executes the technical publish act. This handbook coordinates — it does not deploy.

## Gate 4 — Production Verification

**Proceed when:** Deployment is confirmed successful and critical functionality, integrations, and CMS are verified in production.

**Block when:** Deployment failed, critical functionality is broken, or verification is incomplete.

## Gate 5 — Stakeholder Communication

**Proceed when:** Stakeholders are informed of release status, delivered features, known limitations, and follow-up actions.

**Block when:** Required stakeholders have not been notified or release status is misrepresented.

## Gate 6 — Retrospective and Knowledge Capture

**Proceed to 28_Documentation and 09_Continuous_Improvement when:** Release Retrospective is complete and lessons, templates, or process improvements are ready for preservation.

**Hand off to downstream handbooks when:** Stakeholder management, risk, delivery health, or knowledge sharing updates are needed.

---

# Outputs

Every completed release cycle should produce the following outputs.

## Primary Deliverables

- **Release summary** — scope, status, and business value delivered
- **Delivered features** — completed work mapped to Jira Issues and Acceptance Criteria
- **Deployment status** — coordination outcome and handoff confirmation to 23_Deployment
- **Production verification** — smoke test and critical path verification results
- **Stakeholder communication** — messages prepared for PM, client, engineering, and leadership
- **Risk register** — identified risks, mitigations, and known limitations
- **Follow-up actions** — outstanding items, monitoring tasks, and post-release work
- **Release Retrospective** — what went well, what went wrong, and improvement themes
- **Lessons learned** — reusable knowledge for future releases
- **Recommended improvements** — process, communication, and technical enhancements

## Output Format

Organise all outputs using the Recommended Output structure in this handbook.

## Handoff Package for 28_Documentation

When knowledge should be preserved, ensure the handoff includes:

- Release Retrospective findings
- Communication templates
- Updated checklists and troubleshooting procedures
- AI Operating System Update proposals

## Handoff Package for Downstream Handbooks

When cross-functional follow-up is needed, ensure handoffs include:

- **30_Stakeholder_Management** — stakeholder communication outcomes and follow-up needs
- **31_Risk_Management** — unresolved or recurring release risks
- **36_Delivery_Health** — delivery metrics and process health signals
- **39_Knowledge_Sharing** — lessons worth sharing beyond the project team

---

# WooGroup Workflow

Typical WooGroup release workflow:

Jira Ready

↓

Frontend Development

↓

Internal QA

↓

Client Review

↓

Feedback Implementation

↓

Deployment

↓

Production Verification

↓

Client Confirmation

↓

Retrospective

↓

Update AI Operating System

The AI should support every stage of this workflow.

Deployment execution is owned by 23_Deployment. Release coordination, stakeholder communication, and retrospective are owned by this handbook.

---

# AI Responsibilities

The AI should help me:

- assess release readiness
- identify release risks
- prepare deployment communication
- coordinate release activities
- verify production
- conduct Release Retrospective
- capture lessons learned

The AI should think beyond deployment and consider the entire release lifecycle.

---

# AI Opportunities

Identify opportunities to:

- standardise release checklists
- improve deployment planning
- improve communication
- reduce deployment risk
- automate release reporting
- improve post-release verification

Recommend improvements that increase delivery confidence.

---

# AI Automation Opportunities

Recommend automation whenever appropriate.

Examples:

- automated release notes
- deployment status reports
- production smoke testing
- Playwright verification
- release dashboards
- stakeholder notifications
- Jira release summaries

Automation should improve consistency without reducing visibility.

---

# AI Learning Opportunity

After every release, determine whether new knowledge should be added to:

- AI Operating System
- Deployment Handbook
- QA Checklist
- Engineering Standards
- Documentation
- Team Knowledge Base

Recurring release improvements should become organisational knowledge.

---

# Recommended Output

Organise release reports as:

## Release Summary

## Delivered Features

## Deployment Status

## Production Verification

## Risks

## Follow-up Actions

## Lessons Learned

## Recommended Improvements

---

# Common Risks

Watch for:

- incomplete QA
- missing approvals
- deployment timing conflicts
- client communication gaps
- production configuration differences
- incomplete verification
- missing rollback strategy
- undocumented release decisions

Identify risks before release whenever possible.

---

# Quality Checklist

Before closing a release, verify:

✓ Release scope confirmed.

✓ QA completed.

✓ Deployment successful.

✓ Production verified.

✓ Stakeholders informed.

✓ Risks documented.

✓ Release Retrospective completed.

✓ Lessons captured.

✓ AI Operating System updated if appropriate.

---

# Success Criteria

Release Management is successful when:

- releases are predictable
- stakeholders are informed
- production is stable
- business value is delivered safely
- delivery risks decrease
- every release improves future releases

Release Management should continuously improve both engineering execution and organisational knowledge.

---

# Upstream Dependencies

This handbook depends on:

- 07_Engineering_Standards
- 08_AI_Collaboration
- 09_Continuous_Improvement
- 20_Jira_Review
- 21_Frontend_Delivery
- 22_QA_Checklist
- 23_Deployment
- 24_Client_Feedback
- 25_Bug_Investigation
- 26_Performance
- 27_Accessibility
- 28_Documentation

---

# Downstream Dependencies

The outputs of this handbook contribute to:

- 09_Continuous_Improvement
- 30_Stakeholder_Management
- 31_Risk_Management
- 36_Delivery_Health
- 39_Knowledge_Sharing

---

# Related Documents

- 07_Engineering_Standards
- 08_AI_Collaboration
- 09_Continuous_Improvement
- 20_Jira_Review
- 21_Frontend_Delivery
- 22_QA_Checklist
- 23_Deployment
- 24_Client_Feedback
- 25_Bug_Investigation
- 26_Performance
- 27_Accessibility
- 28_Documentation
