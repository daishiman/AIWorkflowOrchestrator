#!/usr/bin/env node

/**
 * validate-runbook.mjs
 * ランブックの構造検証スクリプト
 *
 * 用途: ランブックMarkdownファイルの構造的な正しさを検証
 * 終了コード: 0=成功, 1=一般エラー, 2=引数エラー, 3=ファイル不在, 4=検証失敗
 */

import { readFileSync, existsSync } from "fs";
import { resolve, basename } from "path";

// 必須セクション定義
const REQUIRED_SECTIONS = [
  { pattern: /^#\s+.+/m, name: "タイトル", required: true },
  { pattern: /^##\s+目的/m, name: "目的", required: true },
  { pattern: /^##\s+適用条件/m, name: "適用条件", required: true },
  { pattern: /^##\s+前提条件/m, name: "前提条件", required: true },
  { pattern: /^##\s+手順/m, name: "手順", required: true },
  {
    pattern: /^##\s+(エスカレーション|Escalation)/m,
    name: "エスカレーション",
    required: true,
  },
  {
    pattern: /^##\s+(ロールバック|Rollback)/m,
    name: "ロールバック手順",
    required: false,
  },
  {
    pattern: /^##\s+(トラブルシューティング|Troubleshooting)/m,
    name: "トラブルシューティング",
    required: false,
  },
];

// 禁止表現パターン
const PROHIBITED_PATTERNS = [
  { pattern: /適切に/g, name: "「適切に」" },
  { pattern: /必要に応じて/g, name: "「必要に応じて」" },
  { pattern: /しばらく待/g, name: "「しばらく待つ」" },
  { pattern: /適宜/g, name: "「適宜」" },
  { pattern: /○○さんに聞/g, name: "属人化表現" },
];

function showHelp() {
  console.log(`
validate-runbook.mjs - ランブック構造検証

使用法:
  node validate-runbook.mjs --file <ファイルパス>
  node validate-runbook.mjs -f <ファイルパス>

オプション:
  --file, -f    検証対象のMarkdownファイルパス（必須）
  --strict      厳格モード：推奨項目も必須として検証
  --help, -h    このヘルプを表示

終了コード:
  0  検証成功
  1  一般エラー
  2  引数エラー
  3  ファイル不在
  4  検証失敗

例:
  node validate-runbook.mjs --file ./runbooks/database-failover.md
  node validate-runbook.mjs -f ./runbooks/*.md --strict
`);
}

function parseArgs(args) {
  const result = {
    file: null,
    strict: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--strict") {
      result.strict = true;
    } else if (arg === "--file" || arg === "-f") {
      result.file = args[++i];
    }
  }

  return result;
}

function validateMarkdownStructure(content, filename) {
  const errors = [];
  const warnings = [];

  // 必須セクションの確認
  for (const section of REQUIRED_SECTIONS) {
    const found = section.pattern.test(content);

    if (!found && section.required) {
      errors.push(`必須セクション「${section.name}」が見つかりません`);
    } else if (!found && !section.required) {
      warnings.push(`推奨セクション「${section.name}」が見つかりません`);
    }
  }

  // 禁止表現のチェック
  for (const prohibited of PROHIBITED_PATTERNS) {
    const matches = content.match(prohibited.pattern);
    if (matches) {
      warnings.push(
        `曖昧な表現${prohibited.name}が ${matches.length} 箇所見つかりました`,
      );
    }
  }

  // コードブロックの整合性チェック
  const codeBlockStarts = (content.match(/```/g) || []).length;
  if (codeBlockStarts % 2 !== 0) {
    errors.push("コードブロック（```）の開始と終了が一致しません");
  }

  // 手順番号の連続性チェック
  const stepMatches = content.match(/^###\s+Step\s+(\d+)/gm);
  if (stepMatches) {
    const numbers = stepMatches.map((m) => parseInt(m.match(/\d+/)[0]));
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] !== numbers[i - 1] + 1) {
        warnings.push(
          `手順番号が連続していません: Step ${numbers[i - 1]} → Step ${numbers[i]}`,
        );
      }
    }
  }

  // リンクの形式チェック
  const brokenLinkPattern = /\[([^\]]*)\]\(\s*\)/g;
  const brokenLinks = content.match(brokenLinkPattern);
  if (brokenLinks) {
    errors.push(`空のリンクが ${brokenLinks.length} 箇所見つかりました`);
  }

  return { errors, warnings };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.file) {
    console.error("エラー: --file オプションは必須です");
    showHelp();
    process.exit(2);
  }

  const filePath = resolve(args.file);

  if (!existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(3);
  }

  console.log(`検証開始: ${basename(filePath)}`);
  console.log("=".repeat(50));

  try {
    const content = readFileSync(filePath, "utf-8");
    const { errors, warnings } = validateMarkdownStructure(content, filePath);

    // 結果出力
    if (errors.length > 0) {
      console.log("\n❌ エラー:");
      errors.forEach((e) => console.log(`  - ${e}`));
    }

    if (warnings.length > 0) {
      console.log("\n⚠️ 警告:");
      warnings.forEach((w) => console.log(`  - ${w}`));
    }

    // 総合判定
    console.log("\n" + "=".repeat(50));

    if (errors.length === 0 && (warnings.length === 0 || !args.strict)) {
      console.log("✅ 検証成功: ランブックは構造要件を満たしています");
      process.exit(0);
    } else if (errors.length === 0 && args.strict && warnings.length > 0) {
      console.log("❌ 検証失敗（厳格モード）: 警告項目を修正してください");
      process.exit(4);
    } else {
      console.log("❌ 検証失敗: エラーを修正してください");
      process.exit(4);
    }
  } catch (error) {
    console.error(`エラー: ファイル読み込みに失敗しました: ${error.message}`);
    process.exit(1);
  }
}

main();
