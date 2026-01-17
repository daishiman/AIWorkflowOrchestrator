#!/usr/bin/env node
/**
 * validate-schema.mjs - JSONスキーマ検証スクリプト
 *
 * 指定されたJSONファイルをスキーマに対して検証する。
 *
 * 使用方法:
 *   node scripts/validate-schema.mjs --schema <schema-path> --data <data-path>
 *
 * 例:
 *   node scripts/validate-schema.mjs \
 *     --schema schemas/artifact-definition.json \
 *     --data docs/30-workflows/my-feature/artifacts.json
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__dirname, "..");

// 簡易JSONスキーマバリデータ
class SchemaValidator {
  constructor(schema) {
    this.schema = schema;
    this.errors = [];
  }

  validate(data, path = "") {
    this.errors = [];
    this._validate(data, this.schema, path);
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  _validate(data, schema, path) {
    // type チェック
    if (schema.type) {
      const actualType = this._getType(data);
      if (schema.type !== actualType) {
        this.errors.push({
          path: path || "(root)",
          message: `Expected type "${schema.type}", got "${actualType}"`,
        });
        return;
      }
    }

    // required チェック
    if (schema.required && schema.type === "object") {
      for (const prop of schema.required) {
        if (data[prop] === undefined) {
          this.errors.push({
            path: `${path}.${prop}`,
            message: `Required property "${prop}" is missing`,
          });
        }
      }
    }

    // properties チェック（object）
    if (schema.properties && typeof data === "object" && data !== null) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (data[key] !== undefined) {
          this._validate(data[key], propSchema, `${path}.${key}`);
        }
      }
    }

    // patternProperties チェック（object）
    if (schema.patternProperties && typeof data === "object" && data !== null) {
      for (const [pattern, propSchema] of Object.entries(
        schema.patternProperties
      )) {
        const regex = new RegExp(pattern);
        for (const [key, value] of Object.entries(data)) {
          if (regex.test(key)) {
            this._validate(value, propSchema, `${path}.${key}`);
          }
        }
      }
    }

    // items チェック（array）
    if (schema.items && Array.isArray(data)) {
      data.forEach((item, index) => {
        this._validate(item, schema.items, `${path}[${index}]`);
      });
    }

    // minLength チェック（string）
    if (schema.minLength && typeof data === "string") {
      if (data.length < schema.minLength) {
        this.errors.push({
          path: path || "(root)",
          message: `String length ${data.length} is less than minimum ${schema.minLength}`,
        });
      }
    }

    // minItems チェック（array）
    if (schema.minItems && Array.isArray(data)) {
      if (data.length < schema.minItems) {
        this.errors.push({
          path: path || "(root)",
          message: `Array length ${data.length} is less than minimum ${schema.minItems}`,
        });
      }
    }

    // enum チェック
    if (schema.enum && !schema.enum.includes(data)) {
      this.errors.push({
        path: path || "(root)",
        message: `Value "${data}" is not in enum [${schema.enum.join(", ")}]`,
      });
    }

    // pattern チェック（string）
    if (schema.pattern && typeof data === "string") {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        this.errors.push({
          path: path || "(root)",
          message: `Value "${data}" does not match pattern "${schema.pattern}"`,
        });
      }
    }

    // minimum/maximum チェック（number/integer）
    if (schema.minimum !== undefined && typeof data === "number") {
      if (data < schema.minimum) {
        this.errors.push({
          path: path || "(root)",
          message: `Value ${data} is less than minimum ${schema.minimum}`,
        });
      }
    }
    if (schema.maximum !== undefined && typeof data === "number") {
      if (data > schema.maximum) {
        this.errors.push({
          path: path || "(root)",
          message: `Value ${data} is greater than maximum ${schema.maximum}`,
        });
      }
    }
  }

  _getType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  }
}

// 引数パース
function parseArgs(args) {
  const result = { schema: null, data: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--schema" && args[i + 1]) {
      result.schema = args[i + 1];
      i++;
    } else if (args[i] === "--data" && args[i + 1]) {
      result.data = args[i + 1];
      i++;
    }
  }

  return result;
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  // 引数検証
  if (!args.schema) {
    console.error("Error: --schema is required");
    showUsage();
    process.exit(1);
  }

  if (!args.data) {
    console.error("Error: --data is required");
    showUsage();
    process.exit(1);
  }

  // スキーマファイル読み込み
  const schemaPath = resolve(SKILL_ROOT, args.schema);
  if (!existsSync(schemaPath)) {
    console.error(`Error: Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  // データファイル読み込み
  const dataPath = resolve(process.cwd(), args.data);
  if (!existsSync(dataPath)) {
    console.error(`Error: Data file not found: ${dataPath}`);
    process.exit(1);
  }

  console.log(`\n📋 スキーマ検証\n`);
  console.log(`スキーマ: ${args.schema}`);
  console.log(`データ: ${args.data}\n`);

  try {
    const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
    const data = JSON.parse(readFileSync(dataPath, "utf-8"));

    const validator = new SchemaValidator(schema);
    const result = validator.validate(data);

    if (result.valid) {
      console.log("✅ 検証成功: スキーマに準拠しています\n");
      process.exit(0);
    } else {
      console.log("❌ 検証失敗:\n");
      for (const error of result.errors) {
        console.log(`  - ${error.path}: ${error.message}`);
      }
      console.log("");
      process.exit(1);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

function showUsage() {
  console.error(`
Usage: node validate-schema.mjs --schema <schema-path> --data <data-path>

Options:
  --schema  スキーマファイルパス（スキル相対パス）
  --data    検証対象JSONファイルパス

Example:
  node validate-schema.mjs \\
    --schema schemas/artifact-definition.json \\
    --data docs/30-workflows/my-feature/artifacts.json
`);
}

main();
