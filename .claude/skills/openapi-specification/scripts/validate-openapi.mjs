#!/usr/bin/env node

/**
 * OpenAPI 仕様書バリデーションスクリプト
 *
 * 使用方法:
 *   node validate-openapi.mjs <openapi-file>
 *
 * 例:
 *   node validate-openapi.mjs openapi.yaml
 *   node validate-openapi.mjs openapi.json
 */

import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { basename, extname } from 'path';

const REQUIRED_FIELDS = ['openapi', 'info', 'paths'];
const REQUIRED_INFO_FIELDS = ['title', 'version'];
const RECOMMENDED_SECTIONS = ['servers', 'components', 'security', 'tags'];

class OpenAPIValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.errors = [];
    this.warnings = [];
    this.spec = null;
  }

  validate() {
    // ファイル存在チェック
    if (!existsSync(this.filePath)) {
      this.errors.push(`ファイルが見つかりません: ${this.filePath}`);
      return this.getResult();
    }

    // ファイル読み込みとパース
    try {
      const content = readFileSync(this.filePath, 'utf-8');
      const ext = extname(this.filePath).toLowerCase();

      if (ext === '.yaml' || ext === '.yml') {
        this.spec = parseYaml(content);
      } else if (ext === '.json') {
        this.spec = JSON.parse(content);
      } else {
        this.errors.push(`サポートされていないファイル形式: ${ext}`);
        return this.getResult();
      }
    } catch (e) {
      this.errors.push(`パースエラー: ${e.message}`);
      return this.getResult();
    }

    // バリデーション実行
    this.validateRequiredFields();
    this.validateInfo();
    this.validateServers();
    this.validatePaths();
    this.validateComponents();
    this.validateSecurity();
    this.validateTags();
    this.checkRecommendedSections();

    return this.getResult();
  }

  validateRequiredFields() {
    for (const field of REQUIRED_FIELDS) {
      if (!this.spec[field]) {
        this.errors.push(`必須フィールド '${field}' がありません`);
      }
    }
  }

  validateInfo() {
    if (!this.spec.info) return;

    for (const field of REQUIRED_INFO_FIELDS) {
      if (!this.spec.info[field]) {
        this.errors.push(`info.${field} は必須です`);
      }
    }

    if (!this.spec.info.description) {
      this.warnings.push('info.description の追加を推奨します');
    }

    if (!this.spec.info.contact) {
      this.warnings.push('info.contact の追加を推奨します');
    }
  }

  validateServers() {
    if (!this.spec.servers || this.spec.servers.length === 0) {
      this.warnings.push('servers セクションの追加を推奨します');
      return;
    }

    this.spec.servers.forEach((server, index) => {
      if (!server.url) {
        this.errors.push(`servers[${index}].url は必須です`);
      }
      if (!server.description) {
        this.warnings.push(`servers[${index}].description の追加を推奨します`);
      }
    });
  }

  validatePaths() {
    if (!this.spec.paths) return;

    for (const [path, pathItem] of Object.entries(this.spec.paths)) {
      // パス形式チェック
      if (!path.startsWith('/')) {
        this.errors.push(`パスは '/' で始まる必要があります: ${path}`);
      }

      // 各HTTPメソッドをチェック
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
      for (const method of methods) {
        if (pathItem[method]) {
          this.validateOperation(path, method, pathItem[method]);
        }
      }
    }
  }

  validateOperation(path, method, operation) {
    const prefix = `${method.toUpperCase()} ${path}`;

    if (!operation.summary) {
      this.warnings.push(`${prefix}: summary の追加を推奨します`);
    }

    if (!operation.operationId) {
      this.errors.push(`${prefix}: operationId は必須です`);
    }

    if (!operation.responses) {
      this.errors.push(`${prefix}: responses は必須です`);
    } else {
      // 少なくとも1つの成功レスポンスがあるか
      const hasSuccess = Object.keys(operation.responses).some(
        code => code.startsWith('2')
      );
      if (!hasSuccess) {
        this.warnings.push(`${prefix}: 成功レスポンス (2xx) の定義を推奨します`);
      }
    }

    // POST/PUT/PATCHにはrequestBodyが必要
    if (['post', 'put', 'patch'].includes(method) && !operation.requestBody) {
      this.warnings.push(`${prefix}: requestBody の定義を推奨します`);
    }

    // tagsの確認
    if (!operation.tags || operation.tags.length === 0) {
      this.warnings.push(`${prefix}: tags の追加を推奨します`);
    }
  }

  validateComponents() {
    if (!this.spec.components) return;

    // スキーマのバリデーション
    if (this.spec.components.schemas) {
      for (const [name, schema] of Object.entries(this.spec.components.schemas)) {
        this.validateSchema(`components.schemas.${name}`, schema);
      }
    }
  }

  validateSchema(path, schema) {
    if (!schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
      this.warnings.push(`${path}: type または $ref の指定を推奨します`);
    }

    if (schema.type === 'object' && schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (!propSchema.description) {
          this.warnings.push(`${path}.${propName}: description の追加を推奨します`);
        }
      }
    }
  }

  validateSecurity() {
    if (!this.spec.security) {
      this.warnings.push('グローバル security 設定の追加を推奨します');
    }

    if (this.spec.components?.securitySchemes) {
      for (const [name, scheme] of Object.entries(this.spec.components.securitySchemes)) {
        if (!scheme.type) {
          this.errors.push(`securitySchemes.${name}.type は必須です`);
        }
      }
    }
  }

  validateTags() {
    if (!this.spec.tags || this.spec.tags.length === 0) {
      this.warnings.push('tags セクションの追加を推奨します');
      return;
    }

    // 使用されているタグを収集
    const usedTags = new Set();
    if (this.spec.paths) {
      for (const pathItem of Object.values(this.spec.paths)) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
          if (pathItem[method]?.tags) {
            pathItem[method].tags.forEach(tag => usedTags.add(tag));
          }
        }
      }
    }

    // 定義されているが使用されていないタグ
    const definedTags = new Set(this.spec.tags.map(t => t.name));
    for (const tag of definedTags) {
      if (!usedTags.has(tag)) {
        this.warnings.push(`タグ '${tag}' は定義されていますが使用されていません`);
      }
    }

    // 使用されているが定義されていないタグ
    for (const tag of usedTags) {
      if (!definedTags.has(tag)) {
        this.warnings.push(`タグ '${tag}' は使用されていますが定義されていません`);
      }
    }
  }

  checkRecommendedSections() {
    for (const section of RECOMMENDED_SECTIONS) {
      if (!this.spec[section]) {
        this.warnings.push(`'${section}' セクションの追加を推奨します`);
      }
    }
  }

  getResult() {
    return {
      file: this.filePath,
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        errorCount: this.errors.length,
        warningCount: this.warnings.length,
      }
    };
  }
}

// メイン処理
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('使用方法: node validate-openapi.mjs <openapi-file>');
  process.exit(1);
}

const filePath = args[0];
const validator = new OpenAPIValidator(filePath);
const result = validator.validate();

// 結果出力
console.log('\n📋 OpenAPI Validation Report');
console.log('═'.repeat(50));
console.log(`ファイル: ${basename(filePath)}`);
console.log(`ステータス: ${result.valid ? '✅ 有効' : '❌ エラーあり'}`);
console.log(`エラー: ${result.summary.errorCount} 件`);
console.log(`警告: ${result.summary.warningCount} 件`);

if (result.errors.length > 0) {
  console.log('\n❌ エラー:');
  result.errors.forEach(err => console.log(`  - ${err}`));
}

if (result.warnings.length > 0) {
  console.log('\n⚠️ 警告:');
  result.warnings.forEach(warn => console.log(`  - ${warn}`));
}

console.log('');

process.exit(result.valid ? 0 : 1);
