#!/usr/bin/env node

/**
 * select-template.js - 仕様タイプに応じたテンプレート自動選択
 *
 * Usage:
 *   node scripts/select-template.js "IPC通信"
 *   node scripts/select-template.js --prefix interfaces
 *   node scripts/select-template.js --list
 *
 * Options:
 *   --prefix <prefix>  prefixからテンプレートを推定
 *   --list             全テンプレート一覧を表示
 *   --help             ヘルプを表示
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "assets");

// テンプレートマッピング定義
const TEMPLATE_MAPPINGS = {
  // prefix → テンプレート
  prefixMap: {
    interfaces: "interfaces-template.md",
    architecture: "architecture-template.md",
    api: "api-template.md",
    database: "database-template.md",
    "ui-ux": "ui-ux-template.md",
    security: "security-template.md",
    technology: "technology-template.md",
    "claude-code": "claude-code-template.md",
    deployment: "deployment-template.md",
    error: "error-handling-template.md",
    quality: "testing-template.md",
    workflow: "workflow-template.md",
    task: "workflow-template.md",
  },

  // キーワード → テンプレート（優先度順）
  keywordMap: [
    // IPC関連
    {
      keywords: ["IPC", "チャンネル", "Preload", "ipcMain", "ipcRenderer"],
      template: "ipc-channel-template.md",
      description: "Electron IPC通信仕様",
    },
    // React Hook関連
    {
      keywords: ["Hook", "use", "useState", "useEffect", "カスタムフック"],
      template: "react-hook-template.md",
      description: "React Hook仕様",
    },
    // サービス関連
    {
      keywords: [
        "Service",
        "サービス",
        "ビジネスロジック",
        "Repository",
        "Facade",
      ],
      template: "service-template.md",
      description: "サービス層仕様",
    },
    // エラー関連
    {
      keywords: ["エラー", "Error", "例外", "リトライ", "エラーコード"],
      template: "error-handling-template.md",
      description: "エラーハンドリング仕様",
    },
    // テスト関連
    {
      keywords: [
        "テスト",
        "Test",
        "カバレッジ",
        "Vitest",
        "MSW",
        "TDD",
        "品質",
      ],
      template: "testing-template.md",
      description: "テスト仕様",
    },
    // インターフェース関連
    {
      keywords: [
        "型",
        "Type",
        "Interface",
        "インターフェース",
        "Zod",
        "Schema",
      ],
      template: "interfaces-template.md",
      description: "インターフェース/型定義仕様",
    },
    // API関連
    {
      keywords: [
        "API",
        "エンドポイント",
        "REST",
        "HTTP",
        "レスポンス",
        "リクエスト",
      ],
      template: "api-template.md",
      description: "API設計仕様",
    },
    // アーキテクチャ関連
    {
      keywords: [
        "アーキテクチャ",
        "パターン",
        "設計",
        "レイヤー",
        "Zustand",
        "状態管理",
      ],
      template: "architecture-template.md",
      description: "アーキテクチャ仕様",
    },
    // データベース関連
    {
      keywords: [
        "データベース",
        "DB",
        "スキーマ",
        "テーブル",
        "Drizzle",
        "SQL",
        "マイグレーション",
      ],
      template: "database-template.md",
      description: "データベース仕様",
    },
    // UI/UX関連
    {
      keywords: [
        "UI",
        "UX",
        "コンポーネント",
        "デザイン",
        "画面",
        "フォーム",
        "パネル",
      ],
      template: "ui-ux-template.md",
      description: "UI/UX仕様",
    },
    // セキュリティ関連
    {
      keywords: [
        "セキュリティ",
        "認証",
        "認可",
        "XSS",
        "バリデーション",
        "権限",
      ],
      template: "security-template.md",
      description: "セキュリティ仕様",
    },
    // デプロイ関連
    {
      keywords: ["デプロイ", "CI/CD", "GitHub Actions", "Railway", "リリース"],
      template: "deployment-template.md",
      description: "デプロイ仕様",
    },
    // 技術スタック関連
    {
      keywords: [
        "技術",
        "スタック",
        "依存関係",
        "ライブラリ",
        "フレームワーク",
      ],
      template: "technology-template.md",
      description: "技術スタック仕様",
    },
    // Claude Code関連
    {
      keywords: ["Claude", "Skill", "Agent", "Command", "スキル"],
      template: "claude-code-template.md",
      description: "Claude Code仕様",
    },
    // ワークフロー関連
    {
      keywords: ["ワークフロー", "フロー", "手順", "プロセス", "Phase"],
      template: "workflow-template.md",
      description: "ワークフロー仕様",
    },
  ],
};

/**
 * 全テンプレート一覧を取得
 */
