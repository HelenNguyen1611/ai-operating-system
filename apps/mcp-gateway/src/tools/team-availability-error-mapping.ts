import {
  TeamAvailabilityApiError,
  TeamAvailabilityAuthError,
  TeamAvailabilityNotConfiguredError,
  TeamAvailabilityNotFoundError,
  TeamAvailabilityTimeoutError,
} from "../adapters/team-availability/errors.js";
import { buildErrorResult, type ToolErrorResult } from "../types/error-envelope.js";

/**
 * Translates a typed Team Availability adapter error into the shared MCP
 * error envelope, mirroring src/tools/jira-error-mapping.ts. Lives in
 * src/tools/, not src/adapters/team-availability/ — adapters never import
 * MCP SDK/tool-result types (ARCHITECTURE.md §7).
 */
export function mapTeamAvailabilityAdapterError(error: unknown): ToolErrorResult {
  if (error instanceof TeamAvailabilityNotConfiguredError) {
    return buildErrorResult("ADAPTER_NOT_CONFIGURED", "team_availability", error.message);
  }
  if (error instanceof TeamAvailabilityTimeoutError) {
    return buildErrorResult("ADAPTER_TIMEOUT", "team_availability", error.message, true);
  }
  if (error instanceof TeamAvailabilityAuthError) {
    return buildErrorResult("ADAPTER_AUTH_FAILED", "team_availability", error.message);
  }
  if (error instanceof TeamAvailabilityNotFoundError) {
    return buildErrorResult("ADAPTER_NOT_FOUND", "team_availability", error.message);
  }
  if (error instanceof TeamAvailabilityApiError) {
    // Network errors and non-2xx responses other than 401/403/404 — treat
    // as retryable (transient upstream/network issue), unlike auth/not-found.
    return buildErrorResult("ADAPTER_UNAVAILABLE", "team_availability", error.message, true);
  }

  return buildErrorResult(
    "GATEWAY_INTERNAL",
    "team_availability",
    error instanceof Error ? error.message : "Unexpected error calling Team Availability",
  );
}
