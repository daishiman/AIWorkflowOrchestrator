#!/usr/bin/env node

/**
 * 依存関係セキュリティスキャン実行スクリプト
 *
 * 使用方法: node run-dependency-scan.mjs [project-dir]
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const projectDir = process.argv[2] || ".";

console.log(
  `${colors.cyan}=== 依存関係セキュリティスキャン ===${colors.reset}\n`,
);
console.log(`対象: ${projectDir}\n`);

// package.json存在確認
const packageJsonPath = join(projectDir, "package.json");
if (!existsSync(packageJsonPath)) {
  console.error(
    `${colors.red}エラー: package.jsonが見つかりません${colors.reset}`,
  );
  process.exit(1);
}

try {
  // pnpm audit実行
  console.log(`${colors.cyan}pnpm audit実行中...${colors.reset}\n`);

  const result = execSync("pnpm audit --json", {
    cwd: projectDir,
    encoding: "utf-8",
  });

  const auditData = JSON.parse(result);
  const meta = auditData.metadata.vulnerabilities;

  console.log(`${colors.cyan}=== 結果 ===${colors.reset}\n`);
  console.log(`Critical: ${colors.red}${meta.critical || 0}${colors.reset}`);
  console.log(`High: ${colors.red}${meta.high || 0}${colors.reset}`);
  console.log(`Medium: ${colors.yellow}${meta.moderate || 0}${colors.reset}`);
  console.log(`Low: ${colors.green}${meta.low || 0}${colors.reset}`);
  console.log(`Info: ${meta.info || 0}\n`);

  const total =
    (meta.critical || 0) +
    (meta.high || 0) +
    (meta.moderate || 0) +
    (meta.low || 0);

  if (total === 0) {
    console.log(
      `${colors.green}✅ 脆弱性は検出されませんでした${colors.reset}\n`,
    );
  } else {
    console.log(`${colors.yellow}検出された脆弱性: ${total}件${colors.reset}`);
    console.log(`\n詳細: pnpm audit で確認してください\n`);

    if ((meta.critical || 0) > 0 || (meta.high || 0) > 0) {
      console.log(
        `${colors.red}⚠️  Critical/High脆弱性が存在します。即座に対応してください${colors.reset}\n`,
      );
      process.exit(1);
    }
  }
} catch (error) {
  if (error.status === 1) {
    // pnpm auditは脆弱性検出時にexit code 1を返す
    console.log(`${colors.yellow}脆弱性が検出されました${colors.reset}\n`);
  } else {
    console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}
