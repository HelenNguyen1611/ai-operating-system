import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Only "Approve" counts as formally approved; empty or any other value = pending. */
export function isApprovedLeave(approvalStatus: string | undefined): boolean {
  return approvalStatus?.trim() === "Approve";
}

/**
 * Snapshot record contract, written by Power Automate.
 *
 * Includes **approved and pending** leave — pending rows (empty approval_status,
 * "Pending", etc.) are shown in morning brief with a "(pending approval)" note
 * so planners still see likely absences (e.g. approver forgot to approve).
 *
 * Sensitive fields (Reason, Note, uploads, approver email) are never in this schema.
 */
export const PersonSchema = z
  .object({
    name: z.string().trim().min(1),
    start_date: z.string().regex(DATE_REGEX, "start_date must be in YYYY-MM-DD format"),
    end_date: z.string().regex(DATE_REGEX, "end_date must be in YYYY-MM-DD format"),
    availability_type: z.string().trim().min(1),
    approval_status: z.string().trim().optional().default(""),
  })
  .refine((person) => person.start_date <= person.end_date, {
    message: "end_date must not be before start_date",
    path: ["end_date"],
  });

export const SnapshotSchema = z.object({
  generated_at: z.string().datetime({ offset: true, message: "generated_at must be an ISO 8601 timestamp with a UTC offset" }),
  people: z.array(PersonSchema),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
export type Person = z.infer<typeof PersonSchema>;

export interface TeamAvailabilityEvent {
  name: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  availabilityType: string;
  /** false when approval_status is empty or not exactly "Approve". */
  approved: boolean;
}

export function mapPerson(person: Person): TeamAvailabilityEvent {
  return {
    name: person.name,
    startDate: person.start_date,
    endDate: person.end_date,
    availabilityType: person.availability_type,
    approved: isApprovedLeave(person.approval_status),
  };
}

/** Inclusive on both ends — an event covering [startDate, endDate] is active on any day in that range. */
export function isActiveOnDate(event: TeamAvailabilityEvent, date: string): boolean {
  return event.startDate <= date && date <= event.endDate;
}
