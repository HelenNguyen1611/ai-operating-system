import { loadJiraConfig } from "../adapters/jira/config.js";
import { createJiraAdapter, type JiraMorningContext } from "../adapters/jira/index.js";
import { loadTeamAvailabilityConfig } from "../adapters/team-availability/config.js";
import {
  createTeamAvailabilityAdapter,
  type TeamAvailabilityResult,
} from "../adapters/team-availability/index.js";
import { buildTeamSummary, type TeamSummaryResult } from "./team-summary.js";

export interface MorningLiveContext {
  jira: JiraMorningContext | null;
  jira_error?: string;
  team_availability: TeamAvailabilityResult | null;
  team_availability_error?: string;
  /** Pre-rendered Team line for Morning Card — copy verbatim into At a glance. */
  team_summary: TeamSummaryResult;
}

/**
 * Best-effort parallel fetch of Jira morning context and team availability.
 * Never throws — unconfigured or failing connectors return null + error string.
 */
export async function fetchMorningLiveContext(): Promise<MorningLiveContext> {
  const [jiraResult, teamResult] = await Promise.all([fetchJira(), fetchTeamAvailability()]);
  const team_summary = buildTeamSummary(
    teamResult.teamAvailability,
    teamResult.teamAvailabilityError,
  );
  return {
    jira: jiraResult.jira,
    jira_error: jiraResult.jiraError,
    team_availability: teamResult.teamAvailability,
    team_availability_error: teamResult.teamAvailabilityError,
    team_summary,
  };
}

async function fetchJira(): Promise<{ jira: JiraMorningContext | null; jiraError?: string }> {
  const config = loadJiraConfig();
  if (!config) {
    return { jira: null, jiraError: "Jira is not configured (ADAPTER_NOT_CONFIGURED)." };
  }
  try {
    const jira = await createJiraAdapter(config).getMorningContext();
    return { jira };
  } catch (error) {
    return { jira: null, jiraError: error instanceof Error ? error.message : String(error) };
  }
}

async function fetchTeamAvailability(): Promise<{
  teamAvailability: TeamAvailabilityResult | null;
  teamAvailabilityError?: string;
}> {
  const config = loadTeamAvailabilityConfig();
  if (!config) {
    return {
      teamAvailability: null,
      teamAvailabilityError: "Team Availability is not configured (ADAPTER_NOT_CONFIGURED).",
    };
  }
  try {
    const teamAvailability = await createTeamAvailabilityAdapter(config).getAvailability();
    return { teamAvailability };
  } catch (error) {
    return {
      teamAvailability: null,
      teamAvailabilityError: error instanceof Error ? error.message : String(error),
    };
  }
}
