#!/usr/bin/env node
/**
 * audit-unassigned-tasks.js
 *
 * 未タスク指示書の配置・フォーマット監査を実行する。
 *
 * Usage:
 *   node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js
 *   node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
 *   node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/example.md
 *   node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD~1
 */

import { readdirSync, readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, basename, resolve, relative } from "path";
import { pathToFileURL } from "url";

const REQUIRED_HEADINGS = [
  "## メタ情報",
  "## 1. なぜこのタスクが必要か（Why）",
  "## 2. 何を達成するか（What）",
  "## 3. どのように実行するか（How）",
  "## 4. 実行手順",
  "## 5. 完了条件チェックリスト",
  "## 6. 検証方法",
  "## 7. リスクと対策",
  "## 8. 参照情報",
  "## 9. 備考",
];

const STATUS_PENDING_REGEX =
  /\|\s*ステータス\s*\|\s*(未実施|未着手|進行中|未対応)\s*\|/;

const STATUS_PENDING_TEXT_REGEX = /(ステータス\s*[:：]\s*)(未実施|未着手|進行中|未対応)/;

function parseArgs(argv) {
  const args = {
    unassignedDir: "docs/30-workflows/unassigned-task",
    completedUnassignedDir: "docs/30-workflows/completed-tasks/unassigned-task",
    targetFiles: [],
    diffFrom: null,
    json: false,
    errors: [],
  };

  function consumeValue(index, optionName) {
    if (!argv[index + 1] || argv[index + 1].startsWith("--")) {
      args.errors.push(`${optionName} には値が必要です`);
      return { value: null, nextIndex: index };
    }
    return { value: argv[index + 1], nextIndex: index + 1 };
  }

  function addTargetFiles(rawValue) {
    const values = rawValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    args.targetFiles.push(...values);
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") {
      args.json = true;
    } else if (token === "--unassigned-dir") {
      const { value, nextIndex } = consumeValue(i, "--unassigned-dir");
      if (value) args.unassignedDir = value;
      i = nextIndex;
    } else if (token.startsWith("--unassigned-dir=")) {
      args.unassignedDir = token.slice("--unassigned-dir=".length).trim();
    } else if (token === "--completed-unassigned-dir") {
      const { value, nextIndex } = consumeValue(i, "--completed-unassigned-dir");
      if (value) args.completedUnassignedDir = value;
      i = nextIndex;
    } else if (token.startsWith("--completed-unassigned-dir=")) {
      args.completedUnassignedDir = token
        .slice("--completed-unassigned-dir=".length)
        .trim();
    } else if (token === "--target-file") {
      const { value, nextIndex } = consumeValue(i, "--target-file");
      if (value) addTargetFiles(value);
      i = nextIndex;
    } else if (token.startsWith("--target-file=")) {
      addTargetFiles(token.slice("--target-file=".length));
    } else if (token === "--diff-from") {
      const { value, nextIndex } = consumeValue(i, "--diff-from");
      if (value) args.diffFrom = value.trim();
      i = nextIndex;
    } else if (token.startsWith("--diff-from=")) {
      args.diffFrom = token.slice("--diff-from=".length).trim();
    } else if (token.startsWith("--")) {
      args.errors.push(`不明なオプションです: ${token}`);
    }
  }

  args.targetFiles = [...new Set(args.targetFiles)];

  return args;
}

function listMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => normalizePath(join(dir, name)))
    .sort();
}

function checkFormat(filePath) {
  const content = readFileSync(filePath, "utf8");
  const missingHeadings = REQUIRED_HEADINGS.filter((heading) => !content.includes(heading));
  const filename = basename(filePath);

  // 命名規則（最小限）: 英小文字/数字/ハイフン。* を含むファイル名を検出。
  const hasIllegalChar = /[A-Z*]/.test(filename);

  return {
    filePath,
    missingHeadings,
    hasIllegalChar,
  };
}

