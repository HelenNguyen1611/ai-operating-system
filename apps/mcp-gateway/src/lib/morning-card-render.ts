import type { JiraMorningContext } from "../adapters/jira/index.js";
import type { JiraIssueSummary } from "../adapters/jira/mapper.js";
import type { MorningLiveContext } from "./live-context-fetch.js";
import type { TeamSummaryResult } from "./team-summary.js";
import { renderTeamCalendarSection } from "./team-calendar-render.js";

export interface RenderMorningCardInput {
  language: "en" | "vi";
  detail: "brief" | "standard" | "full";
  timezone: string;
  live: MorningLiveContext;
  jiraBaseUrl?: string;
}

interface RankedIssue {
  issue: JiraIssueSummary;
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
  why: string;
}

const PRIORITY_DISPLAY_LIMIT = 10;

export class MorningCardContractError extends Error {
  constructor(message: string) {
    super(`Morning Card contract violation: ${message}`);
    this.name = "MorningCardContractError";
  }
}

const LABELS = {
  en: {
    title: "Morning Brief",
    snapshot: "Snapshot",
    firstAction: "First action →",
    mission: "Mission →",
    confidence: "Confidence →",
    atGlance: "At a glance",
    team: "Team",
    calendar: "Calendar",
    jira: "Jira",
    jiraNotLoaded: "not loaded",
    jiraViewAll: "View all open tasks →",
    calendarDefault: "not loaded via gateway — add from M365 if connected",
    priorities: "Priorities",
    priorityList: "Ranked open issues",
    showingIssues: (shown: number, total: number) => `Showing ${shown} of ${total} open issue(s)`,
    viewRemaining: "View all open issues →",
    risks: "Risks",
    standup: "Stand-up",
    high: "High",
    medium: "Medium",
    low: "Low",
    noneQualify: "No further ranked items today",
    fewerCandidates: (n: number) => `Only ${n} candidate(s) available today`,
    firstActionFallback: "Review open issues and pick the first executable item",
    missionFallback: "Clear highest-impact delivery items before stand-up",
    riskJira: "Jira priorities loaded from live context",
    riskTeamStale: (w: string) => w,
    riskCalendar: "Calendar not verified via gateway",
  },
  vi: {
    title: "Báo cáo đầu ngày",
    snapshot: "Tóm tắt nhanh",
    firstAction: "Việc đầu tiên →",
    mission: "Mục tiêu →",
    confidence: "Độ tin cậy →",
    atGlance: "Tổng quan",
    team: "Team",
    calendar: "Lịch",
    jira: "Jira",
    jiraNotLoaded: "chưa load",
    jiraViewAll: "Xem tất cả task mở →",
    calendarDefault: "chưa load qua gateway — bổ sung từ M365 nếu đã kết nối",
    priorities: "Ưu tiên",
    priorityList: "Issue mở đã xếp hạng",
    showingIssues: (shown: number, total: number) => `Đang hiển thị ${shown} / tổng ${total} issue mở`,
    viewRemaining: "Xem đầy đủ issue mở →",
    risks: "Rủi ro",
    standup: "Stand-up",
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
    noneQualify: "Không còn item xếp hạng thêm hôm nay",
    fewerCandidates: (n: number) => `Chỉ có ${n} candidate hôm nay`,
    firstActionFallback: "Xem danh sách issue mở và chọn việc có thể làm ngay",
    missionFallback: "Xử lý các hạng mục delivery quan trọng nhất trước stand-up",
    riskJira: "Ưu tiên Jira từ live context",
    riskTeamStale: (w: string) => w,
    riskCalendar: "Lịch chưa xác minh qua gateway",
  },
} as const;

function formatHeaderDate(timezone: string): { weekday: string; date: string } {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" }).format(now);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return { weekday, date };
}

function jiraFilterUrl(baseUrl: string): string {
  const jql = "assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC";
  return `${baseUrl}/issues/?jql=${encodeURIComponent(jql)}`;
}

