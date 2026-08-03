/**
 * Typed Daily Report adapter errors, mirroring
 * src/adapters/team-availability/errors.ts. Every failure mode reading/
 * writing the local per-day snapshot file is translated into one of these
 * before it leaves src/adapters/daily-report — tool handlers must never see
 * a raw fs error, JSON.parse SyntaxError, or Zod error.
 */

export class DailyReportNotFoundError extends Error {
  constructor(
    public readonly date: string,
    public readonly path: string,
  ) {
    super(`No daily report saved for ${date} (${path})`);
    this.name = "DailyReportNotFoundError";
  }
}

export class DailyReportInvalidError extends Error {
  constructor(
    public readonly date: string,
    detail: string,
  ) {
    super(`Daily report for ${date} is invalid: ${detail}`);
    this.name = "DailyReportInvalidError";
  }
}

export class DailyReportWriteFailedError extends Error {
  constructor(
    public readonly path: string,
    detail: string,
  ) {
    super(`Failed to write daily report at ${path}: ${detail}`);
    this.name = "DailyReportWriteFailedError";
  }
}

export type DailyReportAdapterError =
  | DailyReportNotFoundError
  | DailyReportInvalidError
  | DailyReportWriteFailedError;
