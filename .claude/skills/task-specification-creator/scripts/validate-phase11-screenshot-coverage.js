#!/usr/bin/env node

/**
 * validate-phase11-screenshot-coverage.js
 *
 * Phase 11（UI/UX変更タスク）で、テストケース単位のスクリーンショット証跡が
 * 欠落していないかを機械的に検証する。
 *
 * Usage:
 *   node validate-phase11-screenshot-coverage.js --workflow <workflow-dir>
 *   node validate-phase11-screenshot-coverage.js --workflow <workflow-dir> --json
 *   node validate-phase11-screenshot-coverage.js --workflow <workflow-dir> --allow-non-visual-tc TC-08
 */

import fs from "node:fs";
import path from "node:path";

// Supports both classic IDs (e.g. TC-01, TC-101A) and UI IDs
// (e.g. TC-UI-00-301). Requires at least one digit to avoid matching
// header labels like "TC-ID".
const TC_ID_PATTERN = /\bTC-(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/i;
const TC_ID_EXACT_PATTERN = /^TC-(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*$/i;

function parseArgs(argv) {
  const options = {
    workflow: null,
    json: false,
    allowNonVisual: new Set(),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--workflow": {
        options.workflow = argv[i + 1];
        i += 1;
        break;
      }
      case "--json": {
        options.json = true;
        break;
      }
      case "--allow-non-visual-tc": {
        const raw = argv[i + 1];
        if (!raw) {
          throw new Error("--allow-non-visual-tc には値が必要です");
        }
        raw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((tc) => options.allowNonVisual.add(tc.toUpperCase()));
        i += 1;
        break;
      }
      default: {
        throw new Error(`不明なオプションです: ${arg}`);
      }
    }
  }

  if (!options.workflow) {
    throw new Error("--workflow は必須です");
  }

  return options;
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function listPngFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.toLowerCase().endsWith(".png"))
    .sort();
}

function extractSection(content, headingName) {
  const lines = content.split(/\r?\n/);
  const escapedHeading = headingName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingPattern = new RegExp(`^##\\s+${escapedHeading}\\s*$`);

  const startIndex = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (startIndex < 0) {
    return "";
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i].trim())) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join("\n");
}

function parseTableBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let current = [];

  const flush = () => {
    if (current.length > 0) {
      blocks.push([...current]);
      current = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      current.push(trimmed);
    } else {
      flush();
    }
  }
  flush();

  return blocks;
}

function parseRow(line) {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells) {
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseTable(blockLines) {
  const rows = blockLines.map(parseRow);
  if (rows.length < 2) {
    return null;
  }

  const header = rows[0];
  const dataRows = isSeparatorRow(rows[1]) ? rows.slice(2) : rows.slice(1);
  return { header, rows: dataRows };
}

function normalizeTc(tc) {
  return tc.trim().toUpperCase();
}

function extractTcIdsFromText(text) {
  const matches = text.match(new RegExp(TC_ID_PATTERN.source, "gi")) || [];
  return matches.map((tc) => normalizeTc(tc));
}

function extractExpectedTestCases(phase11Content) {
  const section = extractSection(phase11Content, "テストケース");
  const targets = section || phase11Content;
  const tcSet = new Set();

  const blocks = parseTableBlocks(targets);
  for (const block of blocks) {
    const table = parseTable(block);
    if (!table) continue;
    for (const row of table.rows) {
      if (row.length === 0) continue;
      const firstCell = row[0] ?? "";
      const tcMatch = firstCell.match(TC_ID_PATTERN);
      if (tcMatch) {
        tcSet.add(normalizeTc(tcMatch[0]));
      }
    }
  }

  if (tcSet.size > 0) {
    return [...tcSet];
  }

  extractTcIdsFromText(phase11Content).forEach((tc) => tcSet.add(tc));
  return [...tcSet];
}

function findHeaderIndex(headerCells, patterns) {
  for (let i = 0; i < headerCells.length; i += 1) {
    const header = headerCells[i] || "";
    if (patterns.some((pattern) => pattern.test(header))) {
      return i;
    }
  }
  return -1;
}

function readExpectedTestCasesFromChecklist(checklistPath) {
  if (!fs.existsSync(checklistPath)) {
    return [];
  }
  const checklistContent = readUtf8(checklistPath);
  return extractExpectedTestCases(checklistContent);
}

function extractResultEvidence(manualResultContent) {
  const evidenceMap = new Map();
  const blocks = parseTableBlocks(manualResultContent);

  for (const block of blocks) {
    const table = parseTable(block);
    if (!table) continue;

    const tcIndex = findHeaderIndex(table.header, [
      /^TC-ID$/i,
      /^TC[-\s]*ID$/i,
      /^TC$/i,
      /テストケース/i,
      /^NO$/i,
      /^ID$/i,
    ]);
    const evidenceIndex = findHeaderIndex(table.header, [
      /証跡/i,
      /スクリーンショット/i,
      /SCREENSHOT/i,
      /画像/i,
    ]);

    if (tcIndex < 0 || evidenceIndex < 0) {
      continue;
    }

    for (const row of table.rows) {
      const tcCell = row[tcIndex] ?? "";
      const tcMatch = tcCell.match(TC_ID_PATTERN);
      if (!tcMatch) continue;

      const tc = normalizeTc(tcMatch[0]);
      const evidence = (row[evidenceIndex] ?? "").trim();
      evidenceMap.set(tc, evidence);
    }
  }

  return evidenceMap;
}

function extractScreenshotRefs(evidenceCell) {
  const refs = new Set();
  if (!evidenceCell) return [];

  const fromPath = evidenceCell.match(/screenshots\/([A-Za-z0-9._-]+\.png)/gi) || [];
  fromPath.forEach((match) => {
    const fileName = path.basename(match);
    refs.add(fileName);
  });

  const fromInlineCode = evidenceCell.match(/`([^`]+\.png)`/gi) || [];
  fromInlineCode.forEach((match) => {
    const clean = match.replaceAll("`", "");
    refs.add(path.basename(clean));
  });

  const generic = evidenceCell.match(/[A-Za-z0-9._-]+\.png/gi) || [];
  generic.forEach((match) => refs.add(path.basename(match)));

  return [...refs];
}

