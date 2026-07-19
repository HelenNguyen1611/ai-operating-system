import type { JiraConfig } from "./config.js";
import { JiraClient, paginateAll, type JiraClientOptions } from "./client.js";
import {
  isDoneStatusCategory,
  mapIssue,
  type JiraIssueRaw,
  type JiraIssueSummary,
  type JiraSearchResponseRaw,
} from "./mapper.js";

const JIRA_DISPLAY_TIMEZONE = "Asia/Ho_Chi_Minh"; // matches config/runtime.yaml jira.display_timezone
const DEFAULT_SEARCH_MAX_RESULTS = 25;
const SEARCH_MAX_RESULTS_CAP = 50;
const MORNING_CONTEXT_MAX_ITEMS = 100;
const ISSUE_FIELDS = "summary,status,priority,assignee,updated,duedate";

/**
 * Deliberately no `AND resolution = Unresolved` clause — see
 * isDoneStatusCategory()'s doc comment in mapper.ts for why that field is
 * unreliable in this workspace. Open/Done filtering happens client-side
 * (statusCategory-based) after fetching, not in JQL.
 *
 * `updated >= -{lookbackDays}d` bounds the result set to recent activity —
 * configurable via MORNING_CONTEXT_LOOKBACK_DAYS (see config.ts), default
 * 30 days. This is what recently_updated draws from (the unfiltered list,
 * so Done issues updated within the window can still appear there), and
 * what assigned_open is filtered down from. Combined with the pagination
 * cap (MORNING_CONTEXT_MAX_ITEMS) below, this bounds both how far back and
 * how many issues a single call can pull.
 */
function buildMorningContextJql(lookbackDays: number): string {
  return `assignee = currentUser() AND updated >= -${lookbackDays}d ORDER BY updated DESC`;
}

export interface JiraSearchResult {
  issues: JiraIssueSummary[];
  /**
   * Whether this response contains all matching issues (true) or more
   * exist beyond maxResults (false). Replaces a `total` count field —
   * Jira's replacement search endpoint (/rest/api/3/search/jql) no longer
   * returns a total match count at all (dropped for performance as part
   * of Atlassian's search API migration). Callers who need "how many
   * results are there" cannot get an exact count from this tool; only
   * whether more exist.
   */
  is_last: boolean;
}

export interface JiraMorningContext {
  assigned_open: JiraIssueSummary[];
  recently_updated: JiraIssueSummary[];
  due_today: JiraIssueSummary[];
  overdue: JiraIssueSummary[];
  generated_at: string;
  timezone: typeof JIRA_DISPLAY_TIMEZONE;
}

/**
 * Formats a Date/ISO-timestamp as a YYYY-MM-DD calendar date **in
 * Asia/Ho_Chi_Minh wall-clock time**, not the input's own offset or the
 * host machine's local timezone. This is the "normalise timestamps to
 * Asia/Ho_Chi_Minh before classification" requirement — every due/overdue/
 * recently-updated decision below compares dates produced by this function,
 * never a raw ISO string or a host-local Date method.
 *
 * en-CA is used only because that locale's date formatting happens to be
 * YYYY-MM-DD — no calendar/locale semantics beyond formatting are implied.
 */
function toHoChiMinhDateString(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JIRA_DISPLAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export class JiraAdapter {
  private readonly client: JiraClient;

  constructor(
    private readonly config: JiraConfig,
    options: JiraClientOptions = {},
  ) {
    this.client = new JiraClient(config, options);
  }

  async searchIssues(jql: string, maxResults: number = DEFAULT_SEARCH_MAX_RESULTS): Promise<JiraSearchResult> {
    const cappedMaxResults = Math.min(Math.max(1, maxResults), SEARCH_MAX_RESULTS_CAP);

    const page = await this.client.getJson<JiraSearchResponseRaw>("/rest/api/3/search/jql", {
      jql,
      maxResults: cappedMaxResults,
      fields: ISSUE_FIELDS,
    });

    return {
      issues: page.issues.map((issue) => mapIssue(issue, this.config.baseUrl)),
      is_last: page.isLast ?? !page.nextPageToken,
    };
  }

  async getIssue(key: string): Promise<JiraIssueSummary> {
    const raw = await this.client.getJson<JiraIssueRaw>(`/rest/api/3/issue/${encodeURIComponent(key)}`, {
      fields: ISSUE_FIELDS,
    });
    return mapIssue(raw, this.config.baseUrl);
  }

  async getMorningContext(): Promise<JiraMorningContext> {
    const jql = buildMorningContextJql(this.config.lookbackDays);

    const rawIssues = await paginateAll(
      async (pageToken) => {
        const page = await this.client.getJson<JiraSearchResponseRaw>("/rest/api/3/search/jql", {
          jql,
          maxResults: SEARCH_MAX_RESULTS_CAP,
          fields: ISSUE_FIELDS,
          nextPageToken: pageToken,
        });
        return {
          items: page.issues,
          nextPageToken: page.nextPageToken,
          isLast: page.isLast ?? !page.nextPageToken,
        };
      },
      { maxItems: MORNING_CONTEXT_MAX_ITEMS },
    );

    // Mapped once, unfiltered by status — recently_updated needs Done
    // issues too (a Done issue closed 5 minutes ago is "recently updated"),
    // while assigned_open must not. Filtering assigned_open here and then
    // deriving recently_updated FROM assigned_open (the previous bug) would
    // make it impossible for recently_updated to ever include Done work.
    const allMapped = rawIssues.map((issue) => mapIssue(issue, this.config.baseUrl));
    const todayHCM = toHoChiMinhDateString(new Date());

    const assigned_open = allMapped.filter((_issue, i) => !isDoneStatusCategory(rawIssues[i]));

    const recently_updated = allMapped.filter(
      (issue) => issue.updated !== null && toHoChiMinhDateString(issue.updated) === todayHCM,
    );

    // due_today/overdue intentionally scoped to assigned_open (open issues
    // only) — same comparison logic as before the fix, just now operating
    // on a correctly-filtered base list. A due date on a completed issue
    // isn't operationally "due" or "overdue" anymore.
    const due_today = assigned_open.filter((issue) => issue.due_date === todayHCM);
    const overdue = assigned_open.filter(
      (issue) => issue.due_date !== null && issue.due_date < todayHCM,
    );

    return {
      assigned_open,
      recently_updated,
      due_today,
      overdue,
      generated_at: new Date().toISOString(),
      timezone: JIRA_DISPLAY_TIMEZONE,
    };
  }
}

export function createJiraAdapter(config: JiraConfig, options?: JiraClientOptions): JiraAdapter {
  return new JiraAdapter(config, options);
}

// Exported for direct unit testing of timezone classification (§ "timezone
// classification" in the Phase 2 test requirements) — not otherwise part of
// the adapter's public surface a tool handler would call.
export { toHoChiMinhDateString };
export type { JiraIssueSummary } from "./mapper.js";
export type { JiraConfig } from "./config.js";