function checkMisplaced(filePath) {
  const content = readFileSync(filePath, "utf8");
  return STATUS_PENDING_REGEX.test(content) || STATUS_PENDING_TEXT_REGEX.test(content);
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function isCompletedOnlyArea(dirPath) {
  return normalizePath(dirPath) === "docs/30-workflows/completed-tasks/unassigned-task";
}

function asRepoRelative(filePath) {
  return normalizePath(relative(process.cwd(), resolve(filePath)));
}

function isTargetWithinAuditDirs(filePath, unassignedDir, completedUnassignedDir) {
  const normalized = normalizePath(filePath);
  const auditRoots = [normalizePath(unassignedDir), normalizePath(completedUnassignedDir)];
  return auditRoots.some(
    (root) => normalized === root || normalized.startsWith(`${root}/`),
  );
}

function shellEscapeSingleQuotes(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function getScopedFilesFromDiff(diffFrom, unassignedDir, completedUnassignedDir) {
  const dirs = [unassignedDir, completedUnassignedDir];
  const command =
    `git diff --name-only ${shellEscapeSingleQuotes(diffFrom)} -- ` +
    dirs.map((dir) => shellEscapeSingleQuotes(dir)).join(" ");

  const output = execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => normalizePath(line))
    .filter((line) => line.endsWith(".md"));
}

function resolveScope(args) {
  const scopeErrors = [];
  const currentFiles = new Set();
  const scoped = args.targetFiles.length > 0 || Boolean(args.diffFrom);

  if (args.targetFiles.length > 0) {
    for (const rawTarget of args.targetFiles) {
      const repoRelativeTarget = asRepoRelative(rawTarget);
      const absoluteTarget = resolve(rawTarget);

      if (!existsSync(absoluteTarget)) {
        scopeErrors.push(`--target-file が存在しません: ${rawTarget}`);
        continue;
      }

      if (!repoRelativeTarget.endsWith(".md")) {
        scopeErrors.push(`--target-file は .md ファイルを指定してください: ${rawTarget}`);
        continue;
      }

      if (
        !isTargetWithinAuditDirs(
          repoRelativeTarget,
          args.unassignedDir,
          args.completedUnassignedDir,
        )
      ) {
        scopeErrors.push(
          `--target-file は監査対象ディレクトリ配下のみ指定できます: ${rawTarget}`,
        );
        continue;
      }

      currentFiles.add(normalizePath(repoRelativeTarget));
    }
  }

  if (args.diffFrom) {
    try {
      const diffFiles = getScopedFilesFromDiff(
        args.diffFrom,
        args.unassignedDir,
        args.completedUnassignedDir,
      );
      for (const file of diffFiles) {
        currentFiles.add(file);
      }
    } catch (error) {
      const message = error?.stderr?.toString().trim() || error.message;
      scopeErrors.push(`--diff-from の解析に失敗しました: ${message}`);
    }
  }

  return {
    scoped,
    currentFiles,
    errors: scopeErrors,
  };
}

function classifyViolations(summary, scoped, currentFileSet) {
  function isCurrent(filePath) {
    if (!scoped) return true;
    return currentFileSet.has(normalizePath(filePath));
  }

  const currentViolations = {
    formatViolations: summary.formatViolations.filter((item) => isCurrent(item.filePath)),
    namingViolations: summary.namingViolations.filter((filePath) => isCurrent(filePath)),
    misplacedFiles: summary.misplacedFiles.filter((filePath) => isCurrent(filePath)),
  };

  const baselineViolations = {
    formatViolations: summary.formatViolations.filter((item) => !isCurrent(item.filePath)),
    namingViolations: summary.namingViolations.filter((filePath) => !isCurrent(filePath)),
    misplacedFiles: summary.misplacedFiles.filter((filePath) => !isCurrent(filePath)),
  };

  const currentTotal =
    currentViolations.formatViolations.length +
    currentViolations.namingViolations.length +
    currentViolations.misplacedFiles.length;
  const baselineTotal =
    baselineViolations.formatViolations.length +
    baselineViolations.namingViolations.length +
    baselineViolations.misplacedFiles.length;

  return {
    currentViolations: {
      ...currentViolations,
      total: currentTotal,
    },
    baselineViolations: {
      ...baselineViolations,
      total: baselineTotal,
    },
  };
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.errors.length > 0) {
    for (const error of args.errors) {
      console.error(`[audit-unassigned-tasks] ${error}`);
    }
    process.exit(2);
  }

  const unassignedFiles = listMarkdownFiles(args.unassignedDir);
  const completedUnassignedFiles = listMarkdownFiles(args.completedUnassignedDir);

  const formatViolations = [];
  const namingViolations = [];

  for (const filePath of unassignedFiles) {
    const result = checkFormat(filePath);
    if (result.missingHeadings.length > 0) {
      formatViolations.push({
        filePath,
        missingHeadings: result.missingHeadings,
      });
    }
    if (result.hasIllegalChar) {
      namingViolations.push(filePath);
    }
  }

  const misplacedFiles = isCompletedOnlyArea(args.completedUnassignedDir)
    ? completedUnassignedFiles.filter((filePath) => checkMisplaced(filePath))
    : [];

  const scope = resolveScope(args);
  if (scope.errors.length > 0) {
    for (const error of scope.errors) {
      console.error(`[audit-unassigned-tasks] ${error}`);
    }
    process.exit(2);
  }

  const summary = {
    checkedAt: new Date().toISOString(),
    unassignedDir: args.unassignedDir,
    completedUnassignedDir: args.completedUnassignedDir,
    totals: {
      unassignedFiles: unassignedFiles.length,
      completedUnassignedFiles: completedUnassignedFiles.length,
      formatViolations: formatViolations.length,
      namingViolations: namingViolations.length,
      misplacedFiles: misplacedFiles.length,
    },
    formatViolations,
    namingViolations,
    misplacedFiles,
    scope: {
      mode: scope.scoped ? "scoped" : "full",
      targetFiles: args.targetFiles
        .map((target) => asRepoRelative(target))
        .map((target) => normalizePath(target))
        .sort(),
      diffFrom: args.diffFrom,
      currentFiles: Array.from(scope.currentFiles).sort(),
    },
  };

  const classified = classifyViolations(summary, scope.scoped, scope.currentFiles);
  summary.currentViolations = classified.currentViolations;
  summary.baselineViolations = classified.baselineViolations;
  summary.totals.currentViolations = classified.currentViolations.total;
  summary.totals.baselineViolations = classified.baselineViolations.total;

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("[audit-unassigned-tasks] summary");
    console.log(`- mode: ${summary.scope.mode}`);
    console.log(`- unassigned files: ${summary.totals.unassignedFiles}`);
    console.log(`- format violations: ${summary.totals.formatViolations}`);
    console.log(`- naming violations: ${summary.totals.namingViolations}`);
    console.log(`- misplaced files (completed-tasks/unassigned-task): ${summary.totals.misplacedFiles}`);
    console.log(`- current violations: ${summary.totals.currentViolations}`);
    console.log(`- baseline violations: ${summary.totals.baselineViolations}`);

    if (scope.scoped) {
      console.log(`- current files: ${summary.scope.currentFiles.length}`);
      if (summary.scope.diffFrom) {
        console.log(`- diff-from: ${summary.scope.diffFrom}`);
      }
    }

    if (misplacedFiles.length > 0) {
      console.log("\n[audit-unassigned-tasks] misplaced files");
      for (const filePath of misplacedFiles) {
        console.log(`- ${filePath}`);
      }
    }

    if (formatViolations.length > 0) {
      console.log("\n[audit-unassigned-tasks] format violations");
      for (const violation of formatViolations.slice(0, 30)) {
        console.log(`- ${violation.filePath} (missing: ${violation.missingHeadings.length})`);
      }
      if (formatViolations.length > 30) {
        console.log(`- ... and ${formatViolations.length - 30} more`);
      }
    }

    if (namingViolations.length > 0) {
      console.log("\n[audit-unassigned-tasks] naming violations");
      for (const filePath of namingViolations) {
        console.log(`- ${filePath}`);
      }
    }
  }

  const hasIssue =
    summary.totals.formatViolations > 0 ||
    summary.totals.namingViolations > 0 ||
    summary.totals.misplacedFiles > 0;
  const hasCurrentIssue = summary.totals.currentViolations > 0;
  const shouldFail = scope.scoped ? hasCurrentIssue : hasIssue;

  process.exit(shouldFail ? 1 : 0);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main();
}

export { parseArgs, resolveScope, classifyViolations, main };
