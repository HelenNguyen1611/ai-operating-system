import type { TeamMonthCalendar } from "./team-calendar.js";
import { monthCalendarTitle } from "./team-calendar.js";

/** Neutral professional palette — matches Morning Card team summary tones. */
const C = {
  cardBg: "#ffffff",
  cardBorder: "#e5e7eb",
  cardShadow: "0 1px 3px rgba(15,23,42,0.06)",
  headerBg: "#f8fafc",
  headerText: "#64748b",
  nameText: "#0f172a",
  rowAlt: "#fafafa",
  todayCol: "#eff6ff",
  todayAccent: "#2563eb",
  todayLabel: "#1d4ed8",
  weekendHeader: "#f1f5f9",
  weekendCell: "#f8fafc",
  muted: "#cbd5e1",
  legendText: "#64748b",
  approvedBg: "#fef3c7",
  approvedText: "#92400e",
  approvedBorder: "#fde68a",
  pendingBg: "#ffedd5",
  pendingText: "#c2410c",
  pendingBorder: "#fdba74",
  wfhBg: "#ecfdf5",
  wfhText: "#047857",
  wfhBorder: "#a7f3d0",
  slBg: "#fef2f2",
  slText: "#b91c1c",
  slBorder: "#fecaca",
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function badgeStyle(code: string, approved: boolean): string {
  const upper = code.replace("?", "").toUpperCase();
  let bg: string;
  let color: string;
  let border: string;

  if (!approved) {
    bg = C.pendingBg;
    color = C.pendingText;
    border = C.pendingBorder;
  } else if (upper === "WFH") {
    bg = C.wfhBg;
    color = C.wfhText;
    border = C.wfhBorder;
  } else if (upper === "SL") {
    bg = C.slBg;
    color = C.slText;
    border = C.slBorder;
  } else {
    bg = C.approvedBg;
    color = C.approvedText;
    border = C.approvedBorder;
  }

  return [
    "display:inline-block",
    "min-width:22px",
    "padding:1px 4px",
    "border-radius:4px",
    "font-size:9px",
    "font-weight:600",
    "letter-spacing:0.01em",
    "line-height:1.3",
    `background:${bg}`,
    `color:${color}`,
    `border:1px solid ${border}`,
  ].join(";");
}

function renderBadge(code: string, title: string, approved: boolean): string {
  return `<span style="${badgeStyle(code, approved)}" title="${escapeHtml(title)}">${escapeHtml(code)}</span>`;
}

function renderLegend(language: "en" | "vi"): string {
  const items =
    language === "vi"
      ? [
          { code: "AL", label: "Nghỉ phép", approved: true },
          { code: "WFH", label: "WFH", approved: true },
          { code: "SL", label: "Ốm", approved: true },
          { code: "AL?", label: "Chưa duyệt", approved: false },
        ]
      : [
          { code: "AL", label: "Leave", approved: true },
          { code: "WFH", label: "Remote", approved: true },
          { code: "SL", label: "Sick", approved: true },
          { code: "AL?", label: "Pending", approved: false },
        ];

  const chips = items
    .map(
      (item) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px">${renderBadge(item.code, item.label, item.approved)}<span style="font-size:10px;color:${C.legendText}">${escapeHtml(item.label)}</span></span>`,
    )
    .join("");

  return `<div style="display:flex;flex-wrap:wrap;gap:4px 0;padding:8px 12px;border-top:1px solid ${C.cardBorder};background:${C.headerBg}">${chips}</div>`;
}

/**
 * Month grid HTML for Morning Card — current month, horizontal scroll on narrow screens.
 */
export function renderTeamCalendarHtml(
  calendar: TeamMonthCalendar,
  language: "en" | "vi",
): string {
  const monthLabel = monthCalendarTitle(calendar.month, language);
  const title = language === "vi" ? `Lịch team · ${monthLabel}` : `Team schedule · ${monthLabel}`;
  const nameHeader = language === "vi" ? "Thành viên" : "Member";
  const emptyMsg =
    language === "vi"
      ? `Không ai nghỉ phép hoặc WFH trong ${monthLabel}.`
      : `No leave or WFH scheduled in ${monthLabel}.`;

  if (calendar.rows.length === 0) {
    return [
      `<div style="max-width:100%;margin:6px 0 2px;border:1px solid ${C.cardBorder};border-radius:10px;background:${C.cardBg};overflow:hidden;font-family:system-ui,-apple-system,sans-serif">`,
      `<div style="padding:10px 14px;font-size:12px;font-weight:600;color:${C.nameText};background:${C.headerBg};border-bottom:1px solid ${C.cardBorder}">${escapeHtml(title)}</div>`,
      `<div style="padding:14px;font-size:12px;color:${C.legendText}">${escapeHtml(emptyMsg)}</div>`,
      `</div>`,
    ].join("");
  }

  const dayColWidth = 34;
  const nameColWidth = 128;
  const tableMinWidth = nameColWidth + calendar.days.length * dayColWidth;

  const headerCells = calendar.days
    .map((day) => {
      let bg = C.headerBg;
      let color = C.headerText;
      let borderBottom = `1px solid ${C.cardBorder}`;
      if (day.isToday) {
        bg = C.todayCol;
        color = C.todayLabel;
        borderBottom = `2px solid ${C.todayAccent}`;
      } else if (day.isWeekend) {
        bg = C.weekendHeader;
      }
      return `<th style="padding:6px 2px;text-align:center;font-size:10px;font-weight:${day.isToday ? 700 : 500};color:${color};background:${bg};border-bottom:${borderBottom};min-width:${dayColWidth}px">${day.dayOfMonth}</th>`;
    })
    .join("");

  const bodyRows = calendar.rows
    .map((row, rowIndex) => {
      const rowBg = rowIndex % 2 === 1 ? C.rowAlt : C.cardBg;
      const cells = row.cells
        .map((cell, i) => {
          const day = calendar.days[i];
          const isToday = day?.isToday ?? false;
          const isWeekend = day?.isWeekend ?? false;
          let cellBg = rowBg;
          if (isToday) cellBg = C.todayCol;
          else if (isWeekend) cellBg = C.weekendCell;
          if (!cell) {
            return `<td style="padding:5px 2px;text-align:center;background:${cellBg};border-bottom:1px solid ${C.cardBorder};vertical-align:middle"><span style="color:${C.muted};font-size:11px">·</span></td>`;
          }
          const cellTitle =
            cell.title + (cell.approved ? "" : language === "vi" ? " (chưa duyệt)" : " (pending)");
          return `<td style="padding:4px 2px;text-align:center;background:${cellBg};border-bottom:1px solid ${C.cardBorder};vertical-align:middle">${renderBadge(cell.code, cellTitle, cell.approved)}</td>`;
        })
        .join("");
      return `<tr><td style="padding:7px 10px;font-size:11px;font-weight:500;color:${C.nameText};background:${rowBg};border-bottom:1px solid ${C.cardBorder};white-space:nowrap;max-width:${nameColWidth}px;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;position:sticky;left:0;z-index:1;box-shadow:1px 0 0 ${C.cardBorder}" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</td>${cells}</tr>`;
    })
    .join("");

  return [
    `<div style="max-width:100%;margin:6px 0 2px;border:1px solid ${C.cardBorder};border-radius:10px;background:${C.cardBg};box-shadow:${C.cardShadow};overflow:hidden;font-family:system-ui,-apple-system,sans-serif">`,
    `<div style="padding:10px 14px;font-size:12px;font-weight:600;color:${C.nameText};background:${C.headerBg};border-bottom:1px solid ${C.cardBorder}">${escapeHtml(title)}</div>`,
    `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch">`,
    `<table style="border-collapse:collapse;min-width:${tableMinWidth}px;width:100%">`,
    `<thead><tr>`,
    `<th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:600;color:${C.headerText};background:${C.headerBg};border-bottom:1px solid ${C.cardBorder};letter-spacing:0.04em;text-transform:uppercase;min-width:${nameColWidth}px;position:sticky;left:0;z-index:2">${nameHeader}</th>`,
    headerCells,
    `</tr></thead>`,
    `<tbody>${bodyRows}</tbody>`,
    `</table>`,
    `</div>`,
    renderLegend(language),
    `</div>`,
  ].join("");
}

export function renderTeamCalendarSection(
  calendar: TeamMonthCalendar | null | undefined,
  language: "en" | "vi",
): string | null {
  if (!calendar) return null;
  return renderTeamCalendarHtml(calendar, language);
}
