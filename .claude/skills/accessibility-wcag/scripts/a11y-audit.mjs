#!/usr/bin/env node

/**
 * アクセシビリティ監査スクリプト
 *
 * 使用方法:
 *   node a11y-audit.mjs <file.tsx>
 *
 * 監査内容:
 *   - セマンティックHTML
 *   - ARIA属性
 *   - キーボードアクセシビリティ
 *   - フォームラベル
 *   - 画像代替テキスト
 */

import fs from "fs";
import path from "path";

// チェックルール
const RULES = {
  // セマンティックHTML
  semantic: {
    name: "セマンティックHTML",
    checks: [
      {
        pattern: /<div[^>]*onClick/gi,
        message: "divにonClickがあります。buttonを使用してください",
        severity: "error",
      },
      {
        pattern: /<span[^>]*onClick/gi,
        message: "spanにonClickがあります。buttonを使用してください",
        severity: "error",
      },
      {
        pattern: /<div[^>]*role=["']button["']/gi,
        message:
          'role="button"が使用されています。ネイティブのbuttonを検討してください',
        severity: "warning",
      },
    ],
  },

  // 画像
  images: {
    name: "画像代替テキスト",
    checks: [
      {
        pattern: /<img[^>]*(?!alt=)[^>]*>/gi,
        message: "imgタグにalt属性がありません",
        severity: "error",
      },
      {
        pattern: /<img[^>]*alt=["']['"][^>]*>/gi,
        message: "alt属性が空です（装飾的画像の場合はOK）",
        severity: "info",
      },
    ],
  },

  // フォーム
  forms: {
    name: "フォームアクセシビリティ",
    checks: [
      {
        pattern: /<input[^>]*(?!id=)[^>]*>/gi,
        message: "inputにid属性がありません（labelとの関連付け用）",
        severity: "warning",
      },
      {
        pattern: /<button[^>]*(?!type=)[^>]*>/gi,
        message: 'buttonにtype属性がありません（type="button"を推奨）',
        severity: "warning",
      },
    ],
  },

  // ARIA
  aria: {
    name: "ARIA属性",
    checks: [
      {
        pattern: /aria-hidden=["']true["'][^>]*tabIndex/gi,
        message: "aria-hidden要素にtabIndexがあります（矛盾）",
        severity: "error",
      },
      {
        pattern: /role=["']dialog["'](?![^>]*aria-label)/gi,
        message: 'role="dialog"にはaria-labelまたはaria-labelledbyが必要です',
        severity: "warning",
      },
      {
        pattern: /role=["']menu["'](?![^>]*aria-label)/gi,
        message: 'role="menu"にはaria-labelが推奨されます',
        severity: "info",
      },
    ],
  },

  // キーボード
  keyboard: {
    name: "キーボードアクセシビリティ",
    checks: [
      {
        pattern: /onClick(?![^}]*onKeyDown)[^}]*}/gi,
        message: "onClickがありますがonKeyDownがありません",
        severity: "warning",
      },
      {
        pattern: /tabIndex=["']-1["'][^>]*onClick/gi,
        message: "tabIndex=-1の要素にonClickがあります（フォーカス不可）",
        severity: "error",
      },
    ],
  },

  // フォーカス
  focus: {
    name: "フォーカス管理",
    checks: [
      {
        pattern: /outline:\s*none|outline:\s*0/gi,
        message: "outlineが無効化されています（フォーカス表示を確認）",
        severity: "warning",
      },
      {
        pattern: /:focus\s*{\s*outline:\s*none/gi,
        message: "フォーカススタイルが削除されています",
        severity: "error",
      },
    ],
  },

  // カラー
  color: {
    name: "カラーとコントラスト",
    checks: [
      {
        pattern: /color:\s*red|color:\s*green/gi,
        message: "色名の直接指定は避け、十分なコントラストを確保してください",
        severity: "info",
      },
    ],
  },
};

// 良いパターンの検出
const GOOD_PATTERNS = [
  { pattern: /aria-label=/gi, name: "aria-label使用" },
  { pattern: /aria-labelledby=/gi, name: "aria-labelledby使用" },
  { pattern: /aria-describedby=/gi, name: "aria-describedby使用" },
  { pattern: /role=["']alert["']/gi, name: "アラートロール" },
  { pattern: /role=["']status["']/gi, name: "ステータスロール" },
  { pattern: /aria-live=/gi, name: "ライブリージョン" },
  { pattern: /sr-only|visually-hidden/gi, name: "スクリーンリーダー用テキスト" },
  { pattern: /<label[^>]*htmlFor=/gi, name: "labelとhtmlFor関連付け" },
  { pattern: /onKeyDown/gi, name: "キーボードイベントハンドラ" },
  { pattern: /tabIndex/gi, name: "tabIndex管理" },
  {
    pattern: /prefers-reduced-motion/gi,
    name: "動き軽減設定への対応",
  },
];

/**
 * ファイルを監査
 */
function auditFile(content) {
  const results = {
    errors: [],
    warnings: [],
    infos: [],
    goodPractices: [],
  };

  // 問題を検出
  for (const [categoryKey, category] of Object.entries(RULES)) {
    for (const check of category.checks) {
      const matches = content.match(check.pattern);
      if (matches) {
        const result = {
          category: category.name,
          message: check.message,
          count: matches.length,
        };

        switch (check.severity) {
          case "error":
            results.errors.push(result);
            break;
          case "warning":
            results.warnings.push(result);
            break;
          case "info":
            results.infos.push(result);
            break;
        }
      }
    }
  }

  // 良いパターンを検出
  for (const pattern of GOOD_PATTERNS) {
    const matches = content.match(pattern.pattern);
    if (matches) {
      results.goodPractices.push({
        name: pattern.name,
        count: matches.length,
      });
    }
  }

  return results;
}

/**
 * スコアを計算
 */
function calculateScore(results) {
  let score = 100;

  // 減点
  score -= results.errors.length * 10;
  score -= results.warnings.length * 5;
  score -= results.infos.length * 1;

  // 加点（最大20点）
  const bonusPoints = Math.min(results.goodPractices.length * 2, 20);
  score += bonusPoints;

  return Math.max(0, Math.min(100, score));
}

/**
 * 結果を表示
 */
function printResults(results, score) {
  console.log("\n♿ アクセシビリティ監査レポート");
  console.log("=".repeat(50));

  // エラー
  if (results.errors.length > 0) {
    console.log("\n❌ エラー:");
    results.errors.forEach((e) => {
      console.log(`  [${e.category}] ${e.message} (${e.count}箇所)`);
    });
  }

  // 警告
  if (results.warnings.length > 0) {
    console.log("\n⚠️  警告:");
    results.warnings.forEach((w) => {
      console.log(`  [${w.category}] ${w.message} (${w.count}箇所)`);
    });
  }

  // 情報
  if (results.infos.length > 0) {
    console.log("\nℹ️  情報:");
    results.infos.forEach((i) => {
      console.log(`  [${i.category}] ${i.message} (${i.count}箇所)`);
    });
  }

  // 良いパターン
  if (results.goodPractices.length > 0) {
    console.log("\n✅ 良いパターン:");
    results.goodPractices.forEach((g) => {
      console.log(`  ${g.name} (${g.count}箇所)`);
    });
  }

  // スコア
  console.log("\n📊 スコア:");
  let scoreIcon = "✅";
  if (score < 60) scoreIcon = "❌";
  else if (score < 80) scoreIcon = "⚠️ ";
  console.log(`  ${scoreIcon} ${score}/100`);

  // サマリー
  console.log("\n📋 サマリー:");
  console.log(`  エラー: ${results.errors.length}`);
  console.log(`  警告: ${results.warnings.length}`);
  console.log(`  情報: ${results.infos.length}`);
  console.log(`  良いパターン: ${results.goodPractices.length}`);

  // 改善提案
  if (results.errors.length > 0 || results.warnings.length > 0) {
    console.log("\n💡 改善提案:");

    if (results.errors.some((e) => e.category === "セマンティックHTML")) {
      console.log("  - divやspanの代わりにbutton、a、inputを使用してください");
    }

    if (results.warnings.some((w) => w.category === "フォームアクセシビリティ")) {
      console.log("  - フォーム要素にはラベルを関連付けてください");
    }

    if (results.warnings.some((w) => w.category === "キーボードアクセシビリティ")) {
      console.log("  - onClickにはonKeyDownも追加してください");
    }

    if (results.errors.some((e) => e.category === "フォーカス管理")) {
      console.log("  - フォーカス表示を削除せず、カスタムスタイルを適用してください");
    }
  }

  console.log("\n");
}

/**
 * ディレクトリを再帰的に処理
 */
function processDirectory(dirPath) {
  let allContent = "";

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      allContent += processDirectory(filePath);
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      allContent += fs.readFileSync(filePath, "utf-8");
    }
  });

  return allContent;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node a11y-audit.mjs <file-or-directory>");
    process.exit(1);
  }

  const targetPath = args[0];

  if (!fs.existsSync(targetPath)) {
    console.error(`エラー: パスが見つかりません: ${targetPath}`);
    process.exit(1);
  }

  let content;
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    console.log(`ディレクトリを監査中: ${targetPath}`);
    content = processDirectory(targetPath);
  } else {
    console.log(`ファイルを監査中: ${targetPath}`);
    content = fs.readFileSync(targetPath, "utf-8");
  }

  if (!content) {
    console.log("監査対象のコードが見つかりませんでした");
    process.exit(0);
  }

  const results = auditFile(content);
  const score = calculateScore(results);

  printResults(results, score);

  // 終了コード
  process.exit(results.errors.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
