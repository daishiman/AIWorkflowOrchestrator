#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 使用実績を記録し、EVALS.json のメトリクスを更新します。
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const SKILL_NAME = "command-basic-patterns";

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

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function ensureLogsFile() {
  const logsPath = join(SKILL_DIR, "LOGS.md");
  if (!existsSync(logsPath)) {
    const header = `# スキル利用ログ

このファイルにはスキルの使用記録が追記されます。

---
`;
    writeFileSync(logsPath, header, "utf-8");
  }
  return logsPath;
}

function ensureChangelogFile() {
  const changelogPath = join(SKILL_DIR, "CHANGELOG.md");
  if (!existsSync(changelogPath)) {
    const header = `# 変更履歴

このファイルにはスキルの主な変更が記録されます。

`;
    writeFileSync(changelogPath, header, "utf-8");
  }
  return changelogPath;
}

function ensureEvalsFile() {
  const evalsPath = join(SKILL_DIR, "EVALS.json");
  if (!existsSync(evalsPath)) {
    const initialEvals = {
      skill_name: SKILL_NAME,
      current_level: 1,
      levels: {
        1: {
          name: "Beginner",
          requirements: {
            min_usage_count: 0,
            min_success_rate: 0,
          },
        },
        2: {
          name: "Intermediate",
          requirements: {
            min_usage_count: 5,
            min_success_rate: 0.6,
          },
        },
        3: {
          name: "Advanced",
          requirements: {
            min_usage_count: 15,
            min_success_rate: 0.75,
          },
        },
        4: {
          name: "Expert",
          requirements: {
            min_usage_count: 30,
            min_success_rate: 0.85,
          },
        },
      },
      metrics: {
        total_usage_count: 0,
        success_count: 0,
        failure_count: 0,
        average_satisfaction: 0,
        last_evaluated: null,
      },
    };
    writeFileSync(evalsPath, JSON.stringify(initialEvals, null, 2), "utf-8");
  }
  return evalsPath;
}

function appendChangelog(changelogPath, entry) {
  appendFileSync(changelogPath, entry, "utf-8");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const result = getArg(args, "--result");
  const phase = getArg(args, "--phase") || "unknown";
  const agent = getArg(args, "--agent") || "unknown";
  const notes = getArg(args, "--notes") || "";

  if (!result || !["success", "failure"].includes(result)) {
    console.error(
      "Error: --result は success または failure を指定してください",
    );
    process.exit(EXIT_ARGS_ERROR);
  }

  const timestamp = new Date().toISOString();

  try {
    const logsPath = ensureLogsFile();
    const logEntry = `\n## [${timestamp}]\n\n- **Agent**: ${agent}\n- **Phase**: ${phase}\n- **Result**: ${result}\n- **Notes**: ${notes || "なし"}\n\n---\n`;
    appendFileSync(logsPath, logEntry, "utf-8");
  } catch (err) {
    console.error(`Error: LOGS.md の更新に失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  try {
    const evalsPath = ensureEvalsFile();
    const changelogPath = ensureChangelogFile();
    const evalsData = JSON.parse(readFileSync(evalsPath, "utf-8"));

    evalsData.metrics.total_usage_count += 1;
    if (result === "success") {
      evalsData.metrics.success_count += 1;
    } else {
      evalsData.metrics.failure_count += 1;
    }
    evalsData.metrics.last_evaluated = timestamp;

    const successRate =
      evalsData.metrics.total_usage_count > 0
        ? evalsData.metrics.success_count / evalsData.metrics.total_usage_count
        : 0;

    const currentLevel = evalsData.current_level;
    const nextLevel = currentLevel + 1;

    if (evalsData.levels[nextLevel]) {
      const requirements = evalsData.levels[nextLevel].requirements;
      const canLevelUp =
        evalsData.metrics.total_usage_count >= requirements.min_usage_count &&
        successRate >= requirements.min_success_rate;

      if (canLevelUp) {
        evalsData.current_level = nextLevel;
        const version = `${nextLevel}.0.0`;
        const entry = `\n## [${version}] - ${timestamp.split("T")[0]}\n\n### Changed\n- Level up: ${currentLevel} -> ${nextLevel}\n- Usage count: ${evalsData.metrics.total_usage_count}\n- Success rate: ${(successRate * 100).toFixed(1)}%\n`;
        appendChangelog(changelogPath, entry);
      }
    }

    writeFileSync(evalsPath, JSON.stringify(evalsData, null, 2), "utf-8");
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
