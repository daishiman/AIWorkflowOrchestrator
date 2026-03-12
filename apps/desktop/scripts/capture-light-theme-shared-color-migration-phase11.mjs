#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/light-theme-shared-color-migration",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const safeRunnerRoot = "/tmp/aiworkflow-ltscm-runner";
const safeDesktopRoot = path.join(safeRunnerRoot, "desktop");
const safeRendererRoot = path.join(safeDesktopRoot, "src/renderer");
const safeConfigCliPath = path.join(
  safeRendererRoot,
  "vite.phase11.build.config.mjs",
);
const safeOutputRoot = path.join(safeRunnerRoot, "out");
const sharedRoot = path.join(repoRoot, "packages/shared");
const safeSharedRoot = path.join(safeRunnerRoot, "packages/shared");

function parseArgs(argv) {
  const options = {
    outputDir: screenshotDir,
    port: process.env.LIGHT_THEME_SHARED_COLOR_MIGRATION_PORT ?? "4286",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--output-dir" && argv[index + 1]) {
      options.outputDir = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--port" && argv[index + 1]) {
      options.port = argv[index + 1];
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function waitForServer(url, timeoutMs = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function prepareSafeViteRoot() {
  await fs.rm(safeRunnerRoot, { recursive: true, force: true });
  await fs.mkdir(safeRunnerRoot, { recursive: true });
  await fs.cp(desktopRoot, safeDesktopRoot, {
    recursive: true,
    filter: (source) => {
      const relativePath = path.relative(desktopRoot, source);

      if (!relativePath) {
        return true;
      }

      return ![
        "node_modules",
        "out",
        "dist",
        "coverage",
        "coverage-authkey",
      ].some(
        (excluded) =>
          relativePath === excluded || relativePath.startsWith(`${excluded}/`),
      );
    },
  });
  await fs.mkdir(path.dirname(safeSharedRoot), { recursive: true });
  await fs.cp(sharedRoot, safeSharedRoot, {
    recursive: true,
    filter: (source) => {
      const relativePath = path.relative(sharedRoot, source);

      if (!relativePath) {
        return true;
      }

      return !["node_modules", "dist", "coverage"].some(
        (excluded) =>
          relativePath === excluded || relativePath.startsWith(`${excluded}/`),
      );
    },
  });
  await fs.mkdir(safeDesktopRoot, { recursive: true });
  await fs.symlink(
    path.join(desktopRoot, "node_modules"),
    path.join(safeDesktopRoot, "node_modules"),
    "dir",
  );
  await fs.writeFile(
    safeConfigCliPath,
    [
      `import { defineConfig } from "vite";`,
      `import react from "@vitejs/plugin-react";`,
      `import tsconfigPaths from "vite-tsconfig-paths";`,
      `export default defineConfig({`,
      `  plugins: [react(), tsconfigPaths()],`,
      `  root: ".",`,
      `  resolve: {`,
      `    alias: {`,
      `      "@repo/shared/types/auth-mode": ${JSON.stringify(
        path.join(safeSharedRoot, "src/types/auth-mode.ts"),
      )},`,
      `      scheduler: ${JSON.stringify(
        path.join(
          repoRoot,
          "node_modules/.pnpm/scheduler@0.23.2/node_modules/scheduler/index.js",
        ),
      )},`,
      `    },`,
      `  },`,
      `  base: "./",`,
      `  build: {`,
      `    outDir: ${JSON.stringify(safeOutputRoot)},`,
      `    emptyOutDir: true,`,
      `    manifest: true,`,
      `    rollupOptions: {`,
      `      input: {`,
      `        review: ${JSON.stringify(
        path.join(
          safeRendererRoot,
          "phase11-light-theme-shared-color-migration.entry.js",
        ),
      )},`,
      `      },`,
      `    },`,
      `  },`,
      `  define: {`,
      `    "import.meta.env.VITE_E2E_MODE": JSON.stringify("true"),`,
      `  },`,
      `});`,
      ``,
    ].join("\n"),
  );

  return {
    safeRendererRoot,
    safeConfigCliPath,
    safeOutputRoot,
  };
}

async function runProcess(command, args, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (data) => process.stdout.write(data));
    child.stderr.on("data", (data) => process.stderr.write(data));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(`${command} ${args.join(" ")} exited with code ${code}`),
      );
    });
  });
}

