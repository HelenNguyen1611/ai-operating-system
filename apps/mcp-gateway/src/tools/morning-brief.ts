import { readFile } from "node:fs/promises";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  MorningBriefInputSchema,
  MorningBriefInputShape,
  type MorningBriefInput,
} from "../schemas/framework/morning-brief.input.js";
import { buildErrorResult } from "../types/error-envelope.js";
import { REPO_ROOT, resolveRepoPath } from "../lib/repo-paths.js";

/**
 * Fixed allowlist of framework files this tool is scoped to (Phase 1
 * spec). Never derived from tool input — language only selects which
 * template variant is read, it never becomes part of a file path.
 */
const FRAMEWORK_FILES = {
  config: "config/runtime.yaml",
  baseWorkflow: "commands/_base/morning.base.md",
  morningRuntime: "runtime/41_Morning_Runtime.md",
  contextEngine: "runtime/46_Context_Engine.md",
  reasoningEngine: "runtime/48_Reasoning_Engine.md",
} as const;

const TEMPLATE_BY_LANGUAGE = {
  en: "templates/i18n/morning.en.md",
  vi: "templates/i18n/morning.vi.md",
} as const;

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
    runtime: {
      morning_runtime: string;
      context_engine: string;
      reasoning_engine: string;
    };
    template: string;
  };
  notes: string[];
}

/**
 * Pure loader — no MCP types involved — so it can be unit tested directly
 * against a fixture repo root, independent of the transport/SDK wiring.
 *
 * Loads and returns framework context only. Does not execute the Morning
 * workflow, does not call Jira/Outlook/Calendar, and does not decide
 * priorities — per Phase 1 scope, the calling client (Claude App) is
 * responsible for following the returned instructions.
 */
export async function loadMorningBriefPayload(
  input: MorningBriefInput,
  options: { repoRoot?: string } = {},
): Promise<MorningBriefPayload> {
  const repoRoot = options.repoRoot ?? REPO_ROOT;

  const [config, baseWorkflow, morningRuntime, contextEngine, reasoningEngine, template] =
    await Promise.all([
      readFrameworkFile(repoRoot, FRAMEWORK_FILES.config),
      readFrameworkFile(repoRoot, FRAMEWORK_FILES.baseWorkflow),
      readFrameworkFile(repoRoot, FRAMEWORK_FILES.morningRuntime),
      readFrameworkFile(repoRoot, FRAMEWORK_FILES.contextEngine),
      readFrameworkFile(repoRoot, FRAMEWORK_FILES.reasoningEngine),
      readFrameworkFile(repoRoot, TEMPLATE_BY_LANGUAGE[input.language]),
    ]);

  return {
    tool: "morning_brief",
    language: input.language,
    detail: input.detail,
    instructions:
      "Follow commands/_base/morning.base.md (context.base_workflow), applying " +
      "runtime.morning_runtime, runtime.context_engine, and runtime.reasoning_engine, " +
      `for language="${input.language}" and detail="${input.detail}". Format the ` +
      "response using context.template. This payload contains framework context " +
      "only — no live data. Retrieve calendar/Jira/email context separately before producing the brief.",
    context: {
      config,
      base_workflow: baseWorkflow,
      runtime: {
        morning_runtime: morningRuntime,
        context_engine: contextEngine,
        reasoning_engine: reasoningEngine,
      },
      template,
    },
    notes: [
      "This tool does not call Jira, Outlook, Calendar, or any external connector — Phase 1 scope.",
      "The gateway does not execute the Morning workflow itself; it only loads and returns framework context.",
      'Only detail="brief" and detail="full" are supported in Phase 1 ("standard" is not yet exposed by this tool).',
    ],
  };
}

export function registerMorningBrief(server: McpServer): void {
  server.registerTool(
    "morning_brief",
    {
      title: "Morning Brief",
      description:
        "Loads the framework context needed to produce a Morning Brief (base workflow, " +
        "Runtime 41/46/48, and the language-matched output template) and returns it as a " +
        "structured instruction/context payload. Read-only — does not call Jira, Outlook, " +
        "Calendar, or execute the workflow itself.",
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
