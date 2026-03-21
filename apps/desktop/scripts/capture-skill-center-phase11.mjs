import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");
const screenshotDir = path.resolve(
  repoRoot,
  "docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots",
);
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";

const availableSkills = [
  {
    name: "healthy-skill",
    description: "healthy analysis helper for stable search and filtering",
    path: ".claude/skills/healthy-skill/SKILL.md",
    allowedTools: ["Read"],
    updatedAt: new Date("2026-03-04T00:00:00.000Z").toISOString(),
    agents: [
      {
        filename: "agent.md",
        relativePath: "agents/agent.md",
        description: "agent",
        size: 120,
      },
    ],
    references: [
      {
        filename: "ref.md",
        relativePath: "references/ref.md",
        description: "reference",
        size: 80,
      },
    ],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [
      {
        filename: "index.md",
        relativePath: "indexes/index.md",
        description: "index",
        size: 64,
      },
    ],
    otherFiles: [{ filename: "meta.json", size: 10, type: "other" }],
  },
  {
    name: "missing-description-skill",
    description: undefined,
    path: ".claude/skills/missing-description-skill/SKILL.md",
    allowedTools: ["Read"],
    updatedAt: new Date("2026-03-04T00:00:00.000Z").toISOString(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: "broken-metadata-skill",
    description: null,
    path: ".claude/skills/broken-metadata-skill/SKILL.md",
    allowedTools: ["Read", "Write"],
    updatedAt: new Date("2026-03-04T00:00:00.000Z").toISOString(),
    agents: undefined,
    references: null,
    scripts: undefined,
    assets: [],
    schemas: [],
    indexes: null,
    otherFiles: undefined,
  },
  {
    name: "dev-helper-skill",
    description: "開発 workflow build helper",
    path: ".claude/skills/dev-helper-skill/SKILL.md",
    allowedTools: ["Read"],
    updatedAt: new Date("2026-03-04T00:00:00.000Z").toISOString(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  colorScheme: "light",
});

await context.addInitScript((skills) => {
  localStorage.setItem("dev-skip-auth", "true");

  const importedSkills = [];
  const clone = (value) => JSON.parse(JSON.stringify(value));

  window.electronAPI = {
    skill: {
      list: async () => clone(skills),
      getImported: async () => clone(importedSkills),
      import: async (skillName) => {
        const target = skills.find((s) => String(s.name) === String(skillName));
        if (!target) {
          throw new Error(`Skill not found: ${skillName}`);
        }
        const imported = {
          ...clone(target),
          importedAt: new Date().toISOString(),
          status: "active",
        };
        importedSkills.push(imported);
        return imported;
      },
      remove: async () => undefined,
      rescan: async () => clone(skills),
    },
    auth: {
      getSession: async () => ({ success: false, error: "no-session" }),
      onAuthStateChanged: () => () => undefined,
    },
    profile: {
      get: async () => ({ success: false, error: "not-implemented" }),
      getProviders: async () => ({ success: true, data: [] }),
      update: async () => ({ success: false, error: "not-implemented" }),
      linkProvider: async () => ({ success: false, error: "not-implemented" }),
      unlinkProvider: async () => ({
        success: false,
        error: "not-implemented",
      }),
      delete: async () => ({ success: false, error: "not-implemented" }),
    },
    avatar: {
      upload: async () => ({ success: false, error: "not-implemented" }),
      useProvider: async () => ({ success: false, error: "not-implemented" }),
      remove: async () => ({ success: false, error: "not-implemented" }),
    },
  };
}, availableSkills);

const page = await context.newPage();

try {
  await page.goto(`${baseUrl}/advanced/skill-center?skipAuth=true`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  await page.waitForSelector('[data-testid="skill-search-input"]', {
    timeout: 60000,
  });
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: path.join(screenshotDir, "TC-01-skill-center-initial.png"),
    fullPage: true,
  });

  await page.fill('[data-testid="skill-search-input"]', "healthy");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-02-search-with-missing-description.png"),
    fullPage: true,
  });

  await page.fill('[data-testid="skill-search-input"]', "");
  await page.waitForTimeout(400);
  await page.click('[data-testid="skill-card-broken-metadata-skill"]');
  await page.waitForSelector('[data-testid="skill-detail-panel"]', {
    timeout: 10000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-03-detail-panel-malformed-metadata.png"),
    fullPage: true,
  });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await page.click('[data-testid="category-tab-dev"]');
  await page.waitForTimeout(300);
  await page.click('[data-testid="category-tab-all"]');
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-04-featured-and-category.png"),
    fullPage: true,
  });

  console.log("screenshots captured", screenshotDir);
} finally {
  await page.close();
  await context.close();
  await browser.close();
}
