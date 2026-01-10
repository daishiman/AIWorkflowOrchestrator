#!/usr/bin/env node
/**
 * analyze-interface.mjs
 *
 * TypeScriptインターフェースを分析してISP違反を検出するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/interface-segregation/scripts/analyze-interface.mjs <file.ts>
 *
 * 検出内容:
 *   - メソッド数の分析
 *   - 肥大化インターフェースの検出
 *   - 分離の推奨
 */

import { readFileSync, existsSync } from "fs";
import { resolve, basename } from "path";

// ===== 設定 =====

const THRESHOLDS = {
  methodCount: 7, // メソッド数の警告しきい値
  propertyCount: 10, // プロパティ数の警告しきい値
  totalMembers: 12, // 総メンバー数の警告しきい値
};

// ===== パーサー =====

function parseInterfaces(content) {
  const interfaces = [];

  // インターフェース定義を抽出（シンプルな正規表現ベース）
  const interfaceRegex =
    /interface\s+(\w+)(?:<[^>]+>)?\s*(?:extends\s+[^{]+)?\s*\{([^}]*)\}/gs;

  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    const name = match[1];
    const body = match[2];

    const members = parseMembers(body);

    interfaces.push({
      name,
      body,
      members,
      methodCount: members.filter((m) => m.type === "method").length,
      propertyCount: members.filter((m) => m.type === "property").length,
      totalMembers: members.length,
    });
  }

  return interfaces;
}

function parseMembers(body) {
  const members = [];
  const lines = body.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    const trimmed = line.trim();

    // コメント行をスキップ
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*")
    ) {
      continue;
    }

    // メソッド検出: name(params): returnType または name(params): Promise<returnType>
    const methodMatch = trimmed.match(/^(\w+)\s*[\(<]/);
    if (methodMatch) {
      members.push({
        type: "method",
        name: methodMatch[1],
        signature: trimmed,
      });
      continue;
    }

    // プロパティ検出: name: type または readonly name: type
    const propertyMatch = trimmed.match(/^(?:readonly\s+)?(\w+)\s*[:\?]/);
    if (propertyMatch) {
      members.push({
        type: "property",
        name: propertyMatch[1],
        signature: trimmed,
        readonly: trimmed.startsWith("readonly"),
      });
    }
  }

  return members;
}

// ===== 分析 =====

function analyzeInterface(iface) {
  const issues = [];
  const recommendations = [];

  // メソッド数チェック
  if (iface.methodCount >= THRESHOLDS.methodCount) {
    issues.push({
      severity: "warning",
      message: `メソッド数が多い (${iface.methodCount} >= ${THRESHOLDS.methodCount})`,
    });
    recommendations.push("役割ベースでインターフェースを分離することを検討");
  }

  // プロパティ数チェック
  if (iface.propertyCount >= THRESHOLDS.propertyCount) {
    issues.push({
      severity: "warning",
      message: `プロパティ数が多い (${iface.propertyCount} >= ${THRESHOLDS.propertyCount})`,
    });
    recommendations.push(
      "関連するプロパティをサブインターフェースに分離することを検討",
    );
  }

  // 総メンバー数チェック
  if (iface.totalMembers >= THRESHOLDS.totalMembers) {
    issues.push({
      severity: "error",
      message: `総メンバー数が非常に多い (${iface.totalMembers} >= ${THRESHOLDS.totalMembers})`,
    });
    recommendations.push("ISP原則に基づいた即座の分離を推奨");
  }

  // メソッドのグループ分析
  const methodGroups = analyzeMethodGroups(
    iface.members.filter((m) => m.type === "method"),
  );
  if (methodGroups.length > 1) {
    issues.push({
      severity: "info",
      message: `${methodGroups.length}つの異なる機能グループが検出されました`,
    });
    recommendations.push(
      `検出されたグループ: ${methodGroups.map((g) => g.name).join(", ")}`,
    );
  }

  return {
    interface: iface.name,
    methodCount: iface.methodCount,
    propertyCount: iface.propertyCount,
    totalMembers: iface.totalMembers,
    issues,
    recommendations,
    methodGroups,
    score: calculateScore(iface, issues),
  };
}

