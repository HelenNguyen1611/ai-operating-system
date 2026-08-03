import {
  DailyReportInvalidError,
  DailyReportNotFoundError,
  DailyReportWriteFailedError,
} from "../adapters/daily-report/errors.js";
import { buildErrorResult, type ToolErrorResult } from "../types/error-envelope.js";

/**
 * Translates a typed Daily Report adapter error into the shared MCP error
 * envelope, mirroring src/tools/team-availability-error-mapping.js. Lives in
 * src/tools/, not src/adapters/daily-report/ — adapters never import MCP
 * SDK/tool-result types (ARCHITECTURE.md §7).
 */
export function mapDailyReportAdapterError(error: unknown): ToolErrorResult {
  if (error instanceof DailyReportNotFoundError) {
    // Not retryable — there is genuinely no record for that date, not a transient condition.
    return buildErrorResult("DAILY_REPORT_NOT_FOUND", "daily_report", error.message);
  }
  if (error instanceof DailyReportInvalidError) {
    // Not retryable — a corrupt file needs a fix, not a retry.
    return buildErrorResult("DAILY_REPORT_INVALID", "daily_report", error.message);
  }
  if (error instanceof DailyReportWriteFailedError) {
    return buildErrorResult("GATEWAY_INTERNAL", "daily_report", error.message);
  }

  return buildErrorResult(
    "GATEWAY_INTERNAL",
    "daily_report",
    error instanceof Error ? error.message : "Unexpected error calling Daily Report",
  );
}
