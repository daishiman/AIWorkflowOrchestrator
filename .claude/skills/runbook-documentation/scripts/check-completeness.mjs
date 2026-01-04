#!/usr/bin/env node

/**
 * check-completeness.mjs
 * ランブックの完全性確認スクリプト
 *
 * 用途: ディレクトリ内の全ランブックの必須セクション完全性を確認
 * 終了コード: 0=成功, 1=一般エラー, 2=引数エラー, 3=ディレクトリ不在, 4=検証失敗
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { resolve, join, extname } from "path";

// 完全性チェック項目
const COMPLETENESS_CHECKS = [
  {
    name: "メタデータ（更新日）",
    pattern: /(最終更新日|Last Updated|更新日).*(20\d{2})/i,
    required: true,
  },
  {
    name: "メタデータ（担当者）",
    pattern: /(担当者|Owner|作成者|Author)/i,
    required: true,
  },
  {
    name: "目的（1文）",
    pattern: /^##\s+目的\s*\n+[^\n#]+/m,
    required: true,
  },
  {
    name: "適用条件",
    pattern: /^##\s+適用条件/m,
    required: true,
  },
  {
    name: "前提条件（アクセス権限）",
    pattern: /(アクセス権限|権限|permission)/i,
    required: true,
  },
  {
    name: "前提条件（ツール）",
    pattern: /(必要なツール|ツール|tool)/i,
    required: false,
  },
  {
    name: "手順（番号付き）",
    pattern: /^(###?\s+)?Step\s+\d+|^1\.\s+/m,
    required: true,
  },
  {
    name: "期待される結果",
    pattern: /(期待される結果|Expected|正常時|成功時)/i,
    required: true,
  },
  {
    name: "エスカレーション",
    pattern: /^##\s+(エスカレーション|Escalation)/m,
    required: true,
  },
  {
    name: "エスカレーション（連絡先）",
    pattern: /(連絡先|Contact|@|電話|Slack|メール)/i,
    required: true,
  },
  {
    name: "ロールバック手順",
    pattern: /^##\s+(ロールバック|Rollback)/m,
    required: false,
  },
  {
    name: "コマンド例",
    pattern: /```(bash|sh|shell|zsh)/m,
    required: false,
  },
];

function showHelp() {
  console.log(`
check-completeness.mjs - ランブック完全性確認

使用法:
  node check-completeness.mjs --directory <ディレクトリパス>
  node check-completeness.mjs -d <ディレクトリパス>

オプション:
  --directory, -d    検証対象のディレクトリパス（必須）
  --summary          サマリーのみ出力（詳細省略）
  --help, -h         このヘルプを表示

終了コード:
  0  全ファイル完全
  1  一般エラー
  2  引数エラー
  3  ディレクトリ不在
  4  不完全なファイルあり

例:
  node check-completeness.mjs --directory ./runbooks
  node check-completeness.mjs -d ./runbooks --summary
`);
}

function parseArgs(args) {
  const result = {
    directory: null,
    summary: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--summary") {
      result.summary = true;
    } else if (arg === "--directory" || arg === "-d") {
      result.directory = args[++i];
    }
  }

  return result;
}

function findMarkdownFiles(dir) {
  const files = [];

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (extname(item).toLowerCase() === ".md") {
      files.push(fullPath);
    }
  }

  return files;
}

function checkCompleteness(content, filename) {
  const results = {
    filename,
    passed: [],
    failed: [],
    warnings: [],
  };

  for (const check of COMPLETENESS_CHECKS) {
    const found = check.pattern.test(content);

    if (found) {
      results.passed.push(check.name);
    } else if (check.required) {
      results.failed.push(check.name);
    } else {
      results.warnings.push(check.name);
    }
  }

  return results;
}

function calculateScore(results) {
  const totalRequired = COMPLETENESS_CHECKS.filter((c) => c.required).length;
  const passedRequired = results.passed.filter((name) =>
    COMPLETENESS_CHECKS.find((c) => c.name === name && c.required),
  ).length;

  return {
    percentage: Math.round((passedRequired / totalRequired) * 100),
    passedRequired,
    totalRequired,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.directory) {
    console.error("エラー: --directory オプションは必須です");
    showHelp();
    process.exit(2);
  }

  const dirPath = resolve(args.directory);

  if (!existsSync(dirPath)) {
    console.error(`エラー: ディレクトリが見つかりません: ${dirPath}`);
    process.exit(3);
  }

  console.log(`完全性確認開始: ${dirPath}`);
  console.log("=".repeat(60));

  const files = findMarkdownFiles(dirPath);

  if (files.length === 0) {
    console.log("警告: Markdownファイルが見つかりませんでした");
    process.exit(0);
  }

  const allResults = [];
  let hasFailures = false;

  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");
      const results = checkCompleteness(content, file);
      const score = calculateScore(results);
      allResults.push({ ...results, score });

      if (results.failed.length > 0) {
        hasFailures = true;
      }
    } catch (error) {
      console.error(`エラー: ${file} の読み込みに失敗: ${error.message}`);
      hasFailures = true;
    }
  }

  // 結果出力
  if (!args.summary) {
    for (const result of allResults) {
      console.log(`\n📄 ${result.filename.replace(dirPath, ".")}`);
      console.log(
        `   スコア: ${result.score.percentage}% (${result.score.passedRequired}/${result.score.totalRequired})`,
      );

      if (result.failed.length > 0) {
        console.log("   ❌ 不足:");
        result.failed.forEach((f) => console.log(`      - ${f}`));
      }

      if (result.warnings.length > 0) {
        console.log("   ⚠️ 推奨:");
        result.warnings.forEach((w) => console.log(`      - ${w}`));
      }
    }
  }

  // サマリー
  console.log("\n" + "=".repeat(60));
  console.log("📊 サマリー");
  console.log(`   総ファイル数: ${files.length}`);
  console.log(
    `   完全: ${allResults.filter((r) => r.failed.length === 0).length}`,
  );
  console.log(
    `   不完全: ${allResults.filter((r) => r.failed.length > 0).length}`,
  );

  const avgScore = Math.round(
    allResults.reduce((sum, r) => sum + r.score.percentage, 0) /
      allResults.length,
  );
  console.log(`   平均スコア: ${avgScore}%`);

  if (hasFailures) {
    console.log("\n❌ 完全性確認失敗: 不完全なランブックがあります");
    process.exit(4);
  } else {
    console.log("\n✅ 完全性確認成功: 全ランブックが完全です");
    process.exit(0);
  }
}

main();
