#!/usr/bin/env node

/**
 * テストデータ生成スクリプト
 *
 * 使用法:
 *   node generate-test-data.mjs [options]
 *
 * オプション:
 *   --type <user|project|task>  生成するデータの種類
 *   --count <number>            生成するデータの数（デフォルト: 1）
 *   --output <file>             出力ファイル（デフォルト: 標準出力）
 *   --format <json|sql|ts>      出力フォーマット（デフォルト: json）
 *   --unique-prefix <string>    一意性のためのプレフィックス（デフォルト: タイムスタンプ）
 *
 * 例:
 *   node generate-test-data.mjs --type user --count 5 --output users.json
 *   node generate-test-data.mjs --type project --count 10 --format ts --output projects.ts
 */

import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

class TestDataGenerator {
  constructor(uniquePrefix = null) {
    this.uniquePrefix = uniquePrefix || `test_${Date.now()}`;
  }

  /**
   * 一意のメールアドレスを生成
   */
  generateEmail(baseName) {
    const uuid = randomUUID().slice(0, 8);
    return `${this.uniquePrefix}_${baseName}_${uuid}@test.example.com`;
  }

  /**
   * 一意の名前を生成
   */
  generateName(baseName, index) {
    return `${baseName} ${this.uniquePrefix}_${index}`;
  }

  /**
   * 一意のIDを生成
   */
  generateId() {
    return randomUUID();
  }

  /**
   * ランダムな日付を生成（過去30日以内）
   */
  generateRecentDate() {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
    return new Date(randomTime).toISOString();
  }

  /**
   * ユーザーデータを生成
   */
  generateUser(index) {
    return {
      id: this.generateId(),
      email: this.generateEmail(`user${index}`),
      name: this.generateName('Test User', index),
      passwordHash: 'hashed_test_password_123',
      role: ['admin', 'developer', 'viewer'][Math.floor(Math.random() * 3)],
      emailVerified: Math.random() > 0.3 ? this.generateRecentDate() : null,
      createdAt: this.generateRecentDate(),
      updatedAt: this.generateRecentDate(),
    };
  }

  /**
   * プロジェクトデータを生成
   */
  generateProject(index, ownerId = null) {
    const statuses = ['planning', 'active', 'on_hold', 'completed', 'archived'];
    return {
      id: this.generateId(),
      name: this.generateName('Test Project', index),
      description: `Automated test project created at ${this.uniquePrefix}`,
      ownerId: ownerId || this.generateId(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      startDate: this.generateRecentDate(),
      endDate: Math.random() > 0.5 ? this.generateRecentDate() : null,
      tags: [`tag_${index}`, this.uniquePrefix],
      createdAt: this.generateRecentDate(),
      updatedAt: this.generateRecentDate(),
    };
  }

  /**
   * タスクデータを生成
   */
  generateTask(index, projectId = null, assigneeId = null) {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['todo', 'in_progress', 'review', 'done'];
    return {
      id: this.generateId(),
      title: this.generateName('Test Task', index),
      description: `Automated test task for ${this.uniquePrefix}`,
      projectId: projectId || this.generateId(),
      assigneeId: assigneeId || this.generateId(),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      dueDate: Math.random() > 0.3 ? this.generateRecentDate() : null,
      estimatedHours: Math.floor(Math.random() * 40) + 1,
      actualHours: Math.random() > 0.5 ? Math.floor(Math.random() * 50) : null,
      tags: [`task_tag_${index}`, this.uniquePrefix],
      createdAt: this.generateRecentDate(),
      updatedAt: this.generateRecentDate(),
    };
  }

  /**
   * 複数のデータを生成
   */
  generateBatch(type, count) {
    const data = [];
    for (let i = 1; i <= count; i++) {
      switch (type) {
        case 'user':
          data.push(this.generateUser(i));
          break;
        case 'project':
          data.push(this.generateProject(i));
          break;
        case 'task':
          data.push(this.generateTask(i));
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }
    }
    return data;
  }

  /**
   * JSONフォーマットで出力
   */
  formatAsJson(data) {
    return JSON.stringify(data, null, 2);
  }

  /**
   * TypeScriptフォーマットで出力
   */
  formatAsTypeScript(data, type) {
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    let output = `// Auto-generated test data for ${type}\n`;
    output += `// Generated at: ${new Date().toISOString()}\n\n`;
    output += `export const test${typeName}s = `;
    output += JSON.stringify(data, null, 2);
    output += ' as const;\n\n';
    output += `export type Test${typeName} = typeof test${typeName}s[number];\n`;
    return output;
  }

  /**
   * SQLフォーマットで出力（PostgreSQL INSERT文）
   */
  formatAsSql(data, type) {
    if (data.length === 0) return '';

    const tableName = `${type}s`;
    const keys = Object.keys(data[0]);
    let sql = `-- Auto-generated test data for ${tableName}\n`;
    sql += `-- Generated at: ${new Date().toISOString()}\n\n`;

    for (const record of data) {
      const values = keys.map((key) => {
        const value = record[key];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        if (Array.isArray(value))
          return `ARRAY[${value.map((v) => `'${v}'`).join(', ')}]`;
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      });

      sql += `INSERT INTO ${tableName} (${keys.join(', ')})\n`;
      sql += `VALUES (${values.join(', ')});\n\n`;
    }

    return sql;
  }
}

// CLI処理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: 'user',
    count: 1,
    output: null,
    format: 'json',
    uniquePrefix: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--type':
        options.type = args[++i];
        break;
      case '--count':
        options.count = parseInt(args[++i], 10);
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--unique-prefix':
        options.uniquePrefix = args[++i];
        break;
      case '--help':
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown option: ${args[i]}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
テストデータ生成スクリプト

使用法:
  node generate-test-data.mjs [options]

オプション:
  --type <user|project|task>  生成するデータの種類
  --count <number>            生成するデータの数（デフォルト: 1）
  --output <file>             出力ファイル（デフォルト: 標準出力）
  --format <json|sql|ts>      出力フォーマット（デフォルト: json）
  --unique-prefix <string>    一意性のためのプレフィックス（デフォルト: タイムスタンプ）
  --help                      このヘルプを表示

例:
  node generate-test-data.mjs --type user --count 5 --output users.json
  node generate-test-data.mjs --type project --count 10 --format ts --output projects.ts
  node generate-test-data.mjs --type task --count 20 --format sql --output tasks.sql
  `);
}

function main() {
  try {
    const options = parseArgs();

    // データ生成
    const generator = new TestDataGenerator(options.uniquePrefix);
    const data = generator.generateBatch(options.type, options.count);

    // フォーマット
    let output;
    switch (options.format) {
      case 'json':
        output = generator.formatAsJson(data);
        break;
      case 'ts':
        output = generator.formatAsTypeScript(data, options.type);
        break;
      case 'sql':
        output = generator.formatAsSql(data, options.type);
        break;
      default:
        throw new Error(`Unknown format: ${options.format}`);
    }

    // 出力
    if (options.output) {
      writeFileSync(options.output, output, 'utf-8');
      console.log(`✅ Generated ${options.count} ${options.type}(s) → ${options.output}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmainを実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// モジュールとしてもエクスポート
export { TestDataGenerator };