function listTemplates() {
  const templates = readdirSync(ASSETS_DIR)
    .filter((f) => f.endsWith("-template.md"))
    .sort();

  console.log("\n📋 利用可能なテンプレート一覧\n");
  console.log("| テンプレート | 用途 |");
  console.log("|-------------|------|");

  templates.forEach((t) => {
    const mapping = TEMPLATE_MAPPINGS.keywordMap.find((m) => m.template === t);
    const desc = mapping?.description || "汎用仕様";
    console.log(`| ${t} | ${desc} |`);
  });

  console.log(`\n合計: ${templates.length}種類\n`);
}

/**
 * prefixからテンプレートを推定
 */
function getTemplateByPrefix(prefix) {
  const normalized = prefix.toLowerCase().replace(/-$/, "");
  return TEMPLATE_MAPPINGS.prefixMap[normalized] || "spec-template.md";
}

/**
 * キーワードからテンプレートを推定
 */
function getTemplateByKeywords(input) {
  const inputLower = input.toLowerCase();
  const matches = [];

  for (const mapping of TEMPLATE_MAPPINGS.keywordMap) {
    const matchCount = mapping.keywords.filter((kw) =>
      inputLower.includes(kw.toLowerCase()),
    ).length;

    if (matchCount > 0) {
      matches.push({
        ...mapping,
        score: matchCount,
      });
    }
  }

  // スコア順にソート
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * テンプレートの内容をプレビュー
 */
function previewTemplate(templateName) {
  const templatePath = join(ASSETS_DIR, templateName);
  try {
    const content = readFileSync(templatePath, "utf-8");
    const lines = content.split("\n").slice(0, 30);
    console.log(`\n📄 ${templateName} プレビュー（先頭30行）:\n`);
    console.log(lines.join("\n"));
    console.log("\n...\n");
  } catch (e) {
    console.error(`テンプレート読み込みエラー: ${templateName}`);
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
select-template.js - 仕様タイプに応じたテンプレート自動選択

Usage:
  node scripts/select-template.js "IPC通信"
  node scripts/select-template.js --prefix interfaces
  node scripts/select-template.js --list

Options:
  --prefix <prefix>  prefixからテンプレートを推定
  --list             全テンプレート一覧を表示
  --preview <name>   テンプレートをプレビュー
  --help             このヘルプを表示
    `);
    return;
  }

  if (args.includes("--list")) {
    listTemplates();
    return;
  }

  const prefixIdx = args.indexOf("--prefix");
  if (prefixIdx !== -1 && args[prefixIdx + 1]) {
    const prefix = args[prefixIdx + 1];
    const template = getTemplateByPrefix(prefix);
    console.log(`\n🎯 prefix "${prefix}" に推奨されるテンプレート:`);
    console.log(`   → ${template}\n`);
    console.log(`コピーコマンド:`);
    console.log(`   cp assets/${template} references/${prefix}-xxx.md\n`);
    return;
  }

  const previewIdx = args.indexOf("--preview");
  if (previewIdx !== -1 && args[previewIdx + 1]) {
    previewTemplate(args[previewIdx + 1]);
    return;
  }

  // キーワード検索
  const input = args.join(" ");
  if (!input) {
    console.log('使用例: node scripts/select-template.js "IPC通信"');
    console.log("        node scripts/select-template.js --list");
    return;
  }

  const matches = getTemplateByKeywords(input);

  if (matches.length === 0) {
    console.log(`\n❓ "${input}" に一致するテンプレートが見つかりません。`);
    console.log("   汎用テンプレート spec-template.md を推奨します。\n");
    return;
  }

  console.log(`\n🔍 "${input}" に推奨されるテンプレート:\n`);

  matches.slice(0, 3).forEach((m, i) => {
    const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
    console.log(`${rank} ${m.template}`);
    console.log(`   説明: ${m.description}`);
    console.log(`   マッチ: ${m.keywords.slice(0, 3).join(", ")}`);
    console.log("");
  });

  const best = matches[0];
  console.log(`推奨コマンド:`);
  console.log(`   cp assets/${best.template} references/xxx.md\n`);
}

main();
