#!/usr/bin/env node

/**
 * トランザクション分析スクリプト
 *
 * 使用方法:
 *   node analyze-transaction.mjs <directory>
 *
 * 分析内容:
 *   - トランザクション境界の検出
 *   - 長時間トランザクションの警告
 *   - 外部呼び出しの検出
 *   - ロールバック処理の確認
 */

import fs from "fs";
import path from "path";

// 設定
const CONFIG = {
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  excludeDirs: ["node_modules", "dist", "build", ".git", ".next"],
};

// 分析パターン
const PATTERNS = {
  // トランザクション開始パターン
  transactionStart: [
    /db\.transaction\s*\(/,
    /\.transaction\s*\(\s*async/,
    /BEGIN\s*TRANSACTION/i,
    /client\.query\s*\(\s*['"`]BEGIN/,
  ],

  // 外部呼び出しパターン（トランザクション内で避けるべき）
  externalCalls: [
    /await\s+fetch\s*\(/,
    /await\s+axios\s*[.(]/,
    /await\s+sendEmail/i,
    /await\s+sendNotification/i,
    /await\s+publishEvent/i,
    /await\s+httpClient/i,
  ],

  // 長時間操作パターン
  longOperations: [
    /await\s+sleep\s*\(/,
    /await\s+delay\s*\(/,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
  ],

  // ロールバックパターン
  rollbackPatterns: [
    /ROLLBACK/,
    /\.rollback\s*\(/,
    /throw\s+/,
    /throw\s+new\s+\w+Error/,
  ],

  // セーブポイントパターン
  savepointPatterns: [/SAVEPOINT/, /RELEASE\s+SAVEPOINT/, /ROLLBACK\s+TO/i],

  // 例外握りつぶしパターン（アンチパターン）
  exceptionSwallowing: [
    /catch\s*\([^)]*\)\s*\{\s*\}/,
    /catch\s*\([^)]*\)\s*\{\s*console\.log/,
    /catch\s*\([^)]*\)\s*\{\s*\/\//,
  ],

  // 分離レベル設定
  isolationLevels: [
    /isolationLevel:\s*['"`](\w+)/,
    /ISOLATION\s+LEVEL\s+(\w+)/i,
    /SET\s+TRANSACTION\s+ISOLATION/i,
  ],

  // ロック関連
  lockingPatterns: [
    /FOR\s+UPDATE/i,
    /FOR\s+SHARE/i,
    /FOR\s+NO\s+KEY\s+UPDATE/i,
    /SKIP\s+LOCKED/i,
    /NOWAIT/i,
    /version\s*[+:=]/i,
  ],
};

/**
 * ディレクトリを再帰的に走査
 */
function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!CONFIG.excludeDirs.includes(file)) {
        walkDirectory(filePath, callback);
      }
    } else if (CONFIG.extensions.includes(path.extname(file))) {
      callback(filePath);
    }
  }
}

/**
 * トランザクションブロックを抽出
 */
function extractTransactionBlocks(content, filePath) {
  const blocks = [];
  const lines = content.split("\n");

  let inTransaction = false;
  let transactionStart = 0;
  let braceCount = 0;
  let currentBlock = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // トランザクション開始検出
    if (!inTransaction) {
      for (const pattern of PATTERNS.transactionStart) {
        if (pattern.test(line)) {
          inTransaction = true;
          transactionStart = i + 1;
          braceCount = 0;
          currentBlock = [line];
          break;
        }
      }
    }

    if (inTransaction) {
      if (i > transactionStart - 1) {
        currentBlock.push(line);
      }

      // ブレースカウント
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      // トランザクション終了検出
      if (braceCount <= 0 && currentBlock.length > 1) {
        blocks.push({
          filePath,
          startLine: transactionStart,
          endLine: i + 1,
          content: currentBlock.join("\n"),
          lineCount: currentBlock.length,
        });
        inTransaction = false;
        currentBlock = [];
      }
    }
  }

  return blocks;
}

/**
 * トランザクションブロックを分析
 */
function analyzeTransactionBlock(block) {
  const issues = [];
  const info = [];

  // 1. 外部呼び出し検出
  for (const pattern of PATTERNS.externalCalls) {
    if (pattern.test(block.content)) {
      issues.push({
        type: "EXTERNAL_CALL",
        severity: "ERROR",
        message:
          "トランザクション内で外部呼び出しが検出されました。トランザクション外に移動してください。",
        pattern: pattern.toString(),
      });
    }
  }

  // 2. 長時間操作検出
  for (const pattern of PATTERNS.longOperations) {
    if (pattern.test(block.content)) {
      issues.push({
        type: "LONG_OPERATION",
        severity: "WARNING",
        message:
          "トランザクション内で長時間操作が検出されました。トランザクションを短く保ってください。",
        pattern: pattern.toString(),
      });
    }
  }

  // 3. 例外握りつぶし検出
  for (const pattern of PATTERNS.exceptionSwallowing) {
    if (pattern.test(block.content)) {
      issues.push({
        type: "EXCEPTION_SWALLOWING",
        severity: "ERROR",
        message:
          "例外の握りつぶしが検出されました。例外を再スローしてロールバックを確保してください。",
        pattern: pattern.toString(),
      });
    }
  }

  // 4. 行数チェック（長すぎるトランザクション）
  if (block.lineCount > 50) {
    issues.push({
      type: "LONG_TRANSACTION",
      severity: "WARNING",
      message: `トランザクションが長すぎます（${block.lineCount}行）。分割を検討してください。`,
    });
  }

  // 5. ロールバック処理の確認
  const hasRollback = PATTERNS.rollbackPatterns.some((p) =>
    p.test(block.content),
  );
  if (!hasRollback) {
    issues.push({
      type: "NO_ROLLBACK",
      severity: "INFO",
      message:
        "明示的なロールバック/throw文がありません。フレームワークの自動ロールバックに依存しています。",
    });
  }

  // 6. 分離レベルの検出
  for (const pattern of PATTERNS.isolationLevels) {
    const match = block.content.match(pattern);
    if (match) {
      info.push({
        type: "ISOLATION_LEVEL",
        message: `分離レベル: ${match[1] || "設定あり"}`,
      });
    }
  }

  // 7. ロック戦略の検出
  for (const pattern of PATTERNS.lockingPatterns) {
    if (pattern.test(block.content)) {
      const lockType = pattern.toString().includes("version")
        ? "楽観的ロック"
        : "悲観的ロック";
      info.push({
        type: "LOCKING",
        message: `${lockType}が使用されています`,
      });
      break;
    }
  }

  // 8. セーブポイントの検出
  const hasSavepoint = PATTERNS.savepointPatterns.some((p) =>
    p.test(block.content),
  );
  if (hasSavepoint) {
    info.push({
      type: "SAVEPOINT",
      message: "セーブポイントが使用されています",
    });
  }

  return { issues, info };
}

/**
 * レポート生成
 */
function generateReport(results) {
  const report = {
    summary: {
      totalFiles: 0,
      totalTransactions: 0,
      totalIssues: 0,
      byType: {},
      bySeverity: { ERROR: 0, WARNING: 0, INFO: 0 },
    },
    files: [],
  };

  const fileSet = new Set();

  for (const result of results) {
    fileSet.add(result.block.filePath);
    report.summary.totalTransactions++;

    const fileReport = {
      path: result.block.filePath,
      location: `${result.block.startLine}-${result.block.endLine}`,
      lineCount: result.block.lineCount,
      issues: result.analysis.issues,
      info: result.analysis.info,
    };

    report.files.push(fileReport);

    for (const issue of result.analysis.issues) {
      report.summary.totalIssues++;
      report.summary.bySeverity[issue.severity]++;
      report.summary.byType[issue.type] =
        (report.summary.byType[issue.type] || 0) + 1;
    }
  }

  report.summary.totalFiles = fileSet.size;

  return report;
}

/**
 * レポート出力
 */
function printReport(report) {
  console.log("\n" + "=".repeat(60));
  console.log("トランザクション分析レポート");
  console.log("=".repeat(60));

  // サマリー
  console.log("\n📊 サマリー");
  console.log("-".repeat(40));
  console.log(`  ファイル数: ${report.summary.totalFiles}`);
  console.log(`  トランザクション数: ${report.summary.totalTransactions}`);
  console.log(`  問題検出数: ${report.summary.totalIssues}`);

  if (report.summary.totalIssues > 0) {
    console.log("\n  重要度別:");
    console.log(`    🔴 ERROR: ${report.summary.bySeverity.ERROR}`);
    console.log(`    🟡 WARNING: ${report.summary.bySeverity.WARNING}`);
    console.log(`    🔵 INFO: ${report.summary.bySeverity.INFO}`);

    console.log("\n  種類別:");
    for (const [type, count] of Object.entries(report.summary.byType)) {
      console.log(`    ${type}: ${count}`);
    }
  }

  // 詳細
  if (report.files.length > 0) {
    console.log("\n\n📋 詳細");
    console.log("-".repeat(40));

    for (const file of report.files) {
      console.log(`\n📁 ${file.path}:${file.location}`);
      console.log(`   行数: ${file.lineCount}`);

      if (file.info.length > 0) {
        console.log("   ℹ️  情報:");
        for (const info of file.info) {
          console.log(`      - ${info.message}`);
        }
      }

      if (file.issues.length > 0) {
        console.log("   ⚠️  問題:");
        for (const issue of file.issues) {
          const icon =
            issue.severity === "ERROR"
              ? "🔴"
              : issue.severity === "WARNING"
                ? "🟡"
                : "🔵";
          console.log(`      ${icon} [${issue.type}] ${issue.message}`);
        }
      } else {
        console.log("   ✅ 問題なし");
      }
    }
  }

  // 推奨事項
  if (report.summary.totalIssues > 0) {
    console.log("\n\n💡 推奨事項");
    console.log("-".repeat(40));

    if (report.summary.byType.EXTERNAL_CALL > 0) {
      console.log("  • 外部呼び出しをトランザクション外に移動してください");
    }
    if (report.summary.byType.LONG_OPERATION > 0) {
      console.log("  • 長時間操作をトランザクション外に移動してください");
    }
    if (report.summary.byType.EXCEPTION_SWALLOWING > 0) {
      console.log(
        "  • 例外を再スローしてトランザクションのロールバックを確保してください",
      );
    }
    if (report.summary.byType.LONG_TRANSACTION > 0) {
      console.log("  • 長いトランザクションを小さな単位に分割してください");
    }
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node analyze-transaction.mjs <directory>");
    console.log("");
    console.log("オプション:");
    console.log("  --json    JSON形式で出力");
    process.exit(1);
  }

  const targetDir = args[0];
  const jsonOutput = args.includes("--json");

  if (!fs.existsSync(targetDir)) {
    console.error(`エラー: ディレクトリが存在しません: ${targetDir}`);
    process.exit(1);
  }

  console.log(`\n🔍 トランザクション分析中: ${targetDir}`);

  const results = [];

  walkDirectory(targetDir, (filePath) => {
    const content = fs.readFileSync(filePath, "utf-8");
    const blocks = extractTransactionBlocks(content, filePath);

    for (const block of blocks) {
      const analysis = analyzeTransactionBlock(block);
      results.push({ block, analysis });
    }
  });

  const report = generateReport(results);

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  // 終了コード
  if (report.summary.bySeverity.ERROR > 0) {
    process.exit(1);
  }
}

main();