function rankIssues(jira: JiraMorningContext, language: "en" | "vi"): RankedIssue[] {
  // recently_updated intentionally includes recently completed work for
  // reporting. Priorities, however, must only contain issues still present in
  // assigned_open. Keep the data contract and presentation concern separate.
  const openKeys = new Set(jira.assigned_open.map((issue) => issue.key));
  const overdueKeys = new Set(jira.overdue.map((i) => i.key));
  const dueTodayKeys = new Set(jira.due_today.map((i) => i.key));
  const recentlyUpdatedKeys = new Set(jira.recently_updated.map((i) => i.key));
  const seen = new Set<string>();
  const ranked: RankedIssue[] = [];

  const buckets: JiraIssueSummary[][] = [
    jira.overdue,
    jira.due_today,
    jira.recently_updated,
    jira.assigned_open,
  ];

  for (const bucket of buckets) {
    for (const issue of bucket) {
      if (!openKeys.has(issue.key)) continue;
      if (seen.has(issue.key)) continue;
      seen.add(issue.key);

      let quadrant: RankedIssue["quadrant"] = "Q2";
      let why: string;

      if (overdueKeys.has(issue.key)) {
        quadrant = "Q1";
        why =
          language === "vi"
            ? `Quá hạn (due ${issue.due_date ?? "?"})`
            : `Overdue (due ${issue.due_date ?? "?"})`;
      } else if (dueTodayKeys.has(issue.key)) {
        quadrant = "Q1";
        why = language === "vi" ? "Due hôm nay" : "Due today";
      } else if (recentlyUpdatedKeys.has(issue.key)) {
        quadrant = "Q2";
        why = language === "vi" ? "Cập nhật hôm nay" : "Updated today";
      } else {
        quadrant = "Q2";
        why =
          language === "vi"
            ? `Đang mở — ${issue.status}`
            : `Open — ${issue.status}`;
      }

      ranked.push({ issue, quadrant, why });
    }
  }

  return ranked;
}

function confidenceLevel(live: MorningLiveContext): "high" | "medium" | "low" {
  const jiraOk = !!live.jira;
  const teamOk = live.team_summary.status === "loaded";
  if (jiraOk && teamOk) return "high";
  if (jiraOk || teamOk) return "medium";
  return "low";
}

function tick(ok: boolean): string {
  return ok ? "✓" : "○";
}

function formatPriorityLine(item: RankedIssue, index: number): string {
  const link = `[${item.issue.key}](${item.issue.url})`;
  const summary = item.issue.summary ? ` — ${item.issue.summary}` : "";
  return `${index}. **[${item.quadrant}]** ${link}${summary} — ${item.why}`;
}

function buildRisks(
  live: MorningLiveContext,
  labels: (typeof LABELS)["en"] | (typeof LABELS)["vi"],
  rankedCount: number,
): string[] {
  const risks: string[] = [];
  if (live.jira) risks.push(`- ${labels.riskJira}`);
  if (live.team_summary.warning) risks.push(`- ${labels.riskTeamStale(live.team_summary.warning)}`);
  risks.push(`- ${labels.riskCalendar}`);
  if (rankedCount === 0 && live.jira) {
    risks.push("- No open Jira candidates in morning context buckets");
  }
  return risks.slice(0, 3);
}

/**
 * Fail closed when a renderer change breaks the public Morning Card layout.
 * This guarantees the MCP tool never emits a partially ordered or legacy
 * timeline-shaped card. It cannot control whether a client model rewrites a
 * valid tool result after receiving it.
 */
export function validateMorningCardMarkdown(
  markdown: string,
  language: "en" | "vi",
  hasTeamCalendar: boolean,
): void {
  const L = LABELS[language];
  const requiredInOrder = [
    `# ${L.title}`,
    `### ${L.snapshot}`,
    `### ${L.atGlance}`,
    `### ${L.priorities}`,
    `### ${L.risks}`,
    `### ${L.standup}`,
  ];

  let previousIndex = -1;
  for (const marker of requiredInOrder) {
    const markerIndex = markdown.indexOf(marker);
    if (markerIndex === -1) {
      throw new MorningCardContractError(`missing required section: ${marker}`);
    }
    if (markerIndex <= previousIndex) {
      throw new MorningCardContractError(`section out of order: ${marker}`);
    }
    previousIndex = markerIndex;
  }

  const forbiddenPatterns: Array<[RegExp, string]> = [
    [/^###? Needs attention$/im, "legacy Needs attention section"],
    [/^###? Resolved$/im, "legacy Resolved section"],
    [/^###? (morning|midday|afternoon)$/im, "legacy timeline section"],
    [/^\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*[–-]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)$/im, "hour-block timeline"],
  ];
  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(markdown)) {
      throw new MorningCardContractError(`forbidden ${label}`);
    }
  }

  if (hasTeamCalendar) {
    const weeklyLabel = language === "vi" ? "**Tuần 1**" : "**Week 1**";
    const compactLabel = language === "vi" ? "**Dạng gọn · mobile**" : "**Compact · mobile**";
    if (!markdown.includes(weeklyLabel)) {
      throw new MorningCardContractError("missing weekly team calendar");
    }
    if (!markdown.includes(compactLabel)) {
      throw new MorningCardContractError("missing compact mobile team calendar");
    }
  }
}

/**
 * Server-rendered Morning Card markdown for brief/standard.
 * Designed to be shown verbatim by the client — no alternate layouts.
 */
