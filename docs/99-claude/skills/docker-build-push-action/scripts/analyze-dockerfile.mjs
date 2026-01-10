#!/usr/bin/env node

/**
 * Dockerfile分析スクリプト
 *
 * 機能:
 * - Dockerfile構文チェック
 * - ベストプラクティス検証
 * - レイヤーキャッシュ最適化提案
 * - セキュリティ問題検出
 * - マルチステージビルド分析
 *
 * 使用法:
 *   node analyze-dockerfile.mjs <Dockerfile>
 *   node analyze-dockerfile.mjs Dockerfile
 *   node analyze-dockerfile.mjs backend/Dockerfile
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function colorize(color, text) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function analyzeDockerfile(dockerfilePath) {
  console.log(colorize("cyan", "\n=== Dockerfile分析 ===\n"));
  console.log(`対象: ${dockerfilePath}\n`);

  // ファイル読み込み
  let content;
  try {
    content = readFileSync(dockerfilePath, "utf-8");
  } catch (error) {
    console.error(
      colorize("red", `エラー: ファイルを読み込めません: ${error.message}`),
    );
    process.exit(1);
  }

  const lines = content.split("\n");
  const issues = [];
  const suggestions = [];
  const info = {
    stages: [],
    baseImages: [],
    copyInstructions: [],
    runInstructions: [],
    exposeInstructions: [],
    envInstructions: [],
    hasHealthcheck: false,
    hasUser: false,
    hasWorkdir: false,
  };

  // 行ごとに解析
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) return;

    // FROM命令の解析
    if (trimmed.startsWith("FROM")) {
      const match = trimmed.match(/FROM\s+([^\s]+)(?:\s+AS\s+(\S+))?/i);
      if (match) {
        const [, baseImage, stageName] = match;
        info.baseImages.push({ lineNum, image: baseImage });
        if (stageName) {
          info.stages.push({ lineNum, name: stageName, image: baseImage });
        }

        // ベースイメージのベストプラクティス
        if (baseImage.includes(":latest")) {
          issues.push({
            line: lineNum,
            severity: "warning",
            message:
              'ベースイメージに":latest"タグを使用しています。バージョン固定を推奨します。',
            suggestion: `具体的なバージョン（例: node:20-alpine）を指定してください。`,
          });
        }

        if (!baseImage.includes("alpine") && !baseImage.includes("slim")) {
          suggestions.push({
            line: lineNum,
            message: `軽量イメージ（alpine、slim）の使用を検討してください。現在: ${baseImage}`,
          });
        }
      }
    }

    // RUN命令の解析
    if (trimmed.startsWith("RUN")) {
      info.runInstructions.push({ lineNum, command: trimmed });

      // apt-get/yum/apkのキャッシュクリア確認
      if (
        trimmed.match(/apt-get\s+install/) &&
        !trimmed.includes("rm -rf /var/lib/apt/lists")
      ) {
        issues.push({
          line: lineNum,
          severity: "warning",
          message: "apt-getキャッシュがクリアされていません。",
          suggestion:
            "RUN apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*",
        });
      }

      // 複数RUNの連結提案
      const prevLine = index > 0 ? lines[index - 1].trim() : "";
      if (prevLine.startsWith("RUN") && !prevLine.endsWith("\\")) {
        suggestions.push({
          line: lineNum,
          message: "連続するRUN命令は&&で連結してレイヤー数を削減できます。",
        });
      }

      // Secretsの不適切な使用検出
      if (
        trimmed.match(/PASSWORD|TOKEN|SECRET|KEY/) &&
        !trimmed.includes("--mount=type=secret")
      ) {
        issues.push({
          line: lineNum,
          severity: "error",
          message: "Secretsが平文で含まれている可能性があります。",
          suggestion:
            "BuildKit Secretsを使用: RUN --mount=type=secret,id=TOKEN ...",
        });
      }
    }

    // COPY/ADD命令の解析
    if (trimmed.match(/^(COPY|ADD)\s/)) {
      info.copyInstructions.push({ lineNum, instruction: trimmed });

      // ADDよりCOPYを推奨
      if (trimmed.startsWith("ADD") && !trimmed.includes(".tar")) {
        issues.push({
          line: lineNum,
          severity: "warning",
          message: "ADDの代わりにCOPYの使用を推奨します（tarファイル以外）。",
          suggestion: trimmed.replace("ADD", "COPY"),
        });
      }

      // COPY . の早期使用警告
      if (trimmed.match(/COPY\s+\.\s+/) && index < lines.length / 2) {
        issues.push({
          line: lineNum,
          severity: "warning",
          message:
            "COPY . が早い段階で実行されています。キャッシュ効率が低下します。",
          suggestion:
            "依存関係ファイル（package.json等）を先にコピーし、インストール後にソースコードをコピーしてください。",
        });
      }
    }

    // EXPOSE命令
    if (trimmed.startsWith("EXPOSE")) {
      const match = trimmed.match(/EXPOSE\s+(\d+)/);
      if (match) {
        info.exposeInstructions.push({ lineNum, port: match[1] });
      }
    }

    // ENV命令
    if (trimmed.startsWith("ENV")) {
      info.envInstructions.push({ lineNum, env: trimmed });
    }

    // HEALTHCHECK命令
    if (trimmed.startsWith("HEALTHCHECK")) {
      info.hasHealthcheck = true;
    }

    // USER命令
    if (trimmed.startsWith("USER")) {
      info.hasUser = true;
      if (trimmed.includes("root")) {
        issues.push({
          line: lineNum,
          severity: "error",
          message: "rootユーザーの使用は推奨されません。",
          suggestion: "非rootユーザーを作成して使用してください。",
        });
      }
    }

    // WORKDIR命令
    if (trimmed.startsWith("WORKDIR")) {
      info.hasWorkdir = true;
    }
  });

  // 全体的なベストプラクティスチェック
  if (!info.hasWorkdir) {
    issues.push({
      line: 0,
      severity: "warning",
      message: "WORKDIRが指定されていません。",
      suggestion:
        "WORKDIR /appなどの明示的なワーキングディレクトリを設定してください。",
    });
  }

  if (!info.hasUser) {
    issues.push({
      line: 0,
      severity: "warning",
      message: "USERが指定されていません（rootユーザーで実行されます）。",
      suggestion:
        "セキュリティのため非rootユーザーを作成して使用してください。",
    });
  }

  if (!info.hasHealthcheck && info.exposeInstructions.length > 0) {
    suggestions.push({
      line: 0,
      message: "HEALTHCHECKの追加を検討してください。",
    });
  }

  if (info.stages.length === 0 && info.baseImages.length === 1) {
    suggestions.push({
      line: 0,
      message:
        "マルチステージビルドの使用を検討してください。最終イメージサイズを削減できます。",
    });
  }

  // レイヤーキャッシュ最適化の提案
  const copyBeforeRun = info.copyInstructions.some((copy) =>
    info.runInstructions.some((run) => run.lineNum > copy.lineNum),
  );
  if (copyBeforeRun) {
    suggestions.push({
      line: 0,
      message:
        "レイヤーキャッシュ最適化: 依存関係ファイル（package.json等）のコピーとインストールをソースコードコピーより前に配置してください。",
    });
  }

  // 結果出力
  printResults(issues, suggestions, info);
}

function printResults(issues, suggestions, info) {
  // エラー
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    console.log(colorize("red", `🚨 エラー (${errors.length}件):\n`));
    errors.forEach((issue) => {
      console.log(colorize("red", `  ✗ 行${issue.line}: ${issue.message}`));
      if (issue.suggestion) {
        console.log(`    💡 ${issue.suggestion}\n`);
      }
    });
  }

  // 警告
  const warnings = issues.filter((i) => i.severity === "warning");
  if (warnings.length > 0) {
    console.log(colorize("yellow", `⚠️  警告 (${warnings.length}件):\n`));
    warnings.forEach((issue) => {
      console.log(
        colorize("yellow", `  ⚠ 行${issue.line || "N/A"}: ${issue.message}`),
      );
      if (issue.suggestion) {
        console.log(`    💡 ${issue.suggestion}\n`);
      }
    });
  }

  // 提案
  if (suggestions.length > 0) {
    console.log(colorize("blue", `💡 改善提案 (${suggestions.length}件):\n`));
    suggestions.forEach((suggestion) => {
      console.log(
        colorize(
          "blue",
          `  ℹ️ 行${suggestion.line || "N/A"}: ${suggestion.message}\n`,
        ),
      );
    });
  }

  // サマリー
  console.log(colorize("cyan", "=== サマリー ===\n"));
  console.log(`ベースイメージ数: ${info.baseImages.length}`);
  info.baseImages.forEach((img) => {
    console.log(`  - ${img.image} (行${img.lineNum})`);
  });

  if (info.stages.length > 0) {
    console.log(
      `\nマルチステージビルド: ${colorize("green", "あり")} (${info.stages.length}ステージ)`,
    );
    info.stages.forEach((stage) => {
      console.log(`  - ${stage.name}: ${stage.image} (行${stage.lineNum})`);
    });
  } else {
    console.log(`\nマルチステージビルド: ${colorize("yellow", "なし")}`);
  }

  console.log(`\nRUN命令: ${info.runInstructions.length}件`);
  console.log(`COPY/ADD命令: ${info.copyInstructions.length}件`);
  console.log(
    `EXPOSE: ${info.exposeInstructions.length > 0 ? info.exposeInstructions.map((e) => e.port).join(", ") : "なし"}`,
  );
  console.log(
    `HEALTHCHECK: ${info.hasHealthcheck ? colorize("green", "あり") : colorize("yellow", "なし")}`,
  );
  console.log(
    `USER指定: ${info.hasUser ? colorize("green", "あり") : colorize("yellow", "なし（rootで実行）")}`,
  );
  console.log(
    `WORKDIR: ${info.hasWorkdir ? colorize("green", "あり") : colorize("yellow", "なし")}`,
  );

  // 総合評価
  console.log(colorize("cyan", "\n=== 総合評価 ===\n"));
  const score = calculateScore(
    errors.length,
    warnings.length,
    suggestions.length,
    info,
  );
  console.log(`スコア: ${getScoreColor(score)}${score}/100${COLORS.reset}`);
  console.log(`評価: ${getGrade(score)}\n`);

  if (
    errors.length === 0 &&
    warnings.length === 0 &&
    suggestions.length === 0
  ) {
    console.log(colorize("green", "✅ 問題は検出されませんでした！\n"));
  }
}

function calculateScore(errorCount, warningCount, suggestionCount, info) {
  let score = 100;

  // エラーは-20点/件
  score -= errorCount * 20;

  // 警告は-10点/件
  score -= warningCount * 10;

  // 提案は-5点/件
  score -= suggestionCount * 5;

  // ボーナス点
  if (info.stages.length > 1) score += 10; // マルチステージ
  if (info.hasHealthcheck) score += 5;
  if (info.hasUser) score += 5;
  if (info.hasWorkdir) score += 5;

  return Math.max(0, Math.min(100, score));
}

function getScoreColor(score) {
  if (score >= 80) return COLORS.green;
  if (score >= 60) return COLORS.yellow;
  return COLORS.red;
}

function getGrade(score) {
  if (score >= 90) return colorize("green", "優秀 - 本番環境対応");
  if (score >= 80) return colorize("green", "良好 - 軽微な改善推奨");
  if (score >= 70) return colorize("yellow", "普通 - いくつか改善が必要");
  if (score >= 60) return colorize("yellow", "やや問題あり - 改善を推奨");
  return colorize("red", "要改善 - 重大な問題あり");
}

// メイン実行
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    colorize("red", "エラー: Dockerfileのパスを指定してください。"),
  );
  console.log("\n使用法:");
  console.log("  node analyze-dockerfile.mjs <Dockerfile>");
  console.log("\n例:");
  console.log("  node analyze-dockerfile.mjs Dockerfile");
  console.log("  node analyze-dockerfile.mjs backend/Dockerfile");
  process.exit(1);
}

const dockerfilePath = resolve(args[0]);
analyzeDockerfile(dockerfilePath);
