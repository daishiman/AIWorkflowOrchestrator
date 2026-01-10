#!/usr/bin/env node

/**
 * Electronセキュリティ監査スクリプト
 *
 * 使用方法:
 *   node .claude/skills/electron-security-hardening/scripts/security-audit.mjs [project-dir]
 *
 * 機能:
 *   - セキュリティ設定の検証
 *   - 脆弱なパターンの検出
 *   - CSP設定の確認
 *   - 依存関係の脆弱性チェック
 */

import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import { execSync } from "child_process";

const projectDir = process.argv[2] || process.cwd();

const securityChecks = {
  critical: [],
  high: [],
  medium: [],
  low: [],
};

// セキュリティパターン
const vulnerablePatterns = [
  // Critical
  {
    severity: "critical",
    name: "nodeIntegration有効",
    pattern: /nodeIntegration\s*:\s*true/,
    message:
      "nodeIntegrationが有効です。これによりRenderer内で任意のNode.jsコードが実行可能になります。",
    fix: "nodeIntegration: false に設定してください",
  },
  {
    severity: "critical",
    name: "contextIsolation無効",
    pattern: /contextIsolation\s*:\s*false/,
    message:
      "contextIsolationが無効です。PreloadスクリプトのコンテキストがRendererと共有されます。",
    fix: "contextIsolation: true に設定してください",
  },
  {
    severity: "critical",
    name: "ipcRenderer直接公開",
    pattern: /exposeInMainWorld\s*\([^)]*ipcRenderer\s*\)/,
    message:
      "ipcRendererが直接公開されています。任意のIPCメッセージが送信可能になります。",
    fix: "contextBridgeで必要なAPIのみを公開してください",
  },
  {
    severity: "critical",
    name: "require公開",
    pattern: /exposeInMainWorld\s*\([^)]*require\s*\)/,
    message:
      "requireが直接公開されています。任意のモジュールがロード可能になります。",
    fix: "requireを公開しないでください",
  },

  // High
  {
    severity: "high",
    name: "remoteモジュール使用",
    pattern:
      /enableRemoteModule\s*:\s*true|require\(['"]@electron\/remote['"]\)/,
    message:
      "remoteモジュールが使用されています。セキュリティリスクがあります。",
    fix: "remoteモジュールの代わりにIPCを使用してください",
  },
  {
    severity: "high",
    name: "sandbox無効",
    pattern: /sandbox\s*:\s*false/,
    message: "sandboxが明示的に無効化されています。",
    fix: "sandbox: true に設定するか、この設定を削除してください",
  },
  {
    severity: "high",
    name: "webSecurity無効",
    pattern: /webSecurity\s*:\s*false/,
    message: "webSecurityが無効です。同一オリジンポリシーが無効になります。",
    fix: "webSecurity: true に設定してください（または削除）",
  },
  {
    severity: "high",
    name: "安全でないコンテンツ許可",
    pattern: /allowRunningInsecureContent\s*:\s*true/,
    message: "HTTPSページでHTTPコンテンツの実行が許可されています。",
    fix: "allowRunningInsecureContent: false に設定してください",
  },

  // Medium
  {
    severity: "medium",
    name: "webviewTag有効",
    pattern: /webviewTag\s*:\s*true/,
    message: "webviewTagが有効です。必要でない場合は無効にしてください。",
    fix: "webviewTagを無効にするか、適切なセキュリティ設定を行ってください",
  },
  {
    severity: "medium",
    name: "experimentalFeatures有効",
    pattern: /experimentalFeatures\s*:\s*true/,
    message: "実験的機能が有効です。本番環境では無効にしてください。",
    fix: "experimentalFeatures: false に設定してください",
  },
  {
    severity: "medium",
    name: "will-navigateハンドラーなし",
    pattern: /new\s+BrowserWindow\s*\(/,
    antiPattern: /will-navigate/,
    message: "ナビゲーション制御が設定されていない可能性があります。",
    fix: "will-navigateイベントでナビゲーションを制限してください",
  },

  // Low
  {
    severity: "low",
    name: "DevTools本番有効",
    pattern: /openDevTools\s*\(\)/,
    message: "DevToolsが開かれています。本番環境では無効にしてください。",
    fix: "開発環境でのみDevToolsを有効にしてください",
  },
];

async function analyzeFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const relativePath = path.relative(projectDir, filePath);
  const issues = [];

  for (const check of vulnerablePatterns) {
    if (check.pattern.test(content)) {
      // antiPatternがある場合、それが存在すれば問題なし
      if (check.antiPattern && check.antiPattern.test(content)) {
        continue;
      }

      issues.push({
        severity: check.severity,
        name: check.name,
        message: check.message,
        fix: check.fix,
        file: relativePath,
      });
    }
  }

  return issues;
}

async function checkDependencies() {
  console.log("📦 依存関係の脆弱性をチェック中...\n");

  try {
    const packageJsonPath = path.join(projectDir, "package.json");
    await fs.access(packageJsonPath);

    try {
      execSync("npm audit --json", {
        cwd: projectDir,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      console.log("✅ 依存関係に既知の脆弱性はありません\n");
    } catch (error) {
      // npm auditは脆弱性がある場合に非ゼロで終了する
      if (error.stdout) {
        try {
          const auditResult = JSON.parse(error.stdout);
          const { high, critical } =
            auditResult.metadata?.vulnerabilities || {};

          if (critical > 0) {
            securityChecks.critical.push({
              name: "依存関係の脆弱性",
              message: `${critical}件の重大な脆弱性が依存関係に存在します`,
              fix: "npm audit fix を実行するか、脆弱なパッケージを更新してください",
            });
          }

          if (high > 0) {
            securityChecks.high.push({
              name: "依存関係の脆弱性",
              message: `${high}件の高リスク脆弱性が依存関係に存在します`,
              fix: "npm audit fix を実行してください",
            });
          }
        } catch {
          console.log("⚠️  npm audit の解析に失敗しました\n");
        }
      }
    }
  } catch {
    console.log("⚠️  package.json が見つかりません\n");
  }
}

async function checkCSP() {
  console.log("🛡️ CSP設定をチェック中...\n");

  try {
    const files = await glob("**/*.{ts,tsx,js,jsx,html}", {
      cwd: projectDir,
      ignore: ["**/node_modules/**", "**/dist/**"],
      absolute: true,
    });

    let cspFound = false;

    for (const file of files) {
      const content = await fs.readFile(file, "utf-8");

      if (/Content-Security-Policy/.test(content)) {
        cspFound = true;

        // unsafe-evalチェック
        if (
          /unsafe-eval/.test(content) &&
          !/NODE_ENV.*development/.test(content)
        ) {
          securityChecks.medium.push({
            name: "CSP unsafe-eval",
            message: "CSPにunsafe-evalが含まれています",
            file: path.relative(projectDir, file),
            fix: "本番環境ではunsafe-evalを削除してください",
          });
        }

        // unsafe-inlineチェック（scriptに対して）
        if (/script-src[^;]*unsafe-inline/.test(content)) {
          securityChecks.medium.push({
            name: "CSP unsafe-inline (script)",
            message: "script-srcにunsafe-inlineが含まれています",
            file: path.relative(projectDir, file),
            fix: "nonceまたはhashを使用してインラインスクリプトを許可してください",
          });
        }
      }
    }

    if (!cspFound) {
      securityChecks.medium.push({
        name: "CSP未設定",
        message: "Content Security Policyが設定されていません",
        fix: "CSPを設定してXSS攻撃を防止してください",
      });
    }
  } catch (error) {
    console.log("⚠️  CSPチェックに失敗しました:", error.message, "\n");
  }
}

function printResults() {
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("                     セキュリティ監査結果");
  console.log(
    "═══════════════════════════════════════════════════════════════\n",
  );

  const severities = ["critical", "high", "medium", "low"];
  const icons = { critical: "🔴", high: "🟠", medium: "🟡", low: "🔵" };
  let totalIssues = 0;

  for (const severity of severities) {
    const issues = securityChecks[severity];
    if (issues.length > 0) {
      console.log(
        `${icons[severity]} ${severity.toUpperCase()} (${issues.length}件)`,
      );
      console.log("─".repeat(60));

      for (const issue of issues) {
        console.log(`  ● ${issue.name}`);
        console.log(`    ${issue.message}`);
        if (issue.file) console.log(`    📁 ${issue.file}`);
        console.log(`    💡 ${issue.fix}`);
        console.log();
      }

      totalIssues += issues.length;
    }
  }

  if (totalIssues === 0) {
    console.log("✅ セキュリティ問題は検出されませんでした！\n");
  }

  // サマリー
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("                         サマリー");
  console.log(
    "═══════════════════════════════════════════════════════════════\n",
  );

  console.log(`  🔴 Critical: ${securityChecks.critical.length}`);
  console.log(`  🟠 High:     ${securityChecks.high.length}`);
  console.log(`  🟡 Medium:   ${securityChecks.medium.length}`);
  console.log(`  🔵 Low:      ${securityChecks.low.length}`);
  console.log(`  ─────────────`);
  console.log(`  合計:        ${totalIssues}`);
  console.log();

  // 終了コード
  if (securityChecks.critical.length > 0) {
    console.log(
      "❌ 重大なセキュリティ問題が検出されました。修正が必要です。\n",
    );
    process.exit(1);
  } else if (securityChecks.high.length > 0) {
    console.log(
      "⚠️  高リスクのセキュリティ問題が検出されました。修正を推奨します。\n",
    );
    process.exit(0);
  } else {
    console.log("✅ 重大なセキュリティ問題はありません。\n");
    process.exit(0);
  }
}

async function main() {
  console.log("\n🔒 Electronセキュリティ監査を開始...\n");
  console.log(`📁 プロジェクト: ${projectDir}\n`);

  try {
    // ファイル分析
    const files = await glob("**/*.{ts,tsx,js,jsx}", {
      cwd: projectDir,
      ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
      absolute: true,
    });

    console.log(`📄 ${files.length} ファイルを分析中...\n`);

    for (const file of files) {
      const issues = await analyzeFile(file);
      for (const issue of issues) {
        securityChecks[issue.severity].push(issue);
      }
    }

    // 依存関係チェック
    await checkDependencies();

    // CSPチェック
    await checkCSP();

    // 結果表示
    printResults();
  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

main();
