#!/usr/bin/env node

/**
 * リスクスコア計算スクリプト
 *
 * 使用方法:
 *   node calculate-risk-score.mjs --probability 3 --impact 4
 *   node calculate-risk-score.mjs --emv --prob-percent 40 --impact-value -50000
 */

import { parseArgs } from "node:util";

// リスクレベル定義
const RISK_LEVELS = {
  20: { level: "Critical", color: "\x1b[31m", action: "即座に対応" },
  15: { level: "High", color: "\x1b[33m", action: "優先的に対応" },
  10: { level: "Medium", color: "\x1b[93m", action: "計画的に対応" },
  6: { level: "Low", color: "\x1b[32m", action: "監視継続" },
  1: { level: "Negligible", color: "\x1b[37m", action: "記録のみ" },
};

// 確率スケール定義（5段階）
const PROBABILITY_SCALE = {
  5: { label: "ほぼ確実", range: ">90%", description: "過去に頻繁に発生" },
  4: { label: "高い", range: "70-90%", description: "過去に何度か発生" },
  3: { label: "中程度", range: "30-70%", description: "発生する可能性もある" },
  2: { label: "低い", range: "10-30%", description: "発生可能性は低い" },
  1: { label: "稀", range: "<10%", description: "ほとんど発生しない" },
};

// 影響度スケール定義（5段階）
const IMPACT_SCALE = {
  5: { label: "壊滅的", description: "プロジェクト中止" },
  4: { label: "重大", description: "3ヶ月以上の遅延、50%以上の予算超過" },
  3: { label: "中程度", description: "1-3ヶ月の遅延、20-50%の予算超過" },
  2: { label: "軽微", description: "1ヶ月以内の遅延、10-20%の予算超過" },
  1: { label: "無視可能", description: "影響なしまたは最小限" },
};

// リスクスコアを計算
function calculateRiskScore(probability, impact) {
  return probability * impact;
}

// リスクレベルを決定
function getRiskLevel(score) {
  const levels = Object.keys(RISK_LEVELS)
    .map(Number)
    .sort((a, b) => b - a);
  for (const threshold of levels) {
    if (score >= threshold) {
      return RISK_LEVELS[threshold];
    }
  }
  return RISK_LEVELS[1];
}

// EMV（期待貨幣価値）を計算
function calculateEMV(probPercent, impactValue) {
  return (probPercent / 100) * impactValue;
}

// マトリックス表示
function displayMatrix(probability, impact, score) {
  console.log("\n📊 確率・影響度マトリクス:\n");
  console.log("      影響度（Impact）");
  console.log("    1    2    3    4    5");

  for (let p = 5; p >= 1; p--) {
    let row = `${p} │`;
    for (let i = 1; i <= 5; i++) {
      const cellScore = p * i;
      const isTarget = p === probability && i === impact;
      const level = getRiskLevel(cellScore);

      if (isTarget) {
        row += `${level.color}[${cellScore.toString().padStart(2)}]\x1b[0m│`;
      } else {
        row += ` ${cellScore.toString().padStart(2)} │`;
      }
    }
    row += ` 確率 ${PROBABILITY_SCALE[p].label}`;
    console.log(row);
  }

  console.log("\n影響度スケール:");
  for (let i = 1; i <= 5; i++) {
    console.log(
      `  ${i}: ${IMPACT_SCALE[i].label} - ${IMPACT_SCALE[i].description}`,
    );
  }
}

// 結果表示
function displayResults(probability, impact, score, riskLevel) {
  console.log("\n" + "=".repeat(60));
  console.log("📋 リスク評価結果");
  console.log("=".repeat(60));

  console.log(
    `\n確率: ${probability}/5 - ${PROBABILITY_SCALE[probability].label} (${PROBABILITY_SCALE[probability].range})`,
  );
  console.log(`  ${PROBABILITY_SCALE[probability].description}`);

  console.log(`\n影響度: ${impact}/5 - ${IMPACT_SCALE[impact].label}`);
  console.log(`  ${IMPACT_SCALE[impact].description}`);

  console.log(`\n${riskLevel.color}リスクスコア: ${score}\x1b[0m`);
  console.log(`${riskLevel.color}リスクレベル: ${riskLevel.level}\x1b[0m`);
  console.log(`${riskLevel.color}推奨アクション: ${riskLevel.action}\x1b[0m`);

  displayMatrix(probability, impact, score);

  console.log("\n" + "=".repeat(60));
}

