#!/usr/bin/env node
/**
 * Tailwind CSS usage analyzer.
 *
 * Exit codes:
 *   0: success
 *   1: general error
 *   2: argument error
 *   3: file not found
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, resolve } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_NOT_FOUND = 3;

const BREAKPOINTS = ["sm", "md", "lg", "xl", "2xl"];
const STATE_VARIANTS = [
  "hover",
  "focus",
  "active",
  "disabled",
  "group-hover",
  "peer-focus",
  "first",
  "last",
  "odd",
  "even",
];

const UTILITY_CATEGORIES = {
  layout: /^(flex|grid|block|inline|hidden|container)/,
  spacing: /^(p[xytblr]?-|m[xytblr]?-|space-|gap-)/,
  sizing: /^(w-|h-|min-|max-)/,
  typography: /^(text-|font-|leading-|tracking-|truncate|line-clamp)/,
  colors: /^(bg-|text-|border-|ring-|from-|to-|via-)/,
  borders: /^(border|rounded|divide)/,
  effects: /^(shadow|opacity|blur|brightness|contrast)/,
  transitions: /^(transition|duration|ease|delay|animate)/,
  transforms: /^(scale|rotate|translate|skew|origin)/,
  interactivity: /^(cursor|pointer-events|select|touch)/,
};

function showHelp() {
  console.log(`
Tailwind CSS Analyzer

Usage:
  node analyze-tailwind.mjs --input <file-or-directory> [--output <report.json>]

Options:
  --input <path>   Target file or directory (required)
  --output <path>  Write JSON report to file (optional)
  -h, --help       Show this help
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function requireArg(value, name) {
  if (!value) {
    console.error(`Error: ${name} is required`);
    process.exit(EXIT_ARGS_ERROR);
  }
}

function extractClasses(content) {
  const classes = new Set();
  const patterns = [
    /className=["']([^"']+)["']/g,
    /className={`([^`]+)`}/g,
    /class=["']([^"']+)["']/g,
    /cn\(([^)]+)\)/g,
    /clsx\(([^)]+)\)/g,
    /twMerge\(([^)]+)\)/g,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const classString = match[1];
      classString.split(/\s+/).forEach((cls) => {
        const cleaned = cls.replace(/['"`${}]/g, "").trim();
        if (cleaned && !cleaned.includes("(")) {
          classes.add(cleaned);
        }
      });
    }
  });

  return Array.from(classes);
}

function analyzeClasses(classes) {
  const analysis = {
    total: classes.length,
    responsive: { total: 0, byBreakpoint: {} },
    darkMode: { total: 0, classes: [] },
    states: { total: 0, byState: {} },
    categories: {},
    arbitrary: [],
  };

  BREAKPOINTS.forEach((bp) => {
    analysis.responsive.byBreakpoint[bp] = 0;
  });

  STATE_VARIANTS.forEach((state) => {
    analysis.states.byState[state] = 0;
  });

  Object.keys(UTILITY_CATEGORIES).forEach((cat) => {
    analysis.categories[cat] = 0;
  });

  classes.forEach((cls) => {
    BREAKPOINTS.forEach((bp) => {
      if (cls.startsWith(`${bp}:`)) {
        analysis.responsive.total++;
        analysis.responsive.byBreakpoint[bp]++;
      }
    });

    if (cls.startsWith("dark:")) {
      analysis.darkMode.total++;
      analysis.darkMode.classes.push(cls);
    }

    STATE_VARIANTS.forEach((state) => {
      if (cls.startsWith(`${state}:`)) {
        analysis.states.total++;
        analysis.states.byState[state]++;
      }
    });

    const baseClass = cls.split(":").pop();
    Object.entries(UTILITY_CATEGORIES).forEach(([category, pattern]) => {
      if (pattern.test(baseClass)) {
        analysis.categories[category]++;
      }
    });

    if (cls.includes("[") && cls.includes("]")) {
      analysis.arbitrary.push(cls);
    }
  });

  return analysis;
}

function detectIssues(classes, analysis) {
  const issues = [];

  const spacingClasses = classes.filter((c) => /^(p|m)[xytblr]?-(\d|\[)/.test(c));
  if (spacingClasses.length > 10) {
    issues.push({
      type: "warning",
      message: `多数のスペーシングクラス (${spacingClasses.length}件) が検出されました`,
      suggestion: "デザイントークンの整理を検討してください",
    });
  }

  if (analysis.arbitrary.length > 5) {
    issues.push({
      type: "info",
      message: `任意値の使用が多い (${analysis.arbitrary.length}件)`,
      suggestion: "tailwind.config.js への定義を検討してください",
    });
  }

  if (analysis.total > 20 && analysis.responsive.total === 0) {
    issues.push({
      type: "info",
      message: "多数のクラスがあるがレスポンシブ対応がありません",
      suggestion: "モバイルファーストの見直しを検討してください",
    });
  }

  const colorClasses = classes.filter((c) => /^(bg-|text-)/.test(c));
  const darkColorClasses = classes.filter((c) => /^dark:(bg-|text-)/.test(c));
  if (colorClasses.length > 5 && darkColorClasses.length === 0) {
    issues.push({
      type: "info",
      message: "カラークラスがありますがダークモード対応がありません",
      suggestion: "ダークモードの追加を検討してください",
    });
  }

  return issues;
}

function processDirectory(dirPath) {
  let allClasses = [];
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
      allClasses = allClasses.concat(processDirectory(filePath));
    } else if (/\.(tsx?|jsx?|vue|svelte)$/.test(file)) {
      const content = readFileSync(filePath, "utf-8");
      allClasses = allClasses.concat(extractClasses(content));
    }
  });

  return allClasses;
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const inputArg = getArg(args, "--input");
  const outputArg = getArg(args, "--output");

  requireArg(inputArg, "--input");

  const targetPath = resolve(process.cwd(), inputArg);
  if (!existsSync(targetPath)) {
    console.error(`Error: path not found: ${targetPath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  const stat = statSync(targetPath);
  let classes = [];

  if (stat.isDirectory()) {
    classes = processDirectory(targetPath);
    classes = [...new Set(classes)];
  } else {
    const content = readFileSync(targetPath, "utf-8");
    classes = extractClasses(content);
  }

  if (classes.length === 0) {
    console.log("No Tailwind classes found.");
    process.exit(EXIT_SUCCESS);
  }

  const analysis = analyzeClasses(classes);
  const issues = detectIssues(classes, analysis);

  const report = { analysis, issues };

  console.log("=== Tailwind CSS Analysis ===");
  console.log(`Total classes: ${analysis.total}`);
  console.log(`Responsive classes: ${analysis.responsive.total}`);
  console.log(`Dark mode classes: ${analysis.darkMode.total}`);

  if (issues.length > 0) {
    console.log("\nIssues:");
    issues.forEach((issue) => {
      console.log(`- ${issue.message}`);
      console.log(`  -> ${issue.suggestion}`);
    });
  }

  if (outputArg) {
    const outputPath = resolve(process.cwd(), outputArg);
    writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`\nReport written to ${outputPath}`);
  }

  process.exit(EXIT_SUCCESS);
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
}
