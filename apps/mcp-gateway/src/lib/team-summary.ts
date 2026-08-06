import type { TeamAvailabilityResult } from "../adapters/team-availability/index.js";
import type { TeamAvailabilityEvent } from "../adapters/team-availability/mapper.js";

export type TeamSummaryStatus = "loaded" | "not_configured" | "error";

export interface TeamSummaryResult {
  status: TeamSummaryStatus;
  /** One-line text for Morning Card "Team:" bullet — copy verbatim. */
  line_en: string;
  line_vi: string;
  /** Optional hint when data loaded but looks stale or empty for today. */
  warning?: string;
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
    const staleNote = stale
      ? ` (warning: leave snapshot may be outdated — latest record ends ${snapshot_latest_end_date})`
      : "";
    const staleNoteVi = stale
      ? ` (cảnh báo: snapshot nghỉ có thể lỗi thời — bản ghi mới nhất đến ${snapshot_latest_end_date})`
      : "";
    return {
      status: "loaded",
      line_en: `No leave or WFH recorded for ${date} — full team capacity expected (leave snapshot checked)${staleNote}`,
      line_vi: `Không ghi nhận nghỉ/WFH ngày ${date} — team đủ người (đã kiểm tra snapshot)${staleNoteVi}`,
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

  return {
    status: "loaded",
    line_en: partsEn.join("; "),
    line_vi: partsVi.join("; "),
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
        line_en: "Not verified — team availability source not configured",
        line_vi: "Chưa xác minh — chưa cấu hình nguồn team availability",
      };
    }
    return {
      status: "error",
      line_en: `Not verified — team availability error (${teamAvailabilityError.slice(0, 120)})`,
      line_vi: `Chưa xác minh — lỗi team availability (${teamAvailabilityError.slice(0, 120)})`,
    };
  }

  if (!teamAvailability) {
    return {
      status: "not_configured",
      line_en: "Not verified — team availability not loaded",
      line_vi: "Chưa xác minh — chưa load team availability",
    };
  }

  return buildLoadedLines(teamAvailability);
}
