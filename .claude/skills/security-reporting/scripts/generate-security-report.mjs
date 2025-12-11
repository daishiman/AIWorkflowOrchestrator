#!/usr/bin/env node

/**
 * セキュリティレポート生成スクリプト
 *
 * 使用方法: node generate-security-report.mjs <findings-json>
 */

import { readFileSync, writeFileSync } from "fs";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
};

const inputFile = process.argv[2];

if (!inputFile) {
  console.error(
    `${colors.red}使用方法: node generate-security-report.mjs <findings-json>${colors.reset}`,
  );
  process.exit(1);
}

try {
  const findings = JSON.parse(readFileSync(inputFile, "utf-8"));
  const reportDate = new Date().toISOString().split("T")[0];

  const criticalCount = findings.filter(
    (f) => f.severity === "critical",
  ).length;
  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;

  const report = `# セキュリティ診断レポート

**監査日**: ${reportDate}
**総脆弱性**: ${findings.length}件

## サマリー

- Critical: ${criticalCount}件
- High: ${highCount}件
- Medium: ${mediumCount}件
- Low: ${lowCount}件

## 詳細

${findings
  .map(
    (f, i) => `
### ${i + 1}. ${f.title || f.type}

**重要度**: ${f.severity}
**ファイル**: \`${f.file}:${f.line}\`

**説明**: ${f.description || ""}

**修正推奨**:
${f.recommendation || "パラメータ化クエリまたは入力検証を実装"}
`,
  )
  .join("\n")}

---

**レポート生成日**: ${new Date().toISOString()}
`;

  const outputFile = `security-report-${reportDate}.md`;
  writeFileSync(outputFile, report);

  console.log(
    `${colors.green}✅ レポート生成完了: ${outputFile}${colors.reset}\n`,
  );
} catch (error) {
  console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
  process.exit(1);
}