export function renderMorningCard(input: RenderMorningCardInput): string {
  const { language, detail, timezone, live, jiraBaseUrl } = input;
  const L = LABELS[language];
  const { weekday, date } = formatHeaderDate(timezone);
  const teamLine = language === "vi" ? live.team_summary.line_vi : live.team_summary.line_en;
  const teamCalendarBlock = renderTeamCalendarSection(
    live.team_availability?.month_calendar,
    language,
  );
  const conf = confidenceLevel(live);
  const confLabel = L[conf === "high" ? "high" : conf === "medium" ? "medium" : "low"];

  const ranked = live.jira ? rankIssues(live.jira, language) : [];
  const displayedPriorities = ranked.slice(0, PRIORITY_DISPLAY_LIMIT);
  const primaryPriorities = displayedPriorities.slice(0, 3);

  const firstAction =
    displayedPriorities.length > 0
      ? language === "vi"
        ? `Bắt đầu ${displayedPriorities[0].issue.key} — ${displayedPriorities[0].issue.summary || displayedPriorities[0].why}`
        : `Start ${displayedPriorities[0].issue.key} — ${displayedPriorities[0].issue.summary || displayedPriorities[0].why}`
      : L.firstActionFallback;

  const mission =
    primaryPriorities.length > 0
      ? language === "vi"
        ? `Hoàn thành ${primaryPriorities.map((t) => t.issue.key).join(", ")}`
        : `Progress ${primaryPriorities.map((t) => t.issue.key).join(", ")}`
      : L.missionFallback;

  let jiraLine: string;
  if (live.jira && jiraBaseUrl) {
    const open = live.jira.assigned_open.length;
    const due = live.jira.due_today.length;
    const overdue = live.jira.overdue.length;
    const link = jiraFilterUrl(jiraBaseUrl);
    jiraLine =
      language === "vi"
        ? `- **${L.jira}:** ${open} mở · due hôm nay ${due} · quá hạn ${overdue} · [${L.jiraViewAll}](${link})`
        : `- **${L.jira}:** ${open} open · due today ${due} · overdue ${overdue} · [${L.jiraViewAll}](${link})`;
  } else {
    jiraLine =
      language === "vi"
        ? `- **${L.jira}:** ${live.jira_error ?? L.jiraNotLoaded}`
        : `- **${L.jira}:** ${live.jira_error ?? L.jiraNotLoaded}`;
  }

  const priorityBlocks: string[] = [];
  const totalOpen = live.jira?.assigned_open.length ?? 0;
  if (displayedPriorities.length > 0) {
    priorityBlocks.push(
      `**${L.priorityList}**`,
      `_${L.showingIssues(displayedPriorities.length, totalOpen)}_`,
      ...displayedPriorities.map((item, i) => formatPriorityLine(item, i + 1)),
    );
  } else {
    priorityBlocks.push(`**${L.priorityList}**`, `_${L.showingIssues(0, totalOpen)}_`, `1. — ${L.fewerCandidates(0)}`);
  }

  if (totalOpen > displayedPriorities.length && jiraBaseUrl) {
    priorityBlocks.push("", `[${L.viewRemaining}](${jiraFilterUrl(jiraBaseUrl)})`);
  }

  const todayStandup =
    primaryPriorities.length > 0
      ? primaryPriorities.map((t) => t.issue.key).join(", ")
      : language === "vi"
        ? "Xem ưu tiên"
        : "See priorities";

  const risks = buildRisks(live, L, ranked.length);

  const lines = [
    `# ${L.title}`,
    `**${weekday}, ${date}** · ${timezone} · ${detail}`,
    "",
    "---",
    "",
    `### ${L.snapshot}`,
    `**${L.firstAction}** ${firstAction}`,
    `**${L.mission}** ${mission}`,
    `**${L.confidence}** ${confLabel} · Jira ${tick(!!live.jira)} · Team ${tick(live.team_summary.status === "loaded")} · Calendar ○ · Email ○`,
    "",
    "---",
    "",
    `### ${L.atGlance}`,
    `- **${L.team}:** ${teamLine}`,
    ...(teamCalendarBlock ? ["", teamCalendarBlock] : []),
    `- **${L.calendar}:** ${L.calendarDefault}`,
    jiraLine,
    "",
    "---",
    "",
    `### ${L.priorities}`,
    "",
    ...priorityBlocks,
    "",
    "---",
    "",
    `### ${L.risks}`,
    ...risks,
    "",
    "---",
    "",
    `### ${L.standup}`,
    `Yesterday: ${language === "vi" ? "—" : "—"}`,
    `Today: ${todayStandup}`,
    "Blockers: None",
    "",
    "---",
  ];

  const markdown = lines.join("\n");
  const hasPopulatedTeamCalendar = (live.team_availability?.month_calendar.rows.length ?? 0) > 0;
  validateMorningCardMarkdown(markdown, language, hasPopulatedTeamCalendar);
  return markdown;
}
