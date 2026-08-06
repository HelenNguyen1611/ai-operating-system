import type { TeamAvailabilityResult } from "../adapters/team-availability/index.js";

export type TeamSummaryStatus = "loaded" | "not_configured" | "error";

export interface TeamSummaryResult {
  status: TeamSummaryStatus;
  /** One-line text for Morning Card "Team:" bullet — copy verbatim. */
  line_en: string;
  line_vi: string;
  /** Optional hint when data loaded but looks stale or empty for today. */
  warning?: string;
}

function groupByType(events: TeamAvailabilityResult["events"]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const event of events) {
    const type = event.availabilityType.trim();
    const names = map.get(type) ?? [];
    names.push(event.name);
    map.set(type, names);
  }
  return map;
}

function formatNames(names: string[], max = 5): string {
  if (names.length <= max) {
    return names.join(", ");
  }
  return `${names.slice(0, max).join(", ")} +${names.length - max} more`;
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
      line_en: `No approved leave or WFH for ${date} — full team capacity expected (leave snapshot checked)${staleNote}`,
      line_vi: `Không có nghỉ phép/WFH đã duyệt ngày ${date} — team đủ người (đã kiểm tra snapshot)${staleNoteVi}`,
      warning: stale
        ? `Leave snapshot has ${snapshot_people_total} records but none cover ${date}; latest end_date is ${snapshot_latest_end_date}. Check Power Automate export.`
        : undefined,
    };
  }

  const grouped = groupByType(events);
  const partsEn: string[] = [];
  const partsVi: string[] = [];

  for (const [type, names] of grouped) {
    const label = formatNames(names);
    partsEn.push(`${label} — ${type}`);
    partsVi.push(`${label} — ${type}`);
  }

  return {
    status: "loaded",
    line_en: partsEn.join("; "),
    line_vi: partsVi.join("; "),
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
