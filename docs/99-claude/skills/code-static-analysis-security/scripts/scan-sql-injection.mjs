#!/usr/bin/env node

/**
 * SQLインジェクション検出スクリプト
 *
 * 使用方法: node scan-sql-injection.mjs <directory>
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const sqlInjectionPatterns = [
  {
    name: "String concatenation in query",
    pattern: /(query|exec|raw)\s*\(\s*['"`].*\$\{/,
    severity: "critical",
  },
  {
    name: "String concatenation with +",
    pattern: /(query|exec)\s*\(\s*['"`].*\+\s*\w+/,
    severity: "critical",
  },
  {
    name: "Template literal in SQL",
    pattern: /db\.(query|exec|raw)\s*\(\s*`.*\$\{/,
    severity: "critical",
  },
];

class SQLInjectionScanner {
  constructor(targetDir) {
    this.targetDir = targetDir;
    this.findings = [];
  }

  scan() {
    console.log(
      `${colors.cyan}=== SQLインジェクションスキャン ===${colors.reset}\n`,
    );
    console.log(`対象: ${this.targetDir}\n`);

    this.scanDirectory(this.targetDir);
    this.printResults();
  }

  scanDirectory(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        if (
          !file.startsWith(".") &&
          file !== "node_modules" &&
          file !== "dist"
        ) {
          this.scanDirectory(filePath);
        }
      } else if (this.isTargetFile(file)) {
        this.analyzeFile(filePath);
      }
    }
  }

  isTargetFile(filename) {
    const ext = extname(filename);
    return [".js", ".ts", ".jsx", ".tsx", ".mjs"].includes(ext);
  }

  analyzeFile(filePath) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        this.checkLine(filePath, line, index + 1);
      });
    } catch (error) {
      // Skip
    }
  }

  checkLine(filePath, line, lineNumber) {
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      return;
    }

    for (const { name, pattern, severity } of sqlInjectionPatterns) {
      if (pattern.test(line)) {
        this.findings.push({
          file: filePath,
          line: lineNumber,
          type: name,
          severity,
          code: line.trim(),
        });
      }
    }
  }

  printResults() {
    if (this.findings.length === 0) {
      console.log(
        `${colors.green}✅ SQLインジェクション脆弱性は検出されませんでした${colors.reset}\n`,
      );
      return;
    }

    console.log(
      `${colors.red}🚨 検出された脆弱性: ${this.findings.length}件${colors.reset}\n`,
    );

    this.findings.forEach((finding, index) => {
      console.log(`${index + 1}. ${finding.file}:${finding.line}`);
      console.log(`   タイプ: ${finding.type}`);
      console.log(`   重要度: ${finding.severity}`);
      console.log(`   コード: ${finding.code.substring(0, 80)}`);
      console.log("");
    });

    console.log(`${colors.cyan}=== 修正推奨 ===${colors.reset}\n`);
    console.log(`パラメータ化クエリを使用してください:`);
    console.log(`  db.query('SELECT * FROM users WHERE id = $1', [userId]);\n`);

    process.exit(1);
  }
}

const scanner = new SQLInjectionScanner(process.argv[2] || "./src");
scanner.scan();
