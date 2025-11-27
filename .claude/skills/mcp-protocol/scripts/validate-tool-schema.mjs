#!/usr/bin/env node

/**
 * MCP Tool Schema Validator
 *
 * MCPツール定義のスキーマを検証します。
 *
 * 使用方法:
 *   node validate-tool-schema.mjs <tool-definition-file>
 *   node validate-tool-schema.mjs tool-definition.json
 *
 * 出力:
 *   - スキーマ検証結果
 *   - パラメータ検証結果
 *   - ベストプラクティスチェック
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// 検証結果
const results = {
  errors: [],
  warnings: [],
  info: []
};

// 有効なJSON Schemaタイプ
const VALID_TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'];

// 有効なフォーマット
const VALID_FORMATS = [
  'date-time', 'date', 'time', 'email', 'uri', 'uuid',
  'hostname', 'ipv4', 'ipv6', 'regex'
];

/**
 * ファイルを読み込み
 */
function loadFile(filePath) {
  try {
    const absolutePath = resolve(filePath);
    const content = readFileSync(absolutePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`ファイルが見つかりません: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`JSON構文エラー: ${error.message}`);
    }
    throw error;
  }
}

/**
 * ツール名を検証
 */
function validateToolName(name) {
  if (!name) {
    results.errors.push("'name' フィールドが必須です");
    return false;
  }

  if (typeof name !== 'string') {
    results.errors.push("'name' は文字列である必要があります");
    return false;
  }

  // snake_case推奨
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    results.warnings.push(`ツール名 '${name}' はsnake_case形式を推奨します`);
  }

  return true;
}

/**
 * 説明を検証
 */
function validateDescription(description) {
  if (!description) {
    results.warnings.push("'description' フィールドが推奨されます");
    return true;
  }

  if (typeof description !== 'string') {
    results.errors.push("'description' は文字列である必要があります");
    return false;
  }

  if (description.length < 10) {
    results.warnings.push("説明文が短すぎます。機能を明確に説明してください");
  }

  return true;
}

/**
 * プロパティの型を検証
 */
function validatePropertyType(propName, property, path) {
  const fullPath = path ? `${path}.${propName}` : propName;

  if (!property.type) {
    results.warnings.push(`[${fullPath}] 'type' が未定義です`);
    return true;
  }

  // 配列形式の型（Union type）
  if (Array.isArray(property.type)) {
    const invalidTypes = property.type.filter(t => !VALID_TYPES.includes(t));
    if (invalidTypes.length > 0) {
      results.errors.push(`[${fullPath}] 無効な型: ${invalidTypes.join(', ')}`);
      return false;
    }
    return true;
  }

  if (!VALID_TYPES.includes(property.type)) {
    results.errors.push(`[${fullPath}] 無効な型 '${property.type}'。有効: ${VALID_TYPES.join(', ')}`);
    return false;
  }

  // 追加の型固有検証
  if (property.type === 'string' && property.format) {
    if (!VALID_FORMATS.includes(property.format)) {
      results.warnings.push(`[${fullPath}] 非標準フォーマット '${property.format}'`);
    }
  }

  if (property.type === 'array' && !property.items) {
    results.warnings.push(`[${fullPath}] 配列の 'items' スキーマが推奨されます`);
  }

  if (property.type === 'object' && !property.properties && !property.additionalProperties) {
    results.warnings.push(`[${fullPath}] オブジェクトの 'properties' または 'additionalProperties' が推奨されます`);
  }

  return true;
}

/**
 * プロパティを検証
 */
function validateProperty(propName, property, path = '') {
  let valid = true;
  const fullPath = path ? `${path}.${propName}` : propName;

  valid = validatePropertyType(propName, property, path) && valid;

  // 説明の検証
  if (!property.description) {
    results.warnings.push(`[${fullPath}] 'description' が推奨されます`);
  }

  // ネストされたプロパティの検証
  if (property.type === 'object' && property.properties) {
    for (const [nestedName, nestedProp] of Object.entries(property.properties)) {
      valid = validateProperty(nestedName, nestedProp, fullPath) && valid;
    }
  }

  // 配列アイテムの検証
  if (property.type === 'array' && property.items) {
    if (typeof property.items === 'object' && !Array.isArray(property.items)) {
      valid = validateProperty('items', property.items, fullPath) && valid;
    }
  }

  return valid;
}

/**
 * 入力スキーマを検証
 */
function validateInputSchema(inputSchema) {
  if (!inputSchema) {
    results.warnings.push("'inputSchema' が未定義です（パラメータなしのツール）");
    return true;
  }

  if (inputSchema.type !== 'object') {
    results.errors.push("'inputSchema.type' は 'object' である必要があります");
    return false;
  }

  let valid = true;

  // プロパティの検証
  if (inputSchema.properties) {
    for (const [propName, property] of Object.entries(inputSchema.properties)) {
      valid = validateProperty(propName, property) && valid;
    }
  }

  // requiredの検証
  if (inputSchema.required) {
    if (!Array.isArray(inputSchema.required)) {
      results.errors.push("'required' は配列である必要があります");
      valid = false;
    } else {
      const properties = inputSchema.properties || {};
      for (const reqProp of inputSchema.required) {
        if (!properties[reqProp]) {
          results.errors.push(`必須パラメータ '${reqProp}' が 'properties' に定義されていません`);
          valid = false;
        }
      }
    }
  }

  return valid;
}

/**
 * ツール定義全体を検証
 */
function validateToolDefinition(definition) {
  let valid = true;

  // ツール定義がネストされている場合を処理
  const tool = definition.tool_definition || definition;

  valid = validateToolName(tool.name) && valid;
  valid = validateDescription(tool.description) && valid;
  valid = validateInputSchema(tool.inputSchema) && valid;

  return valid;
}

/**
 * 結果を表示
 */
function printResults() {
  console.log('\n=== ツールスキーマ検証結果 ===\n');

  if (results.errors.length > 0) {
    console.log('❌ エラー:');
    results.errors.forEach(err => console.log(`   - ${err}`));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  警告:');
    results.warnings.forEach(warn => console.log(`   - ${warn}`));
    console.log('');
  }

  if (results.info.length > 0) {
    console.log('ℹ️  情報:');
    results.info.forEach(info => console.log(`   - ${info}`));
    console.log('');
  }

  if (results.errors.length === 0) {
    console.log('✅ 検証成功: ツール定義は有効です');
    return true;
  } else {
    console.log('❌ 検証失敗: エラーを修正してください');
    return false;
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node validate-tool-schema.mjs <tool-definition-file>');
    console.log('例: node validate-tool-schema.mjs tool-definition.json');
    process.exit(1);
  }

  const filePath = args[0];

  try {
    console.log(`検証中: ${filePath}`);
    const definition = loadFile(filePath);
    validateToolDefinition(definition);
    const success = printResults();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
