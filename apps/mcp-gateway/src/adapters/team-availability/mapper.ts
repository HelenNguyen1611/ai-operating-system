/**
 * Confirmed workbook column headers (investigation baseline). Only the
 * columns actually needed for the mapped output are named here — Reason,
 * "Upload relevant documents here", Note, Id, and InternalId are never
 * read into TeamAvailabilityEvent, which is what keeps them out of the
 * tool's output (see mapRow()).
 */
export const COLUMN = {
  EMAIL: "Email",
  NAME: "Name",
  FULL_NAME: "Full name",
  LEAVE_TYPE: "Leave type",
  START_DATE: "Start date",
  END_DATE: "End date",
  TOTAL_HOURS: "Total of hours of leave",
  APPROVER: "Leave approver",
  COMPLETION_TIME: "Completion time",
  APPROVAL_STATUS: "Approval Status",
} as const;

/** Gateway-internal, MCP-facing shape — never includes Reason/uploads/Note. */
export interface TeamAvailabilityEvent {
  employeeName: string;
  employeeEmail: string | null;
  leaveType: string | null;
  /** YYYY-MM-DD */
  startDate: string | null;
  /** YYYY-MM-DD */
  endDate: string | null;
  totalHours: number | null;
  approver: string | null;
  submittedDate: string | null;
  approvalStatus: string;
}

/** Zips a table's header row with one data row into a name-keyed record. */
export function zipRow(headers: string[], row: unknown[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  headers.forEach((header, i) => {
    record[header] = row[i];
  });
  return record;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Excel/Graph date cells arrive in one of two shapes depending on how the
 * cell is read (not verified live against this workbook yet — flagged as
 * an open question in the investigation baseline): an ISO-ish date string,
 * or a serial number of days since the Excel epoch (1899-12-30, matching
 * Excel's own — historically incorrect but universally implemented — leap
 * year handling, which is why 1899-12-30 rather than 1900-01-01). Both
 * forms are normalised to a plain YYYY-MM-DD, mirroring how
 * jira/index.ts's toHoChiMinhDateString() treats due dates as carrying no
 * time/timezone component of their own.
 */
function parseExcelDate(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpochMs = Date.UTC(1899, 11, 30);
    const parsed = new Date(excelEpochMs + value * 86_400_000);
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Maps one zipped Excel row into a TeamAvailabilityEvent, or null if the
 * row can't be identified as a usable leave record (no Approval Status
 * value at all — e.g. a still-pending submission — or no employee name in
 * either Full name or Name). Approval-status filtering to exactly
 * "Approve" happens one layer up, in the adapter — this function only
 * rejects rows that are structurally unusable, not ones that are merely
 * not-yet-approved.
 */
export function mapRow(record: Record<string, unknown>): TeamAvailabilityEvent | null {
  const approvalStatus = readString(record[COLUMN.APPROVAL_STATUS]);
  if (!approvalStatus) return null;

  const employeeName = readString(record[COLUMN.FULL_NAME]) ?? readString(record[COLUMN.NAME]);
  if (!employeeName) return null;

  return {
    employeeName,
    employeeEmail: readString(record[COLUMN.EMAIL]),
    leaveType: readString(record[COLUMN.LEAVE_TYPE]),
    startDate: parseExcelDate(record[COLUMN.START_DATE]),
    endDate: parseExcelDate(record[COLUMN.END_DATE]),
    totalHours: readNumber(record[COLUMN.TOTAL_HOURS]),
    approver: readString(record[COLUMN.APPROVER]),
    submittedDate: parseExcelDate(record[COLUMN.COMPLETION_TIME]),
    approvalStatus,
  };
}
