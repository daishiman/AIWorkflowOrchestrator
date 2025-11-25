#!/usr/bin/env node
/**
 * JSON Schema検証スクリプト
 * JSON Schemaファイルの構文と品質をチェックします
 *
 * 使用方法:
 *   node validate-json-schema.mjs <schema.json> [--validate-data=<data.json>] [--strict]
 *
 * オプション:
 *   --validate-data=<file>  指定したJSONファイルをスキーマで検証
 *   --strict                厳格モードでチェック
 *   --json                  JSON形式で出力
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';

// スキーマ検証ルール
const SCHEMA_RULES = {
  // 必須メタデータ
  metadata: {
    required: ['$schema'],
    recommended: ['$id', 'title', 'description'],
    message: 'スキーマにメタデータが不足しています',
    severity: 'warning',
  },

  // プロパティ定義
  properties: {
    requiredDescription: true,
    message: 'プロパティに説明が不足しています',
    severity: 'info',
  },

  // 型定義
  types: {
    preferExplicit: true,
    message: '明示的な型定義を推奨します',
    severity: 'info',
  },

  // additionalProperties
  additionalProperties: {
    preferFalse: true,
    message: 'additionalPropertiesの設定を推奨します',
    severity: 'warning',
  },

  // 参照
  references: {
    checkValid: true,
    message: '無効な参照があります',
    severity: 'error',
  },
};

// 検証結果
const issues = [];

// メタデータをチェック
function checkMetadata(schema, path = '') {
  if (!schema.$schema) {
    issues.push({
      path: path || 'root',
      rule: 'metadata',
      message: '$schemaが指定されていません',
      severity: 'error',
    });
  }

  if (!schema.$id) {
    issues.push({
      path: path || 'root',
      rule: 'metadata',
      message: '$idの指定を推奨します',
      severity: 'info',
    });
  }

  if (!schema.title && !schema.description) {
    issues.push({
      path: path || 'root',
      rule: 'metadata',
      message: 'titleまたはdescriptionの指定を推奨します',
      severity: 'info',
    });
  }
}

// プロパティをチェック
function checkProperties(schema, path = '', strict = false) {
  if (schema.type === 'object' && schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const propPath = `${path}/properties/${propName}`;

      // 説明がない
      if (strict && !propSchema.description && !propSchema.$ref) {
        issues.push({
          path: propPath,
          rule: 'properties',
          message: `プロパティ "${propName}" に説明がありません`,
          severity: 'info',
        });
      }

      // 型がない
      if (!propSchema.type && !propSchema.$ref && !propSchema.oneOf && !propSchema.anyOf && !propSchema.allOf) {
        issues.push({
          path: propPath,
          rule: 'types',
          message: `プロパティ "${propName}" に型が指定されていません`,
          severity: 'warning',
        });
      }

      // 再帰的にチェック
      checkProperties(propSchema, propPath, strict);
    }

    // additionalPropertiesのチェック
    if (schema.additionalProperties === undefined && strict) {
      issues.push({
        path: path || 'root',
        rule: 'additionalProperties',
        message: 'additionalPropertiesの明示的な設定を推奨します',
        severity: 'info',
      });
    }
  }

  // 配列のitemsをチェック
  if (schema.type === 'array' && schema.items) {
    checkProperties(schema.items, `${path}/items`, strict);
  }

  // $defsをチェック
  if (schema.$defs) {
    for (const [defName, defSchema] of Object.entries(schema.$defs)) {
      checkProperties(defSchema, `${path}/$defs/${defName}`, strict);
    }
  }
}

// 参照を検証
function checkReferences(schema, defs = {}, path = '') {
  if (typeof schema !== 'object' || schema === null) return;

  // $refをチェック
  if (schema.$ref) {
    const ref = schema.$ref;
    if (ref.startsWith('#/')) {
      // ローカル参照の検証
      const refPath = ref.substring(2).split('/');
      let target = null;

      // $defsへの参照をチェック
      if (refPath[0] === '$defs' && refPath.length === 2) {
        target = defs[refPath[1]];
      }

      if (!target && ref.includes('$defs')) {
        issues.push({
          path: path,
          rule: 'references',
          message: `参照 "${ref}" が見つかりません`,
          severity: 'error',
        });
      }
    }
  }

  // 再帰的にチェック
  for (const [key, value] of Object.entries(schema)) {
    if (key === '$defs') continue;
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          checkReferences(item, defs, `${path}/${key}/${index}`);
        });
      } else {
        checkReferences(value, defs, `${path}/${key}`);
      }
    }
  }
}

// 循環参照をチェック
function checkCircularReferences(schema) {
  const visited = new Set();
  const stack = new Set();

  function visit(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) return;

    const id = JSON.stringify(obj).substring(0, 100);
    if (stack.has(id)) {
      issues.push({
        path,
        rule: 'references',
        message: '循環参照の可能性があります',
        severity: 'warning',
      });
      return;
    }

    if (visited.has(id)) return;

    visited.add(id);
    stack.add(id);

    for (const [key, value] of Object.entries(obj)) {
      visit(value, `${path}/${key}`);
    }

    stack.delete(id);
  }

  visit(schema);
}

// スキーマを検証
function validateSchema(schema, options = {}) {
  issues.length = 0;

  checkMetadata(schema);
  checkProperties(schema, '', options.strict);
  checkReferences(schema, schema.$defs || {});
  checkCircularReferences(schema);

  return issues;
}

// データをスキーマで検証（簡易実装）
function validateData(schema, data) {
  const errors = [];

  function validate(schemaNode, dataNode, path = '') {
    if (schemaNode.$ref) {
      // 参照解決（簡易）
      if (schemaNode.$ref.startsWith('#/$defs/')) {
        const defName = schemaNode.$ref.split('/').pop();
        schemaNode = schema.$defs?.[defName] || schemaNode;
      }
    }

    // 型チェック
    if (schemaNode.type) {
      const expectedTypes = Array.isArray(schemaNode.type) ? schemaNode.type : [schemaNode.type];
      const actualType = dataNode === null ? 'null' : Array.isArray(dataNode) ? 'array' : typeof dataNode;

      if (!expectedTypes.includes(actualType)) {
        errors.push({
          path: path || 'root',
          expected: expectedTypes.join(' | '),
          actual: actualType,
          message: `型が一致しません: 期待=${expectedTypes.join(' | ')}, 実際=${actualType}`,
        });
        return;
      }
    }

    // オブジェクトのプロパティチェック
    if (schemaNode.type === 'object' && schemaNode.properties) {
      // 必須チェック
      if (schemaNode.required) {
        for (const req of schemaNode.required) {
          if (!(req in dataNode)) {
            errors.push({
              path: `${path}/${req}`,
              message: `必須プロパティ "${req}" がありません`,
            });
          }
        }
      }

      // プロパティ検証
      for (const [propName, propSchema] of Object.entries(schemaNode.properties)) {
        if (propName in dataNode) {
          validate(propSchema, dataNode[propName], `${path}/${propName}`);
        }
      }

      // additionalPropertiesチェック
      if (schemaNode.additionalProperties === false) {
        const allowedKeys = Object.keys(schemaNode.properties);
        for (const key of Object.keys(dataNode)) {
          if (!allowedKeys.includes(key)) {
            errors.push({
              path: `${path}/${key}`,
              message: `未定義のプロパティ "${key}" があります`,
            });
          }
        }
      }
    }

    // 配列のitemsチェック
    if (schemaNode.type === 'array' && schemaNode.items && Array.isArray(dataNode)) {
      dataNode.forEach((item, index) => {
        validate(schemaNode.items, item, `${path}[${index}]`);
      });
    }

    // 文字列制約
    if (schemaNode.type === 'string' && typeof dataNode === 'string') {
      if (schemaNode.minLength !== undefined && dataNode.length < schemaNode.minLength) {
        errors.push({
          path,
          message: `文字列が短すぎます: 最小=${schemaNode.minLength}, 実際=${dataNode.length}`,
        });
      }
      if (schemaNode.maxLength !== undefined && dataNode.length > schemaNode.maxLength) {
        errors.push({
          path,
          message: `文字列が長すぎます: 最大=${schemaNode.maxLength}, 実際=${dataNode.length}`,
        });
      }
      if (schemaNode.pattern && !new RegExp(schemaNode.pattern).test(dataNode)) {
        errors.push({
          path,
          message: `パターンに一致しません: ${schemaNode.pattern}`,
        });
      }
    }

    // 数値制約
    if ((schemaNode.type === 'number' || schemaNode.type === 'integer') && typeof dataNode === 'number') {
      if (schemaNode.minimum !== undefined && dataNode < schemaNode.minimum) {
        errors.push({
          path,
          message: `値が小さすぎます: 最小=${schemaNode.minimum}, 実際=${dataNode}`,
        });
      }
      if (schemaNode.maximum !== undefined && dataNode > schemaNode.maximum) {
        errors.push({
          path,
          message: `値が大きすぎます: 最大=${schemaNode.maximum}, 実際=${dataNode}`,
        });
      }
    }

    // enum/const
    if (schemaNode.enum && !schemaNode.enum.includes(dataNode)) {
      errors.push({
        path,
        message: `値が列挙型に含まれていません: ${schemaNode.enum.join(', ')}`,
      });
    }
    if (schemaNode.const !== undefined && dataNode !== schemaNode.const) {
      errors.push({
        path,
        message: `定数値と一致しません: 期待=${schemaNode.const}`,
      });
    }
  }

  validate(schema, data);
  return errors;
}

// 結果をフォーマット
function formatResults(schemaIssues, dataErrors = null, options = {}) {
  if (options.json) {
    return JSON.stringify({ schemaIssues, dataErrors }, null, 2);
  }

  let output = '\n📋 JSON Schema 検証結果\n';
  output += '═'.repeat(60) + '\n';

  // スキーマの問題
  if (schemaIssues.length === 0) {
    output += '\n✅ スキーマに問題は見つかりませんでした\n';
  } else {
    const grouped = {
      error: schemaIssues.filter((i) => i.severity === 'error'),
      warning: schemaIssues.filter((i) => i.severity === 'warning'),
      info: schemaIssues.filter((i) => i.severity === 'info'),
    };

    const labels = {
      error: '❌ エラー',
      warning: '⚠️  警告',
      info: '💡 情報',
    };

    for (const [severity, items] of Object.entries(grouped)) {
      if (items.length === 0) continue;

      output += `\n${labels[severity]} (${items.length}件)\n`;
      output += '─'.repeat(60) + '\n';

      for (const item of items) {
        output += `  📍 ${item.path}\n`;
        output += `     ${item.message}\n`;
      }
    }
  }

  // データ検証結果
  if (dataErrors !== null) {
    output += '\n' + '═'.repeat(60) + '\n';
    output += '📊 データ検証結果\n';
    output += '─'.repeat(60) + '\n';

    if (dataErrors.length === 0) {
      output += '✅ データはスキーマに適合しています\n';
    } else {
      output += `❌ ${dataErrors.length}件のエラー\n\n`;
      for (const err of dataErrors) {
        output += `  📍 ${err.path}\n`;
        output += `     ${err.message}\n`;
      }
    }
  }

  output += '\n' + '═'.repeat(60) + '\n';

  return output;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
JSON Schema検証スクリプト

使用方法:
  node validate-json-schema.mjs <schema.json> [options]

オプション:
  --validate-data=<file>  指定したJSONファイルをスキーマで検証
  --strict                厳格モードでチェック
  --json                  JSON形式で出力
  --help                  ヘルプを表示

例:
  node validate-json-schema.mjs schema.json
  node validate-json-schema.mjs schema.json --strict
  node validate-json-schema.mjs schema.json --validate-data=data.json

検証内容:
  - メタデータ（$schema, $id, title, description）
  - プロパティ定義の完全性
  - 参照の有効性
  - 循環参照の検出
  - 型定義の明示性
`);
    process.exit(0);
  }

  const schemaFile = resolve(args.find((a) => !a.startsWith('--')));
  const dataFileArg = args.find((a) => a.startsWith('--validate-data='));
  const dataFile = dataFileArg ? resolve(dataFileArg.split('=')[1]) : null;
  const options = {
    strict: args.includes('--strict'),
    json: args.includes('--json'),
  };

  try {
    // スキーマを読み込み
    if (!existsSync(schemaFile)) {
      throw new Error(`スキーマファイルが見つかりません: ${schemaFile}`);
    }
    const schema = JSON.parse(readFileSync(schemaFile, 'utf-8'));

    // スキーマを検証
    const schemaIssues = validateSchema(schema, options);

    // データ検証
    let dataErrors = null;
    if (dataFile) {
      if (!existsSync(dataFile)) {
        throw new Error(`データファイルが見つかりません: ${dataFile}`);
      }
      const data = JSON.parse(readFileSync(dataFile, 'utf-8'));
      dataErrors = validateData(schema, data);
    }

    console.log(formatResults(schemaIssues, dataErrors, options));

    // 終了コード
    const hasErrors = schemaIssues.some((i) => i.severity === 'error') ||
                     (dataErrors && dataErrors.length > 0);
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
