/**
 * Typed Team Availability adapter errors, mirroring src/adapters/jira/errors.ts.
 * Every failure mode reading/validating the local snapshot file is
 * translated into one of these before it leaves
 * src/adapters/team-availability — tool handlers must never see a raw
 * fs error, JSON.parse SyntaxError, or Zod error.
 */

export class TeamAvailabilityNotConfiguredError extends Error {
  constructor() {
    super("Team Availability is not configured: TEAM_AVAILABILITY_SNAPSHOT_PATH must be set.");
    this.name = "TeamAvailabilityNotConfiguredError";
  }
}

/**
 * A configuration value is present but invalid — distinct from "not
 * configured" (nothing is set). Covers both an invalid
 * TEAM_AVAILABILITY_MAX_AGE_MINUTES and a bad output.display_timezone in
 * the shared config/runtime.yaml (see lib/runtime-config.ts). configKey
 * names whichever setting was invalid, since this error class serves both.
 */
export class TeamAvailabilityConfigInvalidError extends Error {
  constructor(
    public readonly configKey: string,
    message: string,
  ) {
    super(message);
    this.name = "TeamAvailabilityConfigInvalidError";
  }
}

export class TeamAvailabilitySnapshotNotFoundError extends Error {
  constructor(public readonly path: string) {
    super(`Team Availability snapshot file not found: ${path}`);
    this.name = "TeamAvailabilitySnapshotNotFoundError";
  }
}

export class TeamAvailabilitySnapshotInvalidError extends Error {
  constructor(detail: string) {
    super(`Team Availability snapshot is invalid: ${detail}`);
    this.name = "TeamAvailabilitySnapshotInvalidError";
  }
}

export class TeamAvailabilitySnapshotStaleError extends Error {
  constructor(
    public readonly generatedAt: string,
    public readonly maxAgeMinutes: number,
  ) {
    super(
      `Team Availability snapshot is stale: generated_at=${generatedAt} exceeds max age of ${maxAgeMinutes} minutes`,
    );
    this.name = "TeamAvailabilitySnapshotStaleError";
  }
}

export class TeamAvailabilitySnapshotReadFailedError extends Error {
  constructor(
    public readonly path: string,
    detail: string,
  ) {
    super(`Failed to read Team Availability snapshot at ${path}: ${detail}`);
    this.name = "TeamAvailabilitySnapshotReadFailedError";
  }
}

export type TeamAvailabilityAdapterError =
  | TeamAvailabilityNotConfiguredError
  | TeamAvailabilityConfigInvalidError
  | TeamAvailabilitySnapshotNotFoundError
  | TeamAvailabilitySnapshotInvalidError
  | TeamAvailabilitySnapshotStaleError
  | TeamAvailabilitySnapshotReadFailedError;
