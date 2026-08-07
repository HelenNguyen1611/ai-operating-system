import { readFile } from "node:fs/promises";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  MorningBriefInputSchema,
  MorningBriefInputShape,
  type MorningBriefInput,
} from "../schemas/framework/morning-brief.input.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { REPO_ROOT, resolveRepoPath } from "../lib/repo-paths.js";
import { fetchMorningLiveContext, type MorningLiveContext } from "../lib/live-context-fetch.js";
import { renderMorningCard } from "../lib/morning-card-render.js";
import { getDisplayTimezone } from "../lib/runtime-config.js";
import { loadJiraConfig } from "../adapters/jira/config.js";

/**
 * Fixed allowlist of framework files this tool is scoped to (Phase 1
 * spec). Never derived from tool input — language only selects which
 * template variant is read, it never becomes part of a file path.
 */
const FRAMEWORK_FILES = {
  config: "config/runtime.yaml",
  baseWorkflow: "commands/_base/morning.base.md",
  morningLayout: "templates/i18n/_morning-layout.md",
  fastPath: "runtime/_morning-fast-path.md",
  morningRuntime: "runtime/41_Morning_Runtime.md",
  contextEngine: "runtime/46_Context_Engine.md",
  reasoningEngine: "runtime/48_Reasoning_Engine.md",
} as const;

const TEMPLATE_BY_LANGUAGE = {
  en: "templates/i18n/morning.en.md",
  vi: "templates/i18n/morning.vi.md",
} as const;

function isFastDetail(detail: MorningBriefInput["detail"]): boolean {
  return detail === "brief" || detail === "standard";
}

export class FrameworkFileMissingError extends Error {
  constructor(public readonly relativePath: string) {
    super(`Required framework file missing: ${relativePath}`);
    this.name = "FrameworkFileMissingError";
  }
}

async function readFrameworkFile(repoRoot: string, relativePath: string): Promise<string> {
  const absolutePath = resolveRepoPath(relativePath, repoRoot);
  try {
    return await readFile(absolutePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new FrameworkFileMissingError(relativePath);
    }
    throw error;
  }
}

export interface MorningBriefPayload {
  tool: "morning_brief";
  language: MorningBriefInput["language"];
  detail: MorningBriefInput["detail"];
  instructions: string;
  context: {
    config: string;
    base_workflow: string;
    layout: string;
    runtime:
      | {
          mode: "fast";
          fast_path: string;
        }
      | {
          mode: "full";
          morning_runtime: string;
          context_engine: string;
          reasoning_engine: string;
        };
    template: string;
  };
  /** Jira + team availability bundled for brief/standard — omit for full. */
  live?: MorningLiveContext;
  notes: string[];
}

function buildInstructions(input: MorningBriefInput): string {
  if (isFastDetail(input.detail)) {
    const teamHint =
      input.language === "vi"
        ? "Copy `live.team_summary.line_vi` verbatim into the **Team:** bullet under Tổng quan."
        : "Copy `live.team_summary.line_en` verbatim into the **Team:** bullet under At a glance.";
    return (
      `Follow context.base_workflow and context.runtime.fast_path for language="${input.language}" ` +
      `and detail="${input.detail}". **Mandatory:** render ONLY the Morning Card from ` +
      "context.layout + context.template — no other format (no timeline, no Needs attention/Resolved sections). " +
      "Render in your **next message**. " + teamHint + " " +
      "Do NOT call jira_get_morning_context or team_availability_get_availability. " +
      "Skip email/calendar unless user asked. Call daily_report_save after the user sees the brief."
    );
  }

  return (
    "Follow commands/_base/morning.base.md (context.base_workflow), applying " +
    "runtime.morning_runtime, runtime.context_engine, and runtime.reasoning_engine, " +
    `for language="${input.language}" and detail="${input.detail}". Render output as the ` +
    "unified Morning Card (context.layout + context.template). Retrieve " +
    "calendar/Jira/email/team-availability context separately (call " +
    "team_availability_get_availability and jira_get_morning_context before producing the " +
    "brief). After producing today's brief, call daily_report_save (pass the brief text as " +
    "summary). If asked about a past date instead of today, call daily_report_get for that " +
    "date rather than trying to reconstruct it from live connectors."
  );
}

/**
 * Pure loader — no MCP types involved — so it can be unit tested directly
 * against a fixture repo root, independent of the transport/SDK wiring.
 */
