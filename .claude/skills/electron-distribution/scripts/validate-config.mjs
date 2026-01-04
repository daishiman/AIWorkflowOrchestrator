#!/usr/bin/env node

/**
 * electron-builder設定検証スクリプト
 *
 * electron-builder/electron-updater設定がベストプラクティスに準拠しているか検証
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般エラー
 *   2: 引数エラー
 *   3: ファイル不在
 *   4: 検証失敗
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const HELP = `
Usage: node validate-config.mjs [options]

Options:
  --config <path>    package.jsonまたはelectron-builder.jsonのパス
  --strict           厳格モード（警告もエラー扱い）
  -h, --help         このヘルプを表示

Examples:
  node validate-config.mjs --config package.json
  node validate-config.mjs --config electron-builder.json --strict
`;

function parseArgs(args) {
  const result = { config: null, strict: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "-h":
      case "--help":
        console.log(HELP);
        process.exit(0);
      case "--config":
        result.config = args[++i];
        break;
      case "--strict":
        result.strict = true;
        break;
    }
  }

  return result;
}

function validateConfig(config, strict) {
  const errors = [];
  const warnings = [];

  // build設定の存在確認
  const buildConfig = config.build || config;

  if (!buildConfig.appId) {
    errors.push("appId が設定されていません");
  }

  if (!buildConfig.productName) {
    warnings.push("productName が設定されていません（appIdから推測されます）");
  }

  // macOS設定の検証
  if (buildConfig.mac) {
    if (!buildConfig.mac.category) {
      warnings.push("mac.category が設定されていません");
    }
    if (buildConfig.mac.hardenedRuntime === false) {
      errors.push("mac.hardenedRuntime は true である必要があります");
    }
    if (!buildConfig.mac.entitlements) {
      warnings.push("mac.entitlements が設定されていません");
    }
  }

  // Windows設定の検証
  if (buildConfig.win) {
    if (!buildConfig.win.target) {
      warnings.push("win.target が設定されていません");
    }
  }

  // 自動更新設定の検証
  if (buildConfig.publish) {
    const publish = Array.isArray(buildConfig.publish)
      ? buildConfig.publish[0]
      : buildConfig.publish;

    if (!publish.provider) {
      errors.push("publish.provider が設定されていません");
    }

    if (publish.provider === "github") {
      if (!publish.owner || !publish.repo) {
        errors.push("GitHubプロバイダにはowner/repoが必要です");
      }
    }
  }

  // ディレクトリ設定の検証
  if (!buildConfig.directories?.output) {
    warnings.push(
      "directories.output が設定されていません（デフォルト: dist）",
    );
  }

  return { errors, warnings };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.config) {
    console.error("エラー: --config オプションは必須です");
    console.log(HELP);
    process.exit(2);
  }

  const configPath = resolve(args.config);

  if (!existsSync(configPath)) {
    console.error(`エラー: ファイルが見つかりません: ${configPath}`);
    process.exit(3);
  }

  let config;
  try {
    const content = readFileSync(configPath, "utf-8");
    config = JSON.parse(content);
  } catch (error) {
    console.error(`エラー: 設定ファイルの読み込みに失敗: ${error.message}`);
    process.exit(1);
  }

  console.log(`検証中: ${configPath}`);
  console.log("=".repeat(50));

  const { errors, warnings } = validateConfig(config, args.strict);

  // 結果表示
  if (warnings.length > 0) {
    console.log("\n⚠️  警告:");
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.log("\n❌ エラー:");
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  // 判定
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (hasErrors || (args.strict && hasWarnings)) {
    console.log("\n検証結果: 失敗");
    process.exit(4);
  }

  console.log("\n✅ 検証結果: 成功");
  process.exit(0);
}

main();
