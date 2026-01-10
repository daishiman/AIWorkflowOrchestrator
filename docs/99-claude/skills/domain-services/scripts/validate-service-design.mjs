#!/usr/bin/env node

/**
 * ドメインサービス設計検証スクリプト
 *
 * ドメインサービスの設計がDDD原則に準拠しているか検証します。
 *
 * 使用例:
 *   node scripts/validate-service-design.mjs path/to/service.ts
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般的なエラー
 *   2: 引数エラー
 *   4: 検証失敗
 */

import { readFileSync, existsSync } from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
ドメインサービス設計検証スクリプト

Usage:
  node scripts/validate-service-design.mjs <service-file> [options]

Arguments:
  <service-file>    検証するサービスファイルのパス

Options:
  --verbose         詳細な検証結果を表示
  -h, --help        このヘルプを表示

検証項目:
  - ステートレス性: インスタンス変数で状態を保持していないか
  - ドメイン言語: 技術用語ではなくビジネス用語を使用しているか
  - 依存性: インフラストラクチャに直接依存していないか
  - 単一責務: 1サービス1責務になっているか

Examples:
  node scripts/validate-service-design.mjs src/domain/PricingService.ts
  node scripts/validate-service-design.mjs src/domain/TransferService.ts --verbose
  `);
}

class ValidationResult {
  constructor() {
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

  isValid() {
    return this.errors.length === 0;
  }

  print(verbose = false) {
    if (verbose) {
      console.log("\n=== 検証結果 ===\n");
      if (this.passed.length > 0) {
        console.log("✓ パスした項目:");
        this.passed.forEach((p) => console.log(`  - ${p}`));
      }
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠ 警告:");
      this.warnings.forEach((w) => console.log(`  - ${w}`));
    }

    if (this.errors.length > 0) {
      console.log("\n✗ エラー:");
      this.errors.forEach((e) => console.log(`  - ${e}`));
    }

    console.log(
      `\n結果: ${this.isValid() ? "✓ 検証成功" : "✗ 検証失敗"} (${this.passed.length}項目パス, ${this.errors.length}エラー, ${this.warnings.length}警告)`,
    );
  }
}

function validateServiceDesign(filePath, verbose = false) {
  const result = new ValidationResult();
  const content = readFileSync(filePath, "utf-8");

  // 1. ステートレス性の検証
  // privateフィールドに状態を持つパターンを検出
  const statePatterns = [
    /private\s+(?!readonly)\w+\s*[=:]/g,
    /this\.\w+\s*=\s*(?!this\.)/g,
  ];

  let hasState = false;
  for (const pattern of statePatterns) {
    if (pattern.test(content)) {
      hasState = true;
      break;
    }
  }

  if (hasState) {
    result.addWarning("状態を持つ可能性があります（private変数を確認）");
  } else {
    result.addPassed("ステートレス性: 状態を持つフィールドなし");
  }

  // 2. インフラ依存の検証
  const infraPatterns = [
    /import.*from\s+['"]@?(prisma|typeorm|sequelize|mongoose)/i,
    /import.*from\s+['"]@?(axios|fetch|http)/i,
    /import.*from\s+['"]@?(fs|path|child_process)/i,
    /import.*from\s+['"]@?(pg|mysql|sqlite)/i,
  ];

  let hasInfraDep = false;
  for (const pattern of infraPatterns) {
    if (pattern.test(content)) {
      hasInfraDep = true;
      result.addError(`インフラストラクチャへの直接依存を検出: ${pattern}`);
    }
  }

  if (!hasInfraDep) {
    result.addPassed("依存性: インフラストラクチャへの直接依存なし");
  }

  // 3. ドメイン言語の使用検証
  const techTerms = [
    /function\s+save|delete|insert|update|select/i,
    /function\s+get|set(?=[A-Z])/i,
    /function\s+fetch|post|request/i,
  ];

  let hasTechTerms = false;
  for (const pattern of techTerms) {
    if (pattern.test(content)) {
      hasTechTerms = true;
      result.addWarning("技術用語がメソッド名に含まれている可能性があります");
      break;
    }
  }

  if (!hasTechTerms) {
    result.addPassed("ドメイン言語: 技術用語の使用なし");
  }

  // 4. インターフェース実装の検証
  const hasInterface = /implements\s+I\w+/.test(content);
  if (hasInterface) {
    result.addPassed("依存性逆転: インターフェースを実装");
  } else {
    result.addWarning("インターフェースの実装が見つかりません");
  }

  // 5. クラス数の検証（単一責務）
  const classCount = (content.match(/^class\s+\w+/gm) || []).length;
  if (classCount > 1) {
    result.addWarning(`複数のクラスが定義されています (${classCount}個)`);
  } else if (classCount === 1) {
    result.addPassed("単一責務: 1ファイル1クラス");
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const verbose = args.includes("--verbose");
  const filePath = args.find((arg) => !arg.startsWith("-"));

  if (!filePath) {
    console.error("Error: サービスファイルパスが指定されていません");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  if (!existsSync(filePath)) {
    console.error(`Error: ファイルが存在しません: ${filePath}`);
    process.exit(EXIT_ERROR);
  }

  console.log(`ドメインサービスを検証中: ${filePath}`);
  const result = validateServiceDesign(filePath, verbose);
  result.print(verbose);

  process.exit(result.isValid() ? EXIT_SUCCESS : EXIT_VALIDATION_ERROR);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