export async function loadMorningBriefPayload(
  input: MorningBriefInput,
  options: { repoRoot?: string; skipLiveFetch?: boolean } = {},
): Promise<MorningBriefPayload> {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const fast = isFastDetail(input.detail);

  const [config, baseWorkflow, morningLayout, template, runtime, live] = await Promise.all([
    readFrameworkFile(repoRoot, FRAMEWORK_FILES.config),
    readFrameworkFile(repoRoot, FRAMEWORK_FILES.baseWorkflow),
    readFrameworkFile(repoRoot, FRAMEWORK_FILES.morningLayout),
    readFrameworkFile(repoRoot, TEMPLATE_BY_LANGUAGE[input.language]),
    fast
      ? readFrameworkFile(repoRoot, FRAMEWORK_FILES.fastPath).then((fastPath) => ({
          mode: "fast" as const,
          fast_path: fastPath,
        }))
      : Promise.all([
          readFrameworkFile(repoRoot, FRAMEWORK_FILES.morningRuntime),
          readFrameworkFile(repoRoot, FRAMEWORK_FILES.contextEngine),
          readFrameworkFile(repoRoot, FRAMEWORK_FILES.reasoningEngine),
        ]).then(([morningRuntime, contextEngine, reasoningEngine]) => ({
          mode: "full" as const,
          morning_runtime: morningRuntime,
          context_engine: contextEngine,
          reasoning_engine: reasoningEngine,
        })),
    fast && !options.skipLiveFetch ? fetchMorningLiveContext() : Promise.resolve(undefined),
  ]);

  const notes = fast
    ? [
        "brief/standard fast path: live Jira + team data bundled in payload.live — one tool call.",
        "Do not re-fetch jira_get_morning_context or team_availability_get_availability.",
        'detail="standard" is the recommended default for good morning / chào buổi sáng.',
      ]
    : [
        "This tool does not call Jira, Outlook, Calendar, Team Availability, or any external " +
          "connector — Phase 1 scope for full mode.",
        "The gateway does not execute the Morning workflow itself; it only loads and returns framework context.",
        'detail="standard" is the recommended default for Claude App when the user says good morning / chào buổi sáng.',
      ];

  const payload: MorningBriefPayload = {
    tool: "morning_brief",
    language: input.language,
    detail: input.detail,
    instructions: buildInstructions(input),
    context: {
      config,
      base_workflow: baseWorkflow,
      layout: morningLayout,
      runtime,
      template,
    },
    notes,
  };

  if (live !== undefined) {
    payload.live = live;
  }

  return payload;
}

/** Server-rendered Morning Card — skips framework file reads (fast path). */
export async function renderMorningBriefMarkdown(
  input: MorningBriefInput,
  options: { skipLiveFetch?: boolean } = {},
): Promise<string> {
  const [live, timezone] = await Promise.all([
    options.skipLiveFetch ? Promise.resolve(null) : fetchMorningLiveContext(),
    getDisplayTimezone(),
  ]);
  if (!live) {
    throw new Error("Morning Card render requires live context (brief/standard only)");
  }
  const jiraConfig = loadJiraConfig();
  return renderMorningCard({
    language: input.language,
    detail: input.detail,
    timezone,
    live,
    jiraBaseUrl: jiraConfig?.baseUrl,
  });
}

export function registerMorningBrief(server: McpServer): void {
  server.registerTool(
    "morning_brief",
    {
      title: "Morning Brief — use ONLY for good morning / chào buổi sáng",
      description:
        "**Single call for daily morning brief (brief or standard).** Returns a complete pre-rendered " +
        "Morning Card markdown (Jira + team + month calendar HTML already included). **Show the tool result verbatim** in your " +
        "next message — do NOT reformat. **Do NOT call** jira_get_morning_context, " +
        "team_availability_get_availability, Outlook calendar, Outlook email, or Teams chat search before " +
        "or after this tool unless the user explicitly asked for email/calendar/Teams focus or detail=full. " +
        "Typical args: { language: \"en\"|\"vi\", detail: \"standard\" }. For detail full: returns framework JSON.",
      inputSchema: MorningBriefInputShape,
    },
    async (args) => {
      const parsed = MorningBriefInputSchema.safeParse(args);
      if (!parsed.success) {
        return buildErrorResult(
          "VALIDATION_FAILED",
          "framework",
          `Invalid input: ${parsed.error.message}`,
        );
      }

      try {
        if (isFastDetail(parsed.data.detail)) {
          const markdown = await renderMorningBriefMarkdown(parsed.data);
          return { content: [{ type: "text", text: markdown }] };
        }

        const payload = await loadMorningBriefPayload(parsed.data);
        return { content: [{ type: "text", text: JSON.stringify(payload) }] };
      } catch (error) {
        if (error instanceof FrameworkFileMissingError) {
          return buildErrorResult("FRAMEWORK_FILE_MISSING", "framework", error.message);
        }
        return buildErrorResult(
          "GATEWAY_INTERNAL",
          "framework",
          "Unexpected error loading morning_brief context",
        );
      }
    },
  );
}
