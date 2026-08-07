import type { Person } from "../adapters/team-availability/mapper.js";
import {
  isActiveOnDate,
  mapPerson,
  type TeamAvailabilityEvent,
} from "../adapters/team-availability/mapper.js";

/** Reject / Cancelled / declined — do not mark on the team calendar. */
export function isExcludedLeave(approvalStatus: string | undefined): boolean {
  const normalized = approvalStatus?.trim().toLowerCase() ?? "";
  if (!normalized) return false;
  if (normalized === "approve" || normalized === "approved") return false;
  return (
    normalized.startsWith("reject") ||
    normalized.includes("cancel") ||
    normalized === "declined"
  );
}

export interface TeamCalendarDay {
  date: string;
  dayOfMonth: number;
  isToday: boolean;
  isWeekend: boolean;
}

export interface TeamCalendarCell {
  code: string;
  title: string;
  approved: boolean;
}

export interface TeamCalendarRow {
  name: string;
  cells: (TeamCalendarCell | null)[];
}

export interface TeamMonthCalendar {
  /** YYYY-MM */
  month: string;
  start_date: string;
  end_date: string;
  days: TeamCalendarDay[];
  rows: TeamCalendarRow[];
}

const TYPE_CODES: Record<string, string> = {
  "annual leave": "AL",
  "work from home": "WFH",
  "sick /carer's leave": "SL",
  "sick/ carer's leave": "SL",
  "sick leave": "SL",
  "birthday leave": "BL",
  "unpaid leave": "UL",
};

export function availabilityCode(availabilityType: string): string {
  const key = availabilityType.trim().toLowerCase();
  return TYPE_CODES[key] ?? availabilityType.slice(0, 3).toUpperCase();
}

function parseYearMonth(dateStr: string): { year: number; month: number } {
  return {
    year: Number.parseInt(dateStr.slice(0, 4), 10),
    month: Number.parseInt(dateStr.slice(5, 7), 10),
  };
}

function isWeekend(dateStr: string): boolean {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
  return dow === 0 || dow === 6;
}

/** All YYYY-MM-DD dates in the calendar month containing anchorDate. */
export function daysInMonth(anchorDate: string): string[] {
  const { year, month } = parseYearMonth(anchorDate);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: lastDay }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
}

export function monthCalendarTitle(month: string, language: "en" | "vi"): string {
  const { year, month: m } = parseYearMonth(`${month}-01`);
  const d = new Date(Date.UTC(year, m - 1, 1));
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(d);
}

function cellForDay(events: TeamAvailabilityEvent[], date: string): TeamCalendarCell | null {
  const active = events.filter((e) => isActiveOnDate(e, date));
  if (active.length === 0) return null;
  const pick = active.find((e) => e.approved) ?? active[0];
  const code = availabilityCode(pick.availabilityType);
  return {
    code: pick.approved ? code : `${code}?`,
    title: pick.availabilityType,
    approved: pick.approved,
  };
}

/**
 * Build a month grid (1…last day) for people with leave/WFH in that month.
 * Only rows with at least one marked day are included.
 */
export function buildTeamMonthCalendar(people: Person[], anchorDate: string): TeamMonthCalendar {
  const month = anchorDate.slice(0, 7);
  const dayDates = daysInMonth(anchorDate);
  const eventsByName = new Map<string, TeamAvailabilityEvent[]>();

  for (const person of people) {
    if (isExcludedLeave(person.approval_status)) continue;
    const event = mapPerson(person);
    const list = eventsByName.get(person.name) ?? [];
    list.push(event);
    eventsByName.set(person.name, list);
  }

  const rows: TeamCalendarRow[] = [];

  for (const [name, events] of eventsByName) {
    const cells = dayDates.map((date) => cellForDay(events, date));
    if (cells.every((c) => c === null)) continue;
    rows.push({ name, cells });
  }

  rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  const days: TeamCalendarDay[] = dayDates.map((date) => ({
    date,
    dayOfMonth: Number.parseInt(date.slice(8, 10), 10),
    isToday: date === anchorDate,
    isWeekend: isWeekend(date),
  }));

  return {
    month,
    start_date: dayDates[0] ?? anchorDate,
    end_date: dayDates[dayDates.length - 1] ?? anchorDate,
    days,
    rows,
  };
}

/** @deprecated Use buildTeamMonthCalendar */
export const buildTeamWeekCalendar = buildTeamMonthCalendar;
/** @deprecated Use TeamMonthCalendar */
export type TeamWeekCalendar = TeamMonthCalendar;
