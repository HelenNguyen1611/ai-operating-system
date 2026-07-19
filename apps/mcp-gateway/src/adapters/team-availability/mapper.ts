import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Snapshot record contract, written by Power Automate. approval_status is
 * required to be exactly "Approve" as defence in depth — Power Automate is
 * expected to filter to approved rows before writing the file at all, but
 * this schema refuses to trust that silently: any record that isn't
 * approved fails validation (see SnapshotSchema below), which fails the
 * whole snapshot rather than skipping just that record. A stray
 * unapproved record is a signal the upstream filter is broken, which
 * should be loud, not quietly patched over.
 *
 * Only these five fields are read. Zod strips unrecognized keys by
 * default (no .passthrough() anywhere in this schema) — this is what
 * actually enforces "Reason/Note/uploads/approver details never reach the
 * adapter," as a second, independent safeguard on top of Power Automate's
 * own filtering. approval_status itself is validated but never copied
 * into TeamAvailabilityEvent — see mapPerson().
 */
export const PersonSchema = z
  .object({
    name: z.string().trim().min(1),
    start_date: z.string().regex(DATE_REGEX, "start_date must be in YYYY-MM-DD format"),
    end_date: z.string().regex(DATE_REGEX, "end_date must be in YYYY-MM-DD format"),
    availability_type: z.string().trim().min(1),
    approval_status: z.literal("Approve"),
  })
  .refine((person) => person.start_date <= person.end_date, {
    message: "end_date must not be before start_date",
    path: ["end_date"],
  });

/**
 * No top-level "date" field — the snapshot represents a standing set of
 * approved date-range records, not a single as-of day. The tool's own
 * `date` input (default: today) is queried against each record's
 * start_date/end_date independently of when the snapshot was generated.
 */
export const SnapshotSchema = z.object({
  generated_at: z.string().datetime({ offset: true, message: "generated_at must be an ISO 8601 timestamp with a UTC offset" }),
  people: z.array(PersonSchema),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
export type Person = z.infer<typeof PersonSchema>;

/** Gateway-internal, MCP-facing shape — never includes approval_status or any field outside PersonSchema. */
export interface TeamAvailabilityEvent {
  name: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  availabilityType: string;
}

export function mapPerson(person: Person): TeamAvailabilityEvent {
  return {
    name: person.name,
    startDate: person.start_date,
    endDate: person.end_date,
    availabilityType: person.availability_type,
  };
}

/** Inclusive on both ends — an event covering [startDate, endDate] is active on any day in that range. */
export function isActiveOnDate(event: TeamAvailabilityEvent, date: string): boolean {
  return event.startDate <= date && date <= event.endDate;
}
