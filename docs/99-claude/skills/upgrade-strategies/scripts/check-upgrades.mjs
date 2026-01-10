#!/usr/bin/env node

/**
 * アップグレード候補チェックスクリプト
 *
 * 使用方法:
 *   node check-upgrades.mjs [options]
 *
 * オプション:
 *   --security-only   : セキュリティアップデートのみ表示
 *   --major           : Majorアップデートを含める
 *   --json            : JSON形式で出力
 *   --interactive     : インタラクティブモード
 *
 * 例:
 *   node check-upgrades.mjs
 *   node check-upgrades.mjs --security-only
 *   node check-upgrades.mjs --json
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

// コマンドライン引数のパース
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    securityOnly: args.includes("--security-only"),
    includeMajor: args.includes("--major"),
    json: args.includes("--json"),
    interactive: args.includes("--interactive"),
    help: args.includes("--help") || args.includes("-h"),
  };
}

// ヘルプメッセージの表示
function showHelp() {
  console.log(`
アップグレード候補チェックスクリプト

使用方法:
  node check-upgrades.mjs [options]

オプション:
  --security-only   セキュリティアップデートのみ表示
  --major           Majorアップデートを含める
  --json            JSON形式で出力
  --interactive     インタラクティブモード
  --help, -h        このヘルプを表示

例:
  node check-upgrades.mjs
  node check-upgrades.mjs --security-only
  node check-upgrades.mjs --json
`);
}

// パッケージマネージャーの検出
function detectPackageManager() {
  if (existsSync("pnpm-lock.yaml")) return "pnpm";
  if (existsSync("yarn.lock")) return "yarn";
  if (existsSync("package-lock.json")) return "pnpm";
  return "pnpm";
}

// 古いパッケージの取得
function getOutdatedPackages(pm) {
  const commands = {
    pnpm: 'pnpm outdated --format json 2>/dev/null || echo "{}"',
    pnpm: 'pnpm outdated --json 2>/dev/null || echo "{}"',
    yarn: 'yarn outdated --json 2>/dev/null || echo "{}"',
  };

  try {
    const output = execSync(commands[pm], { encoding: "utf8" });
    return JSON.parse(output);
  } catch (error) {
    return {};
  }
}

// セキュリティ脆弱性の取得
function getVulnerabilities(pm) {
  const commands = {
    pnpm: 'pnpm audit --json 2>/dev/null || echo "{}"',
    pnpm: 'pnpm audit --json 2>/dev/null || echo "{}"',
    yarn: 'yarn audit --json 2>/dev/null || echo "{}"',
  };

  try {
    const output = execSync(commands[pm], { encoding: "utf8" });
    return JSON.parse(output);
  } catch (error) {
    return {};
  }
}

// バージョン変更のタイプを判定
function getUpdateType(current, latest) {
  if (!current || !latest) return "unknown";

  const currentParts = current.replace(/^[^\d]*/, "").split(".");
  const latestParts = latest.replace(/^[^\d]*/, "").split(".");

  if (parseInt(latestParts[0]) > parseInt(currentParts[0])) return "major";
  if (parseInt(latestParts[1]) > parseInt(currentParts[1])) return "minor";
  if (parseInt(latestParts[2]) > parseInt(currentParts[2])) return "patch";
  return "unknown";
}

// リスクスコアの計算
function calculateRiskScore(updateType, hasVulnerability) {
  const baseScores = {
    major: 7,
    minor: 3,
    patch: 1,
    unknown: 5,
  };

  let score = baseScores[updateType] || 5;

  // 脆弱性がある場合は優先度を上げる（スコアを下げる）
  if (hasVulnerability) {
    score = Math.max(1, score - 3);
  }

  return score;
}

// 推奨戦略の取得
function getRecommendedStrategy(updateType, hasVulnerability) {
  if (hasVulnerability) {
    return "即座に更新（セキュリティ）";
  }

  const strategies = {
    patch: "自動適用可能",
    minor: "段階的アップグレード",
    major: "計画的アップグレード",
    unknown: "手動確認が必要",
  };

  return strategies[updateType] || "手動確認が必要";
}

