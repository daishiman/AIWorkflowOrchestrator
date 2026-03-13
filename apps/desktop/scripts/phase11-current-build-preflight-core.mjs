import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  canAutoStartLocalStaticServer,
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");

export const PHASE11_CURRENT_BUILD_PREFLIGHT_BUNDLE_NAME =
  "phase11-current-build-preflight";
export const PHASE11_CURRENT_BUILD_PREFLIGHT_BUCKETS = Object.freeze([
  "native",
  "build",
  "harness",
  "baseUrl",
]);
export const PHASE11_CURRENT_BUILD_PREFLIGHT_EXIT_CODES = Object.freeze({
  pass: 0,
  native: 10,
  build: 20,
  harness: 30,
  baseUrl: 40,
});

const DEFAULT_BASE_URL =
  process.env.PHASE11_CAPTURE_BASE_URL ?? "http://127.0.0.1:4173";
const DEFAULT_HARNESS_FILE = "phase11-light-theme-contrast-guard.html";

function resolvePaths(overrides = {}) {
  const rendererRoot =
    overrides.rendererRoot ?? path.join(desktopRoot, "out", "renderer");
  const harnessFileName = overrides.harnessFileName ?? DEFAULT_HARNESS_FILE;

  return {
    repoRoot: overrides.repoRoot ?? repoRoot,
    desktopRoot: overrides.desktopRoot ?? desktopRoot,
    rendererRoot,
    rendererIndexPath:
      overrides.rendererIndexPath ?? path.join(rendererRoot, "index.html"),
    assetRoot: overrides.assetRoot ?? path.join(rendererRoot, "assets"),
    harnessFileName,
    harnessOutputPath:
      overrides.harnessOutputPath ?? path.join(rendererRoot, harnessFileName),
  };
}

function resolveReadinessUrl(baseUrl, harnessFileName = DEFAULT_HARNESS_FILE) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    `${harnessFileName}?surface=settings&theme=light`,
    normalizedBaseUrl,
  ).href;
}

async function defaultPathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function defaultVerifyNativeDependency() {
  let esbuild;
  let resolvedPath;

  try {
    resolvedPath = require.resolve("esbuild");
    const esbuildModule = await import("esbuild");
    esbuild = esbuildModule.default ?? esbuildModule;
  } catch {
    const viteRequire = createRequire(require.resolve("vite/package.json"));
    resolvedPath = viteRequire.resolve("esbuild");
    esbuild = viteRequire("esbuild");
  }

  await esbuild.transform("export const phase11PreflightReady = true;", {
    loader: "js",
    format: "esm",
  });

  return resolvedPath;
}

function createCheck(bucket, status, summary, details = [], nextActions = []) {
  return {
    bucket,
    status,
    summary,
    details,
    nextActions,
  };
}

function createBlockedChecks(startIndex, failedBucket) {
  return PHASE11_CURRENT_BUILD_PREFLIGHT_BUCKETS.slice(startIndex).map(
    (bucket) =>
      createCheck(
        bucket,
        "blocked",
        `${failedBucket} bucket failed`,
        [`Skipped because ${failedBucket} did not pass.`],
      ),
  );
}

