#!/usr/bin/env node

/**
 * JWT/トークンセキュリティチェックスクリプト
 *
 * 目的: プロジェクト内のJWT/トークン実装をスキャンし、
 *       セキュリティベストプラクティスへの準拠を検証する
 *
 * 使用方法:
 *   node check-token-security.mjs <target-directory>
 *
 * チェック項目:
 *   - JWT署名アルゴリズムの安全性
 *   - トークン保存場所の安全性
 *   - 有効期限の設定
 *   - alg: none 攻撃への対策
 *   - センシティブデータのペイロード含有
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

// セキュリティパターン
const patterns = {
  jwt: {
    sign: /jwt\.sign\s*\(/,
    verify: /jwt\.verify\s*\(/,
    decode: /jwt\.decode\s*\(/,
  },
  algorithms: {
    safe: /(RS256|ES256|PS256)/,
    unsafe: /(HS256|none|HS384|HS512)/,
    none: /['"]none['"]/,
  },
  storage: {
    localStorage: /localStorage\.(setItem|getItem).*token/i,
    sessionStorage: /sessionStorage\.(setItem|getItem).*token/i,
    cookie: /res\.cookie.*token/i,
    memory: /const\s+\w*[Tt]oken\w*\s*=/,
  },
  expiration: {
    exp: /exp.*:/,
    expiresIn: /expiresIn\s*:/,
    maxAge: /maxAge\s*:/,
  },
  sensitive: {
    password: /password.*:/i,
    ssn: /ssn.*:/i,
    creditCard: /(creditCard|cardNumber).*:/i,
  },
};

class TokenSecurityChecker {
  constructor(targetDir) {
    this.targetDir = targetDir;
    this.findings = [];
    this.stats = {
      jwtUsage: 0,
      secureAlgorithms: 0,
      unsafeAlgorithms: 0,
      noneAlgorithm: 0,
      unsafeStorage: 0,
      missingExpiration: 0,
      sensitiveData: 0,
    };
  }

  check() {
    console.log(
      `${colors.cyan}=== JWT/トークンセキュリティチェック ===${colors.reset}\n`,
    );
    console.log(`対象ディレクトリ: ${this.targetDir}\n`);

    this.scanDirectory(this.targetDir);
    this.printFindings();
  }

  scanDirectory(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
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

      let inJwtContext = false;
      let contextLines = [];

      lines.forEach((line, index) => {
        // JWT関連のコンテキスト検出
        if (patterns.jwt.sign.test(line) || patterns.jwt.verify.test(line)) {
          inJwtContext = true;
          contextLines = [line];
          this.stats.jwtUsage++;
        } else if (inJwtContext) {
          contextLines.push(line);
          if (line.includes(")") && !line.includes("(")) {
            this.analyzeJwtContext(
              filePath,
              index - contextLines.length + 2,
              contextLines.join("\n"),
            );
            inJwtContext = false;
          }
        }

        // 個別パターンチェック
        this.checkAlgorithm(filePath, line, index + 1);
        this.checkStorage(filePath, line, index + 1);
        this.checkSensitiveData(filePath, line, index + 1);
      });
    } catch (error) {
      // ファイル読み取りエラーは無視
    }
  }

  analyzeJwtContext(filePath, lineNumber, context) {
    const finding = {
      file: filePath,
      line: lineNumber,
      type: "jwt_usage",
      issues: [],
    };

    // アルゴリズムチェック
    if (!patterns.algorithms.safe.test(context)) {
      if (patterns.algorithms.unsafe.test(context)) {
        finding.issues.push({
          severity: "medium",
          message: "HS256等の対称鍵アルゴリズム使用。RS256/ES256推奨",
        });
        this.stats.unsafeAlgorithms++;
      }
    } else {
      this.stats.secureAlgorithms++;
    }

    // alg: none チェック
    if (patterns.algorithms.none.test(context)) {
      finding.issues.push({
        severity: "critical",
        message: "alg: none が検出されました（重大な脆弱性）",
      });
      this.stats.noneAlgorithm++;
    }

    // 有効期限チェック
    if (
      !patterns.expiration.exp.test(context) &&
      !patterns.expiration.expiresIn.test(context)
    ) {
      finding.issues.push({
        severity: "high",
        message: "有効期限（exp/expiresIn）が設定されていない可能性",
      });
      this.stats.missingExpiration++;
    }

    if (finding.issues.length > 0) {
      this.findings.push(finding);
    }
  }

  checkAlgorithm(filePath, line, lineNumber) {
    if (patterns.algorithms.none.test(line) && line.includes("alg")) {
      this.findings.push({
        file: filePath,
        line: lineNumber,
        type: "algorithm",
        issues: [
          {
            severity: "critical",
            message: "alg: none が検出されました",
          },
        ],
      });
      this.stats.noneAlgorithm++;
    }
  }

  checkStorage(filePath, line, lineNumber) {
    if (patterns.storage.localStorage.test(line)) {
      this.findings.push({
        file: filePath,
        line: lineNumber,
        type: "storage",
        issues: [
          {
            severity: "medium",
            message:
              "LocalStorageにトークン保存（XSSリスク）。HttpOnly Cookie推奨",
          },
        ],
      });
      this.stats.unsafeStorage++;
    }
  }

  checkSensitiveData(filePath, line, lineNumber) {
    if (line.includes("jwt.sign") || line.includes("payload")) {
      for (const [dataType, pattern] of Object.entries(patterns.sensitive)) {
        if (pattern.test(line)) {
          this.findings.push({
            file: filePath,
            line: lineNumber,
            type: "sensitive_data",
            issues: [
              {
                severity: "high",
                message: `センシティブデータ（${dataType}）がペイロードに含まれている可能性`,
              },
            ],
          });
          this.stats.sensitiveData++;
        }
      }
    }
  }

  printFindings() {
    console.log(`${colors.cyan}=== 検出結果 ===${colors.reset}\n`);

    // 統計
    console.log(`JWT使用箇所: ${this.stats.jwtUsage}`);
    console.log(
      `安全なアルゴリズム: ${colors.green}${this.stats.secureAlgorithms}${colors.reset}`,
    );
    console.log(
      `安全でないアルゴリズム: ${colors.yellow}${this.stats.unsafeAlgorithms}${colors.reset}`,
    );
    console.log(
      `alg: none 使用: ${colors.red}${this.stats.noneAlgorithm}${colors.reset}`,
    );
    console.log(
      `安全でないストレージ: ${colors.yellow}${this.stats.unsafeStorage}${colors.reset}`,
    );
    console.log(
      `有効期限未設定: ${colors.yellow}${this.stats.missingExpiration}${colors.reset}`,
    );
    console.log(
      `センシティブデータ含有: ${colors.red}${this.stats.sensitiveData}${colors.reset}\n`,
    );

    // Critical issues
    const criticalFindings = this.findings.filter((f) =>
      f.issues.some((i) => i.severity === "critical"),
    );

    if (criticalFindings.length > 0) {
      console.log(
        `${colors.red}🚨 Critical Issues (${criticalFindings.length}):${colors.reset}`,
      );
      criticalFindings.forEach((f) => {
        console.log(`  ${f.file}:${f.line}`);
        f.issues.forEach((issue) => {
          if (issue.severity === "critical") {
            console.log(`    ${issue.message}`);
          }
        });
        console.log();
      });
    }

    // High issues
    const highFindings = this.findings.filter(
      (f) =>
        f.issues.some((i) => i.severity === "high") &&
        !f.issues.some((i) => i.severity === "critical"),
    );

    if (highFindings.length > 0) {
      console.log(
        `${colors.red}⚠️  High Issues (${highFindings.length}):${colors.reset}`,
      );
      highFindings.slice(0, 10).forEach((f) => {
        console.log(`  ${f.file}:${f.line}`);
        f.issues.forEach((issue) => {
          if (issue.severity === "high") {
            console.log(`    ${issue.message}`);
          }
        });
      });
      if (highFindings.length > 10) {
        console.log(`  ... 他 ${highFindings.length - 10} 件\n`);
      } else {
        console.log();
      }
    }

    // 推奨事項
    console.log(`${colors.cyan}=== 推奨事項 ===${colors.reset}\n`);

    console.log(`${colors.green}✅ ベストプラクティス:${colors.reset}`);
    console.log(`  1. RS256/ES256アルゴリズムを使用`);
    console.log(`  2. トークンはHttpOnly Secure Cookieに保存`);
    console.log(`  3. アクセストークン: 15分-1時間の有効期限`);
    console.log(`  4. expクレームを必ず設定`);
    console.log(`  5. センシティブデータをペイロードに含めない`);
    console.log(`  6. jtiクレームでリプレイ攻撃対策\n`);

    // 総合評価
    const totalIssues = this.findings.length;
    if (totalIssues === 0) {
      console.log(
        `${colors.green}✅ トークンセキュリティは良好です${colors.reset}\n`,
      );
    } else {
      console.log(
        `${colors.yellow}検出された問題: ${totalIssues}件${colors.reset}`,
      );
      console.log(`詳細を確認し、修正してください\n`);
    }
  }
}

// メイン実行
const targetDir = process.argv[2] || "./src";

try {
  const checker = new TokenSecurityChecker(targetDir);
  checker.check();
} catch (error) {
  console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
  process.exit(1);
}
