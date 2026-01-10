#!/usr/bin/env node

/**
 * Resource Definition Validator
 *
 * MCPリソース定義ファイルを検証します。
 *
 * 使用方法:
 *   node validate-resource-definition.mjs <definition.json>
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";

const definitionPath = process.argv[2];

if (!definitionPath) {
  console.log(
    "使用方法: node validate-resource-definition.mjs <definition.json>",
  );
  process.exit(1);
}

if (!existsSync(definitionPath)) {
  console.error(`❌ ファイルが見つかりません: ${definitionPath}`);
  process.exit(1);
}

/**
 * リソース定義を検証
 */
function validateDefinition(definition) {
  const errors = [];
  const warnings = [];

  // バージョン検証
  if (!definition.version) {
    warnings.push("version フィールドがありません");
  }

  // リソース検証
  if (definition.resources) {
    definition.resources.forEach((resource, index) => {
      const prefix = `resources[${index}]`;

      if (!resource.uri) {
        errors.push(`${prefix}: uri は必須です`);
      } else {
        const uriResult = validateUri(resource.uri);
        if (!uriResult.valid) {
          errors.push(`${prefix}: 無効なURI - ${uriResult.error}`);
        }
      }

      if (!resource.name) {
        errors.push(`${prefix}: name は必須です`);
      }

      if (resource.mimeType && !isValidMimeType(resource.mimeType)) {
        warnings.push(
          `${prefix}: mimeType '${resource.mimeType}' は一般的でない形式です`,
        );
      }
    });
  }

  // リソーステンプレート検証
  if (definition.resourceTemplates) {
    definition.resourceTemplates.forEach((template, index) => {
      const prefix = `resourceTemplates[${index}]`;

      if (!template.uriTemplate) {
        errors.push(`${prefix}: uriTemplate は必須です`);
      } else {
        // テンプレート変数のチェック
        const templateVars = extractTemplateVariables(template.uriTemplate);

        if (template.parameters) {
          const paramNames = template.parameters.map((p) => p.name);

          // 未定義のテンプレート変数
          templateVars.forEach((v) => {
            if (!paramNames.includes(v)) {
              errors.push(
                `${prefix}: テンプレート変数 '{${v}}' のパラメータ定義がありません`,
              );
            }
          });

          // 未使用のパラメータ
          paramNames.forEach((p) => {
            if (!templateVars.includes(p)) {
              warnings.push(
                `${prefix}: パラメータ '${p}' はテンプレートで使用されていません`,
              );
            }
          });

          // パラメータ検証
          template.parameters.forEach((param, pIndex) => {
            if (!param.name) {
              errors.push(`${prefix}.parameters[${pIndex}]: name は必須です`);
            }
          });
        } else if (templateVars.length > 0) {
          errors.push(
            `${prefix}: テンプレート変数がありますが、parameters が定義されていません`,
          );
        }
      }

      if (!template.name) {
        errors.push(`${prefix}: name は必須です`);
      }
    });
  }

  // キャッシュ設定検証
  if (definition.caching) {
    if (definition.caching.enabled && definition.caching.rules) {
      definition.caching.rules.forEach((rule, index) => {
        const prefix = `caching.rules[${index}]`;

        if (!rule.pattern) {
          errors.push(`${prefix}: pattern は必須です`);
        }

        if (rule.ttl === undefined) {
          errors.push(`${prefix}: ttl は必須です`);
        } else if (rule.ttl < 0) {
          errors.push(`${prefix}: ttl は0以上である必要があります`);
        }

        if (rule.strategy) {
          const validStrategies = [
            "no-cache",
            "cache-first",
            "stale-while-revalidate",
          ];
          if (!validStrategies.includes(rule.strategy)) {
            errors.push(
              `${prefix}: strategy は ${validStrategies.join(", ")} のいずれかである必要があります`,
            );
          }
        }
      });
    }
  }

  // アクセス制御検証
  if (definition.access?.rules) {
    definition.access.rules.forEach((rule, index) => {
      const prefix = `access.rules[${index}]`;

      if (!rule.pattern) {
        errors.push(`${prefix}: pattern は必須です`);
      }

      if (!rule.operations || rule.operations.length === 0) {
        errors.push(`${prefix}: operations は必須です`);
      } else {
        const validOps = ["read", "list", "subscribe"];
        rule.operations.forEach((op) => {
          if (!validOps.includes(op)) {
            errors.push(`${prefix}: 無効な operation '${op}'`);
          }
        });
      }

      if (!rule.policy) {
        errors.push(`${prefix}: policy は必須です`);
      }
    });
  }

  return { errors, warnings };
}