function isMarkedAsNonVisual(evidenceCell) {
  return /NON_VISUAL|非視覚|対象外/i.test(evidenceCell);
}

function extractCoverageMatrix(phase11Content) {
  const section = extractSection(phase11Content, "画面カバレッジマトリクス");
  if (!section) {
    return null;
  }

  const blocks = parseTableBlocks(section);
  if (blocks.length === 0) {
    return null;
  }

  const table = parseTable(blocks[0]);
  if (!table) {
    return null;
  }

  const idIndex = findHeaderIndex(table.header, [
    /^TC$/i,
    /^TC[-\s]*ID$/i,
    /テストケース/i,
    /^NO$/i,
    /^ID$/i,
  ]);
  const evidenceIndex = findHeaderIndex(table.header, [
    /証跡/i,
    /スクリーンショット/i,
    /SCREENSHOT/i,
    /画像/i,
  ]);

  if (idIndex < 0 || evidenceIndex < 0) {
    return null;
  }

  const matrix = new Map();
  for (const row of table.rows) {
    const idCell = (row[idIndex] ?? "").trim();
    if (!idCell) continue;
    const normalizedId = idCell.toUpperCase();
    if (!TC_ID_EXACT_PATTERN.test(normalizedId) && !/^SUP-\d+/i.test(normalizedId)) {
      continue;
    }

    const evidenceCell = (row[evidenceIndex] ?? "").trim();
    matrix.set(normalizedId, {
      evidenceCell,
      refs: extractScreenshotRefs(evidenceCell),
    });
  }

  return matrix;
}

