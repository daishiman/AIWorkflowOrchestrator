#!/usr/bin/env node
/**
 * log_usage.mjs - タスク実行フィードバック記録スクリプト
 *
 * 使用方法:
 *   node scripts/log_usage.mjs --skill <skill-name> --result <success|failure|partial> --phase <phase-number> [--notes <notes>]
 *
 * 例:
 *   node scripts/log_usage.mjs --skill tdd-principles --result partial --phase 3 --notes "テスト粒度が大きすぎた"
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 引数パース
function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value =
        args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
      result[key] = value;
      if (value !== true) i++;
    }
  }
  return result;
}

// 日付フォーマット
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// LOGS.md エントリ生成
function generateLogEntry(options) {
  const { skill, result, phase, notes, issue, proposal } = options;
  const date = formatDate(new Date());

  return `
## ${date} - タスク実行フィードバック

### コンテキスト
- スキル: ${skill}
- Phase: ${phase}
- 実行者: Claude Code (task-specification-creator)

### 結果
- ステータス: ${result}
- 記録日時: ${new Date().toISOString()}

### 発見事項
${notes ? `- **メモ**: ${notes}` : ""}
${issue ? `- **問題点**: ${issue}` : ""}
${proposal ? `- **改善提案**: ${proposal}` : ""}

### 次のアクション
${proposal ? `- [ ] ${proposal}` : "- [ ] (なし)"}

---
`;
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  // 必須引数チェック
  if (!args.skill) {
    console.error("Error: --skill is required");
    console.error(
      "Usage: node scripts/log_usage.mjs --skill <skill-name> --result <success|failure|partial> --phase <phase-number>",
    );
    process.exit(1);
  }

  if (!args.result) {
    console.error("Error: --result is required (success|failure|partial)");
    process.exit(1);
  }

  if (!args.phase) {
    console.error("Error: --phase is required");
    process.exit(1);
  }

  // スキルディレクトリのパス（プロジェクトルートからの相対パス）
  const projectRoot = process.cwd();
  const skillDir = join(projectRoot, ".claude", "skills", args.skill);

  if (!existsSync(skillDir)) {
    console.error(`Error: Skill directory not found: ${skillDir}`);
    process.exit(1);
  }

  // LOGS.md のパス
  const logsPath = join(skillDir, "LOGS.md");

  // 既存のLOGS.mdを読み込むか新規作成
  let existingContent = "";
  if (existsSync(logsPath)) {
    existingContent = readFileSync(logsPath, "utf-8");
  } else {
    existingContent = `# ${args.skill} - 使用ログ

このファイルはスキルの使用履歴とフィードバックを記録します。

---
`;
  }

  // 新しいエントリを追加
  const newEntry = generateLogEntry(args);
  const updatedContent = existingContent + newEntry;

  // ファイル書き込み
  writeFileSync(logsPath, updatedContent, "utf-8");

  console.log(`✅ Logged usage for skill: ${args.skill}`);
  console.log(`   Result: ${args.result}`);
  console.log(`   Phase: ${args.phase}`);
  console.log(`   File: ${logsPath}`);
}

main();
