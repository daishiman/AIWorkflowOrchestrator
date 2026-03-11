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
const workflowDir = path.join(
  repoRoot,
  "docs/30-workflows/skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration",
);
const screenshotDir = path.join(workflowDir, "outputs/phase-11/screenshots");
const captureResultsPath = path.join(screenshotDir, "capture-results.json");
const port = process.env.TASK_SKILL_LIFECYCLE_PORT ?? "5181";
const baseUrl = `http://localhost:${port}`;
const route = "/advanced/skill-management-panel";
const defaultViewport = { width: 1440, height: 1600 };

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date().toISOString();

    const buildImportedSkill = (name, description) => ({
      name,
      description,
      path: `/mock/skills/${name}`,
      allowedTools: ["Read", "Write"],
      updatedAt: now,
      importedAt: now,
      status: "active",
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    });

    const buildAvailableSkill = (name, description) => ({
      name,
      displayName: name,
      description,
      version: "1.0.0",
      category: "automation",
      tags: ["automation"],
      author: "phase11-mock",
      path: `/mock/skills/${name}`,
    });

    const deriveSkillName = (description) => {
      if (/委譲|SubAgent|Codex/i.test(description)) {
        return "delegation-lifecycle-skill";
      }
      if (/議事録|会議|メモ/.test(description)) {
        return "meeting-lifecycle-skill";
      }
      if (/レビュー|仕様/.test(description)) {
        return "review-lifecycle-skill";
      }
      return "lifecycle-skill";
    };

    let importedSkills = [
      buildImportedSkill("existing-skill", "既存の比較用スキル"),
    ];
    let availableSkills = [
      buildAvailableSkill("gamma-helper", "比較用の利用可能スキル"),
    ];

    const mockAnalysis = {
      skillName: "review-lifecycle-skill",
      overallScore: 82,
      categories: [
        {
          name: "prompt",
          score: 86,
          details: "ゴール定義は明確です。",
          issues: [],
        },
        {
          name: "structure",
          score: 78,
          details: "責務をもう一段分ける余地があります。",
          issues: ["生成後の改善経路をもう少し整理できる"],
        },
      ],
      suggestions: [
        {
          type: "structure",
          priority: "medium",
          description: "Planner / Executor / Improver のログ粒度を揃える",
          autoFixable: true,
        },
        {
          type: "documentation",
          priority: "low",
          description: "実行例を 1 件追加する",
          autoFixable: false,
        },
      ],
      risks: [
        {
          category: "maintainability",
          level: "low",
          description: "改善提案の根拠表示は今後の拡張候補です。",
          impact: "理解コストが少し上がる可能性があります。",
        },
      ],
    };

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: Date.now() + 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({ authenticated: true, user: mockUser, isOffline: false });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      },
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "light", resolvedTheme: "light" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "light" } }),
        onSystemChanged: () => () => {},
      },
      skillCreator: {
        detectMode: async (request) => {
          if (/委譲|SubAgent|Codex/i.test(request)) {
            return { success: true, data: "orchestrate" };
          }
          if (/改善/.test(request)) {
            return { success: true, data: "improve-prompt" };
          }
          return { success: true, data: "collaborative" };
        },
        improveSkill: async (skillName) => ({
          success: true,
          data: {
            applied: false,
            suggestions: [
              {
                category: "structure",
                description: `${skillName} の責務境界を整理する`,
                severity: "medium",
                autoFixable: true,
              },
              {
                category: "execution",
                description: "実行例を 1 件 UI 上で示す",
                severity: "low",
                autoFixable: false,
              },
            ],
          },
        }),
      },
      skill: {
        list: async () => availableSkills,
        getImported: async () => importedSkills,
        rescan: async () => availableSkills,
        import: async (skillName) => {
          const imported = buildImportedSkill(skillName, `${skillName} を追加`);
          importedSkills = [...importedSkills, imported];
          availableSkills = availableSkills.filter((skill) => skill.name !== skillName);
          return imported;
        },
        remove: async (skillName) => {
          importedSkills = importedSkills.filter((skill) => skill.name !== skillName);
        },
        create: async ({ description }) => {
          const name = deriveSkillName(description);
          if (!importedSkills.find((skill) => skill.name === name)) {
            importedSkills = [
              buildImportedSkill(name, description),
              ...importedSkills,
            ];
          }
          return { path: `/mock/skills/${name}` };
        },
        execute: async ({ skillName }) => ({
          executionId: `exec-${skillName}-${Date.now()}`,
        }),
        abort: async () => undefined,
        sendPermissionResponse: async () => undefined,
        onStream: () => () => {},
        onComplete: () => () => {},
        onError: () => () => {},
        onPermissionRequest: () => () => {},
        analyze: async (skillName) => ({
          ...mockAnalysis,
          skillName,
        }),
        applyImprovements: async () => ({ applied: [], skipped: [] }),
        autoImprove: async () => ({ applied: [], skipped: [] }),
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nPhase11 mock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
      },
    };
  };
}

