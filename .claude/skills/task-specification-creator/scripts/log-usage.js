#!/usr/bin/env node
/**
 * log-usage.mjs - スキル使用ログ記録スクリプト
 *
 * タスク仕様書作成スキルの実行結果をLOGS.mdに追記し、
 * EVALS.jsonのメトリクスを更新する。
 *
 * 使用方法:
 *   node scripts/log-usage.mjs --result <success|failure> --phase <phase> [options]
 *
 * オプション:
 *   --result    実行結果（success/failure）
 *   --phase     実行フェーズ
 *   --agent     実行したエージェント名
 *   --duration  実行時間（ms）
 *   --error     エラー種別（failure時）
 *   --notes     補足メモ
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(__dirname, "..");
const LOGS_PATH = resolve(SKILL_DIR, "LOGS.md");
const EVALS_PATH = resolve(SKILL_DIR, "EVALS.json");

// 引数パース
function parseArgs(args) {
  const result = {
    result: null,
    phase: "unknown",
    agent: "unknown",
    duration: 0,
    error: null,
    notes: "",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--result" && args[i + 1]) {
      result.result = args[i + 1];
      i++;
    } else if (args[i] === "--phase" && args[i + 1]) {
      result.phase = args[i + 1];
      i++;
    } else if (args[i] === "--agent" && args[i + 1]) {
      result.agent = args[i + 1];
      i++;
    } else if (args[i] === "--duration" && args[i + 1]) {
      result.duration = parseInt(args[i + 1], 10) || 0;
      i++;
    } else if (args[i] === "--error" && args[i + 1]) {
      result.error = args[i + 1];
      i++;
    } else if (args[i] === "--notes" && args[i + 1]) {
      result.notes = args[i + 1];
      i++;
    }
  }

  return result;
}

// LOGS.mdにエントリを追記
function appendLog(entry) {
  const timestamp = new Date().toISOString();
  const resultIcon = entry.result === "success" ? "✓ 成功" : "✗ 失敗";

  let logEntry = `
## [${timestamp}]

- **Agent**: ${entry.agent}
- **Phase**: ${entry.phase}
- **Result**: ${resultIcon}`;

  if (entry.duration > 0) {
    logEntry += `\n- **Duration**: ${entry.duration}ms`;
  }

  if (entry.error) {
    logEntry += `\n- **Error**: ${entry.error}`;
  }

  if (entry.notes) {
    logEntry += `\n- **Notes**: ${entry.notes}`;
  }

  logEntry += `\n\n---\n`;

  // LOGS.mdに追記
  if (existsSync(LOGS_PATH)) {
    const logs = readFileSync(LOGS_PATH, "utf-8");
    writeFileSync(LOGS_PATH, logs + logEntry, "utf-8");
  } else {
    console.error(`Error: LOGS.md not found at ${LOGS_PATH}`);
    process.exit(1);
  }
}

// EVALS.jsonを更新
function updateEvals(entry) {
  let evals;

  if (existsSync(EVALS_PATH)) {
    evals = JSON.parse(readFileSync(EVALS_PATH, "utf-8"));
  } else {
    console.error(`Error: EVALS.json not found at ${EVALS_PATH}`);
    process.exit(1);
  }

  // グローバルメトリクス更新
  evals.metrics.totalUsageCount++;
  if (entry.result === "success") {
    evals.metrics.successCount++;
  } else {
    evals.metrics.failureCount++;
  }
  evals.metrics.successRate =
    evals.metrics.totalUsageCount > 0
      ? evals.metrics.successCount / evals.metrics.totalUsageCount
      : 0;

  // 平均実行時間更新
  if (entry.duration > 0) {
    const totalDuration =
      evals.metrics.averageDuration * (evals.metrics.totalUsageCount - 1) +
      entry.duration;
    evals.metrics.averageDuration = Math.round(
      totalDuration / evals.metrics.totalUsageCount
    );
  }

  evals.metrics.lastEvaluated = new Date().toISOString();

  // フェーズ別メトリクス更新
  const agentKey = entry.agent.replace(/-/g, "-");
  if (evals.phaseMetrics[agentKey]) {
    const phaseMetric = evals.phaseMetrics[agentKey];
    phaseMetric.usageCount++;
    if (entry.result === "success") {
      phaseMetric.successRate =
        (phaseMetric.successRate * (phaseMetric.usageCount - 1) + 1) /
        phaseMetric.usageCount;
    } else {
      phaseMetric.successRate =
        (phaseMetric.successRate * (phaseMetric.usageCount - 1)) /
        phaseMetric.usageCount;
    }
    if (entry.duration > 0) {
      const totalPhaseDuration =
        phaseMetric.avgDuration * (phaseMetric.usageCount - 1) + entry.duration;
      phaseMetric.avgDuration = Math.round(
        totalPhaseDuration / phaseMetric.usageCount
      );
    }
  }

  // エラーパターン記録
  if (entry.error && entry.result === "failure") {
    const existingError = evals.patterns.commonErrors.find(
      (e) => e.type === entry.error
    );
    if (existingError) {
      existingError.count++;
      existingError.lastOccurred = new Date().toISOString();
    } else {
      evals.patterns.commonErrors.push({
        type: entry.error,
        count: 1,
        lastOccurred: new Date().toISOString(),
      });
    }
  }

  // レベルアップ判定
  checkLevelUp(evals);

  // EVALS.json書き込み
  writeFileSync(EVALS_PATH, JSON.stringify(evals, null, 2), "utf-8");
}

// レベルアップ判定
function checkLevelUp(evals) {
  const { metrics, levelCriteria, currentLevel, levelHistory } = evals;

  const nextLevel = currentLevel + 1;
  const criteria = levelCriteria[`level${nextLevel}`];

  if (criteria) {
    if (
      metrics.totalUsageCount >= criteria.usageCount &&
      metrics.successRate >= criteria.successRate
    ) {
      evals.currentLevel = nextLevel;
      evals.levelHistory.push({
        level: nextLevel,
        achievedAt: new Date().toISOString(),
      });
      console.log(`🎉 レベルアップ！ Level ${currentLevel} → Level ${nextLevel}`);
    }
  }
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.result) {
    console.error("Error: --result is required (success/failure)");
    showUsage();
    process.exit(1);
  }

  if (!["success", "failure"].includes(args.result)) {
    console.error("Error: --result must be 'success' or 'failure'");
    process.exit(1);
  }

  console.log(`\n📝 使用ログを記録中...\n`);
  console.log(`Result: ${args.result}`);
  console.log(`Phase: ${args.phase}`);
  console.log(`Agent: ${args.agent}`);
  if (args.duration) console.log(`Duration: ${args.duration}ms`);
  if (args.notes) console.log(`Notes: ${args.notes}`);
  console.log("");

  // LOGS.mdに追記
  appendLog(args);
  console.log(`✅ LOGS.md に追記しました`);

  // EVALS.json更新
  updateEvals(args);
  console.log(`✅ EVALS.json を更新しました`);

  console.log(`\n✅ ログ記録が完了しました\n`);
}

function showUsage() {
  console.error(`
Usage: node log-usage.mjs --result <success|failure> [options]

Options:
  --result    実行結果（success/failure）【必須】
  --phase     実行フェーズ
  --agent     実行したエージェント名
  --duration  実行時間（ms）
  --error     エラー種別（failure時）
  --notes     補足メモ

Examples:
  node scripts/log-usage.mjs --result success --phase "Phase 4" --agent "generate-task-specs" --notes "完了"
  node scripts/log-usage.mjs --result failure --phase "Phase 2" --error "ValidationError" --notes "スキーマ検証失敗"
`);
}

main();
