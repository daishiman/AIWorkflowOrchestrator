#!/usr/bin/env node

/**
 * シークレット管理アーキテクチャ検証スクリプト
 *
 * アーキテクチャ設計がセキュリティベストプラクティスと
 * コンプライアンス要件を満たしているかを検証します。
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_VALIDATION_FAILED = 4;

function showHelp() {
  console.log(`
Usage: node validate-architecture.mjs [options]

Options:
  --config <path>     アーキテクチャ設計書のパス（YAML/JSON）
  --level <1-4>       検証レベル（1: 基本, 4: エンタープライズ）
  --format <format>   出力形式（text, json, markdown）
  -h, --help          このヘルプを表示

Examples:
  node validate-architecture.mjs --config architecture.yaml
  node validate-architecture.mjs --config design.json --level 3 --format json
  `);
}

// 検証ルール定義
const VALIDATION_RULES = {
  security: [
    {
      id: "SEC-001",
      level: 1,
      name: "暗号化必須",
      check: (config) => config.encryption?.enabled === true,
      message: "保存時暗号化が有効になっていません",
    },
    {
      id: "SEC-002",
      level: 1,
      name: "TLS必須",
      check: (config) => config.tls?.version >= "1.2",
      message: "TLS 1.2以上が設定されていません",
    },
    {
      id: "SEC-003",
      level: 2,
      name: "RBAC実装",
      check: (config) => config.accessControl?.type === "rbac",
      message: "RBACが設定されていません",
    },
    {
      id: "SEC-004",
      level: 2,
      name: "監査ログ",
      check: (config) => config.audit?.enabled === true,
      message: "監査ログが有効になっていません",
    },
    {
      id: "SEC-005",
      level: 3,
      name: "HSM/KMS使用",
      check: (config) =>
        config.keyManagement?.backend === "hsm" ||
        config.keyManagement?.backend === "kms",
      message: "Critical分類にHSM/KMSが使用されていません",
    },
    {
      id: "SEC-006",
      level: 3,
      name: "MFA必須",
      check: (config) => config.authentication?.mfa?.required === true,
      message: "管理者アクセスにMFAが設定されていません",
    },
    {
      id: "SEC-007",
      level: 4,
      name: "ゼロトラスト",
      check: (config) => config.zeroTrust?.enabled === true,
      message: "ゼロトラストアーキテクチャが実装されていません",
    },
  ],
  rotation: [
    {
      id: "ROT-001",
      level: 1,
      name: "ローテーション計画",
      check: (config) => config.rotation?.enabled === true,
      message: "ローテーション計画が設定されていません",
    },
    {
      id: "ROT-002",
      level: 2,
      name: "自動ローテーション",
      check: (config) => config.rotation?.automated === true,
      message: "自動ローテーションが設定されていません",
    },
    {
      id: "ROT-003",
      level: 3,
      name: "Critical周期",
      check: (config) => (config.rotation?.critical?.days || 999) <= 30,
      message: "Criticalシークレットの周期が30日を超えています",
    },
  ],
  highAvailability: [
    {
      id: "HA-001",
      level: 2,
      name: "冗長性",
      check: (config) => (config.cluster?.replicas || 0) >= 3,
      message: "クラスターレプリカが3未満です",
    },
    {
      id: "HA-002",
      level: 3,
      name: "マルチリージョン",
      check: (config) => (config.regions?.length || 0) >= 2,
      message: "マルチリージョン構成ではありません",
    },
    {
      id: "HA-003",
      level: 3,
      name: "災害復旧",
      check: (config) => config.disasterRecovery?.enabled === true,
      message: "災害復旧計画が設定されていません",
    },
  ],
  compliance: [
    {
      id: "CMP-001",
      level: 2,
      name: "ログ保持",
      check: (config) => (config.audit?.retentionDays || 0) >= 365,
      message: "監査ログ保持期間が1年未満です",
    },
    {
      id: "CMP-002",
      level: 3,
      name: "不変ログ",
      check: (config) => config.audit?.immutable === true,
      message: "監査ログの不変性が保証されていません",
    },
  ],
};

function parseConfig(configPath) {
  if (!existsSync(configPath)) {
    throw new Error(`設定ファイルが見つかりません: ${configPath}`);
  }

  const content = readFileSync(configPath, "utf-8");

  if (configPath.endsWith(".json")) {
    return JSON.parse(content);
  } else if (configPath.endsWith(".yaml") || configPath.endsWith(".yml")) {
    // 簡易YAMLパーサー（基本的なキー: 値形式のみ対応）
    const result = {};
    const lines = content.split("\n");
    let currentSection = result;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const indent = line.search(/\S/);
      const match = trimmed.match(/^(\w+):\s*(.*)$/);

      if (match) {
        const [, key, value] = match;
        if (value === "") {
          currentSection[key] = {};
          currentSection = currentSection[key];
        } else {
          let parsedValue = value;
          if (value === "true") parsedValue = true;
          else if (value === "false") parsedValue = false;
          else if (/^\d+$/.test(value)) parsedValue = parseInt(value, 10);
          else if (/^\d+\.\d+$/.test(value)) parsedValue = parseFloat(value);

          currentSection[key] = parsedValue;
        }
      }
    }

    return result;
  }

  throw new Error(`未対応のファイル形式: ${configPath}`);
}

function validate(config, level) {
  const results = {
    passed: [],
    failed: [],
    skipped: [],
  };

  for (const category of Object.keys(VALIDATION_RULES)) {
    for (const rule of VALIDATION_RULES[category]) {
      if (rule.level > level) {
        results.skipped.push({
          ...rule,
          category,
          reason: `Level ${rule.level}以上で検証`,
        });
        continue;
      }

      try {
        const passed = rule.check(config);
        if (passed) {
          results.passed.push({ ...rule, category });
        } else {
          results.failed.push({ ...rule, category });
        }
      } catch (err) {
        results.failed.push({
          ...rule,
          category,
          error: err.message,
        });
      }
    }
  }

  return results;
}

function formatText(results, level) {
  const lines = [];

  lines.push("=".repeat(60));
  lines.push("シークレット管理アーキテクチャ検証レポート");
  lines.push("=".repeat(60));
  lines.push(`検証レベル: ${level}`);
  lines.push(`検証日時: ${new Date().toISOString()}`);
  lines.push("");

  // サマリー
  lines.push("## サマリー");
  lines.push(`✅ 合格: ${results.passed.length}`);
  lines.push(`❌ 不合格: ${results.failed.length}`);
  lines.push(`⏭️ スキップ: ${results.skipped.length}`);
  lines.push("");

  // 不合格項目
  if (results.failed.length > 0) {
    lines.push("## 不合格項目");
    for (const item of results.failed) {
      lines.push(`❌ [${item.id}] ${item.name}`);
      lines.push(`   カテゴリ: ${item.category}`);
      lines.push(`   問題: ${item.message}`);
      if (item.error) {
        lines.push(`   エラー: ${item.error}`);
      }
      lines.push("");
    }
  }

  // 合格項目
  if (results.passed.length > 0) {
    lines.push("## 合格項目");
    for (const item of results.passed) {
      lines.push(`✅ [${item.id}] ${item.name}`);
    }
    lines.push("");
  }

  // 結論
  lines.push("=".repeat(60));
  if (results.failed.length === 0) {
    lines.push("✅ すべての検証に合格しました");
  } else {
    lines.push(`❌ ${results.failed.length}件の問題が検出されました`);
  }
  lines.push("=".repeat(60));

  return lines.join("\n");
}

function formatJson(results, level) {
  return JSON.stringify(
    {
      level,
      timestamp: new Date().toISOString(),
      summary: {
        passed: results.passed.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
      results,
    },
    null,
    2,
  );
}

function formatMarkdown(results, level) {
  const lines = [];

  lines.push("# シークレット管理アーキテクチャ検証レポート");
  lines.push("");
  lines.push(`- **検証レベル**: ${level}`);
  lines.push(`- **検証日時**: ${new Date().toISOString()}`);
  lines.push("");

  lines.push("## サマリー");
  lines.push("");
  lines.push("| 結果 | 件数 |");
  lines.push("| ---- | ---- |");
  lines.push(`| ✅ 合格 | ${results.passed.length} |`);
  lines.push(`| ❌ 不合格 | ${results.failed.length} |`);
  lines.push(`| ⏭️ スキップ | ${results.skipped.length} |`);
  lines.push("");

  if (results.failed.length > 0) {
    lines.push("## 不合格項目");
    lines.push("");
    lines.push("| ID | 名前 | カテゴリ | 問題 |");
    lines.push("| -- | ---- | -------- | ---- |");
    for (const item of results.failed) {
      lines.push(
        `| ${item.id} | ${item.name} | ${item.category} | ${item.message} |`,
      );
    }
    lines.push("");
  }

  if (results.passed.length > 0) {
    lines.push("## 合格項目");
    lines.push("");
    lines.push("| ID | 名前 | カテゴリ |");
    lines.push("| -- | ---- | -------- |");
    for (const item of results.passed) {
      lines.push(`| ${item.id} | ${item.name} | ${item.category} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const configPath = getArg("--config");
  const level = parseInt(getArg("--level") || "2", 10);
  const format = getArg("--format") || "text";

  if (!configPath) {
    // デモモード：サンプル設定で検証
    console.log(
      "注意: --config が指定されていません。デモモードで実行します。",
    );
    console.log("");

    const demoConfig = {
      encryption: { enabled: true },
      tls: { version: "1.3" },
      accessControl: { type: "rbac" },
      audit: { enabled: true, retentionDays: 365, immutable: false },
      rotation: { enabled: true, automated: true, critical: { days: 30 } },
      cluster: { replicas: 3 },
      authentication: { mfa: { required: true } },
      keyManagement: { backend: "kms" },
    };

    const results = validate(demoConfig, level);

    switch (format) {
      case "json":
        console.log(formatJson(results, level));
        break;
      case "markdown":
        console.log(formatMarkdown(results, level));
        break;
      default:
        console.log(formatText(results, level));
    }

    process.exit(
      results.failed.length > 0 ? EXIT_VALIDATION_FAILED : EXIT_SUCCESS,
    );
  }

  if (level < 1 || level > 4) {
    console.error("Error: --level は 1-4 の範囲で指定してください");
    process.exit(EXIT_ARGS_ERROR);
  }

  try {
    const config = parseConfig(configPath);
    const results = validate(config, level);

    switch (format) {
      case "json":
        console.log(formatJson(results, level));
        break;
      case "markdown":
        console.log(formatMarkdown(results, level));
        break;
      default:
        console.log(formatText(results, level));
    }

    process.exit(
      results.failed.length > 0 ? EXIT_VALIDATION_FAILED : EXIT_SUCCESS,
    );
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