async function openLifecyclePanel(page) {
  await page.goto(`${baseUrl}${route}`);
  await page.waitForSelector('[data-testid="skill-management-panel"]');
  await page.getByTestId("skill-management-lifecycle-button").click();
  await page.waitForSelector('[data-testid="skill-lifecycle-panel"]');
}

async function createSkillFlow(page, requestText) {
  await page.getByTestId("skill-lifecycle-request-input").fill(requestText);
  await page.getByTestId("skill-lifecycle-prepare-button").click();
  await page.waitForFunction(() => {
    const label = document.querySelector(
      '[data-testid="skill-lifecycle-mode-label"]',
    );
    return label && label.textContent && !label.textContent.includes("未判定");
  });
  await page.getByTestId("skill-lifecycle-create-button").click();
  await page.waitForFunction(() => {
    const label = document.querySelector(
      '[data-testid="skill-lifecycle-created-name"]',
    );
    return label && label.textContent && !label.textContent.includes("未生成");
  });
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: defaultViewport,
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript());
  const page = await context.newPage();

  try {
    await scenario.run(page);
    await page.waitForTimeout(400);
    const outputPath = path.join(screenshotDir, scenario.file);
    await page.screenshot({
      path: outputPath,
      fullPage: true,
    });
    return {
      tc: scenario.tc,
      title: scenario.title,
      file: scenario.file,
      route,
      viewport: defaultViewport,
    };
  } finally {
    await context.close();
  }
}

const scenarios = [
  {
    tc: "TC-11-01",
    title: "自然文から collaborative モードで作成する",
    file: "TC-11-01-create-flow.png",
    run: async (page) => {
      await openLifecyclePanel(page);
      await createSkillFlow(
        page,
        "仕様書を読み、レビュー観点を整理して改善提案まで返すスキルを作りたい",
      );
      await page.waitForSelector('[data-testid="skill-lifecycle-created-path"]');
    },
  },
  {
    tc: "TC-11-02",
    title: "生成直後にそのまま実行へ進む",
    file: "TC-11-02-execute-flow.png",
    run: async (page) => {
      await openLifecyclePanel(page);
      await createSkillFlow(
        page,
        "会議メモを整えて要点をまとめるスキルを作りたい",
      );
      await page
        .getByTestId("skill-lifecycle-execution-input")
        .fill("サンプル議事録を処理して要約して");
      await page.getByTestId("skill-lifecycle-execute-button").click();
      await page.waitForFunction(() => {
        const button = document.querySelector(
          '[data-testid="skill-lifecycle-execute-button"]',
        );
        return button && button.textContent && button.textContent.includes("実行中");
      });
      await page.waitForSelector('[data-testid="mock-streaming-view"], [data-testid="skill-lifecycle-panel"]');
    },
  },
  {
    tc: "TC-11-03",
    title: "改善提案と詳細分析へ進む",
    file: "TC-11-03-improve-flow.png",
    run: async (page) => {
      await openLifecyclePanel(page);
      await createSkillFlow(
        page,
        "仕様変更の差分を整理して改善提案まで返すスキルを作りたい",
      );
      await page.getByTestId("skill-lifecycle-improve-button").click();
      await page.waitForSelector('[data-testid="skill-lifecycle-improve-result"]');
      await page.getByTestId("skill-lifecycle-analysis-toggle").click();
      await page.waitForSelector('[data-testid="skill-lifecycle-analysis-view"]');
    },
  },
  {
    tc: "TC-11-04",
    title: "内部委譲前提でも UI を増やさず継続できる",
    file: "TC-11-04-internal-orchestration-flow.png",
    run: async (page) => {
      await openLifecyclePanel(page);
      await page
        .getByTestId("skill-lifecycle-request-input")
        .fill("SubAgent と Codex に委譲しつつ、最後は 1 画面で完結するスキルを作りたい");
      await page.getByTestId("skill-lifecycle-prepare-button").click();
      await page.waitForFunction(() => {
        const label = document.querySelector(
          '[data-testid="skill-lifecycle-mode-label"]',
        );
        return label && label.textContent && label.textContent.includes("実行分担");
      });
    },
  },
];

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  server.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch();
    const captureResults = [];

    for (const scenario of scenarios) {
      const result = await captureScenario(browser, scenario);
      captureResults.push(result);
      console.log(`✓ ${scenario.tc} ${scenario.file}`);
    }

    await fs.writeFile(
      captureResultsPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          route,
          port,
          results: captureResults,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
