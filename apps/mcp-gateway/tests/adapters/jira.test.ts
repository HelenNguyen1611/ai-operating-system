import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadJiraConfig } from "../../src/adapters/jira/config.js";
import { createJiraAdapter, toHoChiMinhDateString } from "../../src/adapters/jira/index.js";
import {
  JiraApiError,
  JiraAuthError,
  JiraNotFoundError,
  JiraTimeoutError,
} from "../../src/adapters/jira/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "..", "fixtures", "jira");

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, name), "utf-8"));
}

const VALID_CONFIG = {
  baseUrl: "https://example.atlassian.net",
  email: "helen@wootech.co",
  apiToken: "test-token",
  lookbackDays: 30,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(body: string, status: number): Response {
  return new Response(body, { status });
}

// --- Configuration -----------------------------------------------------

describe("loadJiraConfig — valid configuration", () => {
  it("returns a normalised config when all three env vars are set", () => {
    const config = loadJiraConfig({
      JIRA_BASE_URL: "https://example.atlassian.net/",
      JIRA_EMAIL: "helen@wootech.co",
      JIRA_API_TOKEN: "test-token",
    });

    expect(config).toEqual({
      baseUrl: "https://example.atlassian.net", // trailing slash stripped
      email: "helen@wootech.co",
      apiToken: "test-token",
      lookbackDays: 30,
    });
  });
});

describe("loadJiraConfig — missing configuration", () => {
  it("returns null when JIRA_API_TOKEN is missing", () => {
    const config = loadJiraConfig({
      JIRA_BASE_URL: "https://example.atlassian.net",
      JIRA_EMAIL: "helen@wootech.co",
    });
    expect(config).toBeNull();
  });

  it("returns null when no Jira env vars are set at all", () => {
    expect(loadJiraConfig({})).toBeNull();
  });
});

describe("loadJiraConfig — MORNING_CONTEXT_LOOKBACK_DAYS", () => {
  const BASE_ENV = {
    JIRA_BASE_URL: "https://example.atlassian.net",
    JIRA_EMAIL: "helen@wootech.co",
    JIRA_API_TOKEN: "test-token",
  };

  it("defaults to 30 when the env var is not set", () => {
    const config = loadJiraConfig(BASE_ENV);
    expect(config?.lookbackDays).toBe(30);
  });

  it("accepts a valid configured value (e.g. 7)", () => {
    const config = loadJiraConfig({ ...BASE_ENV, MORNING_CONTEXT_LOOKBACK_DAYS: "7" });
    expect(config?.lookbackDays).toBe(7);
  });

  it("accepts the maximum allowed value (365)", () => {
    const config = loadJiraConfig({ ...BASE_ENV, MORNING_CONTEXT_LOOKBACK_DAYS: "365" });
    expect(config?.lookbackDays).toBe(365);
  });

  it.each([
    ["non-numeric", "not-a-number"],
    ["decimal", "7.5"],
    ["zero", "0"],
    ["negative", "-5"],
    ["greater than 365", "366"],
    ["empty string", ""],
  ])("falls back to 30 for an invalid value (%s: %s)", (_label, value) => {
    const config = loadJiraConfig({ ...BASE_ENV, MORNING_CONTEXT_LOOKBACK_DAYS: value });
    expect(config?.lookbackDays).toBe(30);
  });
});

// --- Successful issue search --------------------------------------------

describe("JiraAdapter.searchIssues — successful search", () => {
  it("maps the Jira response into JiraIssueSummary objects", async () => {
    const fixture = loadFixture("search-response.json");
    const fetchImpl = (async (url: RequestInfo | URL) => {
      const u = new URL(url as string);
      expect(u.pathname).toBe("/rest/api/3/search/jql");
      expect(u.searchParams.get("jql")).toBe("assignee = currentUser()");
      return jsonResponse(fixture);
    }) as typeof fetch;

    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });
    const result = await adapter.searchIssues("assignee = currentUser()");

    expect(result.is_last).toBe(true);
    expect(result.issues).toEqual([
      {
        key: "TRIN-79",
        summary: "Review & make guild for client - translate plugin",
        status: "WT In Progress",
        priority: "Normal",
        assignee: "Helen Nguyen",
        updated: "2026-07-10T20:19:11.811+0700",
        due_date: null,
        url: "https://example.atlassian.net/browse/TRIN-79",
      },
    ]);
  });

  it("caps maxResults at 50 even if a larger value is requested", async () => {
    let capturedMaxResults: string | null = null;
    const fetchImpl = (async (url: RequestInfo | URL) => {
      capturedMaxResults = new URL(url as string).searchParams.get("maxResults");
      return jsonResponse({ issues: [], isLast: true });
    }) as typeof fetch;

    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });
    await adapter.searchIssues("assignee = currentUser()", 500);

    expect(capturedMaxResults).toBe("50");
  });
});