async function runNativeCheck(deps) {
  try {
    const resolvedPath = await deps.verifyNativeDependency();
    return createCheck(
      "native",
      "pass",
      "Native dependency is ready.",
      [`esbuild resolved at ${resolvedPath}`],
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return createCheck(
      "native",
      "fail",
      "Native dependency check failed.",
      [message],
      [
        "Run `pnpm install --force` in the repository root.",
        "If the mismatch persists, follow `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001`.",
      ],
    );
  }
}

async function runBuildCheck(paths, deps) {
  const missing = [];
  const assetEntries = [];

  if (!(await deps.pathExists(paths.rendererRoot))) {
    missing.push(paths.rendererRoot);
  }
  if (!(await deps.pathExists(paths.rendererIndexPath))) {
    missing.push(paths.rendererIndexPath);
  }
  if (!(await deps.pathExists(paths.assetRoot))) {
    missing.push(paths.assetRoot);
  } else {
    try {
      assetEntries.push(...(await deps.readDir(paths.assetRoot)));
      if (assetEntries.length === 0) {
        missing.push(`${paths.assetRoot}/*`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      missing.push(`${paths.assetRoot} (${message})`);
    }
  }

  if (missing.length > 0) {
    return createCheck(
      "build",
      "fail",
      "Build output is incomplete.",
      missing.map((entry) => `Missing build artifact: ${entry}`),
      ["Run `pnpm --filter @repo/desktop build` and retry."],
    );
  }

  return createCheck(
    "build",
    "pass",
    "Build output is available.",
    [`Renderer assets: ${assetEntries.length} entries`],
  );
}

async function runHarnessCheck(paths, deps) {
  if (!(await deps.pathExists(paths.harnessOutputPath))) {
    return createCheck(
      "harness",
      "fail",
      "Harness route output is missing.",
      [`Expected build artifact: ${paths.harnessOutputPath}`],
      [
        "Confirm `phase11-light-theme-contrast-guard.html` is included in `apps/desktop/electron.vite.config.ts`.",
      ],
    );
  }

  return createCheck(
    "harness",
    "pass",
    "Harness route output is available.",
    [`Harness file: ${paths.harnessOutputPath}`],
  );
}

async function runBaseUrlCheck({ baseUrl, autoServe }, paths, deps) {
  const readinessUrl = resolveReadinessUrl(baseUrl, paths.harnessFileName);
  let cleanup = null;
  let autoServed = false;

  if (await deps.probeStaticServer(readinessUrl)) {
    return {
      check: createCheck(
        "baseUrl",
        "pass",
        "Base URL is reachable.",
        [`Readiness URL: ${readinessUrl}`],
      ),
      cleanup,
      autoServed,
    };
  }

  if (!autoServe) {
    return {
      check: createCheck(
        "baseUrl",
        "fail",
        "Base URL is unreachable and auto static serve is disabled.",
        [`Readiness URL: ${readinessUrl}`],
        [
          "Retry without `--no-auto-serve`, or start a local static server before capture.",
        ],
      ),
      cleanup,
      autoServed,
    };
  }

  if (!deps.canAutoStartLocalStaticServer(baseUrl)) {
    return {
      check: createCheck(
        "baseUrl",
        "fail",
        "Base URL is unreachable and cannot be auto-served.",
        [`Readiness URL: ${readinessUrl}`],
        [
          "Provide a reachable `--base-url`, or use a loopback URL such as `http://127.0.0.1:4173`.",
        ],
      ),
      cleanup,
      autoServed,
    };
  }

  let server;
  try {
    server = await deps.startRendererStaticServer({
      baseUrl,
      rootDir: paths.rendererRoot,
    });
    cleanup = async () => {
      await server.close();
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      check: createCheck(
        "baseUrl",
        "fail",
        "Auto static serve failed to start.",
        [message],
        [
          "Inspect the requested port and retry the preflight command.",
          "If you are using a remote URL, pass a reachable `--base-url` instead of relying on auto serve.",
        ],
      ),
      cleanup,
      autoServed,
    };
  }

  if (await deps.probeStaticServer(readinessUrl)) {
    autoServed = true;
    return {
      check: createCheck(
        "baseUrl",
        "pass",
        "Base URL became reachable via auto static serve.",
        [`Readiness URL: ${readinessUrl}`],
      ),
      cleanup,
      autoServed,
    };
  }

  return {
    check: createCheck(
      "baseUrl",
      "fail",
      "Base URL is still unreachable after auto static serve.",
      [`Readiness URL: ${readinessUrl}`],
      [
        "Rebuild `@repo/desktop`, then retry the preflight command.",
        "If the problem persists, inspect `apps/desktop/out/renderer` and the requested base URL.",
      ],
    ),
    cleanup,
    autoServed,
  };
}

function summarizeChecks(checks, autoServed) {
  const failedCheck = checks.find((check) => check.status === "fail");
  const failedBucket = failedCheck?.bucket ?? null;

  return {
    status: failedBucket ? "fail" : "pass",
    failedBucket,
    readyForCapture: failedBucket === null,
    autoServed,
    exitCode:
      PHASE11_CURRENT_BUILD_PREFLIGHT_EXIT_CODES[failedBucket ?? "pass"],
    passCount: checks.filter((check) => check.status === "pass").length,
    blockedCount: checks.filter((check) => check.status === "blocked").length,
  };
}

export function formatPhase11CurrentBuildPreflightReport(result) {
  const lines = [
    `[${PHASE11_CURRENT_BUILD_PREFLIGHT_BUNDLE_NAME}]`,
    `status: ${result.summary.status}`,
    `baseUrl: ${result.baseUrl}`,
    `autoServed: ${result.summary.autoServed ? "yes" : "no"}`,
  ];

  for (const check of result.checks) {
    lines.push(`- ${check.bucket}: ${check.status} :: ${check.summary}`);
    for (const detail of check.details) {
      lines.push(`  detail: ${detail}`);
    }
    for (const nextAction of check.nextActions) {
      lines.push(`  next: ${nextAction}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export async function runPhase11CurrentBuildPreflight(
  options = {},
  injected = {},
) {
  const paths = resolvePaths(injected.paths);
  const deps = {
    canAutoStartLocalStaticServer,
    pathExists: defaultPathExists,
    probeStaticServer,
    readDir: async (targetPath) => await fs.readdir(targetPath),
    startRendererStaticServer,
    verifyNativeDependency: defaultVerifyNativeDependency,
    now: () => new Date().toISOString(),
    ...injected,
  };
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const autoServe = options.autoServe ?? true;
  const checks = [];
  let cleanup = null;
  let autoServed = false;

  const nativeCheck = await runNativeCheck(deps);
  checks.push(nativeCheck);
  if (nativeCheck.status === "fail") {
    checks.push(...createBlockedChecks(1, "native"));
  } else {
    const buildCheck = await runBuildCheck(paths, deps);
    checks.push(buildCheck);

    if (buildCheck.status === "fail") {
      checks.push(...createBlockedChecks(2, "build"));
    } else {
      const harnessCheck = await runHarnessCheck(paths, deps);
      checks.push(harnessCheck);

      if (harnessCheck.status === "fail") {
        checks.push(...createBlockedChecks(3, "harness"));
      } else {
        const baseUrlCheckResult = await runBaseUrlCheck(
          { baseUrl, autoServe },
          paths,
          deps,
        );
        checks.push(baseUrlCheckResult.check);
        cleanup = baseUrlCheckResult.cleanup;
        autoServed = baseUrlCheckResult.autoServed;
      }
    }
  }

  const summary = summarizeChecks(checks, autoServed);
  const result = {
    bundleName: PHASE11_CURRENT_BUILD_PREFLIGHT_BUNDLE_NAME,
    timestamp: deps.now(),
    baseUrl,
    summary,
    checks,
    guidance: checks.flatMap((check) =>
      check.nextActions.map((message) => ({
        bucket: check.bucket,
        message,
      })),
    ),
  };

  return {
    result,
    cleanup,
  };
}
