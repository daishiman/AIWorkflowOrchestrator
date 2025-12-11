#!/usr/bin/env node

/**
 * カスタムフック抽出候補分析スクリプト
 *
 * 使用法:
 *   node analyze-hook-candidates.mjs <file.tsx>
 *   node analyze-hook-candidates.mjs <directory>
 *
 * 分析内容:
 *   - 抽出候補となるロジックの検出
 *   - 複雑性の評価
 *   - 再利用可能性の評価
 */

import fs from "fs";
import path from "path";

const patterns = {
  // 状態定義
  useState: /const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState/g,
  useReducer: /const\s+\[(\w+),\s*(\w+)\]\s*=\s*useReducer/g,

  // 副作用
  useEffect: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{/g,
  useLayoutEffect: /useLayoutEffect\s*\(\s*\(\s*\)\s*=>\s*\{/g,

  // その他のフック
  useCallback: /useCallback\s*\(/g,
  useMemo: /useMemo\s*\(/g,
  useRef: /useRef\s*\(/g,
  useContext: /useContext\s*\(/g,

  // カスタムフック使用
  customHook: /use[A-Z]\w+\s*\(/g,

  // コンポーネント定義
  functionComponent: /(?:export\s+)?function\s+([A-Z]\w+)\s*\(/g,
  arrowComponent:
    /(?:export\s+)?const\s+([A-Z]\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>/g,

  // フェッチパターン
  fetch: /fetch\s*\(/g,
  axios: /axios\.\w+\s*\(/g,

  // イベントリスナー
  addEventListener: /addEventListener\s*\(/g,
  removeEventListener: /removeEventListener\s*\(/g,

  // タイマー
  setTimeout: /setTimeout\s*\(/g,
  setInterval: /setInterval\s*\(/g,
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const results = {
    file: filePath,
    components: [],
    hookUsage: {
      useState: 0,
      useReducer: 0,
      useEffect: 0,
      useCallback: 0,
      useMemo: 0,
      useRef: 0,
      useContext: 0,
      customHooks: 0,
    },
    candidates: [],
    suggestions: [],
    complexity: {
      score: 0,
      factors: [],
    },
  };

  // コンポーネント検出
  const funcMatches = [...content.matchAll(patterns.functionComponent)];
  const arrowMatches = [...content.matchAll(patterns.arrowComponent)];
  results.components = [
    ...funcMatches.map((m) => m[1]),
    ...arrowMatches.map((m) => m[1]),
  ];

  // フック使用カウント
  results.hookUsage.useState = (content.match(patterns.useState) || []).length;
  results.hookUsage.useReducer = (
    content.match(patterns.useReducer) || []
  ).length;
  results.hookUsage.useEffect = (
    content.match(patterns.useEffect) || []
  ).length;
  results.hookUsage.useCallback = (
    content.match(patterns.useCallback) || []
  ).length;
  results.hookUsage.useMemo = (content.match(patterns.useMemo) || []).length;
  results.hookUsage.useRef = (content.match(patterns.useRef) || []).length;
  results.hookUsage.useContext = (
    content.match(patterns.useContext) || []
  ).length;
  results.hookUsage.customHooks = (
    content.match(patterns.customHook) || []
  ).length;

  // 抽出候補の検出
  detectCandidates(results, content);

  // 複雑性評価
  evaluateComplexity(results, content);

  return results;
}

function detectCandidates(results, content) {
  // 複数のuseStateが関連している場合
  const useStateMatches = [...content.matchAll(patterns.useState)];
  if (useStateMatches.length >= 3) {
    results.candidates.push({
      type: "state-group",
      description: `${useStateMatches.length}個のuseStateが検出されました`,
      suggestion:
        "useReducerへの統合、またはカスタムフックへの抽出を検討してください",
      priority: "medium",
    });
  }

  // useEffectとuseStateの組み合わせ（データフェッチパターン）
  const hasDataFetchPattern =
    (content.match(patterns.fetch) || content.match(patterns.axios)) &&
    results.hookUsage.useEffect > 0 &&
    results.hookUsage.useState >= 2;

  if (hasDataFetchPattern) {
    results.candidates.push({
      type: "data-fetch",
      description: "データフェッチパターンが検出されました",
      suggestion: "useFetch、SWR、またはReact Queryへの移行を検討してください",
      priority: "high",
    });
  }

  // イベントリスナーパターン
  const hasEventListeners =
    (content.match(patterns.addEventListener) || []).length > 0 ||
    (content.match(patterns.removeEventListener) || []).length > 0;

  if (hasEventListeners) {
    results.candidates.push({
      type: "event-listener",
      description: "イベントリスナーの使用が検出されました",
      suggestion: "useEventListenerカスタムフックへの抽出を検討してください",
      priority: "medium",
    });
  }

  // タイマーパターン
  const hasTimers =
    (content.match(patterns.setTimeout) || []).length > 0 ||
    (content.match(patterns.setInterval) || []).length > 0;

  if (hasTimers && results.hookUsage.useEffect > 0) {
    results.candidates.push({
      type: "timer",
      description: "タイマーの使用が検出されました",
      suggestion:
        "useTimeout/useIntervalカスタムフックへの抽出を検討してください",
      priority: "medium",
    });
  }

  // フォームパターン（onChange、onSubmitの多用）
  const formPatterns =
    (content.match(/onChange\s*=/g) || []).length +
    (content.match(/onSubmit\s*=/g) || []).length;
  if (formPatterns >= 3) {
    results.candidates.push({
      type: "form",
      description: "フォームパターンが検出されました",
      suggestion:
        "useFormカスタムフック、またはreact-hook-formの使用を検討してください",
      priority: "high",
    });
  }

  // 同一コンポーネント内の複数useEffect
  if (results.hookUsage.useEffect >= 3) {
    results.candidates.push({
      type: "multiple-effects",
      description: `${results.hookUsage.useEffect}個のuseEffectが検出されました`,
      suggestion:
        "各副作用を独立したカスタムフックに分離することを検討してください",
      priority: "medium",
    });
  }

  // ローカルストレージパターン
  if (content.includes("localStorage") || content.includes("sessionStorage")) {
    results.candidates.push({
      type: "storage",
      description: "ストレージAPIの使用が検出されました",
      suggestion:
        "useLocalStorage/useSessionStorageカスタムフックへの抽出を検討してください",
      priority: "low",
    });
  }
}

function evaluateComplexity(results, content) {
  let score = 0;
  const factors = [];

  // フック数による複雑性
  const totalHooks = Object.values(results.hookUsage).reduce(
    (a, b) => a + b,
    0,
  );
  if (totalHooks > 10) {
    score += 3;
    factors.push(`高いフック使用数 (${totalHooks})`);
  } else if (totalHooks > 5) {
    score += 1;
    factors.push(`中程度のフック使用数 (${totalHooks})`);
  }

  // useEffectの数
  if (results.hookUsage.useEffect > 3) {
    score += 2;
    factors.push(`複数のuseEffect (${results.hookUsage.useEffect})`);
  }

  // ネストの深さ（簡易チェック）
  const maxIndent = content
    .split("\n")
    .map((line) => line.match(/^(\s*)/)?.[1]?.length || 0)
    .reduce((max, curr) => Math.max(max, curr), 0);

  if (maxIndent > 16) {
    score += 2;
    factors.push(`深いネスト (インデント: ${maxIndent})`);
  }

  // 行数
  const lineCount = content.split("\n").length;
  if (lineCount > 200) {
    score += 2;
    factors.push(`大きなファイル (${lineCount}行)`);
  } else if (lineCount > 100) {
    score += 1;
    factors.push(`中規模ファイル (${lineCount}行)`);
  }

  // 抽出候補の数
  if (results.candidates.length >= 3) {
    score += 2;
    factors.push(`多数の抽出候補 (${results.candidates.length})`);
  }

  results.complexity = { score, factors };

  // 複雑性に基づく提案
  if (score >= 5) {
    results.suggestions.push(
      "⚠️ 高い複雑性: カスタムフックへの積極的な分割を推奨します",
    );
  } else if (score >= 3) {
    results.suggestions.push(
      "📝 中程度の複雑性: ロジックの分離を検討してください",
    );
  }
}

function formatResults(results) {
  const output = [];

  output.push(`\n📁 ${results.file}`);
  output.push("═".repeat(60));

  // コンポーネント
  if (results.components.length > 0) {
    output.push("\n🧩 コンポーネント:");
    output.push(`  ${results.components.join(", ")}`);
  }

  // フック使用状況
  output.push("\n🪝 フック使用状況:");
  Object.entries(results.hookUsage)
    .filter(([, count]) => count > 0)
    .forEach(([name, count]) => {
      output.push(`  ${name}: ${count}`);
    });

  // 複雑性
  const complexityLevel =
    results.complexity.score >= 5
      ? "🔴 高"
      : results.complexity.score >= 3
        ? "🟡 中"
        : "🟢 低";

  output.push(
    `\n📊 複雑性: ${complexityLevel} (スコア: ${results.complexity.score})`,
  );
  if (results.complexity.factors.length > 0) {
    output.push("  要因:");
    results.complexity.factors.forEach((factor) => {
      output.push(`    • ${factor}`);
    });
  }

  // 抽出候補
  if (results.candidates.length > 0) {
    output.push("\n🎯 抽出候補:");
    results.candidates.forEach((candidate) => {
      const priorityIcon =
        candidate.priority === "high"
          ? "🔴"
          : candidate.priority === "medium"
            ? "🟡"
            : "🟢";
      output.push(
        `  ${priorityIcon} [${candidate.type}] ${candidate.description}`,
      );
      output.push(`     💡 ${candidate.suggestion}`);
    });
  }

  // 提案
  if (results.suggestions.length > 0) {
    output.push("\n💡 全体的な提案:");
    results.suggestions.forEach((suggestion) => {
      output.push(`  ${suggestion}`);
    });
  }

  return output.join("\n");
}

function analyzeDirectory(dirPath) {
  const results = [];
  const files = fs.readdirSync(dirPath, { recursive: true });

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile() && /\.(tsx?|jsx?)$/.test(file)) {
      results.push(analyzeFile(filePath));
    }
  }

  return results;
}

// メイン実行
const target = process.argv[2];

if (!target) {
  console.log("使用法: node analyze-hook-candidates.mjs <file.tsx|directory>");
  process.exit(1);
}

const targetPath = path.resolve(target);

if (!fs.existsSync(targetPath)) {
  console.error(`ファイルまたはディレクトリが見つかりません: ${targetPath}`);
  process.exit(1);
}

const isDirectory = fs.statSync(targetPath).isDirectory();
const results = isDirectory
  ? analyzeDirectory(targetPath)
  : [analyzeFile(targetPath)];

// サマリー出力
console.log("\n🔍 カスタムフック抽出候補分析レポート");
console.log("═".repeat(60));

for (const result of results) {
  console.log(formatResults(result));
}

// 全体サマリー
if (results.length > 1) {
  console.log("\n📈 全体サマリー");
  console.log("═".repeat(60));

  const totalCandidates = results.reduce(
    (sum, r) => sum + r.candidates.length,
    0,
  );
  const highPriority = results.reduce(
    (sum, r) => sum + r.candidates.filter((c) => c.priority === "high").length,
    0,
  );
  const avgComplexity =
    results.reduce((sum, r) => sum + r.complexity.score, 0) / results.length;

  console.log(`  分析ファイル数: ${results.length}`);
  console.log(`  抽出候補総数: ${totalCandidates}`);
  console.log(`  高優先度: ${highPriority}`);
  console.log(`  平均複雑性スコア: ${avgComplexity.toFixed(1)}`);
}
