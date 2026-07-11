/**
 * Typed Jira adapter errors. Every upstream failure mode the client can
 * produce is translated into one of these before it leaves src/adapters/jira
 * — per ARCHITECTURE.md §7, tool handlers must never see a raw Jira HTTP
 * response or a raw fetch/AbortError.
 */

export class JiraNotConfiguredError extends Error {
  constructor() {
    super(
      "Jira is not configured: JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN must all be set.",
    );
    this.name = "JiraNotConfiguredError";
  }
}

export class JiraTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Jira request timed out after ${timeoutMs}ms`);
    this.name = "JiraTimeoutError";
  }
}

export class JiraAuthError extends Error {
  constructor(public readonly status: number) {
    super(`Jira rejected the request as unauthorized (HTTP ${status})`);
    this.name = "JiraAuthError";
  }
}

export class JiraNotFoundError extends Error {
  constructor(public readonly resource: string) {
    super(`Jira resource not found: ${resource}`);
    this.name = "JiraNotFoundError";
  }
}

/** Catch-all for any other non-2xx response or network failure. */
export class JiraApiError extends Error {
  constructor(
    public readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = "JiraApiError";
  }
}

export type JiraAdapterError =
  | JiraNotConfiguredError
  | JiraTimeoutError
  | JiraAuthError
  | JiraNotFoundError
  | JiraApiError;
