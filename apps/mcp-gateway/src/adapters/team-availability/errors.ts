/**
 * Typed Team Availability adapter errors, mirroring src/adapters/jira/errors.ts.
 * Every upstream (Microsoft Graph) failure mode is translated into one of
 * these before it leaves src/adapters/team-availability — tool handlers
 * must never see a raw Graph HTTP response or a raw fetch/AbortError.
 */

export class TeamAvailabilityNotConfiguredError extends Error {
  constructor() {
    super(
      "Team Availability is not configured: TEAM_AVAILABILITY_TENANT_ID, " +
        "TEAM_AVAILABILITY_CLIENT_ID, TEAM_AVAILABILITY_CLIENT_SECRET, " +
        "TEAM_AVAILABILITY_DRIVE_ID, and TEAM_AVAILABILITY_ITEM_ID must all be set.",
    );
    this.name = "TeamAvailabilityNotConfiguredError";
  }
}

export class TeamAvailabilityTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Team Availability request timed out after ${timeoutMs}ms`);
    this.name = "TeamAvailabilityTimeoutError";
  }
}

export class TeamAvailabilityAuthError extends Error {
  constructor(public readonly status: number) {
    super(`Microsoft Graph rejected the request as unauthorized (HTTP ${status})`);
    this.name = "TeamAvailabilityAuthError";
  }
}

export class TeamAvailabilityNotFoundError extends Error {
  constructor(public readonly resource: string) {
    super(`Microsoft Graph resource not found: ${resource}`);
    this.name = "TeamAvailabilityNotFoundError";
  }
}

/** Catch-all for any other non-2xx response or network failure. */
export class TeamAvailabilityApiError extends Error {
  constructor(
    public readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = "TeamAvailabilityApiError";
  }
}

export type TeamAvailabilityAdapterError =
  | TeamAvailabilityNotConfiguredError
  | TeamAvailabilityTimeoutError
  | TeamAvailabilityAuthError
  | TeamAvailabilityNotFoundError
  | TeamAvailabilityApiError;
