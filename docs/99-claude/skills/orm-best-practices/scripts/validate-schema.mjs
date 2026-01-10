#!/usr/bin/env node

/**
 * Drizzle ORMスキーマ検証スクリプト
 *
 * 使用方法:
 *   node validate-schema.mjs <schema-file-or-directory>
 *
 * 検証内容:
 *   - テーブル定義の妥当性
 *   - カラム型の適切さ
 *   - インデックスの設定
 *   - リレーションの整合性
 */

import fs from "fs";
import path from "path";

// 設定
const CONFIG = {
  extensions: [".ts"],
  excludeDirs: ["node_modules", "dist", "build", ".git"],
};

// 検証パターン
const PATTERNS = {
  // テーブル定義
  tableDefinition: /export\s+const\s+(\w+)\s*=\s*sqliteTable\s*\(/g,

  // カラム定義
  columns: {
    integer: /integer\s*\(['"`](\w+)['"`]\)/g,
    text: /text\s*\(['"`](\w+)['"`]\)/g,
    real: /real\s*\(['"`](\w+)['"`]\)/g,
    blob: /blob\s*\(['"`](\w+)['"`]\)/g,
    json: /text\s*\(['"`](\w+)['"`]\)[^,]*mode\s*:\s*['"`]json['"`]/g,
  },

  // 制約
  primaryKey: /\.primaryKey\s*\(/,
  notNull: /\.notNull\s*\(/,
  unique: /\.unique\s*\(/,
  references: /\.references\s*\(\s*\(\)\s*=>\s*(\w+)\.(\w+)/g,
  default: /\.default\s*\(/,
  defaultNow: /\.defaultNow\s*\(/,
  defaultRandom: /\.defaultRandom\s*\(/,

  // インデックス
  index: /index\s*\(['"`](\w+)['"`]\)/g,

  // リレーション
  relations: /relations\s*\(\s*(\w+)\s*,/g,
  oneRelation: /one\s*\(\s*(\w+)/g,
  manyRelation: /many\s*\(\s*(\w+)/g,

  // アンチパターン
  antiPatterns: {
    selectStar: /db\.select\s*\(\s*\)\s*\.from/g,
    textForEnum: /text\s*\(['"`]\w+['"`]\)(?!.*notNull)/g,
    noTimestamps:
      /pgTable\s*\([^)]+\{(?![\s\S]*timestamp[\s\S]*created_at)[\s\S]*\}/g,
  },
};

/**
 * ファイルを再帰的に走査
 */
function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!CONFIG.excludeDirs.includes(file)) {
        walkDirectory(filePath, callback);
      }
    } else if (CONFIG.extensions.includes(path.extname(file))) {
      callback(filePath);
    }
  }
}

/**
 * テーブル定義を抽出
 */
function extractTables(content) {
  const tables = [];
  const regex = /export\s+const\s+(\w+)\s*=\s*pgTable\s*\(\s*['"`](\w+)['"`]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    tables.push({
      variableName: match[1],
      tableName: match[2],
    });
  }

  return tables;
}

/**
 * カラム情報を抽出
 */
function extractColumns(content, tableName) {
  const columns = [];
  const tableRegex = new RegExp(
    `const\\s+${tableName}\\s*=\\s*sqliteTable\\s*\\([^{]*\\{([^}]+)\\}`,
    "s",
  );
  const tableMatch = content.match(tableRegex);

  if (!tableMatch) return columns;

  const columnContent = tableMatch[1];

  // 各カラム型をチェック
  for (const [type, pattern] of Object.entries(PATTERNS.columns)) {
    const regex = new RegExp(pattern.source, "g");
    let match;
    while ((match = regex.exec(columnContent)) !== null) {
      const columnDef = columnContent.substring(
        match.index,
        columnContent.indexOf(",", match.index + 100) + 1 ||
          columnContent.length,
      );

      columns.push({
        name: match[1],
        type,
        isPrimaryKey: PATTERNS.primaryKey.test(columnDef),
        isNotNull: PATTERNS.notNull.test(columnDef),
        isUnique: PATTERNS.unique.test(columnDef),
        hasDefault:
          PATTERNS.default.test(columnDef) ||
          PATTERNS.defaultNow.test(columnDef) ||
          PATTERNS.defaultRandom.test(columnDef),
      });
    }
  }

  return columns;
}

/**
 * リレーション情報を抽出
 */
function extractRelations(content) {
  const relations = [];
  const regex = /export\s+const\s+(\w+)Relations\s*=\s*relations\s*\(\s*(\w+)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    relations.push({
      name: match[1],
      table: match[2],
    });
  }

  return relations;
}

/**
 * スキーマを検証
 */
function validateSchema(content, filePath) {
  const issues = [];
  const info = [];

  const tables = extractTables(content);

  for (const table of tables) {
    const columns = extractColumns(content, table.variableName);

    // 1. 主キーの確認
    const hasPrimaryKey = columns.some((c) => c.isPrimaryKey);
    if (!hasPrimaryKey) {
      issues.push({
        type: "NO_PRIMARY_KEY",
        severity: "ERROR",
        table: table.tableName,
        message: `テーブル ${table.tableName} に主キーがありません`,
      });
    }

    // 2. 主キーの型チェック（SQLiteではintegerまたはtextを推奨）
    const pkColumn = columns.find((c) => c.isPrimaryKey);
    if (pkColumn && !["integer", "text"].includes(pkColumn.type)) {
      issues.push({
        type: "NON_STANDARD_PRIMARY_KEY",
        severity: "WARNING",
        table: table.tableName,
        message: `テーブル ${table.tableName} の主キーが推奨型ではありません（現在: ${pkColumn.type}、推奨: integer or text）`,
      });
    }

    // 3. タイムスタンプカラムの確認
    const hasCreatedAt = columns.some(
      (c) => c.name === "created_at" || c.name === "createdAt",
    );
    const hasUpdatedAt = columns.some(
      (c) => c.name === "updated_at" || c.name === "updatedAt",
    );

    if (!hasCreatedAt) {
      issues.push({
        type: "NO_CREATED_AT",
        severity: "INFO",
        table: table.tableName,
        message: `テーブル ${table.tableName} に created_at カラムがありません`,
      });
    }

    if (!hasUpdatedAt) {
      issues.push({
        type: "NO_UPDATED_AT",
        severity: "INFO",
        table: table.tableName,
        message: `テーブル ${table.tableName} に updated_at カラムがありません`,
      });
    }

    // 4. text型のnotNull推奨
    const textColumns = columns.filter((c) => c.type === "text");
    for (const col of textColumns) {
      if (
        !col.isNotNull &&
        !["description", "note", "memo"].includes(col.name.toLowerCase())
      ) {
        issues.push({
          type: "TEXT_WITHOUT_NOT_NULL",
          severity: "INFO",
          table: table.tableName,
          column: col.name,
          message: `${table.tableName}.${col.name} (text) に notNull がありません`,
        });
      }
    }

    // 5. JSONの型付け確認
    const jsonColumns = columns.filter((c) => c.type === "json");
    if (jsonColumns.length > 0) {
      info.push({
        type: "JSON_COLUMNS",
        table: table.tableName,
        columns: jsonColumns.map((c) => c.name),
        message: `${table.tableName} にJSONカラムがあります。text({ mode: 'json' }).$type<T>()で型付けを推奨`,
      });
    }

    // カラム情報を記録
    info.push({
      type: "TABLE_INFO",
      table: table.tableName,
      columnCount: columns.length,
      columns: columns.map((c) => ({
        name: c.name,
        type: c.type,
        nullable: !c.isNotNull,
      })),
    });
  }

  // 6. リレーション定義の確認
  const relations = extractRelations(content);
  const tableNames = tables.map((t) => t.variableName);

  for (const rel of relations) {
    if (!tableNames.includes(rel.table)) {
      issues.push({
        type: "ORPHAN_RELATION",
        severity: "WARNING",
        relation: rel.name,
        message: `リレーション ${rel.name}Relations のテーブル ${rel.table} が見つかりません`,
      });
    }
  }

  // 7. インデックスの確認
  const indexMatches = content.match(PATTERNS.index);
  const indexCount = indexMatches ? indexMatches.length : 0;

  info.push({
    type: "INDEX_COUNT",
    count: indexCount,
    message: `${indexCount}個のインデックスが定義されています`,
  });

  // 8. アンチパターン検出
  if (PATTERNS.antiPatterns.selectStar.test(content)) {
    issues.push({
      type: "SELECT_STAR",
      severity: "WARNING",
      message:
        "db.select().from() が検出されました。必要なカラムのみ選択することを推奨",
    });
  }

  return { tables, issues, info };
}

/**
 * レポート生成
 */
function generateReport(results) {
  const report = {
    summary: {
      totalFiles: results.length,
      totalTables: 0,
      totalIssues: 0,
      bySeverity: { ERROR: 0, WARNING: 0, INFO: 0 },
      byType: {},
    },
    files: [],
  };

  for (const result of results) {
    report.summary.totalTables += result.validation.tables.length;

    report.files.push({
      path: result.filePath,
      tables: result.validation.tables.map((t) => t.tableName),
      issues: result.validation.issues,
      info: result.validation.info,
    });

    for (const issue of result.validation.issues) {
      report.summary.totalIssues++;
      report.summary.bySeverity[issue.severity]++;
      report.summary.byType[issue.type] =
        (report.summary.byType[issue.type] || 0) + 1;
    }
  }

  return report;
}

/**
 * レポート出力
 */
function printReport(report) {
  console.log("\n" + "=".repeat(60));
  console.log("Drizzle ORM スキーマ検証レポート");
  console.log("=".repeat(60));

  // サマリー
  console.log("\n📊 サマリー");
  console.log("-".repeat(40));
  console.log(`  ファイル数: ${report.summary.totalFiles}`);
  console.log(`  テーブル数: ${report.summary.totalTables}`);
  console.log(`  問題検出数: ${report.summary.totalIssues}`);

  if (report.summary.totalIssues > 0) {
    console.log("\n  重要度別:");
    console.log(`    🔴 ERROR: ${report.summary.bySeverity.ERROR}`);
    console.log(`    🟡 WARNING: ${report.summary.bySeverity.WARNING}`);
    console.log(`    🔵 INFO: ${report.summary.bySeverity.INFO}`);
  }

  // 詳細
  console.log("\n\n📋 詳細");
  console.log("-".repeat(40));

  for (const file of report.files) {
    console.log(`\n📁 ${file.path}`);

    if (file.tables.length > 0) {
      console.log(`   テーブル: ${file.tables.join(", ")}`);
    }

    // テーブル情報
    const tableInfos = file.info.filter((i) => i.type === "TABLE_INFO");
    for (const info of tableInfos) {
      console.log(`   📝 ${info.table}: ${info.columnCount}カラム`);
    }

    // JSON警告
    const jsonInfos = file.info.filter((i) => i.type === "JSON_COLUMNS");
    for (const info of jsonInfos) {
      console.log(`   ℹ️  ${info.message}`);
    }

    // 問題
    if (file.issues.length > 0) {
      console.log("   ⚠️  問題:");
      for (const issue of file.issues) {
        const icon =
          issue.severity === "ERROR"
            ? "🔴"
            : issue.severity === "WARNING"
              ? "🟡"
              : "🔵";
        console.log(`      ${icon} [${issue.type}] ${issue.message}`);
      }
    } else {
      console.log("   ✅ 問題なし");
    }
  }

  // 推奨事項
  if (report.summary.totalIssues > 0) {
    console.log("\n\n💡 推奨事項");
    console.log("-".repeat(40));

    if (report.summary.byType.NO_PRIMARY_KEY > 0) {
      console.log("  • すべてのテーブルに主キーを定義してください");
    }
    if (report.summary.byType.NON_STANDARD_PRIMARY_KEY > 0) {
      console.log("  • 主キーにはinteger型またはtext型の使用を推奨します");
    }
    if (report.summary.byType.NO_CREATED_AT > 0) {
      console.log("  • created_at カラムの追加を検討してください");
    }
    if (report.summary.byType.SELECT_STAR > 0) {
      console.log(
        "  • SELECT * の代わりに必要なカラムを明示的に指定してください",
      );
    }
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "使用方法: node validate-schema.mjs <schema-file-or-directory>",
    );
    console.log("");
    console.log("オプション:");
    console.log("  --json    JSON形式で出力");
    process.exit(1);
  }

  const target = args[0];
  const jsonOutput = args.includes("--json");

  if (!fs.existsSync(target)) {
    console.error(
      `エラー: ファイルまたはディレクトリが存在しません: ${target}`,
    );
    process.exit(1);
  }

  console.log(`\n🔍 スキーマ検証中: ${target}`);

  const results = [];
  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    walkDirectory(target, (filePath) => {
      if (filePath.includes("schema") || filePath.includes("tables")) {
        const content = fs.readFileSync(filePath, "utf-8");
        if (content.includes("sqliteTable")) {
          const validation = validateSchema(content, filePath);
          if (validation.tables.length > 0) {
            results.push({ filePath, validation });
          }
        }
      }
    });
  } else {
    const content = fs.readFileSync(target, "utf-8");
    const validation = validateSchema(content, target);
    results.push({ filePath: target, validation });
  }

  const report = generateReport(results);

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  // 終了コード
  if (report.summary.bySeverity.ERROR > 0) {
    process.exit(1);
  }
}

main();
