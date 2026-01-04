#!/usr/bin/env node

/**
 * OKR Validation Script
 *
 * OKRドキュメントの構造と内容を検証します。
 *
 * 使用法:
 *   node scripts/validate-okr.mjs <path-to-okr.md>
 *   node scripts/validate-okr.mjs docs/okrs/Q1-2026-okrs.md
 */

import fs from "fs";
import path from "path";

// 色付きコンソール出力
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// OKRドキュメントの検証
function validateOKR(filePath) {
  log("\n=== OKR検証開始 ===", "blue");
  log(`ファイル: ${filePath}\n`, "blue");

  // ファイルの存在確認
  if (!fs.existsSync(filePath)) {
    log(`❌ エラー: ファイルが見つかりません: ${filePath}`, "red");
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  let hasError = false;
  let warningCount = 0;

  // 基本情報の確認
  log("### 基本情報", "blue");
  const basicInfoChecks = [
    { pattern: /期間\s*:.*Q[1-4]/i, message: "期間（四半期）が指定されている" },
    { pattern: /プロダクト\s*:/i, message: "プロダクト名が指定されている" },
    {
      pattern: /作成日\s*:\s*\d{4}-\d{2}-\d{2}/i,
      message: "作成日が指定されている",
    },
  ];

  basicInfoChecks.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      log(`✅ ${message}`, "green");
    } else {
      log(`⚠️  ${message}が見つかりません`, "yellow");
      warningCount++;
    }
  });

  // Objectiveの確認
  log("\n### Objectives検証", "blue");
  const objectiveMatches =
    content.match(/(?:^|\n)(?:#{1,4})\s+Objective\s*(?:\d+)?:\s*(.+)/gi) || [];

  if (objectiveMatches.length === 0) {
    log("❌ エラー: Objectiveが見つかりません", "red");
    hasError = true;
  } else {
    log(`✅ Objective数: ${objectiveMatches.length}`, "green");

    if (objectiveMatches.length < 3) {
      log("⚠️  警告: Objectiveは通常3-5個が推奨されます", "yellow");
      warningCount++;
    } else if (objectiveMatches.length > 5) {
      log("⚠️  警告: Objectiveが多すぎます（5個以下が推奨）", "yellow");
      warningCount++;
    }

    // 各Objectiveの検証
    objectiveMatches.forEach((objective, index) => {
      const objectiveText = objective
        .replace(/(?:^|\n)(?:#{1,4})\s+Objective\s*(?:\d+)?:\s*/i, "")
        .trim();
      log(`\n  Objective ${index + 1}: "${objectiveText}"`, "blue");

      // 長さチェック
      if (objectiveText.length < 10) {
        log("    ⚠️  警告: Objectiveが短すぎます（10文字以上推奨）", "yellow");
        warningCount++;
      } else if (objectiveText.length > 100) {
        log("    ⚠️  警告: Objectiveが長すぎます（100文字以下推奨）", "yellow");
        warningCount++;
      } else {
        log(`    ✅ 長さ: ${objectiveText.length}文字`, "green");
      }

      // 動詞で始まるかチェック
      const verbPattern =
        /^(達成|向上|実現|確立|構築|拡大|改善|強化|最適化|加速|削減)/;
      if (verbPattern.test(objectiveText)) {
        log("    ✅ 動詞で始まっている", "green");
      } else {
        log("    ⚠️  警告: 動詞で始まることが推奨されます", "yellow");
        warningCount++;
      }
    });
  }

  // Key Resultsの確認
  log("\n### Key Results検証", "blue");
  const krMatches = content.match(/KR\s*\d+\s*:\s*(.+)/gi) || [];

  if (krMatches.length === 0) {
    log("❌ エラー: Key Resultsが見つかりません", "red");
    hasError = true;
  } else {
    log(`✅ Key Results数: ${krMatches.length}`, "green");

    // 各Key Resultの検証
    krMatches.forEach((kr, index) => {
      const krText = kr.replace(/KR\s*\d+\s*:\s*/i, "").trim();
      log(`\n  KR ${index + 1}: "${krText}"`, "blue");

      // 数値が含まれているか
      const numberPattern = /\d+[,.\d]*(?:\s*[%万円$K])?/;
      if (numberPattern.test(krText)) {
        log("    ✅ 数値が含まれている（測定可能）", "green");
      } else {
        log("    ❌ エラー: 数値が含まれていません（測定不可能）", "red");
        hasError = true;
      }

      // 「から」「に」パターン（現在値→目標値）
      const targetPattern =
        /(\d+[,.\d]*(?:\s*[%万円$K])?)(?:から|→)(\d+[,.\d]*(?:\s*[%万円$K])?)/;
      if (targetPattern.test(krText)) {
        log("    ✅ 現在値と目標値が明記されている", "green");
      } else {
        log(
          "    ⚠️  警告: 現在値と目標値を明記することが推奨されます",
          "yellow",
        );
        warningCount++;
      }

      // タスク化していないか
      const taskPattern = /^(実装|リリース|作成|修正|追加)/;
      if (taskPattern.test(krText)) {
        log("    ❌ エラー: タスクになっています。成果指標にすべきです", "red");
        hasError = true;
      }
    });

    // Objective vs KR の比率チェック
    const avgKRPerObjective = krMatches.length / objectiveMatches.length;
    log(`\n  平均KR/Objective: ${avgKRPerObjective.toFixed(1)}`, "blue");
    if (avgKRPerObjective < 2) {
      log(
        "  ⚠️  警告: ObjectiveあたりのKRが少なすぎます（2-4個推奨）",
        "yellow",
      );
      warningCount++;
    } else if (avgKRPerObjective > 5) {
      log("  ⚠️  警告: ObjectiveあたりのKRが多すぎます（2-4個推奨）", "yellow");
      warningCount++;
    } else {
      log("  ✅ ObjectiveあたりのKR数は適切です", "green");
    }
  }

  // オーナーの確認
  log("\n### オーナー検証", "blue");
  const ownerPattern = /オーナー\s*:/i;
  if (ownerPattern.test(content)) {
    log("✅ オーナーが指定されています", "green");
  } else {
    log("⚠️  警告: オーナーの指定が推奨されます", "yellow");
    warningCount++;
  }

  // 整合性（上位OKRとの関連）の確認
  log("\n### 整合性検証", "blue");
  const alignmentPattern = /整合性|関連|貢献/i;
  if (alignmentPattern.test(content)) {
    log("✅ 上位OKRとの整合性が記載されています", "green");
  } else {
    log("⚠️  警告: 上位OKRとの整合性を記載することが推奨されます", "yellow");
    warningCount++;
  }

  // 結果サマリー
  log("\n=== 検証結果サマリー ===", "blue");
  if (hasError) {
    log("❌ エラーが検出されました。修正してください。", "red");
    process.exit(1);
  } else if (warningCount > 0) {
    log(`⚠️  ${warningCount}件の警告があります。確認してください。`, "yellow");
    log("✅ 致命的なエラーはありません。", "green");
    process.exit(0);
  } else {
    log("✅ 検証成功！OKRドキュメントは適切です。", "green");
    process.exit(0);
  }
}

// メイン
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
使用法:
  node scripts/validate-okr.mjs <path-to-okr.md>

例:
  node scripts/validate-okr.mjs docs/okrs/Q1-2026-okrs.md

説明:
  OKRドキュメントの構造と内容を検証します。

検証項目:
  - 基本情報（期間、プロダクト名、作成日）
  - Objective数（3-5個推奨）
  - Objectiveの品質（長さ、動詞で始まるか）
  - Key Results数
  - Key Resultsの品質（測定可能性、現在値/目標値）
  - タスク化していないか
  - オーナーの指定
  - 上位OKRとの整合性
`);
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  validateOKR(filePath);
}

main();
