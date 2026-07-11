/**
 * Tool-level ("Layer 2") error format, per ARCHITECTURE.md §5.
 *
 * Distinct from JSON-RPC transport errors ("Layer 1"), which are handled
 * by server.ts / the MCP SDK directly. This envelope is returned as a
 * normal (protocol-successful) tool result with isError: true — the call
 * reached the handler; the operation failed for a domain reason.
 *
 * Code taxonomy is extend-only: add new codes as new failure modes are
 * discovered, never repurpose an existing one for a different meaning.
 */
export type ErrorCode =
  | "VALIDATION_FAILED"
  | "ADAPTER_UNAVAILABLE"
  | "ADAPTER_AUTH_FAILED"
  | "ADAPTER_NOT_FOUND"
  | "ADAPTER_NOT_CONFIGURED"
  | "ADAPTER_TIMEOUT"
  | "FRAMEWORK_FILE_MISSING"
  | "GATEWAY_INTERNAL";

export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    domain: string;
    message: string;
    retryable: boolean;
  };
}

export interface ToolTextContent {
  type: "text";
  text: string;
}

export interface ToolErrorResult {
  [x: string]: unknown;
  isError: true;
  content: ToolTextContent[];
}

export function buildErrorResult(
  code: ErrorCode,
  domain: string,
  message: string,
  retryable = false,
): ToolErrorResult {
  const envelope: ErrorEnvelope = {
    error: { code, domain, message, retryable },
  };

  return {
    isError: true,
    content: [{ type: "text", text: JSON.stringify(envelope) }],
  };
}