// EMV結果表示
function displayEMVResults(probPercent, impactValue, emv) {
  console.log("\n" + "=".repeat(60));
  console.log("💰 期待貨幣価値（EMV）計算結果");
  console.log("=".repeat(60));

  console.log(`\n確率: ${probPercent}%`);
  console.log(`金銭的影響: $${impactValue.toLocaleString()}`);

  const emvColor = emv >= 0 ? "\x1b[32m" : "\x1b[31m";
  console.log(`\n${emvColor}EMV: $${emv.toLocaleString()}\x1b[0m`);

  if (emv < 0) {
    console.log("\n💡 推奨:");
    console.log(
      `  - コンティンジェンシー予算: $${Math.abs(emv * 1.5).toLocaleString()}`,
    );
    console.log(`    （EMVの150%を確保）`);
  } else {
    console.log("\n✅ これは正のリスク（機会）です");
    console.log("   活用戦略を検討してください");
  }

  console.log("\n" + "=".repeat(60));
}

// メイン処理
function main() {
  const { values } = parseArgs({
    options: {
      probability: { type: "string", short: "p" },
      impact: { type: "string", short: "i" },
      emv: { type: "boolean" },
      "prob-percent": { type: "string" },
      "impact-value": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    console.log(`
使用方法:

  リスクスコア計算（定性的評価）:
    node calculate-risk-score.mjs --probability <1-5> --impact <1-5>
    node calculate-risk-score.mjs -p 3 -i 4

  EMV計算（定量的評価）:
    node calculate-risk-score.mjs --emv --prob-percent <0-100> --impact-value <金額>
    node calculate-risk-score.mjs --emv --prob-percent 40 --impact-value -50000

オプション:
  -p, --probability <1-5>      確率（1: 稀, 2: 低, 3: 中, 4: 高, 5: ほぼ確実）
  -i, --impact <1-5>           影響度（1: 無視可能, 2: 軽微, 3: 中程度, 4: 重大, 5: 壊滅的）
  --emv                        EMV計算モード
  --prob-percent <0-100>       確率（パーセント）
  --impact-value <金額>         金銭的影響（負の値の場合は'-'を付ける）
  -h, --help                   ヘルプ表示

例:
  node calculate-risk-score.mjs -p 3 -i 4
  node calculate-risk-score.mjs --emv --prob-percent 30 --impact-value -100000
`);
    process.exit(0);
  }

  if (values.emv) {
    // EMV計算モード
    if (!values["prob-percent"] || !values["impact-value"]) {
      console.error(
        "❌ エラー: EMVモードでは --prob-percent と --impact-value が必要です",
      );
      console.error("ヘルプ: node calculate-risk-score.mjs --help");
      process.exit(1);
    }

    const probPercent = parseFloat(values["prob-percent"]);
    const impactValue = parseFloat(values["impact-value"]);

    if (isNaN(probPercent) || probPercent < 0 || probPercent > 100) {
      console.error(
        "❌ エラー: --prob-percent は 0-100 の範囲で指定してください",
      );
      process.exit(1);
    }

    if (isNaN(impactValue)) {
      console.error("❌ エラー: --impact-value は数値で指定してください");
      process.exit(1);
    }

    const emv = calculateEMV(probPercent, impactValue);
    displayEMVResults(probPercent, impactValue, emv);
  } else {
    // リスクスコア計算モード
    if (!values.probability || !values.impact) {
      console.error("❌ エラー: --probability と --impact が必要です");
      console.error("ヘルプ: node calculate-risk-score.mjs --help");
      process.exit(1);
    }

    const probability = parseInt(values.probability);
    const impact = parseInt(values.impact);

    if (isNaN(probability) || probability < 1 || probability > 5) {
      console.error("❌ エラー: --probability は 1-5 の範囲で指定してください");
      process.exit(1);
    }

    if (isNaN(impact) || impact < 1 || impact > 5) {
      console.error("❌ エラー: --impact は 1-5 の範囲で指定してください");
      process.exit(1);
    }

    const score = calculateRiskScore(probability, impact);
    const riskLevel = getRiskLevel(score);

    displayResults(probability, impact, score, riskLevel);
  }
}

main();
