import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadTeamAvailabilityConfig, parseMaxAgeMinutes } from "../../src/adapters/team-availability/config.js";
import { createTeamAvailabilityAdapter } from "../../src/adapters/team-availability/index.js";
import {
  TeamAvailabilityConfigInvalidError,
  TeamAvailabilitySnapshotInvalidError,
  TeamAvailabilitySnapshotNotFoundError,
  TeamAvailabilitySnapshotReadFailedError,
  TeamAvailabilitySnapshotStaleError,
} from "../../src/adapters/team-availability/errors.js";

const tempDirs: string[] = [];

async function writeSnapshotFile(content: unknown): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "team-availability-test-"));
  tempDirs.push(dir);
  const filePath = path.join(dir, "team-availability.json");
  await writeFile(filePath, typeof content === "string" ? content : JSON.stringify(content), "utf-8");
  return filePath;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function person(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: "Helen Nguyen",
    start_date: "2026-07-18",
    end_date: "2026-07-20",
    availability_type: "leave",
    approval_status: "Approve",
    ...overrides,
  };
}

function snapshot(people: Record<string, unknown>[], overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    generated_at: "2026-07-19T06:15:00+07:00",
    people,
    ...overrides,
  };
}

// Fixed, injected directly — deliberately NOT read from this repo's real
// config/runtime.yaml (getDisplayTimezone()'s default behavior), so every
// test in this file stays isolated from shared runtime configuration and
// deterministic regardless of what that file currently says. See
// TeamAvailabilityAdapterOptions.resolveDisplayTimezone in
// src/adapters/team-availability/index.ts.
const TEST_TIMEZONE = "Asia/Ho_Chi_Minh";
async function resolveTestTimezone(): Promise<string> {
  return TEST_TIMEZONE;
}

/**
 * Thin wrapper around createTeamAvailabilityAdapter() that always injects
 * resolveTestTimezone, so no test in this file has to remember to do so
 * individually. Per-test options (e.g. readFileImpl for a simulated fs
 * failure) are still passed through and take precedence.
 */
function createTestAdapter(
  config: Parameters<typeof createTeamAvailabilityAdapter>[0],
  options: Parameters<typeof createTeamAvailabilityAdapter>[1] = {},
) {
  return createTeamAvailabilityAdapter(config, { resolveDisplayTimezone: resolveTestTimezone, ...options });
}

// --- Configuration -----------------------------------------------------

describe("loadTeamAvailabilityConfig", () => {
  it("returns a config when TEAM_AVAILABILITY_SNAPSHOT_PATH is set", () => {
    const config = loadTeamAvailabilityConfig({ TEAM_AVAILABILITY_SNAPSHOT_PATH: "/tmp/snapshot.json" });
    expect(config).toEqual({ snapshotPath: "/tmp/snapshot.json", maxAgeMinutesRaw: undefined });
  });

  it("returns null when TEAM_AVAILABILITY_SNAPSHOT_PATH is unset", () => {
    expect(loadTeamAvailabilityConfig({})).toBeNull();
  });
});

describe("parseMaxAgeMinutes", () => {
  it("is disabled when unset or blank", () => {
    expect(parseMaxAgeMinutes(undefined)).toEqual({ kind: "disabled" });
    expect(parseMaxAgeMinutes("")).toEqual({ kind: "disabled" });
    expect(parseMaxAgeMinutes("   ")).toEqual({ kind: "disabled" });
  });

  it("is enabled for a valid positive integer", () => {
    expect(parseMaxAgeMinutes("120")).toEqual({ kind: "enabled", minutes: 120 });
  });

  it.each([
    ["non-numeric", "abc"],
    ["decimal", "7.5"],
    ["zero", "0"],
    ["negative", "-5"],
  ])("is invalid for %s", (_label, raw) => {
    expect(parseMaxAgeMinutes(raw)).toEqual({ kind: "invalid", raw });
  });
});

// --- Valid snapshot / filtering -----------------------------------------

