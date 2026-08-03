import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadDailyReportConfig } from "../../src/adapters/daily-report/config.js";
import { DailyReportStore } from "../../src/adapters/daily-report/client.js";
import { createDailyReportAdapter } from "../../src/adapters/daily-report/index.js";
import {
  DailyReportInvalidError,
  DailyReportNotFoundError,
} from "../../src/adapters/daily-report/errors.js";

const tempDirs: string[] = [];

async function makeTempStoreDir(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "daily-report-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

// Fixed, injected directly — same rationale as team-availability.test.ts's
// TEST_TIMEZONE: keeps this file isolated from the repo's real
// config/runtime.yaml and deterministic regardless of what it currently says.
const TEST_TIMEZONE = "Asia/Ho_Chi_Minh";
async function resolveTestTimezone(): Promise<string> {
  return TEST_TIMEZONE;
}

function createTestAdapter(storeDir: string) {
  return createDailyReportAdapter({ storeDir }, { resolveDisplayTimezone: resolveTestTimezone });
}

// --- Configuration -------------------------------------------------------

describe("loadDailyReportConfig", () => {
  it("uses DAILY_REPORT_STORE_DIR when set", () => {
    const config = loadDailyReportConfig({ DAILY_REPORT_STORE_DIR: "/tmp/reports" });
    expect(config).toEqual({ storeDir: "/tmp/reports" });
  });

  it("falls back to a repo-relative default when unset — never null (unlike Jira/Team Availability)", () => {
    const config = loadDailyReportConfig({});
    expect(config.storeDir).toMatch(/apps[/\\]mcp-gateway[/\\]\.data[/\\]daily-reports$/);
  });
});

// --- DailyReportStore (client.ts) ----------------------------------------

describe("DailyReportStore", () => {
  it("writes a report then reads it back unchanged", async () => {
    const storeDir = await makeTempStoreDir();
    const store = new DailyReportStore();
    const report = {
      date: "2026-07-23",
      generated_at: "2026-07-23T09:05:00+07:00",
      summary: "Shipped UP-189.",
      jira: { assigned_open: [], recently_updated: [], due_today: [], overdue: [], generated_at: "x", timezone: "Asia/Ho_Chi_Minh" as const },
      team_availability: { date: "2026-07-23", team_scope: "all", events: [], generated_at: "x", timezone: "Asia/Ho_Chi_Minh" },
    };

    await store.write(storeDir, report);
    const readBack = await store.read(storeDir, "2026-07-23");

    expect(readBack).toEqual(report);
  });

  it("creates the store directory if it doesn't exist yet", async () => {
    const storeDir = path.join(await makeTempStoreDir(), "nested", "deeper");
    const store = new DailyReportStore();
    const report = {
      date: "2026-07-23",
      generated_at: "2026-07-23T09:05:00+07:00",
      jira: null,
      team_availability: null,
    };

    await expect(store.write(storeDir, report)).resolves.toBeUndefined();
    await expect(store.read(storeDir, "2026-07-23")).resolves.toEqual(report);
  });

  it("throws DailyReportNotFoundError for a date with no saved file", async () => {
    const storeDir = await makeTempStoreDir();
    const store = new DailyReportStore();

    await expect(store.read(storeDir, "2026-01-01")).rejects.toBeInstanceOf(DailyReportNotFoundError);
  });

  it("throws DailyReportInvalidError for a file that isn't valid JSON", async () => {
    const storeDir = await makeTempStoreDir();
    await writeFile(path.join(storeDir, "2026-01-01.json"), "not json{{{", "utf-8");
    const store = new DailyReportStore();

    await expect(store.read(storeDir, "2026-01-01")).rejects.toBeInstanceOf(DailyReportInvalidError);
  });

  it("throws DailyReportInvalidError for JSON that fails the envelope schema", async () => {
    const storeDir = await makeTempStoreDir();
    await writeFile(path.join(storeDir, "2026-01-01.json"), JSON.stringify({ nope: true }), "utf-8");
    const store = new DailyReportStore();

    await expect(store.read(storeDir, "2026-01-01")).rejects.toBeInstanceOf(DailyReportInvalidError);
  });
});

// --- DailyReportAdapter (index.ts) ----------------------------------------

describe("DailyReportAdapter", () => {
  it("save() writes under today's date (per the injected timezone) and get() reads it back", async () => {
    const storeDir = await makeTempStoreDir();
    const adapter = createTestAdapter(storeDir);

    const saved = await adapter.save({
      summary: "Good morning brief.",
      jira: null,
      jiraError: "Jira is not configured (ADAPTER_NOT_CONFIGURED).",
      teamAvailability: null,
      teamAvailabilityError: "Team Availability is not configured (ADAPTER_NOT_CONFIGURED).",
    });

    expect(saved.summary).toBe("Good morning brief.");
    expect(saved.jira).toBeNull();
    expect(saved.jira_error).toContain("not configured");

    const fetched = await adapter.get();
    expect(fetched).toEqual(saved);
  });

  it("save() overwrites the same day's file on a second call (last write wins)", async () => {
    const storeDir = await makeTempStoreDir();
    const adapter = createTestAdapter(storeDir);

    await adapter.save({ summary: "first", jira: null, teamAvailability: null });
    await adapter.save({ summary: "second", jira: null, teamAvailability: null });

    const fetched = await adapter.get();
    expect(fetched.summary).toBe("second");
  });

  it("get() with an explicit date reads a different day than today", async () => {
    const storeDir = await makeTempStoreDir();
    const adapter = createTestAdapter(storeDir);
    const store = new DailyReportStore();
    await store.write(storeDir, {
      date: "2025-07-23",
      generated_at: "2025-07-23T09:00:00+07:00",
      jira: null,
      team_availability: null,
    });

    const fetched = await adapter.get({ date: "2025-07-23" });
    expect(fetched.date).toBe("2025-07-23");
  });

  it("get() for an unsaved date rejects with DailyReportNotFoundError", async () => {
    const storeDir = await makeTempStoreDir();
    const adapter = createTestAdapter(storeDir);

    await expect(adapter.get({ date: "1999-01-01" })).rejects.toBeInstanceOf(DailyReportNotFoundError);
  });
});
