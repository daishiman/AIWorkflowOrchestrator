#!/usr/bin/env node
/**
 * OpenAPI仕様バリデーションスクリプト
 *
 * 使用方法: node validate-openapi.mjs <openapi-file>
 *
 * 検証項目:
 * - YAML/JSON構文
 * - OpenAPI 3.x構造
 * - 必須フィールド
 * - $ref参照の整合性
 * - セキュリティ定義
 */

import { readFileSync } from "fs";
import { parse as parseYaml } from "yaml";

const REQUIRED_FIELDS = {
  root: ["openapi", "info", "paths"],
  info: ["title", "version"],
  operation: ["responses"],
  response: ["description"],
};

const VALID_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
];

function validateOpenAPI(filePath) {
  const issues = [];
  let spec;

  // ファイル読み込みとパース
  try {
    const content = readFileSync(filePath, "utf-8");
    spec = filePath.endsWith(".json")
      ? JSON.parse(content)
      : parseYaml(content);
  } catch (e) {
    return [
      { severity: "error", message: `パースエラー: ${e.message}`, path: "" },
    ];
  }

  // ルートレベル検証
  for (const field of REQUIRED_FIELDS.root) {
    if (!spec[field]) {
      issues.push({
        severity: "error",
        message: `必須フィールド '${field}' がありません`,
        path: "/",
      });
    }
  }

  // OpenAPIバージョン検証
  if (spec.openapi && !spec.openapi.startsWith("3.")) {
    issues.push({
      severity: "warning",
      message: `OpenAPI 3.x推奨（現在: ${spec.openapi}）`,
      path: "/openapi",
    });
  }

  // info検証
  if (spec.info) {
    for (const field of REQUIRED_FIELDS.info) {
      if (!spec.info[field]) {
        issues.push({
          severity: "error",
          message: `info.${field} が必須です`,
          path: "/info",
        });
      }
    }
  }

  // paths検証
  if (spec.paths) {
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      // パス形式チェック
      if (!path.startsWith("/")) {
        issues.push({
          severity: "error",
          message: `パスは '/' で始める必要があります`,
          path: `/paths${path}`,
        });
      }

      // 各メソッド検証
      for (const [method, operation] of Object.entries(pathItem)) {
        if (
          !VALID_METHODS.includes(method) &&
          method !== "parameters" &&
          method !== "$ref"
        ) {
          continue;
        }

        if (VALID_METHODS.includes(method)) {
          const opPath = `/paths${path}/${method}`;

          // operationId推奨
          if (!operation.operationId) {
            issues.push({
              severity: "warning",
              message: "operationIdの設定を推奨",
              path: opPath,
            });
          }

          // responses必須
          if (!operation.responses) {
            issues.push({
              severity: "error",
              message: "responsesが必須です",
              path: opPath,
            });
          } else {
            // 少なくとも1つのレスポンス
            if (Object.keys(operation.responses).length === 0) {
              issues.push({
                severity: "error",
                message: "少なくとも1つのレスポンス定義が必要",
                path: `${opPath}/responses`,
              });
            }

            // 各レスポンス検証
            for (const [status, response] of Object.entries(
              operation.responses,
            )) {
              if (!response.description && !response.$ref) {
                issues.push({
                  severity: "error",
                  message: `レスポンス ${status} にdescriptionが必要`,
                  path: `${opPath}/responses/${status}`,
                });
              }
            }
          }

          // セキュリティ参照検証
          if (operation.security) {
            for (const secReq of operation.security) {
              for (const secName of Object.keys(secReq)) {
                if (!spec.components?.securitySchemes?.[secName]) {
                  issues.push({
                    severity: "error",
                    message: `未定義のセキュリティスキーム: ${secName}`,
                    path: opPath,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  // $ref参照検証
  validateRefs(spec, spec, "", issues);

  return issues;
}

function validateRefs(root, current, path, issues) {
  if (!current || typeof current !== "object") return;

  if (current.$ref) {
    const refPath = current.$ref;
    if (refPath.startsWith("#/")) {
      const resolved = resolveRef(root, refPath);
      if (resolved === undefined) {
        issues.push({
          severity: "error",
          message: `無効な参照: ${refPath}`,
          path,
        });
      }
    }
  }

  for (const [key, value] of Object.entries(current)) {
    if (typeof value === "object") {
      validateRefs(root, value, `${path}/${key}`, issues);
    }
  }
}

function resolveRef(root, refPath) {
  const parts = refPath.replace("#/", "").split("/");
  let current = root;
  for (const part of parts) {
    if (current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

// メイン実行
const filePath = process.argv[2];
if (!filePath) {
  console.log("使用方法: node validate-openapi.mjs <openapi-file>");
  process.exit(1);
}

const issues = validateOpenAPI(filePath);
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

console.log(`\n📋 OpenAPI検証結果: ${filePath}\n`);
console.log(`❌ エラー: ${errors.length}`);
console.log(`⚠️  警告: ${warnings.length}\n`);

if (issues.length > 0) {
  for (const issue of issues) {
    const icon = issue.severity === "error" ? "❌" : "⚠️";
    console.log(`${icon} [${issue.path}] ${issue.message}`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);