/**
 * URIを検証
 */
function validateUri(uri) {
  try {
    new URL(uri);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * MIMEタイプを検証
 */
function isValidMimeType(mimeType) {
  const commonMimeTypes = [
    "text/plain",
    "text/markdown",
    "text/html",
    "text/css",
    "text/csv",
    "application/json",
    "application/xml",
    "application/javascript",
    "application/octet-stream",
    "application/x-yaml",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/svg+xml",
  ];

  return (
    commonMimeTypes.includes(mimeType) ||
    /^[a-z]+\/[a-z0-9.+-]+$/.test(mimeType)
  );
}

/**
 * テンプレート変数を抽出
 */
function extractTemplateVariables(template) {
  const matches = template.match(/\{(\w+)\}/g) || [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * 統計情報を計算
 */
function calculateStats(definition) {
  const stats = {
    resourceCount: definition.resources?.length || 0,
    templateCount: definition.resourceTemplates?.length || 0,
    cachingEnabled: definition.caching?.enabled || false,
    cacheRuleCount: definition.caching?.rules?.length || 0,
    accessRuleCount: definition.access?.rules?.length || 0,
    subscriptionsEnabled: definition.subscriptions?.enabled || false,
  };

  // スキーム別カウント
  const schemes = new Map();
  (definition.resources || []).forEach((r) => {
    try {
      const url = new URL(r.uri);
      const scheme = url.protocol.replace(":", "");
      schemes.set(scheme, (schemes.get(scheme) || 0) + 1);
    } catch {}
  });
  (definition.resourceTemplates || []).forEach((t) => {
    const match = t.uriTemplate.match(/^(\w+):\/\//);
    if (match) {
      const scheme = match[1];
      schemes.set(scheme, (schemes.get(scheme) || 0) + 1);
    }
  });
  stats.schemeDistribution = Object.fromEntries(schemes);

  return stats;
}

/**
 * 結果を表示
 */
function displayResults(definition, errors, warnings, stats) {
  console.log("\n🔍 リソース定義検証結果\n");
  console.log("─".repeat(50));

  // 統計情報
  console.log("\n📊 統計:");
  console.log(`   リソース数: ${stats.resourceCount}`);
  console.log(`   テンプレート数: ${stats.templateCount}`);
  console.log(`   キャッシュ: ${stats.cachingEnabled ? "有効" : "無効"}`);
  if (stats.cachingEnabled) {
    console.log(`   キャッシュルール数: ${stats.cacheRuleCount}`);
  }
  console.log(`   アクセスルール数: ${stats.accessRuleCount}`);
  console.log(`   変更通知: ${stats.subscriptionsEnabled ? "有効" : "無効"}`);

  if (Object.keys(stats.schemeDistribution).length > 0) {
    console.log("   スキーム分布:");
    for (const [scheme, count] of Object.entries(stats.schemeDistribution)) {
      console.log(`     - ${scheme}: ${count}`);
    }
  }

  // エラー
  if (errors.length > 0) {
    console.log("\n❌ エラー:");
    errors.forEach((e) => console.log(`   - ${e}`));
  }

  // 警告
  if (warnings.length > 0) {
    console.log("\n⚠️  警告:");
    warnings.forEach((w) => console.log(`   - ${w}`));
  }

  // 最終判定
  console.log("\n" + "─".repeat(50));
  if (errors.length === 0) {
    if (warnings.length === 0) {
      console.log("✅ リソース定義は有効です");
    } else {
      console.log("⚠️  リソース定義は有効ですが、警告があります");
    }
    return true;
  } else {
    console.log("❌ リソース定義にエラーがあります");
    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    const content = await readFile(definitionPath, "utf-8");
    const definition = JSON.parse(content);

    const { errors, warnings } = validateDefinition(definition);
    const stats = calculateStats(definition);
    const valid = displayResults(definition, errors, warnings, stats);

    process.exit(valid ? 0 : 1);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("❌ JSONパースエラー:", error.message);
    } else {
      console.error("❌ エラー:", error.message);
    }
    process.exit(1);
  }
}

main();
