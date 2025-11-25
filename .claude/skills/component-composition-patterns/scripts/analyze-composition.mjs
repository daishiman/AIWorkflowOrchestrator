#!/usr/bin/env node

/**
 * コンポーネント合成パターン分析スクリプト
 *
 * 使用方法:
 *   node analyze-composition.mjs <component-file.tsx>
 *
 * 分析内容:
 *   - 使用されているパターンの検出
 *   - Context使用の確認
 *   - Props構造の分析
 *   - 改善提案
 */

import fs from "fs";
import path from "path";

// パターン検出用の正規表現
const PATTERNS = {
  compoundComponent: {
    name: "Compound Components",
    patterns: [
      /createContext/,
      /useContext/,
      /\.Provider/,
      /\w+\.\w+\s*=/,
    ],
    description: "Context経由で状態を共有するサブコンポーネント群",
  },
  slotPattern: {
    name: "Slot Pattern",
    patterns: [
      /header\??\s*:\s*ReactNode/,
      /footer\??\s*:\s*ReactNode/,
      /render\w+\??\s*:/,
      /children.*ReactNode/,
    ],
    description: "名前付きスロットによるコンテンツ注入",
  },
  polymorphicComponent: {
    name: "Polymorphic Component",
    patterns: [
      /as\??\s*:\s*T/,
      /as\s*\|\|/,
      /ElementType/,
      /ComponentPropsWithoutRef<T>/,
    ],
    description: "as propによる要素タイプの動的変更",
  },
  renderProps: {
    name: "Render Props",
    patterns: [
      /render\s*:\s*\(/,
      /children\s*:\s*\([^)]+\)\s*=>/,
      /\{render\(/,
    ],
    description: "レンダリングロジックの外部注入",
  },
  controlledComponent: {
    name: "Controlled Component",
    patterns: [
      /value\s*:\s*\w+/,
      /onChange\s*:\s*\(/,
      /defaultValue/,
    ],
    description: "外部からの状態制御",
  },
};

// 問題検出パターン
const ISSUES = {
  propDrilling: {
    name: "Prop Drilling",
    pattern: /(\w+)=\{(\1)\}/g,
    suggestion: "Contextまたは Compound Components の使用を検討",
  },
  largeComponent: {
    name: "Large Component",
    check: (content) => content.split("\n").length > 300,
    suggestion: "コンポーネントの分割を検討",
  },
  missingTypes: {
    name: "Missing Types",
    pattern: /function\s+\w+\s*\([^)]*\)\s*{/,
    suggestion: "TypeScript型定義の追加を推奨",
  },
};

/**
 * パターン検出
 */
function detectPatterns(content) {
  const detected = [];

  for (const [key, config] of Object.entries(PATTERNS)) {
    const matches = config.patterns.filter((pattern) =>
      pattern.test(content)
    ).length;

    if (matches >= 2) {
      detected.push({
        name: config.name,
        confidence: matches / config.patterns.length,
        description: config.description,
      });
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

/**
 * 問題検出
 */
function detectIssues(content) {
  const issues = [];

  for (const [key, config] of Object.entries(ISSUES)) {
    if (config.pattern) {
      const matches = content.match(config.pattern);
      if (matches && matches.length > 3) {
        issues.push({
          name: config.name,
          count: matches.length,
          suggestion: config.suggestion,
        });
      }
    } else if (config.check && config.check(content)) {
      issues.push({
        name: config.name,
        suggestion: config.suggestion,
      });
    }
  }

  return issues;
}

/**
 * Props分析
 */
function analyzeProps(content) {
  const props = [];

  // interface定義からprops抽出
  const interfaceMatch = content.match(
    /interface\s+(\w+Props)\s*(?:extends[^{]+)?\{([^}]+)\}/gs
  );

  if (interfaceMatch) {
    for (const match of interfaceMatch) {
      const nameMatch = match.match(/interface\s+(\w+Props)/);
      const propsMatch = match.match(/\{([^}]+)\}/s);

      if (nameMatch && propsMatch) {
        const propLines = propsMatch[1]
          .split("\n")
          .filter((line) => line.includes(":"))
          .map((line) => line.trim());

        props.push({
          name: nameMatch[1],
          count: propLines.length,
          hasChildren: propLines.some((p) => p.includes("children")),
          hasCallbacks: propLines.some((p) => p.includes("on")),
        });
      }
    }
  }

  return props;
}

/**
 * 推奨パターン提案
 */
function suggestPatterns(detected, issues, props) {
  const suggestions = [];

  // Prop Drillingがある場合
  if (issues.some((i) => i.name === "Prop Drilling")) {
    suggestions.push({
      pattern: "Compound Components",
      reason: "Prop Drillingを解消するため",
    });
  }

  // 多くのスロット系propsがある場合
  const slotProps = props.filter(
    (p) => p.name.includes("Slot") || p.hasChildren
  );
  if (slotProps.length > 2) {
    suggestions.push({
      pattern: "Children Inspection Pattern",
      reason: "複数のスロットを整理するため",
    });
  }

  // コールバックが多い場合
  const callbackProps = props.filter((p) => p.hasCallbacks);
  if (callbackProps.length > 3) {
    suggestions.push({
      pattern: "Controlled/Uncontrolled Hybrid",
      reason: "柔軟な状態管理のため",
    });
  }

  return suggestions;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node analyze-composition.mjs <component-file.tsx>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath);

  console.log(`\n📦 コンポーネント分析: ${fileName}`);
  console.log("=".repeat(50));

  // パターン検出
  const patterns = detectPatterns(content);
  console.log("\n🔍 検出されたパターン:");
  if (patterns.length === 0) {
    console.log("  特定のパターンは検出されませんでした");
  } else {
    patterns.forEach((p) => {
      const confidence = Math.round(p.confidence * 100);
      console.log(`  ✅ ${p.name} (確信度: ${confidence}%)`);
      console.log(`     ${p.description}`);
    });
  }

  // 問題検出
  const issues = detectIssues(content);
  console.log("\n⚠️  潜在的な問題:");
  if (issues.length === 0) {
    console.log("  問題は検出されませんでした");
  } else {
    issues.forEach((i) => {
      console.log(`  ❌ ${i.name}${i.count ? ` (${i.count}箇所)` : ""}`);
      console.log(`     提案: ${i.suggestion}`);
    });
  }

  // Props分析
  const props = analyzeProps(content);
  console.log("\n📋 Props分析:");
  if (props.length === 0) {
    console.log("  Props interfaceが見つかりませんでした");
  } else {
    props.forEach((p) => {
      console.log(`  ${p.name}: ${p.count}個のprops`);
      if (p.hasChildren) console.log("    - children含む");
      if (p.hasCallbacks) console.log("    - コールバック含む");
    });
  }

  // 推奨パターン
  const suggestions = suggestPatterns(patterns, issues, props);
  console.log("\n💡 推奨パターン:");
  if (suggestions.length === 0) {
    console.log("  現在の実装は適切です");
  } else {
    suggestions.forEach((s) => {
      console.log(`  → ${s.pattern}`);
      console.log(`    理由: ${s.reason}`);
    });
  }

  // サマリー
  const lineCount = content.split("\n").length;
  console.log("\n📊 サマリー:");
  console.log(`  行数: ${lineCount}`);
  console.log(`  検出パターン: ${patterns.length}`);
  console.log(`  潜在的問題: ${issues.length}`);
  console.log(`  Props interface: ${props.length}`);

  console.log("\n");
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
