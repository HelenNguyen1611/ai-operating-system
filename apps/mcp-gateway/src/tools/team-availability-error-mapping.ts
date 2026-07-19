import {
  TeamAvailabilityConfigInvalidError,
  TeamAvailabilityNotConfiguredError,
  TeamAvailabilitySnapshotInvalidError,
  TeamAvailabilitySnapshotNotFoundError,
  TeamAvailabilitySnapshotReadFailedError,
  TeamAvailabilitySnapshotStaleError,
} from "../adapters/team-availability/errors.js";
import { buildErrorResult, type ToolErrorResult } from "../types/error-envelope.js";

/**
 * Translates a typed Team Availability adapter error into the shared MCP
 * error envelope, mirroring src/tools/jira-error-mapping.ts. Lives in
 * src/tools/, not src/adapters/team-availability/ — adapters never import
 * MCP SDK/tool-result types (ARCHITECTURE.md §7). Deliberately unaware of
 * src/lib/runtime-config.ts's RuntimeConfigInvalidError — the adapter
 * wraps that into TeamAvailabilityConfigInvalidError itself (see
 * adapters/team-availability/index.ts), so this file only ever needs to
 * know this domain's own error types, same as Jira's mapper.
 */
export function mapTeamAvailabilityAdapterError(error: unknown): ToolErrorResult {
  if (error instanceof TeamAvailabilityNotConfiguredError) {
    return buildErrorResult("ADAPTER_NOT_CONFIGURED", "team_availability", error.message);
  }
  if (error instanceof TeamAvailabilityConfigInvalidError) {
    return buildErrorResult("ADAPTER_CONFIG_INVALID", "team_availability", error.message);
  }
  if (error instanceof TeamAvailabilitySnapshotNotFoundError) {
    // Retryable — Power Automate may simply not have written the file yet.
    return buildErrorResult("SNAPSHOT_NOT_FOUND", "team_availability", error.message, true);
  }
  if (error instanceof TeamAvailabilitySnapshotStaleError) {
    // Retryable — a fresher snapshot may land on the next Power Automate run.
    return buildErrorResult("SNAPSHOT_STALE", "team_availability", error.message, true);
  }
  if (error instanceof TeamAvailabilitySnapshotInvalidError) {
    // Not retryable — malformed content needs a fix, not a retry.
    return buildErrorResult("SNAPSHOT_INVALID", "team_availability", error.message);
  }
  if (error instanceof TeamAvailabilitySnapshotReadFailedError) {
    // Not retryable by default per MVP scope — treated as a persistent
    // condition (e.g. permissions) rather than assumed transient.
    return buildErrorResult("SNAPSHOT_READ_FAILED", "team_availability", error.message);
  }

  return buildErrorResult(
    "GATEWAY_INTERNAL",
    "team_availability",
    error instanceof Error ? error.message : "Unexpected error calling Team Availability",
  );
}
