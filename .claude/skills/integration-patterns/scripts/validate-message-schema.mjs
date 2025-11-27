#!/usr/bin/env node

/**
 * Message Schema Validator
 *
 * メッセージスキーマを検証します。
 *
 * 使用方法:
 *   node validate-message-schema.mjs <schema.json>
 *   node validate-message-schema.mjs <schema.json> --message <message.json>
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { parseArgs } from 'util';

const { values, positionals } = parseArgs({
  options: {
    message: {
      type: 'string',
      short: 'm'
    },
    strict: {
      type: 'boolean',
      default: false
    }
  },
  allowPositionals: true
});

const schemaPath = positionals[0];

if (!schemaPath) {
  console.log('使用方法: node validate-message-schema.mjs <schema.json> [options]');
  console.log('');
  console.log('オプション:');
  console.log('  -m, --message  検証するメッセージファイル');
  console.log('  --strict       厳格モード');
  process.exit(1);
}

/**
 * CloudEvents必須フィールド
 */
const CLOUDEVENTS_REQUIRED = ['specversion', 'id', 'type', 'source'];
const CLOUDEVENTS_OPTIONAL = ['time', 'datacontenttype', 'dataschema', 'subject', 'data'];

/**
 * スキーマを検証
 */
function validateSchema(schema) {
  const errors = [];
  const warnings = [];

  // 基本構造チェック
  if (typeof schema !== 'object' || schema === null) {
    errors.push('スキーマはオブジェクトである必要があります');
    return { errors, warnings };
  }

  // $schemaチェック
  if (!schema.$schema) {
    warnings.push('$schema フィールドがありません（JSON Schema URIを推奨）');
  }

  // typeチェック
  if (schema.type !== 'object') {
    errors.push('ルートタイプは "object" である必要があります');
  }

  // propertiesチェック
  if (!schema.properties) {
    errors.push('properties が定義されていません');
    return { errors, warnings };
  }

  // CloudEvents必須フィールドチェック
  for (const field of CLOUDEVENTS_REQUIRED) {
    if (!schema.properties[field]) {
      warnings.push(`CloudEvents必須フィールド "${field}" が定義されていません`);
    }
  }

  // requiredチェック
  if (!schema.required) {
    warnings.push('required フィールドがありません');
  } else {
    for (const field of CLOUDEVENTS_REQUIRED) {
      if (!schema.required.includes(field)) {
        warnings.push(`"${field}" が required に含まれていません`);
      }
    }
  }

  // specversionチェック
  if (schema.properties.specversion) {
    const spec = schema.properties.specversion;
    if (spec.const !== '1.0' && spec.enum && !spec.enum.includes('1.0')) {
      warnings.push('specversion は "1.0" を含むべきです（CloudEvents 1.0準拠）');
    }
  }

  // idチェック
  if (schema.properties.id) {
    const id = schema.properties.id;
    if (id.format !== 'uuid' && !id.pattern) {
      warnings.push('id にはUUIDフォーマットまたはパターンを指定することを推奨します');
    }
  }

  // typeチェック
  if (schema.properties.type) {
    const type = schema.properties.type;
    if (!type.pattern && !type.enum) {
      warnings.push('type にはパターンまたは列挙を指定することを推奨します');
    }
  }

  // timeチェック
  if (schema.properties.time) {
    const time = schema.properties.time;
    if (time.format !== 'date-time') {
      warnings.push('time には "date-time" フォーマットを指定することを推奨します');
    }
  }

  // dataチェック
  if (!schema.properties.data) {
    warnings.push('data フィールドがありません（イベントペイロード用）');
  }

  // 追加の検証
  validateNestedProperties(schema.properties, '', errors, warnings);

  return { errors, warnings };
}

/**
 * ネストされたプロパティを検証
 */
function validateNestedProperties(properties, path, errors, warnings) {
  for (const [key, prop] of Object.entries(properties)) {
    const currentPath = path ? `${path}.${key}` : key;

    // 型チェック
    if (!prop.type && !prop.$ref && !prop.allOf && !prop.oneOf && !prop.anyOf) {
      warnings.push(`${currentPath}: 型が指定されていません`);
    }

    // 説明チェック
    if (!prop.description && !['specversion', 'id', 'type', 'source', 'time'].includes(key)) {
      // 標準フィールド以外は説明を推奨
    }

    // ネストしたobjectの検証
    if (prop.type === 'object' && prop.properties) {
      validateNestedProperties(prop.properties, currentPath, errors, warnings);
    }

    // 配列のitemsチェック
    if (prop.type === 'array' && !prop.items) {
      warnings.push(`${currentPath}: 配列には items を定義することを推奨します`);
    }
  }
}

/**
 * メッセージをスキーマに対して検証
 */
