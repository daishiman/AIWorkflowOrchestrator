#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * このスクリプトはスキルの使用実績を記録し、自動的にレベルアップを評価します。
 * エージェントの最終Phaseで呼び出されることを想定しています。
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
Usage: node log_usage.mjs [options]

Options:
  --result <success|failure>  実行結果（必須）
  --phase <name>              実行したPhase名（任意）
  --agent <name>              実行したエージェント名（任意）
  --notes <text>              追加のフィードバックメモ（任意）
  -h, --help                  このヘルプを表示
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
  const phase = getArg("--phase") || "unknown";
  const agent = getArg("--agent") || "unknown";
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

- 実行者: ${agent}
- Phase: ${phase}
- 結果: ${result}
- フィードバック: ${notes || "なし"}

---
`;

  try {
    const logsContent = readFileSync(logsPath, "utf-8");
    const updatedLogs = logsContent.replace(
      "（ログエントリはここに追記されます）",
      `${logEntry}\n（ログエントリはここに追記されます）`,
    );
    writeFileSync(logsPath, updatedLogs, "utf-8");
    console.log(`✓ LOGS.md に記録を追記しました`);
  } catch (err) {
    console.error(`Error: LOGS.md の更新に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  // 2. EVALS.json を更新
  const evalsPath = join(SKILL_DIR, "EVALS.json");

  try {
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
        console.log(
          `🎉 レベルアップ: Level ${currentLevel} → Level ${nextLevel}`,
        );

        // 4. SKILL.md の level を更新
        const skillPath = join(SKILL_DIR, "SKILL.md");
        let skillContent = readFileSync(skillPath, "utf-8");
        skillContent = skillContent.replace(
          /^level: \d+$/m,
          `level: ${nextLevel}`,
        );
        skillContent = skillContent.replace(
          /^last_updated: .*$/m,
          `last_updated: ${timestamp.split("T")[0]}`,
        );
        writeFileSync(skillPath, skillContent, "utf-8");
        console.log(`✓ SKILL.md の level を ${nextLevel} に更新しました`);

        // 5. CHANGELOG.md に追記
        const changelogPath = join(SKILL_DIR, "CHANGELOG.md");
        const changelogContent = readFileSync(changelogPath, "utf-8");
        const newVersion = `${evalsData.current_level}.0.0`;
        const changelogEntry = `
## [${newVersion}] - ${timestamp.split("T")[0]}

### Changed
- 自動レベルアップ: Level ${currentLevel} → Level ${nextLevel}
- 使用回数: ${evalsData.metrics.total_usage_count}回
- 成功率: ${(successRate * 100).toFixed(1)}%

`;
        const updatedChangelog = changelogEntry + changelogContent;
        writeFileSync(changelogPath, updatedChangelog, "utf-8");
        console.log(`✓ CHANGELOG.md にバージョン ${newVersion} を追記しました`);
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
