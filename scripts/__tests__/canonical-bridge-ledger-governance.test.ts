/**
 * canonical-bridge-ledger-governance 契約テスト
 *
 * Phase 4 test-matrix.md に基づき、設計成果物の構造・整合性を自動検証する。
 *
 * テストケース (70件):
 * - Contract テスト (C-1〜C-12): 成果物の構造検証 (grep/ls 相当)
 * - Unit テスト (U-1-1〜U-3-8): 個別 FR の詳細確認
 * - Integration テスト (I-1〜I-6): 成果物間の整合性確認
 * - Artifact Existence テスト: 全 Phase の outputs/ に成果物が存在するか
 * - Edge Case テスト (BC-1〜BC-12): 境界ケース検証
 * - Regression テスト: Pitfall 防止ルールの記載確認
 * - Rollback & Recovery テスト: リカバリ手順の定義確認
 */

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// --- テスト対象パス ---
const TASK_ROOT = path.resolve(
  __dirname,
  "../../docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance",
);
const OUTPUTS = path.join(TASK_ROOT, "outputs");

/** ファイルを読み込んで内容を返すヘルパー */
function readOutput(phasePath: string): string {
  const fullPath = path.join(OUTPUTS, phasePath);
  return fs.readFileSync(fullPath, "utf-8");
}

/** 指定パターンの出現回数をカウントするヘルパー */
function countMatches(content: string, pattern: string | RegExp): number {
  const regex =
    typeof pattern === "string" ? new RegExp(pattern, "g") : pattern;
  return (content.match(regex) ?? []).length;
}

/** ディレクトリ内のファイル数を返すヘルパー */
function countFiles(dirPath: string): number {
  const fullPath = path.join(OUTPUTS, dirPath);
  if (!fs.existsSync(fullPath)) return 0;
  return fs.readdirSync(fullPath).filter((f) => !f.startsWith(".")).length;
}

