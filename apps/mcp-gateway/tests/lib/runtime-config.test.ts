import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getDisplayTimezone, RuntimeConfigInvalidError } from "../../src/lib/runtime-config.js";

const tempDirs: string[] = [];

async function makeFixtureRepo(runtimeYaml: string | null): Promise<string> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "runtime-config-test-"));
  tempDirs.push(repoRoot);
  if (runtimeYaml !== null) {
    await mkdir(path.join(repoRoot, "config"), { recursive: true });
    await writeFile(path.join(repoRoot, "config", "runtime.yaml"), runtimeYaml, "utf-8");
  }
  return repoRoot;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("getDisplayTimezone — valid configuration", () => {
  it("extracts output.display_timezone from a real runtime.yaml shape", async () => {
    const repoRoot = await makeFixtureRepo(
      [
        "user:",
        "  locale: vi-VN",
        "  timezone: Asia/Ho_Chi_Minh",
        "",
        "output:",
        "  default_language: en",
        "  time_format: 24h",
        "  display_timezone: Asia/Ho_Chi_Minh",
        "",
        "jira:",
        "  display_timezone: Asia/Ho_Chi_Minh",
        "",
      ].join("\n"),
    );

    await expect(getDisplayTimezone({ repoRoot })).resolves.toBe("Asia/Ho_Chi_Minh");
  });

  it("is not confused by display_timezone appearing under a different top-level key first", async () => {
    const repoRoot = await makeFixtureRepo(
      ["email:", "  display_timezone: America/New_York", "", "output:", "  display_timezone: Europe/London", ""].join(
        "\n",
      ),
    );

    await expect(getDisplayTimezone({ repoRoot })).resolves.toBe("Europe/London");
  });
});

describe("getDisplayTimezone — missing file (ENOENT)", () => {
  it("falls back to Asia/Ho_Chi_Minh when config/runtime.yaml does not exist", async () => {
    const repoRoot = await makeFixtureRepo(null);
    await expect(getDisplayTimezone({ repoRoot })).resolves.toBe("Asia/Ho_Chi_Minh");
  });
});

describe("getDisplayTimezone — file exists but is genuinely invalid (must not silently fall back)", () => {
  it("throws RuntimeConfigInvalidError when output.display_timezone key is absent", async () => {
    const repoRoot = await makeFixtureRepo(["user:", "  locale: vi-VN", ""].join("\n"));
    await expect(getDisplayTimezone({ repoRoot })).rejects.toBeInstanceOf(RuntimeConfigInvalidError);
  });

  it("throws RuntimeConfigInvalidError when the output: block exists but has no display_timezone", async () => {
    const repoRoot = await makeFixtureRepo(["output:", "  default_language: en", ""].join("\n"));
    await expect(getDisplayTimezone({ repoRoot })).rejects.toBeInstanceOf(RuntimeConfigInvalidError);
  });

  it("throws RuntimeConfigInvalidError when display_timezone is not a valid IANA identifier", async () => {
    const repoRoot = await makeFixtureRepo(["output:", "  display_timezone: Not/A_Real_Zone", ""].join("\n"));
    await expect(getDisplayTimezone({ repoRoot })).rejects.toBeInstanceOf(RuntimeConfigInvalidError);
  });

  it("error identifies output.display_timezone as the invalid configKey", async () => {
    const repoRoot = await makeFixtureRepo(["output:", "  default_language: en", ""].join("\n"));
    try {
      await getDisplayTimezone({ repoRoot });
      expect.unreachable("expected getDisplayTimezone to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(RuntimeConfigInvalidError);
      expect((error as RuntimeConfigInvalidError).configKey).toBe("output.display_timezone");
    }
  });
});

describe("getDisplayTimezone — caching", () => {
  it("re-reads on every call when an explicit repoRoot is supplied (no cross-test cache pollution)", async () => {
    const repoRootA = await makeFixtureRepo(["output:", "  display_timezone: Europe/London", ""].join("\n"));
    const repoRootB = await makeFixtureRepo(["output:", "  display_timezone: America/New_York", ""].join("\n"));

    await expect(getDisplayTimezone({ repoRoot: repoRootA })).resolves.toBe("Europe/London");
    await expect(getDisplayTimezone({ repoRoot: repoRootB })).resolves.toBe("America/New_York");
  });
});