// --- Get issue -----------------------------------------------------------

describe("JiraAdapter.getIssue", () => {
  it("fetches and maps a single issue by key", async () => {
    const fixture = loadFixture("issue.json");
    const fetchImpl = (async (url: RequestInfo | URL) => {
      const u = new URL(url as string);
      expect(u.pathname).toBe("/rest/api/3/issue/TRIN-82");
      return jsonResponse(fixture);
    }) as typeof fetch;

    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });
    const issue = await adapter.getIssue("TRIN-82");

    expect(issue.key).toBe("TRIN-82");
    expect(issue.status).toBe("WT In Progress");
    expect(issue.url).toBe("https://example.atlassian.net/browse/TRIN-82");
  });
});

// --- Pagination ------------------------------------------------------------

describe("JiraAdapter.getMorningContext — pagination", () => {
  it("follows nextPageToken across pages until isLast is true", async () => {
    const page1 = loadFixture("search-page-1.json");
    const page2 = loadFixture("search-page-2.json");
    const requestedPageTokens: (string | null)[] = [];

    const fetchImpl = (async (url: RequestInfo | URL) => {
      const u = new URL(url as string);
      expect(u.pathname).toBe("/rest/api/3/search/jql");
      const pageToken = u.searchParams.get("nextPageToken");
      requestedPageTokens.push(pageToken);
      return jsonResponse(pageToken === null ? page1 : page2);
    }) as typeof fetch;

    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });
    const context = await adapter.getMorningContext();

    expect(requestedPageTokens).toEqual([null, "page2token"]);
    expect(context.assigned_open.map((i) => i.key)).toEqual(["TRIN-79", "TRIN-78", "CW-118"]);
    expect(context.timezone).toBe("Asia/Ho_Chi_Minh");
  });
});

describe("JiraAdapter.getMorningContext — configurable lookback window", () => {
  it("uses the default 30-day window in the JQL when lookbackDays is not configured", async () => {
    let capturedJql: string | null = null;
    const fetchImpl = (async (url: RequestInfo | URL) => {
      capturedJql = new URL(url as string).searchParams.get("jql");
      return jsonResponse({ issues: [], isLast: true });
    }) as typeof fetch;

    const configWithDefault = loadJiraConfig({
      JIRA_BASE_URL: "https://example.atlassian.net",
      JIRA_EMAIL: "helen@wootech.co",
      JIRA_API_TOKEN: "test-token",
    })!;
    const adapter = createJiraAdapter(configWithDefault, { fetchImpl });
    await adapter.getMorningContext();

    expect(capturedJql).toBe("assignee = currentUser() AND updated >= -30d ORDER BY updated DESC");
  });

  it("uses a configured lookback window (7 days) in the JQL", async () => {
    let capturedJql: string | null = null;
    const fetchImpl = (async (url: RequestInfo | URL) => {
      capturedJql = new URL(url as string).searchParams.get("jql");
      return jsonResponse({ issues: [], isLast: true });
    }) as typeof fetch;

    const configWith7DayWindow = { ...VALID_CONFIG, lookbackDays: 7 };
    const adapter = createJiraAdapter(configWith7DayWindow, { fetchImpl });
    await adapter.getMorningContext();

    expect(capturedJql).toBe("assignee = currentUser() AND updated >= -7d ORDER BY updated DESC");
  });

  it("never reintroduces a resolution clause in the JQL", async () => {
    let capturedJql: string | null = null;
    const fetchImpl = (async (url: RequestInfo | URL) => {
      capturedJql = new URL(url as string).searchParams.get("jql");
      return jsonResponse({ issues: [], isLast: true });
    }) as typeof fetch;

    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });
    await adapter.getMorningContext();

    expect(capturedJql).not.toContain("resolution");
  });
});

