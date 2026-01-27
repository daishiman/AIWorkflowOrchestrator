#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * このスクリプトはスキルの使用実績を記録し、自動的にレベルアップを評価します。
 * 各Task完了時に呼び出されることを想定しています。
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
Usage: node log_usage.js [options]

Options:
  --result <success|failure>  実行結果（必須）
  --task <name>               実行したTask名（任意）
  --notes <text>              追加のフィードバックメモ（任意）
  -h, --help                  このヘルプを表示

Examples:
  node scripts/log_usage.js --result success --task "search-spec"
  node scripts/log_usage.js --result success --task "create-spec" --notes "新規仕様追加"
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 引数解析
  const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const result = getArg("--result");
  const task = getArg("--task") || "unknown";
  const notes = getArg("--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error(
      "Error: --result は success または failure を指定してください",
    );
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();

  // 1. LOGS.md に追記
  const logsPath = join(SKILL_DIR, "LOGS.md");
  const logEntry = `
## [実行日時: ${timestamp}]

- Task: ${task}
- 結果: ${result}
- フィードバック: ${notes || "なし"}

---
`;

  try {
    if (existsSync(logsPath)) {
      const logsContent = readFileSync(logsPath, "utf-8");
      const updatedLogs = logsContent.replace(
        "（ログエントリはここに追記されます）",
        `${logEntry}\n（ログエントリはここに追記されます）`,
      );
      writeFileSync(logsPath, updatedLogs, "utf-8");
    } else {
      writeFileSync(
        logsPath,
        `# 実行ログ\n${logEntry}\n（ログエントリはここに追記されます）`,
        "utf-8",
      );
    }
    console.log(`✓ LOGS.md に記録を追記しました`);
  } catch (err) {
    console.error(`Error: LOGS.md の更新に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  // 2. EVALS.json を更新
  const evalsPath = join(SKILL_DIR, "EVALS.json");

  try {
    if (!existsSync(evalsPath)) {
      console.log(
        "⚠ EVALS.json が見つかりません。メトリクス更新をスキップします。",
      );
      process.exit(EXIT_SUCCESS);
    }

    const evalsData = JSON.parse(readFileSync(evalsPath, "utf-8"));

    // メトリクス更新
    evalsData.metrics.total_usage_count += 1;
    if (result === "success") {
      evalsData.metrics.success_count += 1;
    } else {
      evalsData.metrics.failure_count += 1;
    }
    evalsData.metrics.last_evaluated = timestamp;

    // 成功率計算
    const successRate =
      evalsData.metrics.total_usage_count > 0
        ? evalsData.metrics.success_count / evalsData.metrics.total_usage_count
        : 0;

    console.log(
      `✓ メトリクス更新: 使用回数=${evalsData.metrics.total_usage_count}, 成功率=${(successRate * 100).toFixed(1)}%`,
    );

    // 3. レベルアップ条件チェック
    const currentLevel = evalsData.current_level;
    const nextLevel = currentLevel + 1;

    if (evalsData.levels[nextLevel]) {
      const requirements = evalsData.levels[nextLevel].requirements;
      const canLevelUp =
        evalsData.metrics.total_usage_count >= requirements.min_usage_count &&
        successRate >= requirements.min_success_rate;

      if (canLevelUp) {
        evalsData.current_level = nextLevel;
        evalsData.levels[nextLevel].unlocked = true;
        console.log(
          `🎉 レベルアップ: Level ${currentLevel} → Level ${nextLevel}`,
        );
      }
    }

    // EVALS.json を保存
    writeFileSync(evalsPath, JSON.stringify(evalsData, null, 2), "utf-8");
    console.log(`✓ EVALS.json を更新しました`);
  } catch (err) {
    console.error(`Error: EVALS.json の処理に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
