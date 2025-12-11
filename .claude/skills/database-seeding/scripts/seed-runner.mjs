#!/usr/bin/env node

/**
 * シード実行スクリプト
 *
 * 用途:
 * - 環境に応じたシードの実行
 * - シード状態の確認
 * - シードのドライラン
 *
 * 使用方法:
 *   node seed-runner.mjs --env development
 *   node seed-runner.mjs --env development --type master
 *   node seed-runner.mjs --dry-run
 *   node seed-runner.mjs --status
 */

// 設定
const CONFIG = {
  environments: ["development", "test", "staging", "production"],
  seedTypes: ["master", "development", "test", "full"],
};

/**
 * 環境を取得
 */
function getEnvironment() {
  return process.env.NODE_ENV || "development";
}

/**
 * 環境が本番かどうか
 */
function isProduction() {
  return getEnvironment() === "production";
}

/**
 * シードタイプを検証
 */
function validateSeedType(type) {
  if (!CONFIG.seedTypes.includes(type)) {
    throw new Error(
      `Invalid seed type: ${type}. Valid types: ${CONFIG.seedTypes.join(", ")}`,
    );
  }
}

/**
 * 本番環境での確認
 */
async function confirmProduction() {
  if (!isProduction()) {
    return true;
  }

  console.log("\n⚠️  WARNING: You are about to run seeds in PRODUCTION");
  console.log("This action may modify production data.");
  console.log("");

  // Node.jsでの簡易確認（実際の実装ではreadlineを使用）
  console.log("To proceed, set CONFIRM_PRODUCTION=true environment variable");

  return process.env.CONFIRM_PRODUCTION === "true";
}

/**
 * シードのサマリーを表示
 */
function showSeedSummary(env, type, dryRun) {
  console.log("\n📋 Seed Summary");
  console.log("===============");
  console.log(`Environment: ${env}`);
  console.log(`Seed Type: ${type}`);
  console.log(`Dry Run: ${dryRun ? "Yes" : "No"}`);
  console.log(
    `Database: ${process.env.DATABASE_URL ? "(configured)" : "(not configured)"}`,
  );
  console.log("");
}

/**
 * マスターシードの実行（デモ）
 */
function runMasterSeed(dryRun) {
  console.log("🔄 Running master seeds...");

  const masterData = [
    { table: "roles", records: ["admin", "editor", "viewer"] },
    { table: "categories", records: ["electronics", "books", "clothing"] },
    { table: "settings", records: ["app.name", "app.timezone"] },
  ];

  masterData.forEach(({ table, records }) => {
    if (dryRun) {
      console.log(`  [DRY RUN] Would seed ${table}: ${records.length} records`);
    } else {
      console.log(`  ✅ Seeded ${table}: ${records.length} records`);
    }
  });
}

/**
 * 開発シードの実行（デモ）
 */
function runDevelopmentSeed(dryRun) {
  if (isProduction()) {
    console.log("  ⚠️ Skipping development seeds in production");
    return;
  }

  console.log("🔄 Running development seeds...");

  const devData = [
    { table: "users", count: 50 },
    { table: "orders", count: 200 },
    { table: "order_items", count: 600 },
  ];

  devData.forEach(({ table, count }) => {
    if (dryRun) {
      console.log(`  [DRY RUN] Would seed ${table}: ${count} records`);
    } else {
      console.log(`  ✅ Seeded ${table}: ${count} records`);
    }
  });
}

/**
 * テストシードの実行（デモ）
 */
function runTestSeed(dryRun) {
  console.log("🔄 Running test seeds...");

  const testFixtures = [
    "user_with_orders",
    "user_without_orders",
    "cancelled_order",
    "refunded_order",
  ];

  testFixtures.forEach((fixture) => {
    if (dryRun) {
      console.log(`  [DRY RUN] Would create fixture: ${fixture}`);
    } else {
      console.log(`  ✅ Created fixture: ${fixture}`);
    }
  });
}

/**
 * シードの実行
 */
async function runSeeds(options) {
  const { env, type, dryRun } = options;

  showSeedSummary(env, type, dryRun);

  // 本番確認
  if (isProduction()) {
    const confirmed = await confirmProduction();
    if (!confirmed) {
      console.log("❌ Seed cancelled");
      process.exit(1);
    }
  }

  console.log("🚀 Starting seed process...\n");

  try {
    switch (type) {
      case "master":
        runMasterSeed(dryRun);
        break;

      case "development":
        runMasterSeed(dryRun);
        runDevelopmentSeed(dryRun);
        break;

      case "test":
        runMasterSeed(dryRun);
        runTestSeed(dryRun);
        break;

      case "full":
        runMasterSeed(dryRun);
        runDevelopmentSeed(dryRun);
        runTestSeed(dryRun);
        break;
    }

    console.log("\n✅ Seed process completed");

    if (dryRun) {
      console.log("\nℹ️  This was a dry run. No data was actually modified.");
      console.log("   Remove --dry-run to execute the seeds.");
    }
  } catch (error) {
    console.error("\n❌ Seed process failed:", error.message);
    process.exit(1);
  }
}

/**
 * シードステータスの表示
 */
function showStatus() {
  console.log("\n📊 Seed Status");
  console.log("==============");
  console.log(`Environment: ${getEnvironment()}`);
  console.log(
    `Database: ${process.env.DATABASE_URL ? "(configured)" : "(not configured)"}`,
  );
  console.log("");
  console.log("Available seed types:");
  CONFIG.seedTypes.forEach((type) => {
    console.log(`  - ${type}`);
  });
  console.log("");
  console.log("Usage examples:");
  console.log("  node seed-runner.mjs --type master");
  console.log("  node seed-runner.mjs --type development --dry-run");
  console.log("  NODE_ENV=staging node seed-runner.mjs --type full");
}

/**
 * ヘルプを表示
 */
function showHelp() {
  console.log(`
シード実行スクリプト

使用方法:
  node seed-runner.mjs [オプション]

オプション:
  --type <type>     シードタイプ (master, development, test, full)
  --env <env>       環境 (development, test, staging, production)
  --dry-run         実際には実行せずにプレビュー
  --status          現在の状態を表示
  --help            このヘルプを表示

環境変数:
  NODE_ENV          実行環境
  DATABASE_URL      データベース接続文字列
  CONFIRM_PRODUCTION  本番実行の確認 (true/false)

例:
  node seed-runner.mjs --type master
  node seed-runner.mjs --type development --dry-run
  NODE_ENV=staging node seed-runner.mjs --type full
  CONFIRM_PRODUCTION=true NODE_ENV=production node seed-runner.mjs --type master

シードタイプ:
  master       マスターデータのみ（すべての環境で安全）
  development  マスター + 開発用ダミーデータ
  test         マスター + テストフィクスチャ
  full         すべてのシード

注意:
  - 本番環境では master タイプのみ推奨
  - 本番実行には CONFIRM_PRODUCTION=true が必要
`);
}

/**
 * 引数のパース
 */
function parseArgs(args) {
  const options = {
    env: getEnvironment(),
    type: "development",
    dryRun: false,
    showStatus: false,
    showHelp: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--env":
        options.env = args[++i];
        break;
      case "--type":
        options.type = args[++i];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--status":
        options.showStatus = true;
        break;
      case "--help":
        options.showHelp = true;
        break;
    }
  }

  return options;
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (args.length === 0 || options.showHelp) {
    showHelp();
    process.exit(0);
  }

  if (options.showStatus) {
    showStatus();
    process.exit(0);
  }

  try {
    validateSeedType(options.type);
    await runSeeds(options);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
