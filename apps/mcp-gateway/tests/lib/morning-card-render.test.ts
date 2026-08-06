import { describe, expect, it } from "vitest";
import { renderMorningCard } from "../../src/lib/morning-card-render.js";
import type { MorningLiveContext } from "../../src/lib/live-context-fetch.js";
import type { JiraMorningContext } from "../../src/adapters/jira/index.js";

function issue(key: string, summary: string, overrides: Record<string, unknown> = {}) {
  return {
    key,
    summary,
    status: "To Do",
    priority: "Normal",
    assignee: "Helen Nguyen",
    updated: "2026-08-06T10:00:00+07:00",
    due_date: null,
    url: `https://jira.example.com/browse/${key}`,
    ...overrides,
  };
}

function jiraContext(overrides: Partial<JiraMorningContext> = {}): JiraMorningContext {
  return {
    assigned_open: [issue("TRN-13", "Improve performance"), issue("TRN-14", "Increase animation speed")],
    recently_updated: [],
    due_today: [],
    overdue: [],
    generated_at: "2026-08-06T07:00:00+07:00",
    timezone: "Asia/Ho_Chi_Minh",
    ...overrides,
  };
}

function live(overrides: Partial<MorningLiveContext> = {}): MorningLiveContext {
  return {
    jira: jiraContext(),
    team_availability: null,
    team_summary: {
      status: "loaded",
      line_en: "No approved leave or WFH for 2026-08-06 — full team capacity expected",
      line_vi: "Không có nghỉ phép/WFH ngày 2026-08-06 — team đủ người",
    },
    ...overrides,
  };
}

describe("renderMorningCard", () => {
  it("uses Morning Card sections, not timeline or Needs attention", () => {
    const md = renderMorningCard({
      language: "en",
      detail: "standard",
      timezone: "Asia/Ho_Chi_Minh",
      live: live(),
      jiraBaseUrl: "https://jira.example.com",
    });
    expect(md).toContain("### Snapshot");
    expect(md).toContain("### At a glance");
    expect(md).toContain("**Team:**");
    expect(md).toContain("### Priorities");
    expect(md).not.toContain("Needs attention");
    expect(md).not.toContain("Resolved");
    expect(md).not.toMatch(/9 AM – 10 AM/);
  });

  it("includes Jira priorities with links and Q tags", () => {
    const md = renderMorningCard({
      language: "en",
      detail: "standard",
      timezone: "Asia/Ho_Chi_Minh",
      live: live(),
      jiraBaseUrl: "https://jira.example.com",
    });
    expect(md).toContain("[TRN-13](https://jira.example.com/browse/TRN-13)");
    expect(md).toContain("**[Q");
  });

  it("renders Vietnamese headings", () => {
    const md = renderMorningCard({
      language: "vi",
      detail: "standard",
      timezone: "Asia/Ho_Chi_Minh",
      live: live(),
      jiraBaseUrl: "https://jira.example.com",
    });
    expect(md).toContain("# Báo cáo đầu ngày");
    expect(md).toContain("### Tóm tắt nhanh");
    expect(md).toContain("### Tổng quan");
    expect(md).toContain("team đủ người");
  });
});
