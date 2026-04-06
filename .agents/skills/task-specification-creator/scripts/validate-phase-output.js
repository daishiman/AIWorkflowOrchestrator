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

// Phase定義 (Phase 0〜13)
// Phase 0は条件付き（外部SDK調査が必要な場合のみ）
const PHASES_REQUIRED = [
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

// Phase 0（条件付き）
const PHASE_OPTIONAL = {
  number: 0,
  name: "sdk-research",
  displayName: "外部SDK調査",
  optional: true,
};

const PHASE_FILE_ALIASES = {
  1: ["requirements"],
  2: ["design"],
  3: ["design-review"],
  4: ["test-creation"],
  5: ["implementation"],
  6: ["test-expansion"],
  7: ["coverage-check", "coverage"],
  8: ["refactoring"],
  9: ["quality-assurance", "quality"],
  10: ["final-review"],
  11: ["manual-test"],
  12: ["documentation"],
  13: ["pr-creation"],
};

// 後方互換性のためPHASESを維持
const PHASES = PHASES_REQUIRED;

// 必須セクション
const REQUIRED_SECTIONS = [
  { pattern: /^#\s+Phase\s+(-?\d+):/m, name: "タイトル (# Phase N:)" },
  { pattern: /^##\s+メタ情報/m, name: "メタ情報" },
  { pattern: /^##\s+目的/m, name: "目的" },
  { pattern: /^##\s+実行タスク/m, name: "実行タスク" },
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

    // Phase 0 の存在確認（オプショナル）
    this.validateOptionalPhase0();

    // 各Phaseファイル確認 (Phase 1〜13)
    for (const phase of PHASES) {
      this.validatePhaseFile(phase);
    }

    this.validateArtifactsParity();
    this.validatePhase11Outputs();
    this.validatePhase12Wording();

    return this.report();
  }

  validateArtifactsParity() {
    const artifactsPath = join(this.workflowDir, "artifacts.json");
    if (!existsSync(artifactsPath)) {
      this.warnings.push("artifacts.json が存在しません");
      return;
    }

    const outputArtifactsPath = join(
      this.workflowDir,
      "outputs",
      "artifacts.json",
    );

    if (!existsSync(outputArtifactsPath)) {
      this.errors.push(
        "root artifacts.json は存在しますが outputs/artifacts.json がありません",
      );
      return;
    }

    const rootContent = readFileSync(artifactsPath, "utf-8").trim();
    const outputContent = readFileSync(outputArtifactsPath, "utf-8").trim();

    if (rootContent !== outputContent) {
      this.warnings.push(
        "artifacts.json と outputs/artifacts.json が一致していません",
      );
      return;
    }

    this.passes.push("artifacts.json: root と outputs/artifacts.json が同期済み");
  }

  validatePhase11Outputs() {
    const phase11Files = readdirSync(this.workflowDir).filter(
      (f) => f.startsWith("phase-11-") && f.endsWith(".md"),
    );
    if (phase11Files.length === 0) {
      return;
    }

    const phase11Path = join(this.workflowDir, phase11Files[0]);
    const phase11Content = readFileSync(phase11Path, "utf-8");
    const phase11OutputDir = join(this.workflowDir, "outputs", "phase-11");
    const screenshotDir = join(phase11OutputDir, "screenshots");
    const isDocsOnlyPhase11 = this.detectDocsOnlyPhase11(phase11Content);
    const expectsVisualEvidence = !isDocsOnlyPhase11;

    if (!existsSync(phase11OutputDir)) {
      this.warnings.push("outputs/phase-11 ディレクトリが存在しません");
      return;
    }

    const phase11RequiredFiles = [
      "manual-test-checklist.md",
      "manual-test-result.md",
      "discovered-issues.md",
    ];
    if (expectsVisualEvidence) {
      phase11RequiredFiles.push("screenshot-plan.json");
    }

    const missingFiles = phase11RequiredFiles.filter(
      (file) => !existsSync(join(phase11OutputDir, file)),
    );
    if (missingFiles.length > 0) {
      const message = `Phase 11 補助成果物が不足しています: ${missingFiles.join(", ")}`;
      if (expectsVisualEvidence) {
        this.errors.push(message);
      } else {
        this.errors.push(message);
      }
    } else {
      this.passes.push(
        `Phase 11: 補助成果物が揃っています (${phase11RequiredFiles.join(", ")})`,
      );
    }

    if (expectsVisualEvidence && existsSync(screenshotDir)) {
      const pngFiles = readdirSync(screenshotDir).filter((file) =>
        /\.png$/i.test(file),
      );
      if (pngFiles.length === 0) {
        this.errors.push(
          "outputs/phase-11/screenshots は存在しますが PNG 証跡が 0 件です",
        );
      } else {
        this.passes.push(
          `Phase 11: screenshot PNG 証跡 ${pngFiles.length}件を確認`,
        );
      }
    } else if (expectsVisualEvidence) {
      this.errors.push(
        "Phase 11 は画面証跡を要求していますが outputs/phase-11/screenshots がありません",
      );
    }
  }

  validatePhase12Wording() {
    const prohibitedPatterns = [
      { pattern: /\bplanned\b/i, label: "planned" },
      { pattern: /PR作成時に実施/, label: "PR作成時に実施" },
      { pattern: /PRマージ後/, label: "PRマージ後" },
    ];
    const filesToScan = [];

    const phase12Files = readdirSync(this.workflowDir).filter(
      (f) => f.startsWith("phase-12-") && f.endsWith(".md"),
    );
    phase12Files.forEach((file) => filesToScan.push(join(this.workflowDir, file)));

    const phase12OutputDir = join(this.workflowDir, "outputs", "phase-12");
    if (existsSync(phase12OutputDir)) {
      readdirSync(phase12OutputDir)
        .filter((file) => file.endsWith(".md"))
        .forEach((file) => filesToScan.push(join(phase12OutputDir, file)));
    }

    let foundCount = 0;
    for (const filePath of filesToScan) {
      const content = readFileSync(filePath, "utf-8");
      const hits = prohibitedPatterns
        .filter(({ pattern }) => pattern.test(content))
        .map(({ label }) => label);
      if (hits.length > 0) {
        foundCount += 1;
        this.warnings.push(
          `${basename(filePath)}: Phase 12 に計画系 wording が残っています (${hits.join(", ")})`,
        );
      }
    }

    if (filesToScan.length > 0 && foundCount === 0) {
      this.passes.push("Phase 12: planned wording / PR後追い文言なし");
    }
  }

  detectDocsOnlyPhase11(phase11Content) {
    const classifyTaskType = (value) => {
      const text = String(value ?? "").trim();
      if (!text) return null;
      if (/(docs-only|docs|non[_-]?visual)/i.test(text)) {
        return true;
      }
      if (/(visual|ui)/i.test(text) && !/(docs-only|docs|non[_-]?visual)/i.test(text)) {
        return false;
      }
      return null;
    };

    const indexPath = join(this.workflowDir, "index.md");
    let indexSignal = null;
    if (existsSync(indexPath)) {
      const indexContent = readFileSync(indexPath, "utf-8");
      const taskTypeMatch = indexContent.match(/^\|\s*タスク種別\s*\|\s*([^|]+)\|/m);
      if (taskTypeMatch) {
        indexSignal = classifyTaskType(taskTypeMatch[1]);
      }
    }

    const artifactsPath = join(this.workflowDir, "artifacts.json");
    let artifactsSignal = null;
    if (existsSync(artifactsPath)) {
      try {
        const artifacts = JSON.parse(readFileSync(artifactsPath, "utf-8"));
        artifactsSignal = classifyTaskType(artifacts?.metadata?.taskType);
      } catch {
        this.warnings.push(
          "Phase 11 docs-only 判定で artifacts.json の解析に失敗したため、screenshot 要件を維持します",
        );
      }
    }

    if (indexSignal === true && artifactsSignal === true) {
      return true;
    }

    if (indexSignal === false || artifactsSignal === false) {
      this.warnings.push(
        "Phase 11 docs-only 判定は index.md / artifacts.json の両方で docs-only 相当を確認できなかったため screenshot 要件を維持します",
      );
      return false;
    }

    if (indexSignal === true || artifactsSignal === true) {
      this.warnings.push(
        "Phase 11 docs-only 判定は index.md / artifacts.json の両方で一致しなかったため fail-closed しました",
      );
      return false;
    }

    if (/(docs-only|NON_VISUAL|spec_created)/i.test(phase11Content)) {
      this.warnings.push(
        "Phase 11 本文に docs-only 記述がありますが、index.md / artifacts.json と両方で確認できないため screenshot 要件を外しません",
      );
    }

    return false;
  }

  validateOptionalPhase0() {
    const files = readdirSync(this.workflowDir).filter(
      (f) => f.startsWith("phase-0-") && f.endsWith(".md"),
    );

    if (files.length > 0) {
      // Phase 0が存在する場合は検証
      console.log("ℹ️  Phase 0 (外部SDK調査) が検出されました - 検証します\n");
      this.validatePhaseFile(PHASE_OPTIONAL);
    } else {
      // Phase 0が存在しない場合は情報として記録
      this.passes.push("Phase 0: 外部SDK調査なし（条件付きPhase）");
    }
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
        const paddedNum = phaseNum.padStart(2, "0");
        const linkPattern = new RegExp(
          `phase-(?:${phaseNum}|${paddedNum})-`,
          "i",
        );
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
    const paddedNum = phaseNum.padStart(2, "0");
    const expectedPattern = new RegExp(`^phase-(?:${phaseNum}|${paddedNum})-.*\\.md$`);

    // ファイル検索
    const files = readdirSync(this.workflowDir).filter(
      (f) => expectedPattern.test(f),
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
    const allowedNames = (PHASE_FILE_ALIASES[phase.number] || [phase.name]).flatMap(
      (name) => [
        `phase-${phaseNum}-${name}.md`,
        `phase-${paddedNum}-${name}.md`,
      ],
    );
    if (!allowedNames.includes(files[0])) {
      this.warnings.push(
        `Phase ${phaseNum}: ファイル名が推奨形式と異なります (実際: ${files[0]}, 推奨例: ${expectedName})`,
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

    // Phase 1〜11は統合テスト連携セクション必須（Phase 0は除外）
    if (Number(phaseNum) >= 1 && Number(phaseNum) <= 11) {
      const integrationSection = /^##\s+統合テスト連携/m.test(content);
      if (!integrationSection) {
        this.errors.push(
          `Phase ${phaseNum} (${files[0]}): 必須セクション「統合テスト連携」がありません`,
        );
      }
    }

    // Phase 0の場合、追加の寛容性を持つ
    if (Number(phaseNum) === 0 && phase.optional) {
      this.passes.push(
        `Phase 0: 外部SDK調査ファイルが正しく存在 (${files[0]})`,
      );
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

    // "eof" を安定処理するため、疑似的な終端見出しを付与してセクション抽出する
    const contentWithSentinel = `${content}\n## __END_OF_DOC__`;

    // 実行タスクセクションの検証
    const taskSection = contentWithSentinel.match(
      /^##\s+実行タスク[\s\S]*?(?=^##\s+)/m,
    );
    if (taskSection) {
      const taskContent = taskSection[0];
      const taskLines = taskContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^-\s+/.test(line) || /^\d+\.\s+/.test(line));

      if (taskLines.length === 0) {
        this.warnings.push(
          `Phase ${phaseNum}: 実行タスクが定義されていないか、形式が正しくありません`,
        );
      } else {
        this.passes.push(
          `Phase ${phaseNum}: ${taskLines.length}個の実行タスクが定義済み`,
        );
      }
    }

    // 完了条件のチェックリスト形式確認（未完了/完了の両方を許容）
    const completionSection = contentWithSentinel.match(
      /^##\s+完了条件[\s\S]*?(?=^##\s+)/m,
    );
    if (completionSection) {
      const checkboxes = completionSection[0].match(/- \[[ xX]\]/g);
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
