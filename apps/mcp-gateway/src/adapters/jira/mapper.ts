/**
 * Raw Jira Cloud REST API v3 issue shape — only the fields this adapter
 * requests and reads. Not a complete type for a Jira issue.
 */
export interface JiraIssueRaw {
  key: string;
  fields?: {
    summary?: string;
    status?: { name?: string; statusCategory?: { key?: string } | null } | null;
    priority?: { name?: string } | null;
    assignee?: { displayName?: string } | null;
    updated?: string;
    duedate?: string | null;
  };
}

/**
 * Whether a raw issue belongs to Jira's "Done" status category — the
 * platform-normalised field for "is this actually finished," always
 * present alongside `status` in the Jira REST API response (no extra
 * `fields` request param needed). Deliberately NOT derived from the
 * `resolution` field: this workspace's workflow does not set `resolution`
 * on the Done transition for many issues, so `resolution = Unresolved`
 * (previously used in JQL to mean "not done") silently includes finished
 * work. Confirmed live: GO-37/IN-152/IN-232/TRIN-34 all have
 * status "Done" while resolution is Unresolved.
 *
 * Also NOT derived from `status.name` — custom workflow statuses can be
 * misleadingly named (e.g. a status literally named "WT Done" observed in
 * this workspace with statusCategory "indeterminate", i.e. NOT actually
 * done) — statusCategory is Jira's own designed-for-this field and is the
 * most reliable signal available without per-workspace configuration.
 */
export function isDoneStatusCategory(raw: JiraIssueRaw): boolean {
  return raw.fields?.status?.statusCategory?.key === "done";
}

/**
 * Response shape of GET /rest/api/3/search/jql — the cursor-paginated
 * replacement for the removed GET /rest/api/3/search (HTTP 410 as of the
 * migration documented at https://developer.atlassian.com/changelog/#CHANGE-2046,
 * observed live against a real Jira Cloud site during Phase 2 operation).
 *
 * Unlike the old endpoint, there is no `total` count field — Atlassian
 * dropped it for performance reasons as part of this migration. Pagination
 * is a cursor (`nextPageToken`) rather than an offset (`startAt`).
 *
 * Field names are inferred from Atlassian's documented migration pattern,
 * not verified against a live successful response (only the 410 rejection
 * of the old endpoint has been observed directly) — if a real call shows
 * different field names, update this interface and the call sites in
 * index.ts/client.ts together.
 */
export interface JiraSearchResponseRaw {
  issues: JiraIssueRaw[];
  nextPageToken?: string;
  isLast?: boolean;
}

/** Gateway-internal, MCP-facing issue shape — stable regardless of Jira's raw response shape. */
export interface JiraIssueSummary {
  key: string;
  summary: string;
  status: string;
  priority: string | null;
  assignee: string | null;
  /** Raw ISO timestamp as returned by Jira (includes its own offset). */
  updated: string | null;
  /** Plain YYYY-MM-DD date, or null — Jira due dates carry no time/timezone component. */
  due_date: string | null;
  url: string;
}

export function mapIssue(raw: JiraIssueRaw, baseUrl: string): JiraIssueSummary {
  return {
    key: raw.key,
    summary: raw.fields?.summary ?? "",
    status: raw.fields?.status?.name ?? "Unknown",
    priority: raw.fields?.priority?.name ?? null,
    assignee: raw.fields?.assignee?.displayName ?? null,
    updated: raw.fields?.updated ?? null,
    due_date: raw.fields?.duedate ?? null,
    url: `${baseUrl}/browse/${raw.key}`,
  };
}
