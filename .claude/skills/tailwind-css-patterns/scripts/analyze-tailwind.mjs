#!/usr/bin/env node

/**
 * Tailwind CSS 使用状況分析スクリプト
 *
 * 使用方法:
 *   node analyze-tailwind.mjs <file-or-directory>
 *
 * 分析内容:
 *   - 使用されているユーティリティクラス
 *   - レスポンシブプレフィックスの使用状況
 *   - ダークモードクラスの検出
 *   - 潜在的な問題の検出
 */

import fs from "fs";
import path from "path";

// ブレークポイントプレフィックス
const BREAKPOINTS = ["sm", "md", "lg", "xl", "2xl"];

// 状態プレフィックス
const STATE_VARIANTS = [
  "hover",
  "focus",
  "active",
  "disabled",
  "group-hover",
  "peer-focus",
  "first",
  "last",
  "odd",
  "even",
];

// カテゴリパターン
const UTILITY_CATEGORIES = {
  layout: /^(flex|grid|block|inline|hidden|container)/,
  spacing: /^(p[xytblr]?-|m[xytblr]?-|space-|gap-)/,
  sizing: /^(w-|h-|min-|max-)/,
  typography: /^(text-|font-|leading-|tracking-|truncate|line-clamp)/,
  colors: /^(bg-|text-|border-|ring-|from-|to-|via-)/,
  borders: /^(border|rounded|divide)/,
  effects: /^(shadow|opacity|blur|brightness|contrast)/,
  transitions: /^(transition|duration|ease|delay|animate)/,
  transforms: /^(scale|rotate|translate|skew|origin)/,
  interactivity: /^(cursor|pointer-events|select|touch)/,
};

/**
 * ファイルからTailwindクラスを抽出
 */
function extractClasses(content) {
  const classes = new Set();

  // className="..." または className={`...`} パターン
  const patterns = [
    /className=["']([^"']+)["']/g,
    /className={`([^`]+)`}/g,
    /class=["']([^"']+)["']/g,
    /cn\(([^)]+)\)/g,
    /clsx\(([^)]+)\)/g,
    /twMerge\(([^)]+)\)/g,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const classString = match[1];
      // 空白で分割してクラスを抽出
      classString.split(/\s+/).forEach((cls) => {
        // 引用符や変数を除外
        const cleaned = cls.replace(/['"`${}]/g, "").trim();
        if (cleaned && !cleaned.includes("(")) {
          classes.add(cleaned);
        }
      });
    }
  });

  return Array.from(classes);
}

/**
 * クラスを分析
 */
function analyzeClasses(classes) {
  const analysis = {
    total: classes.length,
    responsive: { total: 0, byBreakpoint: {} },
    darkMode: { total: 0, classes: [] },
    states: { total: 0, byState: {} },
    categories: {},
    arbitrary: [],
    potential_issues: [],
  };

  // ブレークポイント初期化
  BREAKPOINTS.forEach((bp) => {
    analysis.responsive.byBreakpoint[bp] = 0;
  });

  // 状態初期化
  STATE_VARIANTS.forEach((state) => {
    analysis.states.byState[state] = 0;
  });

  // カテゴリ初期化
  Object.keys(UTILITY_CATEGORIES).forEach((cat) => {
    analysis.categories[cat] = 0;
  });

  classes.forEach((cls) => {
    // レスポンシブ
    BREAKPOINTS.forEach((bp) => {
      if (cls.startsWith(`${bp}:`)) {
        analysis.responsive.total++;
        analysis.responsive.byBreakpoint[bp]++;
      }
    });

    // ダークモード
    if (cls.startsWith("dark:")) {
      analysis.darkMode.total++;
      analysis.darkMode.classes.push(cls);
    }

    // 状態
    STATE_VARIANTS.forEach((state) => {
      if (cls.startsWith(`${state}:`)) {
        analysis.states.total++;
        analysis.states.byState[state]++;
      }
    });

    // カテゴリ
    const baseClass = cls.split(":").pop();
    Object.entries(UTILITY_CATEGORIES).forEach(([category, pattern]) => {
      if (pattern.test(baseClass)) {
        analysis.categories[category]++;
      }
    });

    // 任意値
    if (cls.includes("[") && cls.includes("]")) {
      analysis.arbitrary.push(cls);
    }
  });

  return analysis;
}

/**
 * 問題を検出
 */
