#!/usr/bin/env node

/**
 * セッション設定検証スクリプト
 *
 * 目的: Express/Next.jsアプリケーションのセッション設定を検証し、
 *       セキュリティベストプラクティスへの準拠を確認する
 *
 * 使用方法:
 *   node validate-session-config.mjs <target-file>
 *
 * チェック項目:
 *   - HttpOnly、Secure、SameSite属性
 *   - セッションシークレットの強度
 *   - 有効期限設定
 *   - セッションストア設定
 */

import { readFileSync, existsSync } from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;

function showHelp() {
  console.log(`
セッション設定検証

Usage:
  node validate-session-config.mjs <target-file>

Options:
  -h, --help    このヘルプを表示
  `);
}

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const patterns = {
  sessionConfig: /session\s*\(\s*\{/,
  cookieConfig: /cookie\s*:\s*\{/,
  httpOnly: /httpOnly\s*:\s*(true|false)/,
  secure: /secure\s*:\s*(true|false)/,
  sameSite: /sameSite\s*:\s*['"]?(strict|lax|none)['"]?/i,
  secret: /secret\s*:\s*['"](.+?)['"]/,
  maxAge: /maxAge\s*:\s*(\d+)/,
  store: /store\s*:\s*new\s+(\w+)/,
};

class SessionConfigValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.issues = [];
    this.config = {
      httpOnly: null,
      secure: null,
      sameSite: null,
      secret: null,
      maxAge: null,
      store: null,
    };
  }

  validate() {
    console.log(`${colors.cyan}=== セッション設定検証 ===${colors.reset}\n`);
    console.log(`対象ファイル: ${this.filePath}\n`);

    try {
      const content = readFileSync(this.filePath, "utf-8");
      this.parseConfig(content);
      this.checkSecurity();
      this.printResults();
    } catch (error) {
      console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  parseConfig(content) {
    const lines = content.split("\n");
    let inSessionConfig = false;
    let inCookieConfig = false;

    lines.forEach((line, index) => {
      if (patterns.sessionConfig.test(line)) {
        inSessionConfig = true;
      }

      if (inSessionConfig) {
        // Cookie設定
        if (patterns.cookieConfig.test(line)) {
          inCookieConfig = true;
        }

        if (inCookieConfig) {
          this.extractCookieSettings(line, index + 1);
        }

        // Secret
        const secretMatch = line.match(patterns.secret);
        if (secretMatch) {
          this.config.secret = secretMatch[1];
        }

        // Store
        const storeMatch = line.match(patterns.store);
        if (storeMatch) {
          this.config.store = storeMatch[1];
        }

        // セッション設定終了
        if (line.includes("})") || line.includes("]);")) {
          inSessionConfig = false;
          inCookieConfig = false;
        }
      }
    });
  }

  extractCookieSettings(line, lineNumber) {
    // HttpOnly
    const httpOnlyMatch = line.match(patterns.httpOnly);
    if (httpOnlyMatch) {
      this.config.httpOnly = httpOnlyMatch[1] === "true";
    }

    // Secure
    const secureMatch = line.match(patterns.secure);
    if (secureMatch) {
      this.config.secure = secureMatch[1] === "true";
    }

    // SameSite
    const sameSiteMatch = line.match(patterns.sameSite);
    if (sameSiteMatch) {
      this.config.sameSite = sameSiteMatch[1].toLowerCase();
    }

    // MaxAge
    const maxAgeMatch = line.match(patterns.maxAge);
    if (maxAgeMatch) {
      this.config.maxAge = parseInt(maxAgeMatch[1], 10);
    }
  }

  checkSecurity() {
    // HttpOnly チェック
    if (this.config.httpOnly !== true) {
      this.issues.push({
        severity: "high",
        attribute: "httpOnly",
        message:
          "httpOnly: true が設定されていません（XSS攻撃でトークン窃取可能）",
      });
    }

    // Secure チェック
    if (this.config.secure !== true) {
      this.issues.push({
        severity: "high",
        attribute: "secure",
        message: "secure: true が設定されていません（HTTP通信でトークン漏洩）",
      });
    }

    // SameSite チェック
    if (!this.config.sameSite) {
      this.issues.push({
        severity: "medium",
        attribute: "sameSite",
        message: "sameSite属性が設定されていません（CSRF脆弱性）。strict推奨",
      });
    } else if (this.config.sameSite === "none") {
      this.issues.push({
        severity: "medium",
        attribute: "sameSite",
        message: "sameSite: none は避けてください。strict または lax 推奨",
      });
    }

    // Secret チェック
    if (this.config.secret) {
      if (this.config.secret.length < 32) {
        this.issues.push({
          severity: "high",
          attribute: "secret",
          message: `セッションシークレットが短すぎます（${this.config.secret.length}文字）。32文字以上推奨`,
        });
      }

      if (
        this.config.secret === "secret" ||
        this.config.secret === "your-secret-key"
      ) {
        this.issues.push({
          severity: "critical",
          attribute: "secret",
          message:
            "デフォルトシークレットが使用されています。強力なランダム値に変更してください",
        });
      }

      if (!this.config.secret.startsWith("process.env")) {
        this.issues.push({
          severity: "medium",
          attribute: "secret",
          message:
            "シークレットがハードコードされています。環境変数を使用してください",
        });
      }
    }

    // MaxAge チェック
    if (this.config.maxAge) {
      const hours = this.config.maxAge / (1000 * 60 * 60);
      if (hours > 24) {
        this.issues.push({
          severity: "low",
          attribute: "maxAge",
          message: `セッション有効期限が長すぎます（${hours.toFixed(1)}時間）。24時間以内推奨`,
        });
      }
    }

    // Store チェック
    if (!this.config.store || this.config.store === "MemoryStore") {
      this.issues.push({
        severity: "low",
        attribute: "store",
        message: "本番環境ではRedisStore等の永続ストアを使用してください",
      });
    }
  }

  printResults() {
    console.log(`${colors.cyan}=== 設定内容 ===${colors.reset}\n`);

    console.log(`HttpOnly: ${this.formatBool(this.config.httpOnly)}`);
    console.log(`Secure: ${this.formatBool(this.config.secure)}`);
    console.log(
      `SameSite: ${this.config.sameSite || colors.yellow + "未設定" + colors.reset}`,
    );
    console.log(
      `Secret: ${this.config.secret ? (this.config.secret.startsWith("process.env") ? colors.green + "環境変数" + colors.reset : colors.yellow + "ハードコード" + colors.reset) : colors.red + "未設定" + colors.reset}`,
    );
    console.log(
      `MaxAge: ${this.config.maxAge ? (this.config.maxAge / 1000 / 60 / 60).toFixed(1) + "時間" : colors.yellow + "未設定" + colors.reset}`,
    );
    console.log(
      `Store: ${this.config.store || colors.yellow + "デフォルト（MemoryStore）" + colors.reset}\n`,
    );

    // Issues
    if (this.issues.length === 0) {
      console.log(
        `${colors.green}✅ セキュリティ設定は良好です${colors.reset}\n`,
      );
      return;
    }

    console.log(
      `${colors.cyan}=== 検出された問題 (${this.issues.length}) ===${colors.reset}\n`,
    );

    const critical = this.issues.filter((i) => i.severity === "critical");
    const high = this.issues.filter((i) => i.severity === "high");
    const medium = this.issues.filter((i) => i.severity === "medium");
    const low = this.issues.filter((i) => i.severity === "low");

    if (critical.length > 0) {
      console.log(
        `${colors.red}🚨 Critical (${critical.length}):${colors.reset}`,
      );
      critical.forEach((i) => console.log(`  - ${i.message}`));
      console.log();
    }

    if (high.length > 0) {
      console.log(`${colors.red}⚠️  High (${high.length}):${colors.reset}`);
      high.forEach((i) => console.log(`  - ${i.message}`));
      console.log();
    }

    if (medium.length > 0) {
      console.log(
        `${colors.yellow}⚠️  Medium (${medium.length}):${colors.reset}`,
      );
      medium.forEach((i) => console.log(`  - ${i.message}`));
      console.log();
    }

    if (low.length > 0) {
      console.log(`${colors.yellow}ℹ️  Low (${low.length}):${colors.reset}`);
      low.forEach((i) => console.log(`  - ${i.message}`));
      console.log();
    }

    // 推奨設定例
    console.log(`${colors.cyan}=== 推奨設定例 ===${colors.reset}\n`);
    console.log(`${colors.green}app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000  // 1時間
  }
}));${colors.reset}\n`);
  }

  formatBool(value) {
    if (value === true) return colors.green + "true" + colors.reset;
    if (value === false) return colors.red + "false" + colors.reset;
    return colors.yellow + "未設定" + colors.reset;
  }
}

// メイン実行
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  showHelp();
  process.exit(EXIT_SUCCESS);
}

if (args.length !== 1) {
  console.error(
    `${colors.red}Error: target file is required${colors.reset}`,
  );
  showHelp();
  process.exit(EXIT_ARGS_ERROR);
}

const targetFile = args[0];
if (targetFile.startsWith("-")) {
  console.error(`${colors.red}Error: invalid target file${colors.reset}`);
  showHelp();
  process.exit(EXIT_ARGS_ERROR);
}

if (!existsSync(targetFile)) {
  console.error(
    `${colors.red}Error: target file not found: ${targetFile}${colors.reset}`,
  );
  process.exit(EXIT_FILE_MISSING);
}

try {
  const validator = new SessionConfigValidator(targetFile);
  validator.validate();
  process.exit(EXIT_SUCCESS);
} catch (error) {
  console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
  process.exit(EXIT_ERROR);
}
