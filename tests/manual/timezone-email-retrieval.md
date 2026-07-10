# Manual Tests — Timezone & Email Retrieval

Run these manually. Do not automate against live systems during CI.

---

## Test 1 — Raw Outlook search

**Run:**

Freshly search Outlook Inbox for emails in the last 36 hours.
Return time, sender, subject.
Sort by local received time descending.

**Expected:**

Emails sent late UTC but early morning Vietnam time should appear as **today** (Asia/Ho_Chi_Minh), not yesterday.

---

## Test 2 — `/chaobuoisang`

**Run:**

```
/chaobuoisang
```

**Expected:**

- Emails from Travis/Nicola received in early morning Vietnam time are **not** classified as yesterday.
- Main report in Vietnamese; stand-up in English.
- Times shown in local timezone (24h).

---

## Test 3 — `/morning`

**Run:**

```
/morning
```

**Expected:**

- All times displayed in local timezone or clearly marked if source timezone is shown.
- Context section notes timezone if confidence is Medium/Low.
- Leadership/action emails surfaced before generic recent mail.

---

## Test 4 — UTC boundary edge case

**Scenario:**

Email received at `2026-07-09T18:30:00Z` (01:30 Vietnam, 10 July).

**Expected:**

Classified as **today** in Vietnam when Morning run executes on 10 July local.

Not excluded or labelled "yesterday" due to UTC date.

---

## Test 5 — Config loaded

**Verify:**

Morning run references `config/runtime.yaml` timezone before connector queries.

No connector query uses only `today` or `yesterday` natural-language filters without absolute time window.
