# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 4                                |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ユニットテスト作成: 各サービスのテスト
- 統合テスト作成: IPC連携テストの作成
- 境界値分析: エッジケースのテスト追加

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

## 実行手順

### 1. テストシナリオ設計

**SkillAnalyzer テストシナリオ**:

| シナリオID | カテゴリ | テスト内容                       |
| ---------- | -------- | -------------------------------- |
| SA-01      | 正常系   | 有効なスキルを分析して結果を返す |
| SA-02      | 正常系   | 静的分析でSKILL.mdの問題を検出   |
| SA-03      | 正常系   | AI分析で改善提案を生成           |
| SA-04      | 異常系   | 存在しないスキルでエラー         |
| SA-05      | 異常系   | SKILL.md がないスキルでエラー    |
| SA-06      | 境界値   | 空のスキルディレクトリ           |

**SkillImprover テストシナリオ**:

| シナリオID | カテゴリ | テスト内容                       |
| ---------- | -------- | -------------------------------- |
| SI-01      | 正常系   | 自動修正可能な改善を適用         |
| SI-02      | 正常系   | プロンプト改善を実行             |
| SI-03      | 正常系   | 構造改善を実行                   |
| SI-04      | 正常系   | バックアップを作成               |
| SI-05      | 異常系   | 改善適用中のエラーをハンドリング |
| SI-06      | 境界値   | 改善提案が空の場合               |

**PromptOptimizer テストシナリオ**:

| シナリオID | カテゴリ | テスト内容                        |
| ---------- | -------- | --------------------------------- |
| PO-01      | 正常系   | プロンプトを最適化して結果を返す  |
| PO-02      | 正常系   | 複数バリアントを生成              |
| PO-03      | 正常系   | プロンプトを評価してスコアを返す  |
| PO-04      | 異常系   | 空のプロンプトでエラー            |
| PO-05      | 境界値   | 非常に長いプロンプト（10000文字） |

### 2. ユニットテスト作成

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillAnalyzer.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillAnalyzer } from "../SkillAnalyzer";

describe("SkillAnalyzer", () => {
  let analyzer: SkillAnalyzer;

  beforeEach(() => {
    analyzer = new SkillAnalyzer("/path/to/skills");
  });

  describe("analyze", () => {
    it("SA-01: should return SkillAnalysis for valid skill", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SA-02: should detect SKILL.md issues in static analysis", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SA-03: should generate improvement suggestions via AI analysis", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SA-04: should throw error for non-existent skill", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SA-05: should throw error for skill without SKILL.md", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SA-06: should handle empty skill directory", async () => {
      // TODO: 実装後にテストが通る
    });
  });
});
```

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImprover.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillImprover } from "../SkillImprover";

describe("SkillImprover", () => {
  let improver: SkillImprover;

  beforeEach(() => {
    improver = new SkillImprover("/path/to/skills");
  });

  describe("applyImprovements", () => {
    it("SI-01: should apply auto-fixable improvements", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SI-02: should execute prompt improvement", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SI-03: should execute structure improvement", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SI-04: should create backup before improvements", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SI-05: should handle errors during improvement", async () => {
      // TODO: 実装後にテストが通る
    });

    it("SI-06: should handle empty suggestions", async () => {
      // TODO: 実装後にテストが通る
    });
  });
});
```

```typescript
// apps/desktop/src/main/services/skill/__tests__/PromptOptimizer.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PromptOptimizer } from "../PromptOptimizer";

describe("PromptOptimizer", () => {
  let optimizer: PromptOptimizer;

  beforeEach(() => {
    optimizer = new PromptOptimizer();
  });

  describe("optimize", () => {
    it("PO-01: should optimize prompt and return result", async () => {
      // TODO: 実装後にテストが通る
    });
  });

  describe("generateVariants", () => {
    it("PO-02: should generate multiple variants", async () => {
      // TODO: 実装後にテストが通る
    });
  });

  describe("evaluate", () => {
    it("PO-03: should evaluate prompt and return score", async () => {
      // TODO: 実装後にテストが通る
    });

    it("PO-04: should throw error for empty prompt", async () => {
      // TODO: 実装後にテストが通る
    });

    it("PO-05: should handle very long prompt", async () => {
      // TODO: 実装後にテストが通る
    });
  });
});
```

### 3. 統合テスト作成

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImprover.integration.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("SkillImprover Integration", () => {
  describe("Full improvement flow", () => {
    it("should analyze, improve, and verify skill", async () => {
      // TODO: 実装後にテストが通る
    });

    it("should rollback on failure", async () => {
      // TODO: 実装後にテストが通る
    });
  });
});
```

### 4. 境界値テスト

| テストケース           | 入力値                  | 期待結果        |
| ---------------------- | ----------------------- | --------------- |
| 空のスキル名           | `""`                    | ValidationError |
| 非常に長いスキル名     | 1000文字                | ValidationError |
| 特殊文字を含むスキル名 | `"skill<script>"`       | ValidationError |
| スコア境界（0）        | overallScore = 0        | 有効            |
| スコア境界（100）      | overallScore = 100      | 有効            |
| スコア範囲外           | overallScore = -1 / 101 | ValidationError |

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                    | テストファイル     |
| ------------------ | ------------------------------------------- | ------------------ |
| IPC接続テスト      | skill:analyze/improve/optimize チャネル疎通 | `*.ipc.test.ts`    |
| データフローテスト | Renderer→IPC→Service→SDK→FSの往復           | `*.flow.test.ts`   |
| エラーハンドリング | SDK/FS障害時のエラー伝播                    | `*.error.test.ts`  |
| バックアップテスト | 改善前バックアップ・復元                    | `*.backup.test.ts` |

## アーキテクチャ層別テスト（AIが判断）

| 層           | テスト観点                       | テストファイル配置                                |
| ------------ | -------------------------------- | ------------------------------------------------- |
| Main Process | SkillAnalyzer/Improver/Optimizer | `apps/desktop/src/main/services/skill/__tests__/` |
| IPC通信      | skill:analyze/improve/optimize   | `*.ipc.test.ts`                                   |
| Shared       | 型定義、バリデーション           | `packages/shared/**/*.test.ts`                    |

## 成果物

| 成果物             | パス                                                       | 説明               |
| ------------------ | ---------------------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                    | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`                            | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`               | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/*.test.ts` | 実際のテストコード |

## 完了条件

- [ ] SkillAnalyzer テスト（6ケース）が作成されている
- [ ] SkillImprover テスト（6ケース）が作成されている
- [ ] PromptOptimizer テスト（5ケース）が作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+）
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. テストシナリオ設計（SA/SI/PO各テスト）
2. SkillAnalyzer ユニットテスト作成（6ケース）
3. SkillImprover ユニットテスト作成（6ケース）
4. PromptOptimizer ユニットテスト作成（5ケース）
5. 統合テストシナリオ設計
6. 境界値テスト追加
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] テストが失敗状態（Red）であることを確認
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 4
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）
