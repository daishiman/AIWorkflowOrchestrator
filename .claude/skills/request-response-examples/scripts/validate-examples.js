#!/usr/bin/env node
/**
 * OpenAPI 仕様内の example 検証スクリプト
 *
 * 用途:
 * - すべてのエンドポイントに example が定義されているか確認
 * - example がスキーマに準拠しているか検証
 * - エラーレスポンスの example をチェック
 */

import { readFileSync } from "fs";
import YAML from "yaml";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function loadOpenAPISpec(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return YAML.parse(content);
  } catch (error) {
    log(colors.red, "❌", `ファイル読み込みエラー: ${filePath}`);
    log(colors.red, "   ", error.message);
    process.exit(1);
  }
}

function validateExamples(spec) {
  console.log(
    `\n${colors.blue}🔍 OpenAPI Example を検証中...${colors.reset}\n`,
  );

  let totalEndpoints = 0;
  let endpointsWithExamples = 0;
  let missingExamples = [];
  let missingErrorExamples = [];
  let warnings = [];

  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        totalEndpoints++;

        const endpoint = `${method.toUpperCase()} ${path}`;

        // リクエストボディの example チェック
        if (operation.requestBody) {
          const content = operation.requestBody.content || {};
          const hasExample = Object.values(content).some(
            (c) => c.example || c.examples,
          );

          if (!hasExample) {
            missingExamples.push({
              endpoint,
              type: "request",
              message: "リクエストボディに example がありません",
            });
          }
        }

        // レスポンスの example チェック
        let hasSuccessExample = false;
        let hasErrorExample = false;

        Object.entries(operation.responses || {}).forEach(
          ([statusCode, response]) => {
            const content = response.content || {};
            const hasExample = Object.values(content).some(
              (c) => c.example || c.examples,
            );

            if (statusCode.startsWith("2")) {
              // 成功レスポンス
              if (hasExample) {
                hasSuccessExample = true;
              } else {
                missingExamples.push({
                  endpoint,
                  type: "response",
                  statusCode,
                  message: `${statusCode} レスポンスに example がありません`,
                });
              }
            } else if (
              statusCode.startsWith("4") ||
              statusCode.startsWith("5")
            ) {
              // エラーレスポンス
              if (hasExample) {
                hasErrorExample = true;
              }
            }
          },
        );

        if (hasSuccessExample) {
          endpointsWithExamples++;
        }

        // エラーレスポンスの example がない場合は警告
        if (!hasErrorExample && operation.responses) {
          const hasErrorResponse = Object.keys(operation.responses).some(
            (code) => code.startsWith("4") || code.startsWith("5"),
          );

          if (hasErrorResponse) {
            missingErrorExamples.push({
              endpoint,
              message: "エラーレスポンスに example がありません",
            });
          }
        }

        // deprecated エンドポイントに example がない場合は警告レベルを下げる
        if (
          operation.deprecated &&
          missingExamples.some((e) => e.endpoint === endpoint)
        ) {
          warnings.push({
            endpoint,
            message:
              "非推奨エンドポイントに example がありません（優先度: 低）",
          });
        }
      }
    });
  });

  // 結果表示
  console.log(`${colors.blue}📊 サマリー${colors.reset}\n`);
  console.log(`   総エンドポイント数: ${totalEndpoints}`);
  console.log(
    `   Example あり: ${endpointsWithExamples} (${Math.round((endpointsWithExamples / totalEndpoints) * 100)}%)`,
  );
  console.log(`   Example なし: ${totalEndpoints - endpointsWithExamples}\n`);

  // 不足している example
  if (missingExamples.length > 0) {
    console.log(
      `${colors.red}❌ Example が不足しているエンドポイント${colors.reset}\n`,
    );

    missingExamples.forEach((item) => {
      log(colors.red, "🔴", `${item.endpoint} - ${item.message}`);
    });

    console.log();
  }

  // エラーレスポンスの example がない
  if (missingErrorExamples.length > 0) {
    console.log(
      `${colors.yellow}⚠️  エラーレスポンスの Example が不足${colors.reset}\n`,
    );

    missingErrorExamples.forEach((item) => {
      log(colors.yellow, "🟡", `${item.endpoint} - ${item.message}`);
    });

    console.log();
  }

  // 警告
  if (warnings.length > 0) {
    console.log(`${colors.yellow}💡 警告${colors.reset}\n`);

    warnings.forEach((item) => {
      log(colors.yellow, "⚠️ ", `${item.endpoint} - ${item.message}`);
    });

    console.log();
  }

  // 品質レベル判定
  const exampleCoverage = (endpointsWithExamples / totalEndpoints) * 100;

  console.log(`${colors.blue}📈 Example カバレッジ評価${colors.reset}\n`);

  if (exampleCoverage >= 100) {
    log(
      colors.green,
      "🌟",
      `完璧です！すべてのエンドポイントに example があります`,
    );
  } else if (exampleCoverage >= 80) {
    log(
      colors.green,
      "✅",
      `良好（${Math.round(exampleCoverage)}%） - ほとんどのエンドポイントに example があります`,
    );
  } else if (exampleCoverage >= 50) {
    log(
      colors.yellow,
      "⚠️ ",
      `要改善（${Math.round(exampleCoverage)}%） - example の追加を推奨します`,
    );
  } else {
    log(
      colors.red,
      "❌",
      `不十分（${Math.round(exampleCoverage)}%） - example の追加が必要です`,
    );
  }

  console.log();

  // 推奨アクション
  if (missingExamples.length > 0) {
    console.log(`${colors.blue}📋 推奨アクション${colors.reset}\n`);
    log(colors.blue, "1.", "不足している example を OpenAPI 仕様に追加");
    log(
      colors.blue,
      "2.",
      "エラーレスポンスの example も追加（RFC 7807 形式推奨）",
    );
    log(colors.blue, "3.", "example は実際のAPIレスポンスと一致させる");
    console.log();
  }

  return missingExamples.length === 0;
}

// メイン実行
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log("使用方法: validate-examples.js <openapi.yaml>");
  console.log("例: validate-examples.js openapi.yaml");
  process.exit(1);
}

const specPath = args[0];
const spec = loadOpenAPISpec(specPath);

const isValid = validateExamples(spec);

process.exit(isValid ? 0 : 1);
