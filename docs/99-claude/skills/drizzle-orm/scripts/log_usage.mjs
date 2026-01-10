#!/usr/bin/env node

/**
 * Drizzle ORM スキル使用ログ記録スクリプト
 *
 * 使用方法:
 *   node log_usage.mjs --result <success|failure> [--phase <phase>] [--agent <agent>] [--notes <notes>]
 *
 * 機能:
 *   - 使用履歴を LOGS.md に追記
 *   - メトリクスを EVALS.json に更新
 *   - レベル評価を実施
 */

import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_GENERAL_ERROR = 1;
const EXIT_ARGUMENT_ERROR = 2;

function showHelp() {
  console.log(`
使用方法: node log_usage.mjs --result <success|failure> [options]

必須引数:
  --result <value>  実行結果 (success または failure)

オプション引数:
  --phase <value>   実行フェーズ名
  --agent <value>   実行エージェント名
  --notes <value>   追加メモ
  -h, --help        このヘルプメッセージを表示

終了コード:
  0   成功
  1   一般的なエラー
  2   引数エラー
  `);
}

function parseArgs(args) {
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      parsed.help = true;
      return parsed;
    }

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`--${key} には値が必要です`);
      }

      parsed[key] = value;
      i++;
    }
  }

  return parsed;
}

async function updateLogs(result, phase, agent, notes) {
  const logsPath = join(SKILL_DIR, "LOGS.md");
  const content = await readFile(logsPath, "utf-8");

  const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
  const entry = `
## ${timestamp.split(" ")[0]} ${timestamp.split(" ")[1].slice(0, 5)}
- **結果**: ${result}
${phase ? `- **Phase**: ${phase}` : ""}
${agent ? `- **エージェント**: ${agent}` : ""}
${notes ? `- **ノート**: ${notes}` : ""}
`;

  const updated = content.replace(
    "<!-- ここに使用記録が追記されます -->",
    `<!-- ここに使用記録が追記されます -->\n${entry}`,
  );

  await writeFile(logsPath, updated, "utf-8");
  console.log("✓ LOGS.md を更新しました");
}

async function updateMetrics(result) {
  const evalsPath = join(SKILL_DIR, "EVALS.json");
  const content = await readFile(evalsPath, "utf-8");
  const evals = JSON.parse(content);

  // メトリクス更新
  evals.metrics.usageCount++;

  if (result === "success") {
    evals.metrics.successCount++;
  } else {
    evals.metrics.failureCount++;
  }

  evals.metrics.successRate =
    evals.metrics.successCount / evals.metrics.usageCount;

  // レベル評価
  const thresholds = evals.thresholds;
  let newLevel = 1;

  if (
    evals.metrics.usageCount >= thresholds.level4.usageCount &&
    evals.metrics.successRate >= thresholds.level4.successRate
  ) {
    newLevel = 4;
  } else if (
    evals.metrics.usageCount >= thresholds.level3.usageCount &&
    evals.metrics.successRate >= thresholds.level3.successRate
  ) {
    newLevel = 3;
  } else if (
    evals.metrics.usageCount >= thresholds.level2.usageCount &&
    evals.metrics.successRate >= thresholds.level2.successRate
  ) {
    newLevel = 2;
  }

  evals.level.current = newLevel;
  evals.level.maxAchieved = Math.max(evals.level.maxAchieved, newLevel);

  // 最終評価日時
  evals.lastEvaluation = new Date().toISOString();

  // 履歴追加
  evals.history.push({
    timestamp: new Date().toISOString(),
    result,
    level: newLevel,
  });

  await writeFile(evalsPath, JSON.stringify(evals, null, 2), "utf-8");
  console.log("✓ EVALS.json を更新しました");
  console.log(`  現在のレベル: ${newLevel}`);
  console.log(
    `  成功率: ${(evals.metrics.successRate * 100).toFixed(1)}% (${evals.metrics.successCount}/${evals.metrics.usageCount})`,
  );
}

async function main() {
  const args = process.argv.slice(2);

  try {
    const parsed = parseArgs(args);

    if (parsed.help) {
      showHelp();
      process.exit(EXIT_SUCCESS);
    }

    if (!parsed.result) {
      console.error("エラー: --result は必須です");
      showHelp();
      process.exit(EXIT_ARGUMENT_ERROR);
    }

    if (parsed.result !== "success" && parsed.result !== "failure") {
      console.error(
        "エラー: --result は success または failure である必要があります",
      );
      process.exit(EXIT_ARGUMENT_ERROR);
    }

    await updateLogs(parsed.result, parsed.phase, parsed.agent, parsed.notes);
    await updateMetrics(parsed.result);

    console.log("\n✅ 使用記録を保存しました");
    process.exit(EXIT_SUCCESS);
  } catch (error) {
    console.error("エラー:", error.message);
    process.exit(EXIT_GENERAL_ERROR);
  }
}

main();