function validateMessage(message, schema) {
  const errors = [];

  // 必須フィールドチェック
  if (schema.required) {
    for (const field of schema.required) {
      if (message[field] === undefined) {
        errors.push(`必須フィールドがありません: ${field}`);
      }
    }
  }

  // プロパティの型チェック
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (message[key] !== undefined) {
        const typeError = validateType(message[key], prop, key);
        if (typeError) {
          errors.push(typeError);
        }
      }
    }
  }

  return errors;
}

/**
 * 型を検証
 */
function validateType(value, schema, path) {
  const expectedType = schema.type;

  if (!expectedType) return null;

  const actualType = Array.isArray(value) ? 'array' : typeof value;

  // 型マッピング
  const typeMap = {
    'string': 'string',
    'number': 'number',
    'integer': 'number',
    'boolean': 'boolean',
    'array': 'array',
    'object': 'object'
  };

  if (typeMap[expectedType] !== actualType) {
    return `${path}: 型が一致しません（期待: ${expectedType}, 実際: ${actualType}）`;
  }

  // フォーマット検証
  if (schema.format) {
    const formatError = validateFormat(value, schema.format, path);
    if (formatError) return formatError;
  }

  // パターン検証
  if (schema.pattern && typeof value === 'string') {
    if (!new RegExp(schema.pattern).test(value)) {
      return `${path}: パターンに一致しません（${schema.pattern}）`;
    }
  }

  // const検証
  if (schema.const !== undefined && value !== schema.const) {
    return `${path}: 固定値が一致しません（期待: ${schema.const}）`;
  }

  // enum検証
  if (schema.enum && !schema.enum.includes(value)) {
    return `${path}: 許可された値ではありません（${schema.enum.join(', ')}）`;
  }

  return null;
}

/**
 * フォーマットを検証
 */
function validateFormat(value, format, path) {
  switch (format) {
    case 'uuid':
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return `${path}: 無効なUUID形式`;
      }
      break;
    case 'date-time':
      if (isNaN(Date.parse(value))) {
        return `${path}: 無効な日時形式`;
      }
      break;
    case 'uri':
      try {
        new URL(value);
      } catch {
        return `${path}: 無効なURI形式`;
      }
      break;
  }
  return null;
}

/**
 * 結果を表示
 */
function displayResults(schemaResult, messageErrors = null) {
  console.log('\n🔍 メッセージスキーマ検証結果\n');
  console.log('═'.repeat(50));

  // スキーマ検証結果
  console.log('\n📋 スキーマ検証:');

  if (schemaResult.errors.length > 0) {
    console.log('\n❌ エラー:');
    schemaResult.errors.forEach(e => console.log(`   - ${e}`));
  }

  if (schemaResult.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    schemaResult.warnings.forEach(w => console.log(`   - ${w}`));
  }

  if (schemaResult.errors.length === 0 && schemaResult.warnings.length === 0) {
    console.log('   ✅ 問題ありません');
  }

  // メッセージ検証結果
  if (messageErrors !== null) {
    console.log('\n📨 メッセージ検証:');

    if (messageErrors.length > 0) {
      console.log('\n❌ エラー:');
      messageErrors.forEach(e => console.log(`   - ${e}`));
    } else {
      console.log('   ✅ メッセージはスキーマに適合しています');
    }
  }

  // 総評
  console.log('\n' + '═'.repeat(50));

  const hasErrors = schemaResult.errors.length > 0 ||
                    (messageErrors && messageErrors.length > 0);

  if (hasErrors) {
    console.log('\n❌ 検証失敗');
    return false;
  } else if (schemaResult.warnings.length > 0) {
    console.log('\n⚠️  検証成功（警告あり）');
    return !values.strict;
  } else {
    console.log('\n✅ 検証成功');
    return true;
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    if (!existsSync(schemaPath)) {
      console.error(`❌ ファイルが見つかりません: ${schemaPath}`);
      process.exit(1);
    }

    // スキーマ読み込み
    const schemaContent = await readFile(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    // スキーマ検証
    const schemaResult = validateSchema(schema);

    // メッセージ検証（オプション）
    let messageErrors = null;
    if (values.message) {
      if (!existsSync(values.message)) {
        console.error(`❌ メッセージファイルが見つかりません: ${values.message}`);
        process.exit(1);
      }

      const messageContent = await readFile(values.message, 'utf-8');
      const message = JSON.parse(messageContent);
      messageErrors = validateMessage(message, schema);
    }

    const success = displayResults(schemaResult, messageErrors);
    process.exit(success ? 0 : 1);

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('❌ JSONパースエラー:', error.message);
    } else {
      console.error('❌ エラー:', error.message);
    }
    process.exit(1);
  }
}

main();