// --- Jira API failure --------------------------------------------------

describe("JiraClient — Jira API failure", () => {
  it("throws JiraApiError for a 500 response", async () => {
    const fetchImpl = (async () => textResponse("internal error", 500)) as typeof fetch;
    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });

    await expect(adapter.searchIssues("assignee = currentUser()")).rejects.toBeInstanceOf(JiraApiError);
  });

  it("throws JiraAuthError for a 401 response", async () => {
    const fetchImpl = (async () => textResponse("unauthorized", 401)) as typeof fetch;
    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });

    await expect(adapter.getIssue("TRIN-1")).rejects.toBeInstanceOf(JiraAuthError);
  });

  it("throws JiraNotFoundError for a 404 response", async () => {
    const fetchImpl = (async () => textResponse("not found", 404)) as typeof fetch;
    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });

    await expect(adapter.getIssue("TRIN-999999")).rejects.toBeInstanceOf(JiraNotFoundError);
  });
});

// --- Timeout ---------------------------------------------------------------

describe("JiraClient — timeout", () => {
  it("throws JiraTimeoutError when the request never resolves before the timeout", async () => {
    const neverResolvingFetch = ((_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const abortError = new Error("The operation was aborted");
          abortError.name = "AbortError";
          reject(abortError);
        });
      })) as typeof fetch;

    const adapter = createJiraAdapter(VALID_CONFIG, {
      fetchImpl: neverResolvingFetch,
      timeoutMs: 30,
    });

    await expect(adapter.getIssue("TRIN-1")).rejects.toBeInstanceOf(JiraTimeoutError);
  });
});

// --- Timezone classification ------------------------------------------

describe("toHoChiMinhDateString — timezone classification", () => {
  it("returns the date as-is when the input is already +07:00", () => {
    expect(toHoChiMinhDateString("2026-07-10T20:19:11.811+0700")).toBe("2026-07-10");
  });

  it("rolls the date forward when a UTC timestamp crosses midnight in +07:00", () => {
    // 18:00 UTC + 7h = 01:00 the next day in Asia/Ho_Chi_Minh.
    expect(toHoChiMinhDateString("2026-07-10T18:00:00.000Z")).toBe("2026-07-11");
  });

  it("does not roll the date forward when the UTC timestamp stays within the same HCM day", () => {
    // 16:00 UTC + 7h = 23:00 the same day in Asia/Ho_Chi_Minh.
    expect(toHoChiMinhDateString("2026-07-10T16:00:00.000Z")).toBe("2026-07-10");
  });
});

describe("JiraAdapter.getMorningContext — due_today / overdue classification", () => {
  it("buckets issues by comparing due_date against today's Asia/Ho_Chi_Minh date", async () => {
    const todayHCM = toHoChiMinhDateString(new Date());
    const yesterdayHCM = toHoChiMinhDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const rawSearchResponse = {
      issues: [
        {
          key: "DUE-1",
          fields: {
            summary: "Due today",
            status: { name: "To Do" },
            priority: { name: "High" },
            assignee: { displayName: "Helen Nguyen" },
            updated: new Date().toISOString(),
            duedate: todayHCM,
          },
        },
        {
          key: "OVERDUE-1",
          fields: {
            summary: "Overdue",
            status: { name: "To Do" },
            priority: { name: "High" },
            assignee: { displayName: "Helen Nguyen" },
            updated: new Date().toISOString(),
            duedate: yesterdayHCM,
          },
        },
        {
          key: "NODATE-1",
          fields: {
            summary: "No due date",
            status: { name: "To Do" },
            priority: { name: "Normal" },
            assignee: { displayName: "Helen Nguyen" },
            updated: new Date().toISOString(),
            duedate: null,
          },
        },
      ],
      isLast: true,
    };

    const fetchImpl = (async () => jsonResponse(rawSearchResponse)) as typeof fetch;
    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });
    const context = await adapter.getMorningContext();

    expect(context.due_today.map((i) => i.key)).toEqual(["DUE-1"]);
    expect(context.overdue.map((i) => i.key)).toEqual(["OVERDUE-1"]);
    expect(context.assigned_open).toHaveLength(3);
  });
});

