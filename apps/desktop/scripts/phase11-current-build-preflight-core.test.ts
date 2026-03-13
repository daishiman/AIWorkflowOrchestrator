// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import {
  PHASE11_CURRENT_BUILD_PREFLIGHT_BUNDLE_NAME,
  runPhase11CurrentBuildPreflight,
} from "./phase11-current-build-preflight-core.mjs";

const TEST_PATHS = {
  rendererRoot: "/tmp/out/renderer",
  rendererIndexPath: "/tmp/out/renderer/index.html",
  assetRoot: "/tmp/out/renderer/assets",
  harnessOutputPath:
    "/tmp/out/renderer/phase11-light-theme-contrast-guard.html",
};

function createInjectedDeps(overrides: Record<string, unknown> = {}) {
  const existingPaths = new Set([
    TEST_PATHS.rendererRoot,
    TEST_PATHS.rendererIndexPath,
    TEST_PATHS.assetRoot,
    TEST_PATHS.harnessOutputPath,
  ]);

  return {
    now: () => "2026-03-13T00:00:00.000Z",
    verifyNativeDependency: vi.fn(async () => "/virtual/node_modules/esbuild"),
    pathExists: vi.fn(async (targetPath: string) =>
      existingPaths.has(targetPath),
    ),
    readDir: vi.fn(async () => ["entry.js"]),
    probeStaticServer: vi.fn(async () => true),
    startRendererStaticServer: vi.fn(async () => ({
      close: async () => {},
    })),
    canAutoStartLocalStaticServer: vi.fn(() => true),
    paths: TEST_PATHS,
    ...overrides,
  };
}

describe("phase11-current-build-preflight-core", () => {
  it("success path では 4 bucket を pass にする", async () => {
    const deps = createInjectedDeps();
    const { result } = await runPhase11CurrentBuildPreflight({}, deps);

    expect(result.bundleName).toBe(PHASE11_CURRENT_BUILD_PREFLIGHT_BUNDLE_NAME);
    expect(result.summary.status).toBe("pass");
    expect(result.summary.readyForCapture).toBe(true);
    expect(result.summary.exitCode).toBe(0);
    expect(result.checks.map((check) => check.status)).toEqual([
      "pass",
      "pass",
      "pass",
      "pass",
    ]);
  });

  it("native fail 時は後続 bucket を blocked にする", async () => {
    const deps = createInjectedDeps({
      verifyNativeDependency: vi.fn(async () => {
        throw new Error("Bad CPU type in executable");
      }),
    });
    const { result } = await runPhase11CurrentBuildPreflight({}, deps);

    expect(result.summary.status).toBe("fail");
    expect(result.summary.failedBucket).toBe("native");
    expect(result.summary.exitCode).toBe(10);
    expect(result.checks.map((check) => check.status)).toEqual([
      "fail",
      "blocked",
      "blocked",
      "blocked",
    ]);
    expect(result.guidance[0]?.message).toContain("pnpm install --force");
  });

  it("build missing 時は build bucket を fail にする", async () => {
    const deps = createInjectedDeps({
      pathExists: vi.fn(
        async (targetPath: string) => targetPath !== TEST_PATHS.rendererRoot,
      ),
    });
    const { result } = await runPhase11CurrentBuildPreflight({}, deps);

    expect(result.summary.failedBucket).toBe("build");
    expect(result.summary.exitCode).toBe(20);
    expect(result.checks[1].status).toBe("fail");
    expect(result.checks[1].nextActions[0]).toContain(
      "pnpm --filter @repo/desktop build",
    );
    expect(result.checks[2].status).toBe("blocked");
  });

  it("harness missing 時は route guidance を返す", async () => {
    const deps = createInjectedDeps({
      pathExists: vi.fn(
        async (targetPath: string) =>
          targetPath !== TEST_PATHS.harnessOutputPath,
      ),
    });
    const { result } = await runPhase11CurrentBuildPreflight({}, deps);

    expect(result.summary.failedBucket).toBe("harness");
    expect(result.summary.exitCode).toBe(30);
    expect(result.checks[2].status).toBe("fail");
    expect(result.checks[2].nextActions[0]).toContain(
      "electron.vite.config.ts",
    );
    expect(result.checks[3].status).toBe("blocked");
  });

  it("baseUrl unreachable でも auto serve で復旧できれば pass にする", async () => {
    const probeStaticServer = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const deps = createInjectedDeps({
      probeStaticServer,
    });
    const { result, cleanup } = await runPhase11CurrentBuildPreflight({}, deps);

    expect(result.summary.status).toBe("pass");
    expect(result.summary.autoServed).toBe(true);
    expect(result.checks[3].summary).toContain("auto static serve");
    expect(cleanup).toBeTypeOf("function");
    await cleanup?.();
  });

  it("baseUrl unreachable かつ fallback 不可なら fail にする", async () => {
    const deps = createInjectedDeps({
      probeStaticServer: vi.fn(async () => false),
      canAutoStartLocalStaticServer: vi.fn(() => false),
    });
    const { result } = await runPhase11CurrentBuildPreflight(
      {
        baseUrl: "https://example.com",
      },
      deps,
    );

    expect(result.summary.failedBucket).toBe("baseUrl");
    expect(result.summary.exitCode).toBe(40);
    expect(result.checks[3].status).toBe("fail");
    expect(result.guidance[0]?.message).toContain("--base-url");
  });
});
