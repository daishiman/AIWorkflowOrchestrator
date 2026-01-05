#!/usr/bin/env node

/**
 * 認証・認可エンドポイント分析スクリプト
 *
 * 目的: プロジェクト内の認証・認可に関連するエンドポイントを分析し、
 *       セキュリティチェックの有無を検証する
 *
 * 使用方法:
 *   node analyze-auth-endpoints.mjs <target-directory>
 *
 * 出力:
 *   - 認証・認可エンドポイントのリスト
 *   - セキュリティチェックの有無
 *   - 潜在的な脆弱性の警告
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;

function showHelp() {
  console.log(`
認証・認可エンドポイント分析

Usage:
  node analyze-auth-endpoints.mjs <target-directory>

Options:
  -h, --help    このヘルプを表示
  `);
}

// カラー出力用
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// 認証・認可関連のパターン
const authPatterns = {
  endpoints: {
    login: /\/(login|signin|auth|authenticate)/i,
    logout: /\/(logout|signout)/i,
    register: /\/(register|signup|sign-up)/i,
    reset: /\/(reset|forgot|password)/i,
    oauth: /\/(oauth|callback|authorize)/i,
    admin: /\/admin\//i,
    user: /\/user[s]?\/[:\w]+/i,
  },
  securityChecks: {
    authMiddleware:
      /(requireAuth|isAuthenticated|authenticate|verifyToken|checkAuth)/,
    roleCheck: /(requireRole|hasRole|checkRole|isAdmin|requireAdmin)/,
    permissionCheck: /(requirePermission|hasPermission|checkPermission|can)/,
    ownershipCheck: /(isOwner|checkOwnership|verifyOwnership)/,
    rateLimiting: /(rateLimit|limiter|throttle)/,
  },
  vulnerabilities: {
    directQuery: /\.(query|exec|raw)\s*\(\s*['"`].*\$\{/,
    noValidation: /(req\.body|req\.params|req\.query)\s*\.\w+[^;]*;/,
    passwordPlaintext: /password\s*[=:]\s*['"`]/i,
  },
};

class AuthEndpointAnalyzer {
  constructor(targetDir) {
    this.targetDir = targetDir;
    this.results = {
      endpoints: [],
      statistics: {
        total: 0,
        protected: 0,
        unprotected: 0,
        vulnerabilities: 0,
      },
    };
  }

  analyze() {
    console.log(
      `${colors.cyan}=== 認証・認可エンドポイント分析 ===${colors.reset}\n`,
    );
    console.log(`対象ディレクトリ: ${this.targetDir}\n`);

    this.scanDirectory(this.targetDir);
    this.printResults();
  }

  scanDirectory(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        // node_modules等は除外
        if (
          !file.startsWith(".") &&
          file !== "node_modules" &&
          file !== "dist"
        ) {
          this.scanDirectory(filePath);
        }
      } else if (this.isTargetFile(file)) {
        this.analyzeFile(filePath);
      }
    }
  }

  isTargetFile(filename) {
    const ext = extname(filename);
    return [".js", ".ts", ".jsx", ".tsx", ".mjs"].includes(ext);
  }

  analyzeFile(filePath) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        this.checkForAuthEndpoint(filePath, line, index + 1);
      });
    } catch (error) {
      console.error(
        `${colors.red}エラー: ${filePath} の読み取りに失敗${colors.reset}`,
      );
    }
  }

  checkForAuthEndpoint(filePath, line, lineNumber) {
    // HTTPメソッドパターン
    const httpMethodPattern =
      /(app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/;
    const match = line.match(httpMethodPattern);

    if (!match) return;

    const [, , method, path] = match;

    // 認証・認可関連エンドポイントか判定
    const endpointType = this.identifyEndpointType(path);
    if (!endpointType) return;

    // セキュリティチェックの検出
    const securityChecks = this.detectSecurityChecks(line);
    const vulnerabilities = this.detectVulnerabilities(line);

    const endpoint = {
      file: filePath,
      line: lineNumber,
      method: method.toUpperCase(),
      path,
      type: endpointType,
      securityChecks,
      vulnerabilities,
      protected: securityChecks.length > 0,
      severity:
        vulnerabilities.length > 0
          ? "high"
          : securityChecks.length === 0
            ? "medium"
            : "low",
    };

    this.results.endpoints.push(endpoint);
    this.results.statistics.total++;

    if (endpoint.protected) {
      this.results.statistics.protected++;
    } else {
      this.results.statistics.unprotected++;
    }

    if (vulnerabilities.length > 0) {
      this.results.statistics.vulnerabilities++;
    }
  }

  identifyEndpointType(path) {
    for (const [type, pattern] of Object.entries(authPatterns.endpoints)) {
      if (pattern.test(path)) {
        return type;
      }
    }
    return null;
  }

  detectSecurityChecks(line) {
    const checks = [];
    for (const [checkType, pattern] of Object.entries(
      authPatterns.securityChecks,
    )) {
      if (pattern.test(line)) {
        checks.push(checkType);
      }
    }
    return checks;
  }

  detectVulnerabilities(line) {
    const vulns = [];
    for (const [vulnType, pattern] of Object.entries(
      authPatterns.vulnerabilities,
    )) {
      if (pattern.test(line)) {
        vulns.push(vulnType);
      }
    }
    return vulns;
  }

  printResults() {
    console.log(`${colors.cyan}=== 分析結果 ===${colors.reset}\n`);

    // 統計情報
    console.log(`${colors.blue}統計:${colors.reset}`);
    console.log(`  総エンドポイント数: ${this.results.statistics.total}`);
    console.log(
      `  保護されたエンドポイント: ${colors.green}${this.results.statistics.protected}${colors.reset}`,
    );
    console.log(
      `  保護されていないエンドポイント: ${colors.yellow}${this.results.statistics.unprotected}${colors.reset}`,
    );
    console.log(
      `  脆弱性検出: ${colors.red}${this.results.statistics.vulnerabilities}${colors.reset}\n`,
    );

    // 高リスクエンドポイント
    const highRisk = this.results.endpoints.filter(
      (e) => e.severity === "high",
    );
    if (highRisk.length > 0) {
      console.log(
        `${colors.red}🚨 高リスクエンドポイント (${highRisk.length}):${colors.reset}`,
      );
      highRisk.forEach((e) => {
        console.log(`  ${e.method} ${e.path}`);
        console.log(`    ファイル: ${e.file}:${e.line}`);
        console.log(`    タイプ: ${e.type}`);
        console.log(`    脆弱性: ${e.vulnerabilities.join(", ")}`);
        console.log();
      });
    }

    // 保護されていないエンドポイント
    const unprotected = this.results.endpoints.filter(
      (e) => !e.protected && e.severity !== "high",
    );
    if (unprotected.length > 0) {
      console.log(
        `${colors.yellow}⚠️  保護されていないエンドポイント (${unprotected.length}):${colors.reset}`,
      );
      unprotected.forEach((e) => {
        console.log(`  ${e.method} ${e.path}`);
        console.log(`    ファイル: ${e.file}:${e.line}`);
        console.log(`    タイプ: ${e.type}`);
        console.log(`    推奨: 認証・認可チェックを追加`);
        console.log();
      });
    }

    // 正しく保護されたエンドポイント
    const protected_endpoints = this.results.endpoints.filter(
      (e) => e.protected && e.severity === "low",
    );
    if (protected_endpoints.length > 0) {
      console.log(
        `${colors.green}✅ 正しく保護されたエンドポイント (${protected_endpoints.length}):${colors.reset}`,
      );
      protected_endpoints.slice(0, 5).forEach((e) => {
        console.log(`  ${e.method} ${e.path}`);
        console.log(`    セキュリティチェック: ${e.securityChecks.join(", ")}`);
      });
      if (protected_endpoints.length > 5) {
        console.log(`  ... 他 ${protected_endpoints.length - 5} 件\n`);
      } else {
        console.log();
      }
    }

    // 推奨事項
    console.log(`${colors.cyan}=== 推奨事項 ===${colors.reset}\n`);

    if (this.results.statistics.vulnerabilities > 0) {
      console.log(`${colors.red}🚨 Critical:${colors.reset}`);
      console.log(
        `  ${this.results.statistics.vulnerabilities}件の脆弱性を即座に修正してください\n`,
      );
    }

    if (this.results.statistics.unprotected > 0) {
      console.log(`${colors.yellow}⚠️  Important:${colors.reset}`);
      console.log(
        `  ${this.results.statistics.unprotected}件の保護されていないエンドポイントに認証・認可を追加してください\n`,
      );
    }

    if (
      this.results.statistics.protected === this.results.statistics.total &&
      this.results.statistics.vulnerabilities === 0
    ) {
      console.log(
        `${colors.green}✅ すべてのエンドポイントが適切に保護されています${colors.reset}\n`,
      );
    }

    // カバレッジ率
    const coverage =
      this.results.statistics.total > 0
        ? (
            (this.results.statistics.protected /
              this.results.statistics.total) *
            100
          ).toFixed(1)
        : 0;

    console.log(`セキュリティカバレッジ: ${coverage}%`);
    if (coverage < 80) {
      console.log(`${colors.yellow}目標: 95%以上${colors.reset}\n`);
    } else if (coverage < 95) {
      console.log(`${colors.green}良好（目標: 95%以上）${colors.reset}\n`);
    } else {
      console.log(`${colors.green}優秀${colors.reset}\n`);
    }
  }
}

// メイン実行
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  showHelp();
  process.exit(EXIT_SUCCESS);
}

if (args.length > 1) {
  console.error(`${colors.red}Error: too many arguments${colors.reset}`);
  showHelp();
  process.exit(EXIT_ARGS_ERROR);
}

const targetDir = args[0] || "./src";
if (targetDir.startsWith("-")) {
  console.error(`${colors.red}Error: invalid target directory${colors.reset}`);
  showHelp();
  process.exit(EXIT_ARGS_ERROR);
}

if (!existsSync(targetDir)) {
  console.error(
    `${colors.red}Error: target directory not found: ${targetDir}${colors.reset}`,
  );
  process.exit(EXIT_FILE_MISSING);
}

try {
  const analyzer = new AuthEndpointAnalyzer(targetDir);
  analyzer.analyze();
  process.exit(EXIT_SUCCESS);
} catch (error) {
  console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
  process.exit(EXIT_ERROR);
}
