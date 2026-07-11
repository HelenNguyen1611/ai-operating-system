import {
  JiraApiError,
  JiraAuthError,
  JiraNotConfiguredError,
  JiraNotFoundError,
  JiraTimeoutError,
} from "../adapters/jira/errors.js";
import { buildErrorResult, type ToolErrorResult } from "../types/error-envelope.js";

/**
 * Translates a typed Jira adapter error into the shared MCP error envelope
 * (src/types/error-envelope.ts). Lives in src/tools/, not src/adapters/jira/
 * — adapters never import MCP SDK/tool-result types (ARCHITECTURE.md §7),
 * so this MCP-shaped translation is a tools-layer concern, shared across
 * all three Jira tools to avoid repeating the same catch-block five times.
 */
export function mapJiraAdapterError(error: unknown): ToolErrorResult {
  if (error instanceof JiraNotConfiguredError) {
    return buildErrorResult("ADAPTER_NOT_CONFIGURED", "jira", error.message);
  }
  if (error instanceof JiraTimeoutError) {
    return buildErrorResult("ADAPTER_TIMEOUT", "jira", error.message, true);
  }
  if (error instanceof JiraAuthError) {
    return buildErrorResult("ADAPTER_AUTH_FAILED", "jira", error.message);
  }
  if (error instanceof JiraNotFoundError) {
    return buildErrorResult("ADAPTER_NOT_FOUND", "jira", error.message);
  }
  if (error instanceof JiraApiError) {
    // Network errors and non-2xx responses other than 401/403/404 — treat
    // as retryable (transient upstream/network issue), unlike auth/not-found.
    return buildErrorResult("ADAPTER_UNAVAILABLE", "jira", error.message, true);
  }

  return buildErrorResult(
    "GATEWAY_INTERNAL",
    "jira",
    error instanceof Error ? error.message : "Unexpected error calling Jira",
  );
}
