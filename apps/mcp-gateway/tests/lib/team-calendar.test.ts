import { describe, expect, it } from "vitest";
import {
  availabilityCode,
  buildTeamMonthCalendar,
  daysInMonth,
  isExcludedLeave,
  monthCalendarTitle,
} from "../../src/lib/team-calendar.js";
import type { Person } from "../../src/adapters/team-availability/mapper.js";
import {
  renderTeamCalendarHtml,
  renderTeamCalendarMarkdown,
} from "../../src/lib/team-calendar-render.js";

function person(overrides: Partial<Person> = {}): Person {
  return {
    name: "Alice Nguyen",
    start_date: "2026-08-06",
    end_date: "2026-08-07",
    availability_type: "Annual Leave",
    approval_status: "",
    ...overrides,
  };
}

describe("isExcludedLeave", () => {
  it("excludes reject and cancelled", () => {
    expect(isExcludedLeave("Reject")).toBe(true);
    expect(isExcludedLeave("Cancelled ")).toBe(true);
    expect(isExcludedLeave("declined")).toBe(true);
  });

  it("keeps approve and pending", () => {
    expect(isExcludedLeave("Approve")).toBe(false);
    expect(isExcludedLeave("")).toBe(false);
    expect(isExcludedLeave("Request more information")).toBe(false);
  });
});

describe("daysInMonth", () => {
  it("returns all days for August 2026", () => {
    const days = daysInMonth("2026-08-15");
    expect(days).toHaveLength(31);
    expect(days[0]).toBe("2026-08-01");
    expect(days[30]).toBe("2026-08-31");
  });
});

describe("buildTeamMonthCalendar", () => {
  it("includes only people with leave in the current month", () => {
    const calendar = buildTeamMonthCalendar(
      [
        person({ name: "Alice Nguyen", start_date: "2026-08-06", end_date: "2026-08-07" }),
        person({
          name: "Bob Smith",
          start_date: "2026-09-01",
          end_date: "2026-09-05",
          approval_status: "Approve",
        }),
      ],
      "2026-08-07",
    );
    expect(calendar.month).toBe("2026-08");
    expect(calendar.rows).toHaveLength(1);
    expect(calendar.rows[0]?.name).toBe("Alice Nguyen");
    expect(calendar.days).toHaveLength(31);
  });

  it("marks pending leave with ? suffix in cell code via render", () => {
    const calendar = buildTeamMonthCalendar([person()], "2026-08-06");
    const html = renderTeamCalendarHtml(calendar, "vi");
    expect(html).toContain("AL?");
    expect(html).toContain("Alice Nguyen");
    expect(html).toContain("tháng 8 năm 2026");
  });

  it("marks approved leave with solid badge (no pending in data cells)", () => {
    const calendar = buildTeamMonthCalendar(
      [person({ approval_status: "Approve" })],
      "2026-08-06",
    );
    const html = renderTeamCalendarHtml(calendar, "en");
    expect(html).toContain('title="Annual Leave">AL</span>');
    expect(html).not.toContain("Annual Leave (pending)");
  });
});

describe("monthCalendarTitle", () => {
  it("formats Vietnamese month title", () => {
    expect(monthCalendarTitle("2026-08", "vi")).toMatch(/2026/);
  });
});

describe("renderTeamCalendarMarkdown", () => {
  it("renders seven-day weekly tables plus a compact mobile list", () => {
    const calendar = buildTeamMonthCalendar([person()], "2026-08-06");
    const md = renderTeamCalendarMarkdown(calendar, "vi");
    expect(md).toContain("**Lịch team ·");
    expect(md).toContain("**Tuần 1**");
    expect(md).toContain("| Thành viên |");
    expect(md).toContain("| Alice Nguyen |");
    expect(md).toContain("AL?");
    expect(md).toContain("**Dạng gọn · mobile**");
    expect(md).toContain("- **Alice Nguyen:** AL? 6–7");
    expect(md).toContain("| Thành viên | 1 | 2 | 3 | 4 | 5 | **6** | 7 |");
    expect(md).not.toContain("| 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |");
    expect(md).not.toContain("<div");
  });
});

describe("availabilityCode", () => {
  it("maps common leave types", () => {
    expect(availabilityCode("Annual Leave")).toBe("AL");
    expect(availabilityCode("Work from home")).toBe("WFH");
    expect(availabilityCode("Sick/ Carer's Leave")).toBe("SL");
  });
});
