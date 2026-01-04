#!/usr/bin/env node

/**
 * GitHub Actions ワークフローセキュリティ検証スクリプト
 *
 * 18-skills.md §3.4 準拠
 *
 * 使用例:
 *   node validate-workflow-security.mjs .github/workflows/
 *   node validate-workflow-security.mjs .github/workflows/deploy.yml
 *
 * 終了コード:
 *   0: 成功（すべての検証をパス）
 *   1: 一般的なエラー
 *   2: 引数エラー
 *   3: ファイル不在
 *   4: 検証失敗
 */

import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { join, basename } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
GitHub Actions ワークフローセキュリティ検証スクリプト

Usage:
  node validate-workflow-security.mjs <path> [options]

Arguments:
  <path>          ワークフローファイルまたはディレクトリのパス

Options:
  --verbose       詳細な検証結果を表示
  --strict        警告もエラーとして扱う
  -h, --help      このヘルプを表示

Validation checks:
  - 平文シークレットの検出
  - permissions ブロックの存在
  - 外部アクションのバージョン固定
  - ログマスキングの使用
  - フォークPR制限の存在
  - Environment protection の使用

Examples:
  node validate-workflow-security.mjs .github/workflows/
  node validate-workflow-security.mjs .github/workflows/deploy.yml --verbose
  `);
}

class SecurityValidationResult {
  constructor(file) {
    this.file = file;
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addPassed(message) {
    this.passed.push(message);
  }

  isValid(strict = false) {
    return this.errors.length === 0 && (!strict || this.warnings.length === 0);
  }
}

function validateWorkflow(filePath) {
  const result = new SecurityValidationResult(filePath);

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // 1. 平文シークレットの検出
  const secretPatterns = [
    /password:\s*["']?[^$\s{][^"'\s]+["']?/i,
    /api_key:\s*["']?[^$\s{][^"'\s]+["']?/i,
    /token:\s*["']?[^$\s{][^"'\s]+["']?/i,
    /secret:\s*["']?[^$\s{][^"'\s]+["']?/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of secretPatterns) {
      if (pattern.test(line) && !line.includes("${{") && !line.includes("#")) {
        result.addError(`行${i + 1}: 平文シークレットの可能性: ${line.trim()}`);
      }
    }
  }

  if (result.errors.length === 0) {
    result.addPassed("平文シークレットなし");
  }

  // 2. permissions ブロックの確認
  if (content.includes("permissions:")) {
    result.addPassed("permissions ブロックが定義されている");

    // 過剰な権限のチェック
    if (content.includes("permissions: write-all")) {
      result.addError("permissions: write-all は過剰な権限です");
    }
  } else {
    result.addWarning(
      "permissions ブロックがありません（デフォルト権限が使用されます）",
    );
  }

  // 3. 外部アクションのバージョン確認
  const usesPattern = /uses:\s*([^@\s]+)@([^\s]+)/g;
  let match;
  let hasUnpinnedAction = false;

  while ((match = usesPattern.exec(content)) !== null) {
    const action = match[1];
    const version = match[2];

    // actions/ で始まる公式アクションはセマンティックバージョンでOK
    if (action.startsWith("actions/")) {
      if (!/^v\d+(\.\d+)*$/.test(version) && !/^[a-f0-9]{40}$/.test(version)) {
        result.addWarning(
          `アクション ${action}@${version} のバージョンを固定推奨`,
        );
        hasUnpinnedAction = true;
      }
    } else {
      // サードパーティアクションはSHA固定を推奨
      if (!/^[a-f0-9]{40}$/.test(version)) {
        result.addWarning(
          `サードパーティアクション ${action}@${version} はSHA固定を推奨`,
        );
        hasUnpinnedAction = true;
      }
    }
  }

  if (!hasUnpinnedAction) {
    result.addPassed("すべてのアクションが適切にバージョン固定されている");
  }

  // 4. ログマスキングの確認
  if (content.includes("::add-mask::")) {
    result.addPassed("ログマスキングが使用されている");
  } else if (content.includes("secrets.")) {
    result.addWarning(
      "シークレットを使用していますが、明示的なマスキングがありません",
    );
  }

  // 5. フォークPR制限の確認
  if (content.includes("pull_request")) {
    if (
      content.includes("github.event.pull_request.head.repo.full_name") ||
      content.includes("github.event.pull_request.head.repo.fork")
    ) {
      result.addPassed("フォークPR制限が実装されている");
    } else {
      result.addWarning(
        "pull_requestトリガーがありますが、フォークPR制限がありません",
      );
    }
  }

  // 6. Environment protection の確認
  if (content.includes("environment:")) {
    result.addPassed("Environment protection が使用されている");
  } else if (content.includes("deploy") || content.includes("production")) {
    result.addWarning(
      "デプロイ関連のジョブにEnvironment protectionがありません",
    );
  }

  // 7. pull_request_target の確認
  if (content.includes("pull_request_target")) {
    if (content.includes("actions/checkout") && content.includes("ref:")) {
      result.addWarning(
        "pull_request_target + checkout は危険な組み合わせの可能性があります",
      );
    }
  }

  return result;
}

function validatePath(targetPath, verbose = false, strict = false) {
  const results = [];

  if (statSync(targetPath).isDirectory()) {
    const files = readdirSync(targetPath).filter(
      (f) => f.endsWith(".yml") || f.endsWith(".yaml"),
    );

    for (const file of files) {
      results.push(validateWorkflow(join(targetPath, file)));
    }
  } else {
    results.push(validateWorkflow(targetPath));
  }

  return results;
}

function printResults(results, verbose = false, strict = false) {
  let hasErrors = false;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalPassed = 0;

  for (const result of results) {
    console.log(`\n=== ${basename(result.file)} ===`);

    if (verbose && result.passed.length > 0) {
      console.log("\n✓ パス:");
      result.passed.forEach((p) => console.log(`  - ${p}`));
    }

    if (result.warnings.length > 0) {
      console.log("\n⚠ 警告:");
      result.warnings.forEach((w) => console.log(`  - ${w}`));
    }

    if (result.errors.length > 0) {
      console.log("\n✗ エラー:");
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    totalPassed += result.passed.length;

    if (!result.isValid(strict)) {
      hasErrors = true;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(
    `結果: ${hasErrors ? "✗ 検証失敗" : "✓ 検証成功"} (${totalPassed}パス, ${totalErrors}エラー, ${totalWarnings}警告)`,
  );

  return hasErrors;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const verbose = args.includes("--verbose");
  const strict = args.includes("--strict");
  const targetPath = args.find((arg) => !arg.startsWith("-"));

  if (!targetPath) {
    console.error("Error: パスが指定されていません");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  if (!existsSync(targetPath)) {
    console.error(`Error: パスが存在しません: ${targetPath}`);
    process.exit(EXIT_FILE_MISSING);
  }

  console.log(`ワークフローを検証中: ${targetPath}`);
  const results = validatePath(targetPath, verbose, strict);
  const hasErrors = printResults(results, verbose, strict);

  process.exit(hasErrors ? EXIT_VALIDATION_ERROR : EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