function analyzeMethodGroups(methods) {
  const groups = [];
  const keywords = {
    ライフサイクル: [
      "init",
      "initialize",
      "shutdown",
      "dispose",
      "destroy",
      "start",
      "stop",
    ],
    検証: ["validate", "check", "verify", "assert"],
    永続化: ["save", "load", "store", "persist", "serialize", "deserialize"],
    監視: ["monitor", "observe", "watch", "track", "metrics", "progress"],
    CRUD: ["create", "read", "update", "delete", "get", "set", "find"],
    リカバリ: ["rollback", "retry", "recover", "restore", "undo"],
  };

  for (const [groupName, groupKeywords] of Object.entries(keywords)) {
    const matchingMethods = methods.filter((m) =>
      groupKeywords.some((keyword) => m.name.toLowerCase().includes(keyword)),
    );

    if (matchingMethods.length > 0) {
      groups.push({
        name: groupName,
        methods: matchingMethods.map((m) => m.name),
      });
    }
  }

  return groups;
}

function calculateScore(iface, issues) {
  let score = 100;

  // メソッド数による減点
  if (iface.methodCount > 5) {
    score -= (iface.methodCount - 5) * 5;
  }

  // 問題による減点
  for (const issue of issues) {
    if (issue.severity === "error") score -= 20;
    else if (issue.severity === "warning") score -= 10;
    else if (issue.severity === "info") score -= 5;
  }

  return Math.max(0, score);
}

// ===== 出力 =====

function printResults(results, filename) {
  console.log("\n🔍 ISP分析結果");
  console.log("=".repeat(60));
  console.log(`📁 ファイル: ${filename}`);
  console.log(`📊 検出されたインターフェース: ${results.length}個`);
  console.log("");

  for (const result of results) {
    printInterfaceResult(result);
  }

  // サマリー
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const avgScore =
    results.length > 0 ? (totalScore / results.length).toFixed(1) : 0;

  console.log("=".repeat(60));
  console.log("📊 サマリー");
  console.log(`   平均スコア: ${avgScore}/100`);
  console.log(
    `   問題のあるインターフェース: ${results.filter((r) => r.issues.length > 0).length}個`,
  );
  console.log("");
}

function printInterfaceResult(result) {
  console.log(`📋 ${result.interface}`);
  console.log("-".repeat(40));
  console.log(`   メソッド数: ${result.methodCount}`);
  console.log(`   プロパティ数: ${result.propertyCount}`);
  console.log(`   総メンバー数: ${result.totalMembers}`);
  console.log(`   スコア: ${result.score}/100`);

  if (result.issues.length > 0) {
    console.log("");
    console.log("   ⚠️ 検出された問題:");
    for (const issue of result.issues) {
      const icon =
        issue.severity === "error"
          ? "❌"
          : issue.severity === "warning"
            ? "⚠️"
            : "ℹ️";
      console.log(`      ${icon} ${issue.message}`);
    }
  }

  if (result.recommendations.length > 0) {
    console.log("");
    console.log("   💡 推奨事項:");
    for (const rec of result.recommendations) {
      console.log(`      • ${rec}`);
    }
  }

  if (result.methodGroups.length > 0) {
    console.log("");
    console.log("   🔖 検出された機能グループ:");
    for (const group of result.methodGroups) {
      console.log(`      [${group.name}]: ${group.methods.join(", ")}`);
    }
  }

  console.log("");
}

// ===== メイン処理 =====

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node analyze-interface.mjs <file.ts>");
    console.log("");
    console.log("例:");
    console.log("  node analyze-interface.mjs src/interfaces/workflow.ts");
    process.exit(0);
  }

  const filePath = resolve(process.cwd(), args[0]);

  if (!existsSync(filePath)) {
    console.error(`❌ ファイルが見つかりません: ${args[0]}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const interfaces = parseInterfaces(content);

    if (interfaces.length === 0) {
      console.log("ℹ️ インターフェースが見つかりませんでした");
      process.exit(0);
    }

    const results = interfaces.map(analyzeInterface);
    printResults(results, basename(filePath));

    // 問題があれば終了コード1
    const hasProblems = results.some((r) =>
      r.issues.some((i) => i.severity === "error" || i.severity === "warning"),
    );
    process.exit(hasProblems ? 1 : 0);
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