describe("TeamAvailabilityAdapter.getAvailability — approved, active-for-date events", () => {
  it("returns an event whose range covers the requested date, inclusive on both ends", async () => {
    const snapshotPath = await writeSnapshotFile(
      snapshot([person({ start_date: "2026-07-18", end_date: "2026-07-20" })]),
    );
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    for (const date of ["2026-07-18", "2026-07-19", "2026-07-20"]) {
      const result = await adapter.getAvailability({ date });
      expect(result.events).toHaveLength(1);
      expect(result.date).toBe(date);
    }
  });

  it("excludes an event outside its date range", async () => {
    const snapshotPath = await writeSnapshotFile(
      snapshot([person({ start_date: "2026-07-18", end_date: "2026-07-20" })]),
    );
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    const before = await adapter.getAvailability({ date: "2026-07-17" });
    const after = await adapter.getAvailability({ date: "2026-07-21" });
    expect(before.events).toHaveLength(0);
    expect(after.events).toHaveLength(0);
  });

  it("maps fields onto the expected output shape and excludes approval_status", async () => {
    const snapshotPath = await writeSnapshotFile(snapshot([person({ name: "Helen Nguyen" })]));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    const result = await adapter.getAvailability({ date: "2026-07-19" });
    expect(result.events[0]).toEqual({
      name: "Helen Nguyen",
      startDate: "2026-07-18",
      endDate: "2026-07-20",
      availabilityType: "leave",
    });
  });

  it("defaults team_scope to 'all' and echoes an explicit one back", async () => {
    const snapshotPath = await writeSnapshotFile(snapshot([]));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    expect((await adapter.getAvailability({ date: "2026-07-19" })).team_scope).toBe("all");
    expect((await adapter.getAvailability({ date: "2026-07-19", teamScope: "all" })).team_scope).toBe("all");
  });

  it("passes the snapshot's own generated_at through to the response", async () => {
    const snapshotPath = await writeSnapshotFile(snapshot([]));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    const result = await adapter.getAvailability({ date: "2026-07-19" });
    expect(result.generated_at).toBe("2026-07-19T06:15:00+07:00");
  });
});

// --- Sensitive / unknown field exclusion --------------------------------

describe("TeamAvailabilityAdapter.getAvailability — sensitive and unknown field exclusion", () => {
  it("strips unknown and sensitive fields from the response even if present in the raw file", async () => {
    const snapshotPath = await writeSnapshotFile(
      snapshot([
        person({
          reason: "Personal trip",
          note: "Internal note",
          uploaded_documents: "https://example.com/doc.pdf",
          approver_email: "manager@wootech.co",
          employee_email: "helen@wootech.co",
        }),
      ]),
    );
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    const result = await adapter.getAvailability({ date: "2026-07-19" });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("Personal trip");
    expect(serialized).not.toContain("Internal note");
    expect(serialized).not.toContain("doc.pdf");
    expect(serialized).not.toContain("manager@wootech.co");
    expect(serialized).not.toContain("helen@wootech.co");
    expect(serialized).not.toContain("Approve"); // approval_status itself must never reach the output
  });
});

// --- Snapshot schema validation ------------------------------------------

describe("TeamAvailabilityAdapter.getAvailability — snapshot validation", () => {
  it("rejects a record whose end_date is earlier than its start_date", async () => {
    const snapshotPath = await writeSnapshotFile(
      snapshot([person({ start_date: "2026-07-20", end_date: "2026-07-18" })]),
    );
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilitySnapshotInvalidError,
    );
  });

  it("rejects a blank or whitespace-only name", async () => {
    for (const name of ["", "   "]) {
      const snapshotPath = await writeSnapshotFile(snapshot([person({ name })]));
      const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });
      await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
        TeamAvailabilitySnapshotInvalidError,
      );
    }
  });

  it("rejects a record whose approval_status is not exactly 'Approve'", async () => {
    for (const approval_status of ["Pending", "Reject", "approve", ""]) {
      const snapshotPath = await writeSnapshotFile(snapshot([person({ approval_status })]));
      const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });
      await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
        TeamAvailabilitySnapshotInvalidError,
      );
    }
  });

  it("rejects malformed JSON", async () => {
    const snapshotPath = await writeSnapshotFile("{ not valid json");
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });
    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilitySnapshotInvalidError,
    );
  });

  it("rejects a snapshot missing generated_at", async () => {
    const snapshotPath = await writeSnapshotFile({ people: [] });
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });
    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilitySnapshotInvalidError,
    );
  });
});

// --- File errors -----------------------------------------------------------

