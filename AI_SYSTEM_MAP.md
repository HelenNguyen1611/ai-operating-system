                           AI Employee Handbook
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼

Work Context (01) Daily Workflow (03) Knowledge Sources (02)
│ │ │
└──────────────┬──────────────┴──────────────┬──────────────┘
▼ ▼
Decision Framework (04) Communication Standards (05)
│ │
└──────────────┬──────────────┘
▼
Leadership Principles (06)
│
▼
Engineering Standards (07)
│
▼
AI Collaboration (08)
│
▼
Continuous Improvement (09)
│
▼
ENGINEERING LAYER (20–29)
│
▼
Operations Layer (10–12)
│
▼
Growth Layer (09, 28, 39)
──────────────────────────────────────────────────────────────────────────────

# North Star

This repository is not a collection of prompts.

It is my Personal AI Operating System.

Its purpose is to help AI think, communicate, deliver, learn, and continuously improve alongside me.

Every document should contribute to one or more of these goals:

- Better decisions
- Better communication
- Better software delivery
- Better leadership
- Better learning
- Better long-term knowledge

Whenever new knowledge is discovered, determine whether it should become part of this Operating System.

---

# System Layers

## Foundation Layer

AI understands me.

| ID  | Handbook             | Purpose                              |
| --- | -------------------- | ------------------------------------ |
| 00  | AI Employee Handbook | System entry point and navigation    |
| 01  | Work Context         | Role, projects, clients, constraints |
| 02  | Knowledge Sources    | Jira, Confluence, Figma, live data   |
| 03  | Daily Workflow       | Daily rhythm and priorities          |

Foundation provides context before any Engineering Layer work begins.

---

## Thinking Layer

AI thinks like me.

| ID  | Handbook                | Purpose                           |
| --- | ----------------------- | --------------------------------- |
| 04  | Decision Framework      | How to analyse options and decide |
| 05  | Communication Standards | How to communicate with clarity   |

Thinking Layer guides reasoning before action in Engineering and Operations.

---

## Leadership Layer

AI helps me lead.

| ID  | Handbook              | Purpose                            |
| --- | --------------------- | ---------------------------------- |
| 06  | Leadership Principles | Leadership values and expectations |

Leadership Layer informs stakeholder communication, Internal Review, and Release Management (29).

---

## Engineering Layer

AI works like me.

Engineering Layer handbooks sit on Engineering Standards (07), AI Collaboration (08), and Continuous Improvement (09).

| ID  | Handbook           | AI Role                     | Primary Responsibility                           |
| --- | ------------------ | --------------------------- | ------------------------------------------------ |
| 20  | Jira Review        | Senior Requirements Analyst | Pre-implementation Issue analysis                |
| 21  | Frontend Delivery  | Senior Frontend Engineer    | Frontend implementation lifecycle                |
| 22  | QA Checklist       | QA Lead                     | QA verification and release readiness            |
| 23  | Deployment         | Deployment Engineer         | Deployment execution and Production Verification |
| 24  | Client Feedback    | Client Success Partner      | Client Feedback analysis and response            |
| 25  | Bug Investigation  | Senior Debugging Engineer   | Root cause analysis and prevention               |
| 26  | Performance        | Performance Engineer        | Performance analysis and optimisation            |
| 27  | Accessibility      | Accessibility Specialist    | Accessibility standards and remediation          |
| 28  | Documentation      | Knowledge Manager           | Knowledge capture and maintenance                |
| 29  | Release Management | Release Manager             | Release coordination and Release Retrospective   |

---

## Operations Layer

AI supports me daily.

| ID  | Handbook      | Purpose                     |
| --- | ------------- | --------------------------- |
| 10  | Morning Brief | Start-of-day orientation    |
| 11  | Standup       | Daily progress and blockers |
| 12  | End of Day    | Close-out and handoff       |

Operations Layer connects daily execution to the Engineering Layer.

---

## Growth Layer

AI helps me improve.

| ID  | Handbook               | Purpose                             |
| --- | ---------------------- | ----------------------------------- |
| 09  | Continuous Improvement | System-wide improvement loop        |
| 28  | Documentation          | Knowledge Base and handbook updates |
| 39  | Knowledge Sharing      | Team and organisational knowledge   |

Growth Layer receives outputs from Release Management (29) and Documentation (28).

---

# Engineering Lifecycle

