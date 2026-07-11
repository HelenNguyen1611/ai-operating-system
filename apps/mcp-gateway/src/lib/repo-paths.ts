import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This file lives at apps/mcp-gateway/src/lib/repo-paths.ts — four levels
// below the repository root (lib -> src -> mcp-gateway -> apps -> root).
export const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

/**
 * Resolves a fixed, repository-relative path safely.
 *
 * The allowlist of relative paths passed to this function is always
 * hardcoded by the caller (never derived from tool input), but the
 * containment check is kept as defense in depth per ARCHITECTURE.md
 * "use repository-relative paths safely" — a relative path that
 * resolves outside repoRoot (e.g. via a stray "..") throws instead of
 * silently reading a file outside the repo.
 */
export function resolveRepoPath(relativePath: string, repoRoot: string = REPO_ROOT): string {
  const resolved = path.resolve(repoRoot, relativePath);
  const normalizedRoot = repoRoot.endsWith(path.sep) ? repoRoot : repoRoot + path.sep;

  if (resolved !== repoRoot && !resolved.startsWith(normalizedRoot)) {
    throw new Error(`Refusing to resolve path outside repository root: ${relativePath}`);
  }

  return resolved;
}
