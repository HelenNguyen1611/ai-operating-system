import path from "node:path";
import { REPO_ROOT } from "../../lib/repo-paths.js";

/**
 * Owns Daily Report config resolution, per ARCHITECTURE.md §7 — "an adapter
 * is responsible for its own config validation." Reads process.env
 * directly, same as jira/config.ts and team-availability/config.ts.
 *
 * Unlike those two adapters, this one is never "not configured": the store
 * directory always has a usable default, so there is no ADAPTER_NOT_CONFIGURED
 * path for Daily Report — loadDailyReportConfig() always returns a config.
 */
export interface DailyReportConfig {
  storeDir: string;
}

const DEFAULT_STORE_DIR = path.join(REPO_ROOT, "apps", "mcp-gateway", ".data", "daily-reports");

export function loadDailyReportConfig(env: NodeJS.ProcessEnv = process.env): DailyReportConfig {
  const configured = env.DAILY_REPORT_STORE_DIR?.trim();
  return { storeDir: configured || DEFAULT_STORE_DIR };
}