function detectIssues(classes, analysis) {
  const issues = [];

  // 重複する可能性のあるクラス
  const spacingClasses = classes.filter((c) => /^(p|m)[xytblr]?-\d/.test(c));
  if (spacingClasses.length > 10) {
    issues.push({
      type: "warning",
      message: `多数のスペーシングクラス (${spacingClasses.length}個) が検出されました`,
      suggestion: "CSS変数やデザイントークンの使用を検討してください",
    });
  }

  // 任意値の過度な使用
  if (analysis.arbitrary.length > 5) {
    issues.push({
      type: "info",
      message: `任意値の使用が多い (${analysis.arbitrary.length}個)`,
      suggestion:
        "tailwind.config.jsでカスタム値を定義することを検討してください",
    });
  }

  // レスポンシブなしの大きなコンポーネント
  if (analysis.total > 20 && analysis.responsive.total === 0) {
    issues.push({
      type: "info",
      message: "多数のクラスがありますが、レスポンシブ対応がありません",
      suggestion: "モバイルファーストのレスポンシブデザインを検討してください",
    });
  }

  // ダークモードの一貫性
  const colorClasses = classes.filter((c) => /^(bg-|text-)/.test(c));
  const darkColorClasses = classes.filter((c) => /^dark:(bg-|text-)/.test(c));
  if (colorClasses.length > 5 && darkColorClasses.length === 0) {
    issues.push({
      type: "info",
      message: "カラークラスがありますが、ダークモード対応がありません",
      suggestion: "ダークモードのスタイルを追加することを検討してください",
    });
  }

  return issues;
}

/**
 * ディレクトリを再帰的に処理
 */
function processDirectory(dirPath) {
  let allClasses = [];

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      allClasses = allClasses.concat(processDirectory(filePath));
    } else if (/\.(tsx?|jsx?|vue|svelte)$/.test(file)) {
      const content = fs.readFileSync(filePath, "utf-8");
      allClasses = allClasses.concat(extractClasses(content));
    }
  });

  return allClasses;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node analyze-tailwind.mjs <file-or-directory>");
    process.exit(1);
  }

  const targetPath = args[0];

  if (!fs.existsSync(targetPath)) {
    console.error(`エラー: パスが見つかりません: ${targetPath}`);
    process.exit(1);
  }

  console.log(`\n🎨 Tailwind CSS 分析: ${targetPath}`);
  console.log("=".repeat(50));

  let classes;
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    classes = processDirectory(targetPath);
    // 重複を除去
    classes = [...new Set(classes)];
  } else {
    const content = fs.readFileSync(targetPath, "utf-8");
    classes = extractClasses(content);
  }

  if (classes.length === 0) {
    console.log("\n⚠️  Tailwindクラスが見つかりませんでした");
    process.exit(0);
  }

  const analysis = analyzeClasses(classes);
  const issues = detectIssues(classes, analysis);

  // 結果出力
  console.log(`\n📊 サマリー:`);
  console.log(`  総クラス数: ${analysis.total}`);

  console.log(`\n📱 レスポンシブ: ${analysis.responsive.total}クラス`);
  Object.entries(analysis.responsive.byBreakpoint).forEach(([bp, count]) => {
    if (count > 0) {
      const bar = "█".repeat(Math.ceil(count / 2));
      console.log(`  ${bp.padEnd(4)}: ${count.toString().padStart(3)} ${bar}`);
    }
  });

  console.log(`\n🌙 ダークモード: ${analysis.darkMode.total}クラス`);
  if (analysis.darkMode.total > 0 && analysis.darkMode.total <= 10) {
    analysis.darkMode.classes.forEach((cls) => console.log(`  - ${cls}`));
  }

  console.log(`\n🎯 状態バリアント: ${analysis.states.total}クラス`);
  Object.entries(analysis.states.byState).forEach(([state, count]) => {
    if (count > 0) {
      console.log(`  ${state}: ${count}`);
    }
  });

  console.log(`\n📦 カテゴリ別:`);
  Object.entries(analysis.categories)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const bar = "█".repeat(Math.ceil(count / 3));
      console.log(
        `  ${category.padEnd(15)}: ${count.toString().padStart(3)} ${bar}`,
      );
    });

  if (analysis.arbitrary.length > 0) {
    console.log(`\n🔧 任意値: ${analysis.arbitrary.length}クラス`);
    analysis.arbitrary.slice(0, 5).forEach((cls) => console.log(`  - ${cls}`));
    if (analysis.arbitrary.length > 5) {
      console.log(`  ... 他${analysis.arbitrary.length - 5}件`);
    }
  }

  if (issues.length > 0) {
    console.log("\n⚠️  検出された問題:");
    issues.forEach((issue) => {
      const icon = issue.type === "warning" ? "⚠️ " : "ℹ️ ";
      console.log(`  ${icon} ${issue.message}`);
      console.log(`     → ${issue.suggestion}`);
    });
  }

  // 最も使用されているクラストップ10
  const classCount = {};
  classes.forEach((cls) => {
    classCount[cls] = (classCount[cls] || 0) + 1;
  });
  const topClasses = Object.entries(classCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log("\n🔝 最も使用されているクラス:");
  topClasses.forEach(([cls, count], i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${cls} (${count})`);
  });

  console.log("\n");
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