// パッケージ情報の整形
function formatPackages(outdated, vulnerabilities, options) {
  const vulnerablePackages = new Set();

  // 脆弱性のあるパッケージを特定
  if (vulnerabilities.advisories) {
    Object.values(vulnerabilities.advisories).forEach((advisory) => {
      vulnerablePackages.add(advisory.module_name);
    });
  }

  const packages = [];

  Object.entries(outdated).forEach(([name, info]) => {
    const current = info.current || info.version;
    const latest = info.latest || info.wanted;
    const updateType = getUpdateType(current, latest);
    const hasVulnerability = vulnerablePackages.has(name);

    // Major を含めない場合はスキップ
    if (!options.includeMajor && updateType === "major") {
      return;
    }

    // セキュリティのみの場合、脆弱性がないパッケージはスキップ
    if (options.securityOnly && !hasVulnerability) {
      return;
    }

    packages.push({
      name,
      current,
      latest,
      updateType,
      hasVulnerability,
      riskScore: calculateRiskScore(updateType, hasVulnerability),
      strategy: getRecommendedStrategy(updateType, hasVulnerability),
    });
  });

  // リスクスコアでソート（低い方が優先度高い）
  packages.sort((a, b) => a.riskScore - b.riskScore);

  return packages;
}

// コンソール出力
function printReport(packages, vulnerabilities, pm) {
  console.log("\n========================================");
  console.log("依存関係アップグレードレポート");
  console.log("========================================\n");

  console.log(`パッケージマネージャー: ${pm}`);
  console.log(`更新可能なパッケージ: ${packages.length}件`);
  console.log("");

  // サマリー
  const summary = {
    patch: packages.filter((p) => p.updateType === "patch").length,
    minor: packages.filter((p) => p.updateType === "minor").length,
    major: packages.filter((p) => p.updateType === "major").length,
    security: packages.filter((p) => p.hasVulnerability).length,
  };

  console.log("サマリー:");
  console.log(`  🟢 Patch: ${summary.patch}件`);
  console.log(`  🟡 Minor: ${summary.minor}件`);
  console.log(`  🔴 Major: ${summary.major}件`);
  console.log(`  🔒 セキュリティ: ${summary.security}件`);
  console.log("");

  // 詳細リスト
  if (packages.length > 0) {
    console.log("========================================");
    console.log("詳細");
    console.log("========================================\n");

    // セキュリティ関連を先に表示
    const securityPackages = packages.filter((p) => p.hasVulnerability);
    if (securityPackages.length > 0) {
      console.log("🔒 セキュリティアップデート（優先）:");
      securityPackages.forEach((pkg) => {
        console.log(`  - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
        console.log(`    戦略: ${pkg.strategy}`);
      });
      console.log("");
    }

    // その他の更新
    const otherPackages = packages.filter((p) => !p.hasVulnerability);
    if (otherPackages.length > 0) {
      console.log("📦 その他の更新:");
      otherPackages.forEach((pkg) => {
        const icon =
          pkg.updateType === "patch"
            ? "🟢"
            : pkg.updateType === "minor"
              ? "🟡"
              : "🔴";
        console.log(`  ${icon} ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
        console.log(`    タイプ: ${pkg.updateType}, 戦略: ${pkg.strategy}`);
      });
    }
  }

  // 推奨アクション
  console.log("\n========================================");
  console.log("推奨アクション");
  console.log("========================================\n");

  if (summary.security > 0) {
    console.log("1. セキュリティアップデートを即座に適用:");
    console.log("   pnpm audit --fix");
    console.log("");
  }

  if (summary.patch > 0) {
    console.log("2. Patchアップデートを適用:");
    console.log("   pnpm update");
    console.log("");
  }

  if (summary.minor > 0) {
    console.log("3. Minorアップデートを段階的に適用:");
    console.log("   pnpm update --latest");
    console.log("");
  }

  if (summary.major > 0) {
    console.log("4. Majorアップデートは計画的に対応:");
    console.log("   各パッケージのCHANGELOGを確認してください");
    console.log("");
  }

  console.log("");
}

// メイン処理
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // パッケージマネージャーの検出
  const pm = detectPackageManager();

  // package.jsonの存在確認
  if (!existsSync("package.json")) {
    console.error("エラー: package.json が見つかりません");
    process.exit(1);
  }

  console.log("依存関係をチェック中...\n");

  // 情報の取得
  const outdated = getOutdatedPackages(pm);
  const vulnerabilities = getVulnerabilities(pm);

  // パッケージの整形
  const packages = formatPackages(outdated, vulnerabilities, options);

  // 出力
  if (options.json) {
    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          packageManager: pm,
          packages,
          summary: {
            total: packages.length,
            patch: packages.filter((p) => p.updateType === "patch").length,
            minor: packages.filter((p) => p.updateType === "minor").length,
            major: packages.filter((p) => p.updateType === "major").length,
            security: packages.filter((p) => p.hasVulnerability).length,
          },
        },
        null,
        2,
      ),
    );
  } else {
    printReport(packages, vulnerabilities, pm);
  }

  // 終了コード
  const hasSecurityIssues = packages.some((p) => p.hasVulnerability);
  process.exit(hasSecurityIssues ? 1 : 0);
}

main().catch((error) => {
  console.error("エラーが発生しました:", error);
  process.exit(1);
});