// --- Status filtering regression (assigned_open must exclude Done) -----

describe("JiraAdapter.getMorningContext — status filtering (regression)", () => {
  it("excludes Done issues from assigned_open regardless of resolution or recency, but allows them in recently_updated", async () => {
    const todayHCM = toHoChiMinhDateString(new Date());
    const oldIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

    // Mixed fixture: open issues (statusCategory "new"/"indeterminate") and
    // Done issues (statusCategory "done") — mirroring the live bug, where
    // `resolution = Unresolved` in JQL let Done-status issues through
    // because this workspace's workflow never sets `resolution` on the
    // Done transition (confirmed live: GO-37/IN-152/IN-232/TRIN-34).
    const rawSearchResponse = {
      issues: [
        {
          key: "OPEN-1",
          fields: {
            summary: "Still in progress, due today",
            status: { name: "In Progress", statusCategory: { key: "indeterminate" } },
            priority: { name: "Normal" },
            assignee: { displayName: "Helen Nguyen" },
            updated: new Date().toISOString(),
            duedate: todayHCM,
          },
        },
        {
          key: "OPEN-2",
          fields: {
            summary: "To do, untouched for a while",
            status: { name: "To Do", statusCategory: { key: "new" } },
            priority: { name: "Normal" },
            assignee: { displayName: "Helen Nguyen" },
            updated: oldIso,
            duedate: null,
          },
        },
        {
          key: "DONE-RECENT",
          fields: {
            summary: "Finished moments ago, resolution never set",
            status: { name: "Done", statusCategory: { key: "done" } },
            priority: { name: "Normal" },
            assignee: { displayName: "Helen Nguyen" },
            updated: new Date().toISOString(),
            // Due date deliberately set to today too, to prove due_today
            // excludes it (due_today is scoped to assigned_open, which
            // this issue must not be part of).
            duedate: todayHCM,
          },
        },
        {
          key: "DONE-OLD",
          fields: {
            summary: "Finished a month ago",
            status: { name: "Done", statusCategory: { key: "done" } },
            priority: { name: "Normal" },
            assignee: { displayName: "Helen Nguyen" },
            updated: oldIso,
            duedate: null,
          },
        },
      ],
      isLast: true,
    };

    const fetchImpl = (async () => jsonResponse(rawSearchResponse)) as typeof fetch;
    const adapter = createJiraAdapter(VALID_CONFIG, { fetchImpl });
    const context = await adapter.getMorningContext();

    // assigned_open: only the two open issues — no Done issue at all,
    // regardless of how recently it was updated.
    expect(context.assigned_open.map((i) => i.key).sort()).toEqual(["OPEN-1", "OPEN-2"]);

    // recently_updated: Done issues CAN appear here if updated today —
    // DONE-RECENT qualifies, DONE-OLD does not (updated 30 days ago).
    expect(context.recently_updated.map((i) => i.key).sort()).toEqual(["DONE-RECENT", "OPEN-1"]);

    // due_today: scoped to assigned_open only — DONE-RECENT has a due date
    // of today but must NOT appear here, since it's not an open issue.
    expect(context.due_today.map((i) => i.key)).toEqual(["OPEN-1"]);

    // No Done issue anywhere in assigned_open/due_today/overdue.
    for (const issue of [...context.assigned_open, ...context.due_today, ...context.overdue]) {
      expect(issue.key).not.toMatch(/^DONE-/);
    }
  });
});