The Engineering Layer follows this lifecycle sequence:

```
20 Jira Review
        ↓
21 Frontend Delivery
        ↓
22 QA Checklist
        ↓
23 Deployment
        ↓
24 Client Feedback
        ↓
25 Bug Investigation
        ↓
26 Performance
        ↓
27 Accessibility
        ↓
28 Documentation
        ↓
29 Release Management
```

Each handbook owns ONE primary responsibility.

Each handbook consumes outputs from its upstream neighbour and produces outputs for its downstream neighbour.

---

## Primary Handoff Chain

| From | Primary Output                                                           | To               |
| ---- | ------------------------------------------------------------------------ | ---------------- |
| 20   | Implementation Plan, Business Goal, Acceptance Criteria, Risk Assessment | 21               |
| 21   | Implemented frontend work, Self QA complete, Internal Review ready       | 22               |
| 22   | QA Report, release readiness confirmation                                | 23               |
| 23   | Deployment Report, Production Verification status                        | 24               |
| 24   | Feedback analysis, prioritised response plan, Client Confirmation        | 25               |
| 25   | Investigation Report, root cause, fix verification, prevention plan      | 26               |
| 26   | Performance Report, optimisation results, verification                   | 27               |
| 27   | Accessibility Report, remediation verification                           | 28               |
| 28   | Documentation, Knowledge Updates, AI Operating System Update draft       | 29               |
| 29   | Release Summary, Release Retrospective, stakeholder communication        | 09, Growth Layer |

---

## Decision Gates

Each handbook defines Decision Gates.

If a gate fails, the AI recommends the next action before proceeding downstream.

| Handbook | Example Gates                                             |
| -------- | --------------------------------------------------------- |
| 20       | Requirements clear? Acceptance Criteria testable?         |
| 21       | Design reviewed? Implementation complete? Self QA passed? |
| 22       | QA passed? Release readiness confirmed?                   |
| 23       | Deployment successful? Production verified?               |
| 24       | Client Feedback understood? Client approved?              |
| 25       | Bug reproduced? Root cause identified? Fix verified?      |
| 26       | Performance measured? Optimisation verified?              |
| 27       | Accessibility acceptable? Regressions checked?            |
| 28       | Documentation accurate? Knowledge captured?               |
| 29       | Release scope confirmed? Release Retrospective complete?  |

---

## Terminology

Use consistently across the Engineering Layer:

| Term                       | Meaning                                   |
| -------------------------- | ----------------------------------------- |
| Business Goal              | Why the work exists                       |
| Acceptance Criteria        | Testable conditions for completion        |
| Issue                      | Jira Issue (not ticket)                   |
| QA                         | Formal quality assurance (22)             |
| Verification               | Scoped confirmation after a change        |
| Deployment                 | Technical publish act (23)                |
| Release                    | Business event with coordination (29)     |
| Production Verification    | Confirming production behaviour           |
| Client Review              | Delivery phase when client evaluates work |
| Client Feedback            | Items received during Client Review (24)  |
| Internal Review            | Peer review before Client Review          |
| Lessons Learned            | Capture after delivery work               |
| Release Retrospective      | Release-level review (29)                 |
| AI Operating System Update | Knowledge applied to this repository      |
| Engineering Standards      | 07_Engineering_Standards                  |

---

## Ownership Boundaries

| Topic                     | Owner | Supporting handbook     |
| ------------------------- | ----- | ----------------------- |
| Issue analysis            | 20    | —                       |
| Frontend implementation   | 21    | 20 inputs               |
| QA verification           | 22    | 21 Self QA              |
| Deployment execution      | 23    | 22 release readiness    |
| Client Feedback analysis  | 24    | 21 Client Review phase  |
| Bug investigation         | 25    | 20 bug triage           |
| Performance optimisation  | 26    | 22 smoke checks         |
| Accessibility remediation | 27    | 22 smoke checks         |
| Knowledge capture         | 28    | all handbooks           |
| Release coordination      | 29    | 23 deployment execution |

Deployment (23) executes. Release Management (29) coordinates, communicates, and retrospects.

---

# Standard Handbook Template

Every Engineering Layer handbook (20–29) follows Version 2.0 structure:

