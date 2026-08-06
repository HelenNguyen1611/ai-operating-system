import { describe, expect, it } from "vitest";
import { buildTeamSummary } from "../../src/lib/team-summary.js";
import type { TeamAvailabilityResult } from "../../src/adapters/team-availability/index.js";

function result(overrides: Partial<TeamAvailabilityResult> = {}): TeamAvailabilityResult {
  return {
    date: "2026-08-06",
    team_scope: "all",
    events: [],
    generated_at: "2026-08-06T07:00:00+07:00",
    timezone: "Asia/Ho_Chi_Minh",
    snapshot_people_total: 0,
    snapshot_latest_end_date: "",
    ...overrides,
  };
}

describe("buildTeamSummary", () => {
  it("returns not configured when adapter is missing", () => {
    const summary = buildTeamSummary(null, "Team Availability is not configured (ADAPTER_NOT_CONFIGURED).");
    expect(summary.status).toBe("not_configured");
    expect(summary.line_en).toContain("Not verified");
  });

  it("returns loaded line when no one is on leave today", () => {
    const summary = buildTeamSummary(result({ snapshot_people_total: 70, snapshot_latest_end_date: "2026-08-06" }));
    expect(summary.status).toBe("loaded");
    expect(summary.line_en).toContain("full team capacity");
  });

  it("warns when snapshot records do not cover today", () => {
    const summary = buildTeamSummary(
      result({ snapshot_people_total: 70, snapshot_latest_end_date: "2025-08-04" }),
    );
    expect(summary.warning).toContain("Power Automate");
    expect(summary.line_en).toContain("2025-08-04");
  });

  it("lists people grouped by availability type", () => {
    const summary = buildTeamSummary(
      result({
        events: [
          { name: "Helen Nguyen", startDate: "2026-08-06", endDate: "2026-08-06", availabilityType: "Work from home" },
          { name: "Alice", startDate: "2026-08-06", endDate: "2026-08-08", availabilityType: "Annual Leave" },
        ],
      }),
    );
    expect(summary.line_en).toContain("Helen Nguyen");
    expect(summary.line_en).toContain("Work from home");
    expect(summary.line_en).toContain("Alice");
  });
});
