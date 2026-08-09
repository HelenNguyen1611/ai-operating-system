import type { TeamAvailabilityResult } from "../adapters/team-availability/index.js";
import type { TeamAvailabilityEvent } from "../adapters/team-availability/mapper.js";

export type TeamSummaryStatus = "loaded" | "not_configured" | "error";
export type TeamCapacityStatus = "full" | "partial" | "unknown";

/** Tailwind-like hex — inline HTML for Claude App markdown where supported; emoji as fallback. */
const COLOR_GREEN = "#16a34a";
const COLOR_YELLOW = "#ca8a04";
const COLOR_MUTED = "#6b7280";

export interface TeamSummaryResult {
  status: TeamSummaryStatus;
  /** full = nobody out; partial = leave/WFH today; unknown = not loaded */
  capacity: TeamCapacityStatus;
  /** One-line HTML for Morning Card "Team:" bullet — copy verbatim. */
  line_en: string;
  line_vi: string;
  warning?: string;
}

function teamLine(color: string, emoji: string, text: string): string {
  return `<span style="color:${color}">${emoji} ${text}</span>`;
}

function teamLineGreen(text: string): string {
  return teamLine(COLOR_GREEN, "🟢", text);
}

function teamLineYellow(text: string): string {
  return teamLine(COLOR_YELLOW, "🟡", text);
}

function teamLineMuted(text: string): string {
  return teamLine(COLOR_MUTED, "⚪", text);
}

function formatEvent(event: TeamAvailabilityEvent, language: "en" | "vi"): string {
  const base = `${event.name} — ${event.availabilityType}`;
  if (event.approved) {
    return base;
  }
  return language === "vi" ? `${base} (chưa approve)` : `${base} (pending approval)`;
}

function formatNames(events: TeamAvailabilityEvent[], language: "en" | "vi", max = 5): string {
  const formatted = events.map((e) => formatEvent(e, language));
  if (formatted.length <= max) {
    return formatted.join("; ");
  }
  return `${formatted.slice(0, max).join("; ")} +${formatted.length - max} more`;
}

function buildLoadedLines(result: TeamAvailabilityResult): TeamSummaryResult {
  const { date, events, snapshot_latest_end_date, snapshot_people_total } = result;

  if (events.length === 0) {
    const stale =
      snapshot_people_total > 0 &&
      snapshot_latest_end_date !== "" &&
      snapshot_latest_end_date < date;
    const staleNoteEn = stale
      ? ` (snapshot may be outdated — latest record ends ${snapshot_latest_end_date})`
      : "";
    const staleNoteVi = stale
      ? ` (snapshot có thể lỗi thời — bản ghi mới nhất đến ${snapshot_latest_end_date})`
      : "";
    return {
      status: "loaded",
      capacity: "full",
      line_en: teamLineGreen(`No leave or WFH recorded for today.${staleNoteEn}`),
      line_vi: teamLineGreen(`Không ghi nhận nghỉ phép/WFH hôm nay.${staleNoteVi}`),
      warning: stale
        ? `Leave snapshot has ${snapshot_people_total} records but none cover ${date}; latest end_date is ${snapshot_latest_end_date}. Check Power Automate export.`
        : undefined,
    };
  }

  const approved = events.filter((e) => e.approved);
  const pending = events.filter((e) => !e.approved);

  const partsEn: string[] = [];
  const partsVi: string[] = [];

  if (approved.length > 0) {
    partsEn.push(formatNames(approved, "en"));
    partsVi.push(formatNames(approved, "vi"));
  }
  if (pending.length > 0) {
    partsEn.push(formatNames(pending, "en"));
    partsVi.push(formatNames(pending, "vi"));
  }

  const textEn = partsEn.join("; ");
  const textVi = partsVi.join("; ");

  return {
    status: "loaded",
    capacity: "partial",
    line_en: teamLineYellow(textEn),
    line_vi: teamLineYellow(textVi),
    warning:
      pending.length > 0
        ? `${pending.length} pending leave record(s) on ${date} — treat as likely absence until approved or rejected.`
        : undefined,
  };
}

export function buildTeamSummary(
  teamAvailability: TeamAvailabilityResult | null,
  teamAvailabilityError?: string,
): TeamSummaryResult {
  if (teamAvailabilityError) {
    if (teamAvailabilityError.includes("ADAPTER_NOT_CONFIGURED")) {
      return {
        status: "not_configured",
        capacity: "unknown",
        line_en: teamLineMuted("Not verified — team availability source not configured"),
        line_vi: teamLineMuted("Chưa xác minh — chưa cấu hình nguồn team availability"),
      };
    }
    return {
      status: "error",
      capacity: "unknown",
      line_en: teamLineMuted(
        `Not verified — team availability error (${teamAvailabilityError.slice(0, 120)})`,
      ),
      line_vi: teamLineMuted(
        `Chưa xác minh — lỗi team availability (${teamAvailabilityError.slice(0, 120)})`,
      ),
    };
  }

  if (!teamAvailability) {
    return {
      status: "not_configured",
      capacity: "unknown",
      line_en: teamLineMuted("Not verified — team availability not loaded"),
      line_vi: teamLineMuted("Chưa xác minh — chưa load team availability"),
    };
  }

  return buildLoadedLines(teamAvailability);
}