async function writeStaticHarnessHtml(outputDir) {
  const manifestPath = path.join(outputDir, ".vite/manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
  const manifestEntry = Object.values(manifest).find(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      entry.isEntry === true &&
      typeof entry.src === "string" &&
      entry.src.endsWith("phase11-light-theme-shared-color-migration.entry.js"),
  );

  if (!manifestEntry?.file) {
    throw new Error("Phase 11 review harness entry not found in manifest");
  }

  const cssLinks = (manifestEntry.css ?? [])
    .map(
      (href) => `    <link rel="stylesheet" href="./${href}" />`,
    )
    .join("\n");

  await fs.writeFile(
    path.join(outputDir, "phase11-light-theme-shared-color-migration.html"),
    [
      "<!doctype html>",
      '<html lang="ja">',
      "  <head>",
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      "    <title>Phase 11 Light Theme Shared Color Migration Harness</title>",
      cssLinks,
      "  </head>",
      "  <body>",
      '    <div id="root"></div>',
      `    <script type="module" src="./${manifestEntry.file}"></script>`,
      "  </body>",
      "</html>",
      "",
    ].join("\n"),
  );
}

function buildHarnessUrl(baseUrl, surface, theme = "light") {
  const params = new URLSearchParams({
    surface,
    theme,
  });

  return `${baseUrl}/phase11-light-theme-shared-color-migration.html?${params.toString()}`;
}

const scenarios = [
  {
    tcId: "TC-11-01",
    file: "TC-11-01-settings-overview-light-desktop.png",
    surface: "settings",
    viewport: { width: 1440, height: 1500 },
    note: "ThemeSelector / AccountSection / LocaleSelector / TimezoneSelector の overview。",
  },
  {
    tcId: "TC-11-02",
    file: "TC-11-02-settings-avatar-menu-light-desktop.png",
    surface: "settings",
    viewport: { width: 1440, height: 1500 },
    note: "AccountSection の avatar menu state。",
    action: async (page) => {
      await page.getByLabel("アバターを編集").click();
      await page.getByRole("menu", { name: "アバター編集メニュー" }).waitFor();
    },
  },
  {
    tcId: "TC-11-03",
    file: "TC-11-03-settings-delete-dialog-light-desktop.png",
    surface: "settings",
    viewport: { width: 1440, height: 1500 },
    note: "AccountSection の delete dialog state。",
    action: async (page) => {
      await page.getByLabel("アカウントを削除").click();
      await page.getByText("アカウント削除の確認").waitFor();
    },
  },
  {
    tcId: "TC-11-04",
    file: "TC-11-04-settings-locale-dropdown-light-desktop.png",
    surface: "settings",
    viewport: { width: 1440, height: 1500 },
    note: "LocaleSelector dropdown state。",
    action: async (page) => {
      await page.getByRole("combobox", { name: "言語" }).click();
      await page.getByRole("option", { name: "English" }).waitFor();
    },
  },
  {
    tcId: "TC-11-05",
    file: "TC-11-05-settings-timezone-dropdown-light-desktop.png",
    surface: "settings",
    viewport: { width: 1440, height: 1500 },
    note: "TimezoneSelector dropdown state。",
    action: async (page) => {
      await page.getByRole("combobox", { name: "タイムゾーン" }).click();
      await page.getByPlaceholder("検索...").waitFor();
    },
  },
  {
    tcId: "TC-11-06",
    file: "TC-11-06-auth-surface-light-desktop.png",
    surface: "auth",
    viewport: { width: 1280, height: 960 },
    note: "AuthView の representative screen。",
  },
  {
    tcId: "TC-11-07",
    file: "TC-11-07-workspace-search-results-light-desktop.png",
    surface: "workspace-search",
    viewport: { width: 1440, height: 1200 },
    note: "WorkspaceSearchPanel の検索結果 state。",
    action: async (page) => {
      const searchInput = page.getByTestId("search-input");
      await searchInput.fill("light");
      await searchInput.press("Enter");
      await page.getByTestId("search-results").waitFor();
    },
  },
  {
    tcId: "TC-11-08",
    file: "TC-11-08-dashboard-reference-light-desktop.png",
    surface: "dashboard",
    viewport: { width: 1440, height: 1080 },
    note: "Dashboard の representative reference surface。",
  },
];

async function captureScenario(browser, baseUrl, outputDir, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: "light",
  });

  try {
    const page = await context.newPage();
    const url = buildHarnessUrl(baseUrl, scenario.surface);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    await page.waitForLoadState("networkidle");

    if (scenario.surface === "settings") {
      await page.getByTestId("ltscm-settings-surface").waitFor();
    } else if (scenario.surface === "auth") {
      await page.getByTestId("ltscm-auth-surface").waitFor();
    } else if (scenario.surface === "workspace-search") {
      await page.getByTestId("ltscm-workspace-search-surface").waitFor();
      await page.getByTestId("workspace-search-panel").waitFor();
    } else if (scenario.surface === "dashboard") {
      await page.getByTestId("ltscm-dashboard-surface").waitFor();
      await page.getByTestId("dashboard-view").waitFor();
    }

    if (scenario.action) {
      await scenario.action(page);
    }

    await page.waitForTimeout(300);

    const outputPath = path.join(outputDir, scenario.file);
    await page.screenshot({
      path: outputPath,
      fullPage: true,
    });

    return {
      tcId: scenario.tcId,
      file: scenario.file,
      surface: scenario.surface,
      note: scenario.note,
      viewport: scenario.viewport,
      url,
      capturedAt: new Date().toISOString(),
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv);
  const baseUrl = `http://127.0.0.1:${options.port}`;

  await fs.mkdir(options.outputDir, { recursive: true });
  const safeVite = await prepareSafeViteRoot();

  await runProcess(
    "pnpm",
    ["exec", "vite", "build", "--config", safeVite.safeConfigCliPath],
    safeVite.safeRendererRoot,
  );
  await writeStaticHarnessHtml(safeVite.safeOutputRoot);

  const server = spawn(
    "python3",
    [
      "-m",
      "http.server",
      String(options.port),
      "--directory",
      safeVite.safeOutputRoot,
      "--bind",
      "127.0.0.1",
    ],
    {
      cwd: safeVite.safeOutputRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  let browser;
  try {
    await waitForServer(
      `${baseUrl}/phase11-light-theme-shared-color-migration.html`,
    );
    browser = await chromium.launch();
    const captures = [];

    for (const scenario of scenarios) {
      captures.push(
        await captureScenario(browser, baseUrl, options.outputDir, scenario),
      );
      process.stdout.write(`✓ ${scenario.file}\n`);
    }

    await fs.writeFile(
      path.join(options.outputDir, path.basename(metadataPath)),
      JSON.stringify(
        {
          taskId: "TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001",
          capturedAt: new Date().toISOString(),
          baseUrl,
          outputDir: options.outputDir,
          captures,
        },
        null,
        2,
      ),
    );
    process.stdout.write(`✓ ${path.basename(metadataPath)}\n`);
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
    await fs.rm(safeRunnerRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(
    "[capture-light-theme-shared-color-migration-phase11] failed",
    error,
  );
  process.exitCode = 1;
});
