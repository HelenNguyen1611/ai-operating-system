import { readFile } from "node:fs/promises";
import { REPO_ROOT, resolveRepoPath } from "./repo-paths.js";

const RUNTIME_CONFIG_RELATIVE_PATH = "config/runtime.yaml";

/** Used only when config/runtime.yaml is genuinely absent (ENOENT) — see loadDisplayTimezone(). */
const FALLBACK_DISPLAY_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Thrown when config/runtime.yaml exists but output.display_timezone is
 * missing, unparsable, not a valid IANA timezone identifier, or the file
 * is unreadable for a reason other than not existing. Deliberately not
 * silently downgraded to the fallback — an operator-visible config
 * mistake must not be hidden behind a value that merely looks plausible.
 */
export class RuntimeConfigInvalidError extends Error {
  constructor(
    public readonly configKey: string,
    message: string,
  ) {
    super(message);
    this.name = "RuntimeConfigInvalidError";
  }
}

let cachedDisplayTimezone: Promise<string> | null = null;

/**
 * Resolves the timezone Morning Brief is configured with
 * (config/runtime.yaml's output.display_timezone) — the single source of
 * truth for "what timezone does 'today' mean in this deployment," reused
 * here rather than introducing a second, adapter-specific timezone
 * setting.
 *
 * Caching only applies to the default (production) repoRoot — passing an
 * explicit repoRoot always re-reads, so tests never see cross-test cache
 * pollution without needing a separate cache-reset export. Same
 * options.repoRoot shape as loadMorningBriefPayload() in
 * tools/morning-brief.ts.
 */
export function getDisplayTimezone(options: { repoRoot?: string } = {}): Promise<string> {
  if (options.repoRoot) {
    return loadDisplayTimezone(options.repoRoot);
  }

  if (!cachedDisplayTimezone) {
    cachedDisplayTimezone = loadDisplayTimezone(REPO_ROOT).catch((error: unknown) => {
      // Never cache a failure — an operator fixing runtime.yaml must take
      // effect on the very next call, not require a gateway restart.
      cachedDisplayTimezone = null;
      throw error;
    });
  }

  return cachedDisplayTimezone;
}

async function loadDisplayTimezone(repoRoot: string): Promise<string> {
  let text: string;
  try {
    text = await readFile(resolveRepoPath(RUNTIME_CONFIG_RELATIVE_PATH, repoRoot), "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return FALLBACK_DISPLAY_TIMEZONE;
    }
    // Unreadable for any other reason (permissions, etc.) — surfaced, not
    // silently treated the same as "file doesn't exist."
    throw error;
  }

  const value = parseDisplayTimezone(text);
  if (!value) {
    throw new RuntimeConfigInvalidError(
      "output.display_timezone",
      "config/runtime.yaml exists but output.display_timezone is missing or unparsable.",
    );
  }
  if (!isValidIanaTimezone(value)) {
    throw new RuntimeConfigInvalidError(
      "output.display_timezone",
      `config/runtime.yaml's output.display_timezone ("${value}") is not a valid IANA timezone identifier.`,
    );
  }

  return value;
}

/**
 * Targeted extraction, not a general YAML parser — finds the top-level
 * "output:" block, then "display_timezone:" within it specifically.
 * Scoped to that block because runtime.yaml repeats the same key under
 * email/calendar/teams/jira/workday too; output.display_timezone is
 * Morning Brief's own setting, the one this helper exists to reuse.
 */
function parseDisplayTimezone(yamlText: string): string | null {
  const outputBlock = yamlText.match(/^output:\n((?:[ \t]+.*\n?)*)/m)?.[1];
  if (!outputBlock) return null;
  return outputBlock.match(/^[ \t]+display_timezone:\s*(\S+)/m)?.[1] ?? null;
}

function isValidIanaTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