```
Purpose
AI Role
AI Learns
Core Philosophy
Inputs
Workflow
Steps
Decision Gates
Outputs
WooGroup Workflow
AI Responsibilities
AI Opportunities
AI Automation Opportunities
AI Learning Opportunity
Recommended Output
Common Risks
Quality Checklist
Success Criteria
Upstream Dependencies
Downstream Dependencies
Related Documents
```

Design principles:

- Single Responsibility Principle
- Knowledge Reuse
- Continuous Learning
- Separation of Concerns
- Progressive Enhancement
- AI-first thinking
- Enterprise Maintainability
- Workflow before Prompt
- Knowledge before Automation

---

# Knowledge Flow

Knowledge originates during delivery work and moves through the system:

```
Engineering work (20–29)
        │
        ▼
AI Learning Opportunity (in handbook)
        │
        ▼
28 Documentation
        │
        ├──► 07 Engineering Standards
        ├──► Engineering handbooks (20–29)
        ├──► AI_SYSTEM_MAP
        ├──► 09 Continuous Improvement
        └──► 39 Knowledge Sharing
```

Inputs flow downstream. Knowledge flows back upstream into standards and handbooks.

---

# Learning Loop

```
Delivery work
        │
        ▼
Lessons Learned / Release Retrospective
        │
        ▼
AI Learning Opportunity
        │
        ▼
28 Documentation
        │
        ▼
09 Continuous Improvement
        │
        ▼
AI Operating System Update
        │
        ▼
Future delivery decisions (20–29)
```

Every completed cycle should make the next delivery faster, safer, and more consistent.

---

# AI Operating System Update Cycle

Trigger an AI Operating System Update when:

- A Decision Gate fails repeatedly across projects
- Client Feedback patterns recur
- Bugs share the same root cause
- Performance or accessibility issues repeat
- Release Retrospective identifies process gaps
- Documentation gaps cause repeated questions

Update process:

1. Capture knowledge in 28 Documentation
2. Review against 07 Engineering Standards
3. Update affected handbook(s) 20–29
4. Update AI_SYSTEM_MAP if architecture changes
5. Record improvement in 09 Continuous Improvement

---

# Dependency Relationships

## Foundation to Engineering

```
01 Work Context ──┐
02 Knowledge Sources ──┼──► 20 Jira Review
03 Daily Workflow ──┘
04 Decision Framework ──► all Engineering handbooks
05 Communication Standards ──► 24, 29
06 Leadership Principles ──► 29
07 Engineering Standards ──► all Engineering handbooks
08 AI Collaboration ──► 20, 21, 29
09 Continuous Improvement ──► 28, 29
```

## Engineering Layer linear dependencies

```
20 → 21 → 22 → 23 → 24 → 25 → 26 → 27 → 28 → 29
```

## Engineering to Growth

```
29 Release Management ──► 09 Continuous Improvement
28 Documentation ──► AI_SYSTEM_MAP
28 Documentation ──► 39 Knowledge Sharing
29 Release Management ──► 30, 31, 36 (Leadership / Delivery health)
```

Cross-layer rule:

When work completes in any handbook, ask whether knowledge belongs in 28 Documentation, 07 Engineering Standards, or 09 Continuous Improvement before closing the task.

---

                 DAILY OPERATION LIFECYCLE

Morning Brief (10)
│
▼
Stand-up (11)
│
▼
Development ──────────────► 20 Jira Review → 21 Frontend Delivery
│
▼
Code Review / Internal Review
│
▼
QA ───────────────────────► 22 QA Checklist
│
▼
Deployment ───────────────► 23 Deployment
│
▼
Client Review ────────────► 24 Client Feedback
│
▼
Bug Investigation ────────► 25 Bug Investigation (when needed)
│
▼
Performance / Accessibility ► 26 Performance → 27 Accessibility
│
▼
Documentation ────────────► 28 Documentation
│
▼
Release Management ───────► 29 Release Management
│
▼
End of Day (12)
│
▼
Lessons Learned / Release Retrospective
│
▼
AI Operating System Update
│
▼
Future Decisions

---

# Live Data

Jira
Calendar
Outlook
Teams
Confluence
Leave Tracker

Live data feeds Foundation Layer (02) and Engineering Layer inputs (20–29).

        │
        ▼

Morning Brief (10)
│
▼
Stand-up (11)
│
▼
Execution ────────────────► Engineering Layer (20–29)
│
▼
End of Day (12)
│
▼
Lessons Learned
│
▼
AI Handbook Update
│
▼
Future Decisions
