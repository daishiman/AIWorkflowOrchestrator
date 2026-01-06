#!/usr/bin/env node
/**
 * validate-phase-output.mjs - Phase出力ファイルの機械的検証スクリプト
 *
 * 使用方法:
 *   node scripts/validate-phase-output.mjs <workflow-dir>
 *
 * 例:
 *   node scripts/validate-phase-output.mjs docs/30-workflows/chat-llm-switching
 *
 * 検証項目:
 *   - Phase 1 ~ Phase 13 の13ファイルが存在するか
 *   - 各ファイルに必須セクションが含まれているか
 *   - 命名規則に従っているか
 *   - index.md が存在するか
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, basename } from "path";

// Phase定義 (Phase 1〜13)
const PHASES = [
  { number: 1, name: "requirements", displayName: "要件定義" },
  { number: 2, name: "design", displayName: "設計" },
  { number: 3, name: "design-review", displayName: "設計レビューゲート" },
  { number: 4, name: "test-creation", displayName: "テスト作成" },
  { number: 5, name: "implementation", displayName: "実装" },
  { number: 6, name: "test-expansion", displayName: "テスト拡充" },
  { number: 7, name: "coverage-check", displayName: "テストカバレッジ確認" },
  { number: 8, name: "refactoring", displayName: "リファクタリング" },
  { number: 9, name: "quality-assurance", displayName: "品質保証" },
  { number: 10, name: "final-review", displayName: "最終レビューゲート" },
  { number: 11, name: "manual-test", displayName: "手動テスト検証" },
  { number: 12, name: "documentation", displayName: "ドキュメント更新" },
  { number: 13, name: "pr-creation", displayName: "PR作成" },
];

// 必須セクション
const REQUIRED_SECTIONS = [
  { pattern: /^#\s+Phase\s+(-?\d+):/m, name: "タイトル (# Phase N:)" },
  { pattern: /^##\s+メタ情報/m, name: "メタ情報" },
  { pattern: /^##\s+目的/m, name: "目的" },
  { pattern: /^##\s+使用スキル/m, name: "使用スキル" },
  { pattern: /^##\s+参照資料/m, name: "参照資料" },
  { pattern: /^##\s+(成果物|実行手順)/m, name: "成果物/実行手順" },
  { pattern: /^##\s+完了条件/m, name: "完了条件" },
];

// 品質基準チェック
const QUALITY_CHECKS = [
  {
    name: "曖昧表現の排除",
    pattern: /(適切に|必要に応じて|など|〜等|できるだけ)/g,
    severity: "warning",
    message: "曖昧な表現が含まれています",
  },
  {
    name: "スキル選定理由",
    pattern: /`[a-z-]+`:\s*.+/,
    severity: "error",
    message: "スキル選定理由が記載されていません",
    inSection: "使用スキル",
  },
];

class PhaseValidator {
  constructor(workflowDir) {
    this.workflowDir = workflowDir;
    this.errors = [];
    this.warnings = [];
    this.passes = [];
  }

  validate() {
    console.log(`\nPhase出力を検証中: ${this.workflowDir}\n`);

    // ディレクトリ存在確認
    if (!existsSync(this.workflowDir)) {
      this.errors.push(`ディレクトリが存在しません: ${this.workflowDir}`);
      return this.report();
    }

    // index.md 確認
    this.validateIndexFile();

    // 各Phaseファイル確認
    for (const phase of PHASES) {
      this.validatePhaseFile(phase);
    }

    return this.report();
  }

  validateIndexFile() {
    const indexPath = join(this.workflowDir, "index.md");
    if (!existsSync(indexPath)) {
      this.errors.push("index.md が存在しません");
    } else {
      const content = readFileSync(indexPath, "utf-8");

      // 全Phaseへのリンクがあるか確認
      let missingLinks = [];
      for (const phase of PHASES) {
        const phaseNum = String(phase.number);
        const linkPattern = new RegExp(`phase-${phaseNum}-`, "i");
        if (!linkPattern.test(content)) {
          missingLinks.push(`Phase ${phaseNum}`);
        }
      }

      if (missingLinks.length > 0) {
        this.warnings.push(
          `index.md に以下のPhaseへのリンクがありません: ${missingLinks.join(", ")}`,
        );
      } else {
        this.passes.push("index.md: 全Phaseへのリンクあり");
      }
    }
  }

  validatePhaseFile(phase) {
    const phaseNum = String(phase.number);
    const expectedPattern = `phase-${phaseNum}-`;

    // ファイル検索
    const files = readdirSync(this.workflowDir).filter(
      (f) => f.startsWith(expectedPattern) && f.endsWith(".md"),
    );

    if (files.length === 0) {
      this.errors.push(
        `Phase ${phaseNum} (${phase.displayName}) のファイルが見つかりません`,
      );
      return;
    }

    if (files.length > 1) {
      this.warnings.push(
        `Phase ${phaseNum} に複数のファイルがあります: ${files.join(", ")}`,
      );
    }

    const filePath = join(this.workflowDir, files[0]);
    const content = readFileSync(filePath, "utf-8");

    // 命名規則チェック
    const expectedName = `phase-${phaseNum}-${phase.name}.md`;
    if (files[0] !== expectedName) {
      this.warnings.push(
        `Phase ${phaseNum}: ファイル名が推奨形式と異なります (実際: ${files[0]}, 推奨: ${expectedName})`,
      );
    }

    // 必須セクションチェック
    for (const section of REQUIRED_SECTIONS) {
      if (!section.pattern.test(content)) {
        this.errors.push(
          `Phase ${phaseNum} (${files[0]}): 必須セクション「${section.name}」がありません`,
        );
      }
    }

    // Phase 1〜11は統合テスト連携セクション必須
    if (Number(phaseNum) >= 1 && Number(phaseNum) <= 11) {
      const integrationSection = /^##\s+統合テスト連携/m.test(content);
      if (!integrationSection) {
        this.errors.push(
          `Phase ${phaseNum} (${files[0]}): 必須セクション「統合テスト連携」がありません`,
        );
      }
    }

    // 品質チェック
    for (const check of QUALITY_CHECKS) {
      if (check.pattern.global) {
        const matches = content.match(check.pattern);
        if (matches && matches.length > 0) {
          if (check.severity === "error") {
            this.errors.push(
              `Phase ${phaseNum}: ${check.message} (${matches.slice(0, 3).join(", ")}...)`,
            );
          } else {
            this.warnings.push(
              `Phase ${phaseNum}: ${check.message} (${matches.slice(0, 3).join(", ")})`,
            );
          }
        }
      }
    }

    // スキル選定セクションの検証
    const skillSection = content.match(/^##\s+使用スキル[\s\S]*?(?=^##|\z)/m);
    if (skillSection) {
      const skillContent = skillSection[0];
      // スキル名と選定理由のパターン: `skill-name`: 理由
      const skillPattern = /`([a-z][a-z0-9-]*)`:\s*(.+)/g;
      const skills = [...skillContent.matchAll(skillPattern)];

      if (skills.length === 0) {
        this.warnings.push(
          `Phase ${phaseNum}: スキルが選定されていないか、形式が正しくありません`,
        );
      } else {
        this.passes.push(
          `Phase ${phaseNum}: ${skills.length}個のスキルが選定済み`,
        );
      }
    }

    // 完了条件のチェックリスト形式確認
    const completionSection = content.match(
      /^##\s+完了条件[\s\S]*?(?=^##|\z)/m,
    );
    if (completionSection) {
      const checkboxes = completionSection[0].match(/- \[ \]/g);
      if (!checkboxes || checkboxes.length === 0) {
        this.warnings.push(
          `Phase ${phaseNum}: 完了条件がチェックリスト形式ではありません`,
        );
      } else {
        this.passes.push(
          `Phase ${phaseNum}: ${checkboxes.length}個の完了条件あり`,
        );
      }
    }
  }

  report() {
    console.log("=".repeat(60));
    console.log("検証結果");
    console.log("=".repeat(60));

    if (this.errors.length > 0) {
      console.log("\n❌ エラー:");
      this.errors.forEach((e) => console.log(`  - ${e}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  警告:");
      this.warnings.forEach((w) => console.log(`  - ${w}`));
    }

    if (this.passes.length > 0) {
      console.log("\n✅ パス:");
      this.passes.forEach((p) => console.log(`  - ${p}`));
    }

    console.log("\n" + "-".repeat(60));
    console.log(
      `結果: ${this.errors.length === 0 ? "✓ 検証成功" : "✗ 検証失敗"} ` +
        `(${this.passes.length}項目パス, ${this.errors.length}エラー, ${this.warnings.length}警告)`,
    );

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      passes: this.passes,
    };
  }
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node validate-phase-output.mjs <workflow-dir>");
    console.error(
      "Example: node validate-phase-output.mjs docs/30-workflows/chat-llm-switching",
    );
    process.exit(1);
  }

  const workflowDir = args[0];
  const validator = new PhaseValidator(workflowDir);
  const result = validator.validate();

  process.exit(result.success ? 0 : 1);
}

main();
