#!/usr/bin/env node

/**
 * 状態構造分析スクリプト
 *
 * 使用法:
 *   node analyze-state-structure.mjs <file.tsx>
 *   node analyze-state-structure.mjs <directory>
 *
 * 分析内容:
 *   - 状態の配置レベル検出
 *   - Prop Drillingの深さ分析
 *   - Context使用状況
 *   - 状態持ち上げの推奨
 */

import fs from "fs";
import path from "path";

const patterns = {
  // 状態定義
  state: {
    useState: /useState\s*[<(]/g,
    useReducer: /useReducer\s*[<(]/g,
    useContext: /useContext\s*\(/g,
  },

  // Context
  context: {
    createContext: /createContext\s*[<(]/g,
    Provider: /\.Provider/g,
    Consumer: /\.Consumer/g,
  },

  // Props
  props: {
    propsDrilling: /\(\s*{\s*[\w,\s]+}\s*\)/g,
    spreadProps: /\{\.\.\.(\w+)\}/g,
    childrenProp: /children/g,
  },

  // コンポーネント定義
  components: {
    functionComponent: /function\s+([A-Z]\w+)\s*\(/g,
    arrowComponent: /const\s+([A-Z]\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>/g,
    memoComponent: /memo\s*\(\s*(?:function\s+)?([A-Z]\w+)/g,
  },

  // フック
  hooks: {
    useMemo: /useMemo\s*\(/g,
    useCallback: /useCallback\s*\(/g,
    customHook: /use[A-Z]\w+\s*\(/g,
  },
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const results = {
    file: filePath,
    components: [],
    stateUsage: {
      useState: 0,
      useReducer: 0,
      useContext: 0,
    },
    contextUsage: {
      created: 0,
      providers: 0,
      consumers: 0,
    },
    propDrillingIndicators: {
      destructuredProps: 0,
      spreadProps: 0,
      childrenUsage: 0,
    },
    issues: [],
    suggestions: [],
  };

  // コンポーネント検出
  const functionMatches = [
    ...content.matchAll(patterns.components.functionComponent),
  ];
  const arrowMatches = [
    ...content.matchAll(patterns.components.arrowComponent),
  ];
  const memoMatches = [...content.matchAll(patterns.components.memoComponent)];

  const componentNames = new Set([
    ...functionMatches.map((m) => m[1]),
    ...arrowMatches.map((m) => m[1]),
    ...memoMatches.map((m) => m[1]),
  ]);

  results.components = [...componentNames];

  // 状態使用カウント
  results.stateUsage.useState = (
    content.match(patterns.state.useState) || []
  ).length;
  results.stateUsage.useReducer = (
    content.match(patterns.state.useReducer) || []
  ).length;
  results.stateUsage.useContext = (
    content.match(patterns.state.useContext) || []
  ).length;

  // Context使用カウント
  results.contextUsage.created = (
    content.match(patterns.context.createContext) || []
  ).length;
  results.contextUsage.providers = (
    content.match(patterns.context.Provider) || []
  ).length;
  results.contextUsage.consumers = (
    content.match(patterns.context.Consumer) || []
  ).length;

  // Props分析
  results.propDrillingIndicators.destructuredProps = (
    content.match(patterns.props.propsDrilling) || []
  ).length;
  results.propDrillingIndicators.spreadProps = (
    content.match(patterns.props.spreadProps) || []
  ).length;
  results.propDrillingIndicators.childrenUsage = (
    content.match(patterns.props.childrenProp) || []
  ).length;

  // 分析と提案生成
  generateAnalysis(results, content);

  return results;
}

function generateAnalysis(results, content) {
  // 状態が多すぎる
  const totalState =
    results.stateUsage.useState + results.stateUsage.useReducer;
  if (totalState > 10 && results.components.length < 3) {
    results.issues.push({
      severity: "warning",
      message: `コンポーネント数(${results.components.length})に対して状態が多すぎます(${totalState}個)。状態の分割を検討してください。`,
    });
  }

  // Prop Drillingの可能性
  if (
    results.propDrillingIndicators.destructuredProps > 5 &&
    results.stateUsage.useContext === 0
  ) {
    results.suggestions.push(
      "propsの分割代入が多く検出されました。Prop Drillingの可能性があります。Contextまたはコンポジションの使用を検討してください。",
    );
  }

  // childrenパターンの活用
  if (
    results.propDrillingIndicators.childrenUsage === 0 &&
    results.components.length > 2
  ) {
    results.suggestions.push(
      "childrenパターンが使用されていません。コンポジションによるProp Drilling解消を検討してください。",
    );
  }

  // Context使用の確認
  if (results.contextUsage.providers > 3) {
    results.issues.push({
      severity: "info",
      message: `Providerが${results.contextUsage.providers}個あります。Provider Hellになっていないか確認してください。`,
    });
  }

  // useContextとuseStateのバランス
  if (results.stateUsage.useContext > results.stateUsage.useState * 2) {
    results.suggestions.push(
      "Contextの使用が多いです。ローカル状態で十分なケースがないか確認してください。",
    );
  }

  // メモ化の確認
  const memoUsage =
    (content.match(patterns.hooks.useMemo) || []).length +
    (content.match(patterns.hooks.useCallback) || []).length;

  if (results.contextUsage.providers > 0 && memoUsage === 0) {
    results.suggestions.push(
      "Context Providerがありますが、メモ化が見つかりません。Providerの値をuseMemoでメモ化することを検討してください。",
    );
  }

  // 状態配置レベルの推定
  analyzeStatePlacement(results, content);
}

function analyzeStatePlacement(results, content) {
  // useStateの使用場所を分析
  const useStateMatches = [
    ...content.matchAll(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g),
  ];

  for (const match of useStateMatches) {
    const stateName = match[1];

    // この状態がどこで使われているか確認
    const usageCount = (
      content.match(new RegExp(`\\b${stateName}\\b`, "g")) || []
    ).length;

    // propsとして渡されているか確認
    const passedAsProps = content.includes(`${stateName}={${stateName}}`);

    if (passedAsProps && usageCount > 5) {
      results.suggestions.push(
        `状態 "${stateName}" が多くの場所で使用されています。Contextへの移行を検討してください。`,
      );
    }
  }
}

function formatResults(results) {
  const output = [];

  output.push(`\n📁 ${results.file}`);
  output.push("═".repeat(50));

  // コンポーネント
  output.push("\n🧩 コンポーネント:");
  output.push(`  検出数: ${results.components.length}`);
  if (results.components.length > 0) {
    output.push(`  ${results.components.join(", ")}`);
  }

  // 状態使用
  output.push("\n📊 状態使用:");
  output.push(`  useState: ${results.stateUsage.useState}回`);
  output.push(`  useReducer: ${results.stateUsage.useReducer}回`);
  output.push(`  useContext: ${results.stateUsage.useContext}回`);

  // Context使用
  if (results.contextUsage.created > 0 || results.contextUsage.providers > 0) {
    output.push("\n🌐 Context:");
    output.push(`  作成: ${results.contextUsage.created}個`);
    output.push(`  Provider: ${results.contextUsage.providers}個`);
    output.push(`  Consumer: ${results.contextUsage.consumers}個`);
  }

  // Prop Drilling指標
  output.push("\n📋 Props分析:");
  output.push(
    `  分割代入: ${results.propDrillingIndicators.destructuredProps}箇所`,
  );
  output.push(
    `  スプレッド: ${results.propDrillingIndicators.spreadProps}箇所`,
  );
  output.push(
    `  children使用: ${results.propDrillingIndicators.childrenUsage}箇所`,
  );

  // 問題点
  if (results.issues.length > 0) {
    output.push("\n⚠️ 問題点:");
    for (const issue of results.issues) {
      const icon =
        issue.severity === "warning"
          ? "⚠️"
          : issue.severity === "error"
            ? "❌"
            : "ℹ️";
      output.push(`  ${icon} ${issue.message}`);
    }
  }

  // 提案
  if (results.suggestions.length > 0) {
    output.push("\n💡 提案:");
    for (const suggestion of results.suggestions) {
      output.push(`  • ${suggestion}`);
    }
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
  console.log("使用法: node analyze-state-structure.mjs <file.tsx|directory>");
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
console.log("\n📊 状態構造分析レポート");
console.log("═".repeat(50));

for (const result of results) {
  console.log(formatResults(result));
}

// 全体サマリー
if (results.length > 1) {
  console.log("\n📈 全体サマリー");
  console.log("═".repeat(50));

  const totalState = results.reduce(
    (sum, r) => sum + r.stateUsage.useState + r.stateUsage.useReducer,
    0,
  );
  const totalContext = results.reduce(
    (sum, r) => sum + r.stateUsage.useContext,
    0,
  );
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const totalSuggestions = results.reduce(
    (sum, r) => sum + r.suggestions.length,
    0,
  );

  console.log(`  分析ファイル数: ${results.length}`);
  console.log(`  総状態数: ${totalState}`);
  console.log(`  Context使用: ${totalContext}`);
  console.log(`  問題点: ${totalIssues}件`);
  console.log(`  提案: ${totalSuggestions}件`);
}