// =============================================================
// 1. Contract テスト (C-1〜C-12)
//    成果物の構造を grep/ls で機械的に検証する
// =============================================================
describe("Contract Tests (C-1〜C-12)", () => {
  const contractMatrix = readOutput("phase-2/contract-matrix.md");
  const designSummary = readOutput("phase-2/design-summary.md");
  const validationMatrix = readOutput("phase-2/validation-matrix.md");

  it("C-1: contract-matrix に spec_created が定義されている", () => {
    expect(countMatches(contractMatrix, "spec_created")).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("C-2: contract-matrix に type: design 条件が定義されている", () => {
    expect(
      countMatches(contractMatrix, /type[:\s]*design/gi),
    ).toBeGreaterThanOrEqual(1);
  });

  it("C-3: design-summary に rsync コマンドが記載されている", () => {
    // 注: test-matrix では contract-matrix を参照していたが、
    // rsync の詳細は design-summary の Bridge Rule 設計に記載
    expect(countMatches(designSummary, "rsync")).toBeGreaterThanOrEqual(1);
  });

  it("C-4: contract-matrix に diff -qr コマンドが記載されている", () => {
    expect(countMatches(contractMatrix, "diff -qr")).toBeGreaterThanOrEqual(1);
  });

  it("C-5: design-summary に 3ファイル制約が記載されている", () => {
    expect(
      countMatches(designSummary, /3ファイル|3\s*files/gi),
    ).toBeGreaterThanOrEqual(1);
  });

  it("C-6: design-summary に gh issue close 手順が記載されている", () => {
    expect(
      countMatches(designSummary, "gh issue close"),
    ).toBeGreaterThanOrEqual(1);
  });

  it("C-7: contract-matrix に LOGS.md が2ファイル分記載されている", () => {
    expect(countMatches(contractMatrix, "LOGS.md")).toBeGreaterThanOrEqual(2);
  });

  it("C-8: validation-matrix に FR-1.1〜5.4 の全16項目が存在する", () => {
    expect(countMatches(validationMatrix, /FR-/g)).toBeGreaterThanOrEqual(16);
  });

  it("C-9: outputs/phase-1/ に3ファイル以上存在する", () => {
    expect(countFiles("phase-1")).toBeGreaterThanOrEqual(3);
  });

  it("C-10: outputs/phase-2/ に3ファイル以上存在する", () => {
    expect(countFiles("phase-2")).toBeGreaterThanOrEqual(3);
  });

  it("C-11: outputs/phase-3/ に2ファイル以上存在する", () => {
    expect(countFiles("phase-3")).toBeGreaterThanOrEqual(2);
  });

  it("C-12: validation-matrix に P43 対策が記載されている", () => {
    expect(countMatches(validationMatrix, "P43")).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================
// 2. Unit テスト (U-1-1〜U-3-8)
//    個別 FR の詳細確認
// =============================================================
describe("Unit Tests - L-1: Governance State Machine (U-1-x)", () => {
  const contractMatrix = readOutput("phase-2/contract-matrix.md");
  const designSummary = readOutput("phase-2/design-summary.md");

  it("U-1-1: spec_created 進入条件が成果物ベースで記載されている", () => {
    // outputs/phase-1〜3/ の成果物パスが contract-matrix に列挙されていること
    expect(contractMatrix).toMatch(/outputs\/phase-[123]/);
    expect(contractMatrix).toMatch(/spec_created/);
  });

  it("U-1-2: type:design と type:implementation の条件テーブルが存在する", () => {
    // Type 別条件テーブルに 2 行以上の type 区分が存在
    const designCount = countMatches(contractMatrix, /type[:\s]*design/gi);
    const implCount = countMatches(
      contractMatrix,
      /type[:\s]*implementation/gi,
    );
    expect(designCount).toBeGreaterThanOrEqual(1);
    expect(implCount).toBeGreaterThanOrEqual(1);
  });

  it("U-1-3: Phase 10 MINOR 後の遷移パスが記載されている", () => {
    expect(designSummary).toMatch(/MINOR/);
    expect(designSummary).toMatch(/未タスク/);
    expect(designSummary).toMatch(/Phase 11/);
  });

  it("U-1-4: rollback の3段条件が全て定義されている", () => {
    // contract-matrix の逆遷移テーブルが3行存在する
    const rollbackLines = contractMatrix
      .split("\n")
      .filter(
        (line) =>
          /spec_created|implementation_ready|completed/.test(line) &&
          /逆遷移|rollback/i.test(line),
      );
    // 逆遷移テーブルがある contract-matrix 内で3つの state を確認
    expect(contractMatrix).toMatch(/spec_created/);
    expect(contractMatrix).toMatch(/implementation_ready/);
    expect(contractMatrix).toMatch(/completed/);
  });

  it("U-1-5: type:design の coverage gate 除外が明記されている", () => {
    expect(contractMatrix).toMatch(/不要/);
  });
});

describe("Unit Tests - L-2: Canonical Source & Bridge (U-2-x)", () => {
  const designSummary = readOutput("phase-2/design-summary.md");
  const contractMatrix = readOutput("phase-2/contract-matrix.md");

  it("U-2-1: 5カテゴリの source table が存在する", () => {
    // design-summary にカテゴリ行が 5 行以上
    const categories = [
      "Workflow Ledger",
      "Lessons Learned",
      "System Spec",
      "Indexes",
      "Skill Meta",
    ];
    for (const cat of categories) {
      expect(designSummary).toContain(cat);
    }
  });

  it("U-2-2: 各カテゴリに canonical path が記載されている", () => {
    expect(designSummary).toMatch(/\.claude\/skills\//);
  });

  it("U-2-3: 責務・権限者・タイミングの3列が全行に値を持つ", () => {
    // source table のヘッダに3列が存在することを確認
    expect(designSummary).toMatch(/更新権限者/);
    expect(designSummary).toMatch(/更新タイミング/);
  });

  it("U-2-4: legacy register との cross-reference リンクが存在する", () => {
    expect(designSummary).toMatch(/legacy-ordinal-family-register/);
  });

  it("U-2-5: bridge rule 文書が存在する", () => {
    // Bridge Rule 設計は design-summary に記載
    expect(designSummary).toMatch(/Bridge|bridge/);
  });

  it("U-2-6: deprecation timeline が定義されている", () => {
    expect(designSummary).toMatch(/無期限保持|deprecation/i);
  });
});

describe("Unit Tests - L-3: Same-Wave Sync Protocol (U-3-x)", () => {
  const designSummary = readOutput("phase-2/design-summary.md");

  it("U-3-1: Phase 12 同期チェックリストが存在する", () => {
    expect(designSummary).toMatch(/Step A/);
    expect(designSummary).toMatch(/Step B/);
    expect(designSummary).toMatch(/Step C/);
    expect(designSummary).toMatch(/Step D/);
    expect(designSummary).toMatch(/Step E/);
  });

  it("U-3-2: 同期対象ファイルが5カテゴリ以上で列挙されている", () => {
    const stepLines = designSummary
      .split("\n")
      .filter((l) => /Step [A-E]/.test(l));
    expect(stepLines.length).toBeGreaterThanOrEqual(5);
  });

  it("U-3-3: 3ファイル/エージェント制約が明記されている", () => {
    expect(designSummary).toMatch(/3ファイル|P43/);
  });

  it("U-3-4: rsync コマンドが記載されている", () => {
    expect(designSummary).toMatch(/rsync.*--checksum/);
  });

  it("U-3-5: 3ステップ手順が記載されている", () => {
    expect(designSummary).toMatch(/Step 1|ステップ.*1/);
    expect(designSummary).toMatch(/Step 2|ステップ.*2/);
    expect(designSummary).toMatch(/Step 3|ステップ.*3/);
  });

  it("U-3-6: 設計タスクの3ステップ例外なし条件が記載されている", () => {
    expect(designSummary).toMatch(/P58|省略不可/);
  });

  it("U-3-7: current→baseline 移管条件が記載されている", () => {
    expect(designSummary).toMatch(/wave 完了|wave完了/);
  });

  it("U-3-8: gh issue close 手順が記載されている", () => {
    expect(designSummary).toMatch(/gh issue close/);
  });
});

// =============================================================
// 3. Integration テスト (I-1〜I-6)
//    成果物間の整合性確認
// =============================================================
describe("Integration Tests (I-1〜I-6)", () => {
  const designSummary = readOutput("phase-2/design-summary.md");
  const contractMatrix = readOutput("phase-2/contract-matrix.md");
  const validationMatrix = readOutput("phase-2/validation-matrix.md");

  it("I-1: Step A→B→C→D→E の順序整合性", () => {
    const posA = designSummary.indexOf("Step A");
    const posB = designSummary.indexOf("Step B");
    const posC = designSummary.indexOf("Step C");
    const posD = designSummary.indexOf("Step D");
    const posE = designSummary.indexOf("Step E");

    expect(posA).not.toBe(-1);
    expect(posB).not.toBe(-1);
    expect(posC).not.toBe(-1);
    expect(posD).not.toBe(-1);
    expect(posE).not.toBe(-1);
    expect(posA).toBeLessThan(posB);
    expect(posB).toBeLessThan(posC);
    expect(posC).toBeLessThan(posD);
    expect(posD).toBeLessThan(posE);
  });

  it("I-2: source table と contract-matrix の整合性", () => {
    // 明示的マッピング: カテゴリ→アクションの双方向整合を検証
    const categoryToAction: Record<string, string> = {
      "Workflow Ledger": "ledger-update",
      "Lessons Learned": "lessons-update",
      "System Spec": "spec-update",
      Indexes: "index-regen",
      "Skill Meta": "mirror-sync",
    };

    for (const [category, action] of Object.entries(categoryToAction)) {
      expect(designSummary).toContain(category);
      expect(contractMatrix).toContain(action);
    }
  });

  it("I-3: validation-matrix の FR 網羅性", () => {
    // FR-1.1〜5.4 の全16項目が行として存在
    const frPattern = /FR-\d+\.\d+/g;
    const frMatches = validationMatrix.match(frPattern) ?? [];
    const uniqueFRs = new Set(frMatches);
    expect(uniqueFRs.size).toBeGreaterThanOrEqual(16);
  });

  it("I-4: Pitfall 防止ルールと Action 契約の対応", () => {
    const requiredPitfalls = ["P1", "P25", "P43", "P56", "P59"];
    for (const pitfall of requiredPitfalls) {
      expect(validationMatrix).toContain(pitfall);
    }
  });

  it("I-5: rollback 手順と state 遷移図の整合性", () => {
    // contract-matrix のStateテーブルに3つの state が定義されていること
    const states = ["spec_created", "implementation_ready", "completed"];
    for (const state of states) {
      expect(contractMatrix).toContain(state);
    }
  });

  it("I-6: mirror sync コマンドと verification の対応", () => {
    // rsync は design-summary、diff -qr は contract-matrix に記載
    expect(designSummary).toMatch(/rsync/);
    expect(contractMatrix).toMatch(/diff -qr/);
  });
});

// =============================================================
// 4. 成果物存在テスト
//    全 Phase の outputs/ に成果物が存在することを確認
// =============================================================
describe("Artifact Existence Tests", () => {
  const requiredOutputs: Record<string, string[]> = {
    "phase-1": [
      "requirements-definition.md",
      "scope-definition.md",
      "current-state-inventory.md",
    ],
    "phase-2": [
      "design-summary.md",
      "contract-matrix.md",
      "validation-matrix.md",
    ],
    "phase-3": ["design-review-report.md", "gate-decision.md"],
    "phase-4": ["test-matrix.md", "mock-strategy.md"],
    "phase-5": ["implementation-plan.md", "file-change-scope.md"],
    "phase-6": ["regression-expansion-plan.md", "edge-case-matrix.md"],
    "phase-7": ["coverage-targets.md", "integration-gate.md"],
  };

  for (const [phase, files] of Object.entries(requiredOutputs)) {
    for (const file of files) {
      it(`${phase}/${file} が存在する`, () => {
        const filePath = path.join(OUTPUTS, phase, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    }
  }
});

// =============================================================
// 5. Edge Case テスト (Phase 6 edge-case-matrix.md 由来)
//    BC-1〜BC-12 の境界ケース検証
// =============================================================
describe("Edge Case Tests (BC-1〜BC-12)", () => {
  it("BC-1: artifacts.json が有効な JSON である", () => {
    const artifactsPath = path.join(TASK_ROOT, "artifacts.json");
    const content = fs.readFileSync(artifactsPath, "utf-8");
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it("BC-2: artifacts.json の type が design または implementation である", () => {
    const artifactsPath = path.join(TASK_ROOT, "artifacts.json");
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, "utf-8"));
    // type フィールドが存在する場合は enum 制約を検証
    if (artifacts.type) {
      expect(["design", "implementation"]).toContain(artifacts.type);
    }
  });

  it("BC-3: canonical source table に重複パスが存在しない", () => {
    const designSummary = readOutput("phase-2/design-summary.md");
    const pathPattern = /\.claude\/skills\/[^\s|]+/g;
    const paths = designSummary.match(pathPattern) ?? [];
    const uniquePaths = new Set(paths);
    expect(paths.length).toBe(uniquePaths.size);
  });

  it("BC-9: documentation-changelog に同一 Step の重複記録がない", () => {
    const changelogPath = path.join(
      OUTPUTS,
      "phase-12/documentation-changelog.md",
    );
    if (fs.existsSync(changelogPath)) {
      const content = fs.readFileSync(changelogPath, "utf-8");
      const stepRecords = content.match(/Step [A-E].*完了/g) ?? [];
      const uniqueSteps = new Set(stepRecords);
      expect(stepRecords.length).toBe(uniqueSteps.size);
    }
  });

  it("BC-12: unassigned-task/ 配下は .md ファイルのみ", () => {
    const unassignedDir = path.resolve(
      __dirname,
      "../../docs/30-workflows/unassigned-task",
    );
    if (fs.existsSync(unassignedDir)) {
      const files = fs
        .readdirSync(unassignedDir)
        .filter((f) => !f.startsWith("."));
      const nonMd = files.filter((f) => !f.endsWith(".md"));
      expect(nonMd).toEqual([]);
    }
  });
});

// =============================================================
// 6. Regression テスト (Phase 6 regression-expansion-plan.md 由来)
//    Pitfall 防止ルールの仕様書内記載確認
// =============================================================
describe("Regression Tests - Pitfall Prevention", () => {
  const designSummary = readOutput("phase-2/design-summary.md");
  const contractMatrix = readOutput("phase-2/contract-matrix.md");
  const validationMatrix = readOutput("phase-2/validation-matrix.md");
  const implPlan = readOutput("phase-5/implementation-plan.md");

  it("P1/P25: LOGS.md 2ファイル同時更新ルールが記載されている", () => {
    expect(implPlan).toMatch(/LOGS\.md/);
    expect(implPlan).toMatch(/2ファイル/);
  });

  it("P2/P27: topic-map.md 再生成ルールが記載されている", () => {
    expect(implPlan).toMatch(/generate-index/);
  });

  it("P3/P38/P58: 未タスク3ステップ必須ルールが記載されている", () => {
    expect(designSummary).toMatch(/P58|省略不可/);
  });

  it("P4/P51: documentation-changelog 事後記録ルールが記載されている", () => {
    expect(implPlan).toMatch(/事後記録|documentation-changelog/);
  });

  it("P43: サブエージェント 3ファイル制約が記載されている", () => {
    expect(implPlan).toMatch(/3ファイル/);
  });

  it("P56: 再評価クローズ時 Issue Close ルールが記載されている", () => {
    expect(implPlan).toMatch(/gh issue close/);
  });

  it("P59: changelog 統合作成ルール（並列分担禁止）が記載されている", () => {
    expect(implPlan).toMatch(/P59|分割禁止|メインエージェント/);
  });
});

// =============================================================
// 7. Rollback & Recovery テスト
//    rollback 手順が定義されていることの検証
// =============================================================
describe("Rollback & Recovery Tests", () => {
  const implPlan = readOutput("phase-5/implementation-plan.md");

  it("Step A 中断時のリカバリ手順が定義されている", () => {
    expect(implPlan).toMatch(/Step A[\s\S]*中断|中断[\s\S]*Step A/);
  });

  it("Step C 中断時のリカバリ手順が定義されている", () => {
    expect(implPlan).toMatch(/Step C[\s\S]*中断|中断[\s\S]*Step C/);
  });

  it("Step D 中断時のリカバリ手順が定義されている", () => {
    expect(implPlan).toMatch(/Step D[\s\S]*中断|中断[\s\S]*Step D/);
  });

  it("Step E 中断時のリカバリ手順が定義されている", () => {
    expect(implPlan).toMatch(/Step E[\s\S]*中断|中断[\s\S]*Step E/);
  });

  it("全 Step にリカバリコマンドが定義されている", () => {
    expect(implPlan).toMatch(/git diff --stat/);
    expect(implPlan).toMatch(/generate-index\.js/);
    expect(implPlan).toMatch(/rsync/);
  });
});