function runCoverageValidation(options) {
  const workflowPath = path.resolve(options.workflow);
  const phase11Path = path.join(workflowPath, "phase-11-manual-test.md");
  const manualChecklistPath = path.join(
    workflowPath,
    "outputs",
    "phase-11",
    "manual-test-checklist.md",
  );
  const manualResultPath = path.join(
    workflowPath,
    "outputs",
    "phase-11",
    "manual-test-result.md",
  );
  const screenshotDir = path.join(workflowPath, "outputs", "phase-11", "screenshots");

  const report = {
    workflow: options.workflow,
    phase11Path,
    manualChecklistPath,
    manualResultPath,
    screenshotDir,
    expectedTestCases: [],
    coveredTestCases: 0,
    errors: [],
    warnings: [],
    missingFiles: [],
    unreferencedScreenshots: [],
  };

  if (!fs.existsSync(phase11Path)) {
    report.errors.push(`Phase 11仕様書が存在しません: ${phase11Path}`);
    return report;
  }
  if (!fs.existsSync(manualResultPath)) {
    report.errors.push(`manual-test-result.md が存在しません: ${manualResultPath}`);
    return report;
  }

  const phase11Content = readUtf8(phase11Path);
  const manualResultContent = readUtf8(manualResultPath);
  let expectedCases = extractExpectedTestCases(phase11Content);
  if (expectedCases.length === 0) {
    expectedCases = readExpectedTestCasesFromChecklist(manualChecklistPath);
    if (expectedCases.length > 0) {
      report.warnings.push(
        "phase-11-manual-test.md から TC 抽出不可のため、manual-test-checklist.md を代替ソースとして使用しました",
      );
    }
  }
  report.expectedTestCases = expectedCases;

  if (expectedCases.length === 0) {
    report.errors.push(
      "Phase 11仕様書/チェックリストからテストケース（TC-XX）を抽出できませんでした",
    );
    return report;
  }

  const evidenceMap = extractResultEvidence(manualResultContent);
  if (evidenceMap.size === 0) {
    report.errors.push(
      "manual-test-result.md の表から証跡列（証跡/スクリーンショット）を抽出できませんでした",
    );
    return report;
  }

  const existingScreenshots = new Set(listPngFiles(screenshotDir));
  if (existingScreenshots.size === 0) {
    report.errors.push(`スクリーンショットが存在しません: ${screenshotDir}`);
    return report;
  }

  const referencedScreenshots = new Set();
  const matrix = extractCoverageMatrix(phase11Content);

  if (!matrix) {
    report.warnings.push(
      "phase-11-manual-test.md に画面カバレッジマトリクスが見つかりません（任意だが推奨）",
    );
  } else {
    for (const tc of expectedCases) {
      if (!matrix.has(tc)) {
        report.errors.push(`${tc}: 画面カバレッジマトリクスに行が存在しません`);
      }
    }

    for (const [id, info] of matrix.entries()) {
      if (info.refs.length === 0) {
        report.errors.push(
          `${id}: 画面カバレッジマトリクスの証跡列にスクリーンショット（.png）参照がありません`,
        );
        continue;
      }
      for (const ref of info.refs) {
        if (!existingScreenshots.has(ref)) {
          report.errors.push(`${id}: 画面カバレッジマトリクス参照ファイルが存在しません (${ref})`);
          report.missingFiles.push({ tc: id, file: ref });
        }
      }
    }
  }

  for (const tc of expectedCases) {
    if (!evidenceMap.has(tc)) {
      report.errors.push(
        `${tc}: manual-test-result.md の証跡表にテストケース行が存在しません`,
      );
      continue;
    }

    const evidenceCell = evidenceMap.get(tc) ?? "";
    const refs = extractScreenshotRefs(evidenceCell);

    const allowNonVisual = options.allowNonVisual.has(tc) || isMarkedAsNonVisual(evidenceCell);

    if (refs.length === 0) {
      if (allowNonVisual) {
        report.warnings.push(`${tc}: 非視覚TCとして証跡画像なしを許容しました`);
      } else {
        report.errors.push(
          `${tc}: 証跡列にスクリーンショット（.png）参照がありません`,
        );
      }
      continue;
    }

    report.coveredTestCases += 1;

    for (const ref of refs) {
      referencedScreenshots.add(ref);
      if (!existingScreenshots.has(ref)) {
        report.errors.push(`${tc}: 参照ファイルが存在しません (${ref})`);
        report.missingFiles.push({ tc, file: ref });
      }
    }
  }

  for (const file of existingScreenshots) {
    if (!referencedScreenshots.has(file)) {
      report.unreferencedScreenshots.push(file);
    }
  }

  if (report.unreferencedScreenshots.length > 0) {
    report.warnings.push(
      `証跡に紐付いていないスクリーンショットがあります (${report.unreferencedScreenshots.length}件)`,
    );
  }

  return report;
}

function printHuman(report) {
  console.log("Phase 11 スクリーンショットカバレッジ検証");
  console.log("=".repeat(60));
  console.log(`workflow: ${report.workflow}`);
  console.log(`expected TC: ${report.expectedTestCases.length}`);
  console.log(`covered TC: ${report.coveredTestCases}`);

  if (report.errors.length > 0) {
    console.log("\n❌ エラー:");
    report.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (report.warnings.length > 0) {
    console.log("\n⚠️  警告:");
    report.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (report.errors.length === 0) {
    console.log("\n✅ 検証成功: TC単位のスクリーンショット証跡に欠落はありません");
  } else {
    console.log("\n✗ 検証失敗: スクリーンショット証跡に欠落があります");
  }
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv);
  } catch (error) {
    console.error(`引数エラー: ${error.message}`);
    process.exit(2);
  }

  const report = runCoverageValidation(options);
  const success = report.errors.length === 0;

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report);
  }

  process.exit(success ? 0 : 1);
}

main();
