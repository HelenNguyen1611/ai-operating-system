# SYSTEM_INDEX

Version: 1.0

---

# Purpose

SYSTEM_INDEX is the navigation layer of the Personal AI Operating System.

It does not contain business knowledge.

It does not contain execution logic.

Its responsibility is to help the AI quickly identify:

- user intent
- appropriate runtime
- required engines
- relevant handbooks
- expected outputs

Think of this document as the navigation table for the entire AI Operating System.

---

# Navigation Principles

Always identify the user's intent before loading knowledge.

Never load every handbook.

Load only the minimum required context.

Route work to the correct specialist runtime.

---

# Request Flow

User Request

↓

Identify Intent

↓

Find Task

↓

Load Runtime

↓

Load Engines

↓

Load Handbooks

↓

Generate Output

↓

Evolution Engine

---

# Daily Operations

## Morning Brief

Intent

Prepare today's work.

Runtime

41_Morning_Runtime

Engines

46_Context_Engine

48_Reasoning_Engine

49_Evolution_Engine

Handbooks

10_Morning_Brief

20_Jira_Review

30_Stakeholder_Management

36_Delivery_Health

Outputs

Morning Brief

Stand-up Preparation

Priority List

Risk Summary

---

## Daily Stand-up

Intent

Prepare daily team update.

Runtime

43_Communication_Runtime

Engines

46_Context_Engine

48_Reasoning_Engine

Handbooks

11_Standup

20_Jira_Review

36_Delivery_Health

Outputs

Stand-up Update

Blockers

Today's Plan

---

## End of Day

Intent

Review today's work.

Runtime

41_Morning_Runtime

Engines

48_Reasoning_Engine

49_Evolution_Engine

Handbooks

12_End_of_Day

39_Knowledge_Sharing

Outputs

Daily Summary

Lessons Learned

Tomorrow Plan

---

# Engineering

## Review Jira

Intent

Understand engineering work.

Runtime

44_Engineering_Runtime

Engines

46_Context_Engine

48_Reasoning_Engine

Handbooks

20_Jira_Review

Outputs

Requirement Review

Engineering Plan

Risk Assessment

---

## Frontend Delivery

Runtime

44_Engineering_Runtime

Handbooks

21_Frontend_Delivery

Outputs

Implementation Plan

Delivery Checklist

---

## QA

Runtime

44_Engineering_Runtime

Handbooks

22_QA_Checklist

Outputs

QA Report

Verification Checklist

---

## Deployment

Runtime

44_Engineering_Runtime

Handbooks

23_Deployment

29_Release_Management

Outputs

Deployment Plan

Release Checklist

Rollback Plan

---

## Client Feedback

Runtime

44_Engineering_Runtime

43_Communication_Runtime

Handbooks

24_Client_Feedback

Outputs

Feedback Analysis

Action Plan

Client Response

---

## Bug Investigation

Runtime

44_Engineering_Runtime

Handbooks

25_Bug_Investigation

Outputs

Root Cause Analysis

Fix Recommendation

Risk Assessment

---

## Performance

Runtime

44_Engineering_Runtime

Handbooks

26_Performance

Outputs

Performance Report

Optimisation Plan

---

## Accessibility

Runtime

44_Engineering_Runtime

Handbooks

27_Accessibility

Outputs

Accessibility Review

Compliance Report

---

## Documentation

Runtime

44_Engineering_Runtime

Handbooks

28_Documentation

Outputs

Technical Documentation

Knowledge Update

---

## Release Management

Runtime

44_Engineering_Runtime

45_Leadership_Runtime

Handbooks

29_Release_Management

Outputs

Release Plan

Release Communication

Lessons Learned

---

# Leadership

## Stakeholder Management

Runtime

45_Leadership_Runtime

Handbooks

30_Stakeholder_Management

Outputs

Stakeholder Strategy

Communication Plan

---

## Risk Management

Runtime

45_Leadership_Runtime

Handbooks

31_Risk_Management

Outputs

Risk Register

Mitigation Plan

---

## Planning

Runtime

45_Leadership_Runtime

Handbooks

32_Project_Planning

Outputs

Execution Plan

Priority List

---

## Delegation

Runtime

45_Leadership_Runtime

Handbooks

33_Delegation

Outputs

Delegation Plan

Ownership Matrix

---

## Coaching

Runtime

45_Leadership_Runtime

Handbooks

34_Coaching

Outputs

Coaching Plan

Development Advice

---

## Conflict Resolution

Runtime

45_Leadership_Runtime

43_Communication_Runtime

Handbooks

35_Conflict_Resolution

Outputs

Resolution Strategy

Communication Plan

---

## Delivery Health

Runtime

45_Leadership_Runtime

44_Engineering_Runtime

Handbooks

36_Delivery_Health

Outputs

Delivery Health Report

Risk Summary

---

## AI Strategy

Runtime

45_Leadership_Runtime

Handbooks

37_AI_Strategy

Outputs

AI Recommendation

Workflow Improvement

Automation Opportunities

---

## Career Development

Runtime

45_Leadership_Runtime

Handbooks

38_Career_Development

Outputs

Career Advice

Development Plan

---

## Knowledge Sharing

Runtime

45_Leadership_Runtime

49_Evolution_Engine

Handbooks

39_Knowledge_Sharing

Outputs

Knowledge Update

Handbook Recommendation

---

# Communication

## Email

Runtime

43_Communication_Runtime

Handbooks

05_Communication_Standards

Outputs

Professional Email

---

## Teams Message

Runtime

43_Communication_Runtime

Handbooks

05_Communication_Standards

Outputs

Teams Message

---

## Meeting Preparation

Runtime

43_Communication_Runtime

45_Leadership_Runtime

Handbooks

05_Communication_Standards

34_Coaching

Outputs

Meeting Notes

Discussion Points

---

## Client Communication

Runtime

43_Communication_Runtime

45_Leadership_Runtime

Handbooks

05_Communication_Standards

30_Stakeholder_Management

Outputs

Client Response

Communication Plan

---

# Runtime Routing

Morning Activities

↓

41_Morning_Runtime

---

Communication

↓

43_Communication_Runtime

---

Engineering

↓

44_Engineering_Runtime

---

Leadership

↓

45_Leadership_Runtime

---

# Engine Routing

Context Required

↓

46_Context_Engine

---

Long-term Preference

↓

47_Memory_Engine

---

Decision Making

↓

48_Reasoning_Engine

---

Continuous Improvement

↓

49_Evolution_Engine

---

# Source of Truth

Architecture

↓

AI_SYSTEM_MAP.md

---

Business Knowledge

↓

00–39 Handbook Layer

---

Execution

↓

40–45 Runtime Layer

---

Intelligence

↓

46–49 Intelligence Layer

---

Navigation

↓

SYSTEM_INDEX.md

---

# Navigation Rules

Always:

- identify intent first
- load the correct runtime
- load only relevant engines
- load only required handbooks
- minimise context
- follow Runtime before Handbook

Never:

- load every handbook
- skip runtime routing
- bypass reasoning
- mix unrelated workflows

SYSTEM_INDEX is the navigation guide for the Personal AI Operating System.

It tells the AI where to go.

The Runtime tells the AI how to execute.

The Handbook tells the AI what to know.
