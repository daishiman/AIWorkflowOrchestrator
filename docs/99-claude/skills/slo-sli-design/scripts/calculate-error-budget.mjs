#!/usr/bin/env node
/**
 * エラーバジェット計算スクリプト
 *
 * 用途: SLOとリクエスト数からエラーバジェットを計算
 * 使用例: node calculate-error-budget.mjs --slo 99.9 --requests 10000000
 */

// コマンドライン引数のパース
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace("--", "");
  const value = args[i + 1];
  options[key] = value;
}

// バリデーション
if (!options.slo || !options.requests) {
  console.error(
    "Usage: node calculate-error-budget.mjs --slo <SLO_TARGET> --requests <TOTAL_REQUESTS>",
  );
  console.error(
    "Example: node calculate-error-budget.mjs --slo 99.9 --requests 10000000",
  );
  process.exit(1);
}

const sloTarget = parseFloat(options.slo);
const totalRequests = parseInt(options.requests, 10);
const currentErrors = options.errors ? parseInt(options.errors, 10) : 0;

// SLO検証
if (sloTarget < 0 || sloTarget > 100) {
  console.error("Error: SLO must be between 0 and 100");
  process.exit(1);
}

// エラーバジェット計算
const sloDecimal = sloTarget / 100;
const errorBudgetTotal = (1 - sloDecimal) * totalRequests;
const errorBudgetRemaining = errorBudgetTotal - currentErrors;
const consumedPercentage = (currentErrors / errorBudgetTotal) * 100;

// 結果出力
console.log("\n" + "=".repeat(60));
console.log("📊 Error Budget Calculation");
console.log("=".repeat(60));
console.log(`SLO Target: ${sloTarget}%`);
console.log(`Total Requests (30d): ${totalRequests.toLocaleString()}`);
console.log(
  `Total Error Budget: ${Math.floor(errorBudgetTotal).toLocaleString()} errors`,
);

if (currentErrors > 0) {
  console.log(`\nCurrent Errors: ${currentErrors.toLocaleString()}`);
  console.log(
    `Remaining Budget: ${Math.floor(errorBudgetRemaining).toLocaleString()} errors`,
  );
  console.log(`Consumed: ${consumedPercentage.toFixed(2)}%`);

  // ステータス判定
  let status, emoji, action;
  if (consumedPercentage < 50) {
    status = "GREEN";
    emoji = "✅";
    action = "通常開発速度を維持";
  } else if (consumedPercentage < 75) {
    status = "YELLOW";
    emoji = "⚠️";
    action = "新機能デプロイを慎重化";
  } else if (consumedPercentage < 90) {
    status = "ORANGE";
    emoji = "🚨";
    action = "新機能凍結、信頼性改善優先";
  } else {
    status = "RED";
    emoji = "🔴";
    action = "緊急対応、すべての変更凍結";
  }

  console.log(`\nStatus: ${emoji} ${status}`);
  console.log(`Action: ${action}`);

  // 予測
  if (currentErrors > 0) {
    const daysElapsed = options.days ? parseInt(options.days, 10) : 15; // デフォルト15日
    const dailyErrorRate = currentErrors / daysElapsed;
    const daysUntilDepletion = errorBudgetRemaining / dailyErrorRate;

    console.log(`\n📈 Projection:`);
    console.log(`Daily Error Rate: ${dailyErrorRate.toFixed(0)} errors/day`);
    console.log(`Days Until Depletion: ${daysUntilDepletion.toFixed(1)} days`);

    if (daysUntilDepletion < 30) {
      console.log(
        `🚨 Warning: Error budget will be depleted before end of measurement period!`,
      );
    }
  }
}

console.log("=".repeat(60));
console.log("\n💡 Recommendations:");

if (sloTarget >= 99.99) {
  console.log(
    "⚠️  SLO target >= 99.99% is very ambitious. Ensure adequate resources.",
  );
}

if (sloTarget < 99) {
  console.log("⚠️  SLO target < 99% may not meet user expectations.");
}

if (consumedPercentage > 75) {
  console.log(
    "🚨 Error budget consumption is high. Focus on reliability improvements.",
  );
}

console.log("\n");