describe("TeamAvailabilityAdapter.getAvailability — file errors", () => {
  it("throws TeamAvailabilitySnapshotNotFoundError when the file does not exist", async () => {
    const adapter = createTestAdapter({
      snapshotPath: "/nonexistent/path/team-availability.json",
      maxAgeMinutesRaw: undefined,
    });
    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilitySnapshotNotFoundError,
    );
  });

  it("throws TeamAvailabilitySnapshotReadFailedError for a non-ENOENT read failure", async () => {
    const adapter = createTestAdapter(
      { snapshotPath: "/irrelevant.json", maxAgeMinutesRaw: undefined },
      {
        readFileImpl: async () => {
          const error = new Error("EACCES: permission denied") as NodeJS.ErrnoException;
          error.code = "EACCES";
          throw error;
        },
      },
    );
    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilitySnapshotReadFailedError,
    );
  });
});

// --- Staleness -------------------------------------------------------------

describe("TeamAvailabilityAdapter.getAvailability — staleness", () => {
  it("throws TeamAvailabilitySnapshotStaleError when generated_at exceeds max age", async () => {
    const oldTimestamp = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(); // 3 hours ago
    const snapshotPath = await writeSnapshotFile(snapshot([], { generated_at: oldTimestamp }));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: "120" });

    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilitySnapshotStaleError,
    );
  });

  it("succeeds when generated_at is within max age", async () => {
    const recentTimestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
    const snapshotPath = await writeSnapshotFile(snapshot([], { generated_at: recentTimestamp }));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: "120" });

    await expect(adapter.getAvailability({ date: "2026-07-19" })).resolves.toBeDefined();
  });

  it("does not enforce staleness when max age is disabled (unset)", async () => {
    const veryOldTimestamp = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const snapshotPath = await writeSnapshotFile(snapshot([], { generated_at: veryOldTimestamp }));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    await expect(adapter.getAvailability({ date: "2026-07-19" })).resolves.toBeDefined();
  });

  it("throws TeamAvailabilityConfigInvalidError when max age is present but invalid, rather than silently disabling it", async () => {
    const snapshotPath = await writeSnapshotFile(snapshot([]));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: "not-a-number" });

    await expect(adapter.getAvailability({ date: "2026-07-19" })).rejects.toBeInstanceOf(
      TeamAvailabilityConfigInvalidError,
    );
  });

  it("names the offending variable in the invalid-max-age error message", async () => {
    const snapshotPath = await writeSnapshotFile(snapshot([]));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: "-5" });

    try {
      await adapter.getAvailability({ date: "2026-07-19" });
      expect.unreachable("expected getAvailability to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(TeamAvailabilityConfigInvalidError);
      expect((error as TeamAvailabilityConfigInvalidError).configKey).toBe("TEAM_AVAILABILITY_MAX_AGE_MINUTES");
      expect((error as Error).message).toContain("TEAM_AVAILABILITY_MAX_AGE_MINUTES");
    }
  });
});

// --- Default-date timezone behavior -----------------------------------

describe("TeamAvailabilityAdapter.getAvailability — default date resolution", () => {
  it("defaults to today when no date is provided, using the injected display timezone", async () => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: TEST_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const snapshotPath = await writeSnapshotFile(snapshot([person({ start_date: today, end_date: today })]));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    const result = await adapter.getAvailability();
    expect(result.date).toBe(today);
    expect(result.timezone).toBe(TEST_TIMEZONE);
    expect(result.events).toHaveLength(1);
  });

  it("resolves 'today' in the injected timezone rather than UTC across a UTC/HCM day boundary", async () => {
    // 18:00 UTC is 01:00 the next day in Asia/Ho_Chi_Minh (+07:00) — a
    // UTC-based "today" and an HCM-based "today" disagree at this instant,
    // which is exactly the boundary case an implicit-UTC bug would fail.
    // The timezone itself is injected (see resolveTestTimezone above), not
    // read from the real config/runtime.yaml — this test's correctness
    // must not depend on that file's current contents.
    // vi.setSystemTime (not a manual Date.now patch) is required here —
    // it replaces the global Date implementation itself, so both
    // `new Date()` (used to resolve "today") and `Date.now()` (used for
    // the staleness check) are affected consistently.
    const utcToday = "2026-07-10";
    const hcmToday = "2026-07-11";

    const snapshotPath = await writeSnapshotFile(snapshot([person({ start_date: hcmToday, end_date: hcmToday })]));
    const adapter = createTestAdapter({ snapshotPath, maxAgeMinutesRaw: undefined });

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T18:00:00Z"));
    try {
      const result = await adapter.getAvailability();
      expect(result.date).toBe(hcmToday);
      expect(result.date).not.toBe(utcToday);
      expect(result.events).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
