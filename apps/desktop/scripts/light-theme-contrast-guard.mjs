#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  LIGHT_THEME_AUDIT_EXCLUSIONS,
  LIGHT_THEME_AUDIT_PATTERNS,
  LIGHT_THEME_AUDIT_TARGETS,
  LIGHT_THEME_SCREENSHOT_SCENARIOS,
  createLightThemeScreenshotPlan,
} from "./light-theme-contrast-guard.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");

function cloneGlobalRegex(regex) {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
}

function shouldExcludeFile(relativePath) {
  return LIGHT_THEME_AUDIT_EXCLUSIONS.some((pattern) =>
    pattern.test(relativePath),
  );
}

function resolveBucket(relativePath) {
  const target = LIGHT_THEME_AUDIT_TARGETS.find(
    (entry) => entry.relativePath === relativePath,
  );
  return target?.bucket ?? "current";
}

function resolveSurface(relativePath) {
  const target = LIGHT_THEME_AUDIT_TARGETS.find(
    (entry) => entry.relativePath === relativePath,
  );
  return target?.surface ?? "unknown";
}

export function auditSource(relativePath, content) {
  if (shouldExcludeFile(relativePath)) {
    return [];
  }

  const bucket = resolveBucket(relativePath);
  const surface = resolveSurface(relativePath);
  const lines = content.split(/\r?\n/);
  const hits = [];

  lines.forEach((line, index) => {
    for (const pattern of LIGHT_THEME_AUDIT_PATTERNS) {
      const regex = cloneGlobalRegex(pattern.regex);
      const matches = [...line.matchAll(regex)];

      matches.forEach((match) => {
        hits.push({
          relativePath,
          surface,
          bucket,
          lineNumber: index + 1,
          patternId: pattern.id,
          patternLabel: pattern.label,
          token: match[0],
          lineText: line.trim(),
        });
      });
    }
  });

  return hits;
}

export function summarizeAuditHits(hits) {
  const byBucket = {
    current: 0,
    baseline: 0,
  };
  const byFile = {};
  const byPattern = {};

  hits.forEach((hit) => {
    byBucket[hit.bucket] = (byBucket[hit.bucket] ?? 0) + 1;
    byFile[hit.relativePath] = (byFile[hit.relativePath] ?? 0) + 1;
    byPattern[hit.patternId] = (byPattern[hit.patternId] ?? 0) + 1;
  });

  return {
    totalViolations: hits.length,
    currentViolations: byBucket.current,
    baselineViolations: byBucket.baseline,
    byFile,
    byPattern,
  };
}

export async function auditConfiguredTargets(customRepoRoot = repoRoot) {
  const results = [];
  const missingTargets = [];

  for (const target of LIGHT_THEME_AUDIT_TARGETS) {
    const absolutePath = path.join(customRepoRoot, target.relativePath);
    try {
      const content = await fs.readFile(absolutePath, "utf8");
      results.push(...auditSource(target.relativePath, content));
    } catch (error) {
      if (error && typeof error === "object" && error.code === "ENOENT") {
        missingTargets.push(target.relativePath);
        continue;
      }
      throw error;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    targets: [...LIGHT_THEME_AUDIT_TARGETS],
    missingTargets,
    screenshotPlan: createLightThemeScreenshotPlan("http://127.0.0.1:4173"),
    scenarios: LIGHT_THEME_SCREENSHOT_SCENARIOS.map((scenario) => ({
      id: scenario.id,
      surface: scenario.surface,
      selector: scenario.selector,
      output: scenario.output,
      theme: scenario.theme,
    })),
    hits: results,
    summary: summarizeAuditHits(results),
  };
}

function parseArgs(argv) {
  const options = {
    json: false,
    write: null,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case "--json":
        options.json = true;
        break;
      case "--write":
        options.write = argv[index + 1] ?? null;
        index += 1;
        break;
      default:
        throw new Error(`Unknown option: ${token}`);
    }
  }

  return options;
}

function formatReport(report) {
  const lines = [
    "[light-theme-contrast-guard]",
    `generatedAt: ${report.generatedAt}`,
    `targets: ${report.targets.length}`,
    `currentViolations: ${report.summary.currentViolations}`,
    `baselineViolations: ${report.summary.baselineViolations}`,
    `missingTargets: ${report.missingTargets.length}`,
  ];

  Object.entries(report.summary.byFile)
    .sort((left, right) => right[1] - left[1])
    .forEach(([filePath, count]) => {
      lines.push(`- ${filePath}: ${count}`);
    });

  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs(process.argv);
  const report = await auditConfiguredTargets();

  if (options.write) {
    const absoluteWritePath = path.isAbsolute(options.write)
      ? options.write
      : path.join(repoRoot, options.write);
    await fs.mkdir(path.dirname(absoluteWritePath), { recursive: true });
    await fs.writeFile(absoluteWritePath, JSON.stringify(report, null, 2));
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatReport(report));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("[light-theme-contrast-guard] failed", error);
    process.exitCode = 1;
  });
}
