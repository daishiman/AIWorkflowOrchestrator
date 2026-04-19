# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 3                               |
| 後続Phase  | Phase 5                               |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

## 目的

TDD の Red フェーズとして、`runCreateWorkflow()` における `features` フィールドの LLM 自動生成テストを
実装前に作成する。Phase 5 の実装でこれらが Green になることを目標とする。

## 実行タスク

- テストファイルの新規作成: `SkillCreatorService.features.test.ts`
- 正常系テストケースの作成（TC-01〜TC-05）
- 異常系テストケースの作成（TC-03）
- 回帰テストケースの作成（TC-06〜TC-07）
- TDD Red 確認（実装前に FAIL することを確認）

## 参照資料

| 資料名                    | パス                                                                        | 用途                           |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| SkillCreatorService.ts    | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`               | テスト対象ファイル（line 937） |
| Phase 2 設計書            | `outputs/phase-2/design.md`                                                 | テスト設計の根拠               |
| Phase 1 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`                                    | AC 参照                        |
| STREAM-002 テストパターン | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` | テストパターン参照             |

## テストケース一覧

### 正常系テストケース

| TC ID | テスト名                                                  | 検証内容                                                                               | AC   |
| ----- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---- |
| TC-01 | runCreateWorkflow が LLM から features 配列を取得すること | `loadAgent("plan-structure")` 経由で LLM が呼ばれ `features` が配列として返ること      | AC-1 |
| TC-02 | 生成された features が非空配列であること                  | 返却された `features` の length が 1 以上であること                                    | AC-1 |
| TC-04 | generateSkillMd へ features が渡されること                | `generateSkillMd()` 呼び出し時に features プロパティが非空配列であること（スパイ検証） | AC-2 |
| TC-05 | SKILL.md に features 一覧が反映されること                 | 生成された SKILL.md に features の各エントリが含まれること                             | AC-2 |

### 異常系テストケース

| TC ID | テスト名                                                   | 検証内容                                                             | AC   |
| ----- | ---------------------------------------------------------- | -------------------------------------------------------------------- | ---- |
| TC-03 | LLM 呼び出し失敗時に features: [] でフォールバックすること | LLM が reject した場合でも `features: []` として処理が継続されること | AC-3 |

### 回帰テストケース

| TC ID | テスト名                                            | 検証内容                                                              | AC   |
| ----- | --------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| TC-06 | 既存の create ワークフローが回帰なしに動作すること  | create モードの他の処理（purpose・agents など）が影響を受けないこと   | AC-4 |
| TC-07 | update モードでも features 生成が正常に動作すること | update ワークフロー実行時にも features が正常に生成・セットされること | AC-4 |

## 実行手順

### 0. TDD Red 確認（テスト作成前の baseline 確認）

```bash
# 既存テストが PASS していることを確認（baseline）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
```

### 1. テストファイルの作成

**ファイルパス**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("SkillCreatorService - runCreateWorkflow features LLM 生成", () => {
  const mockLlmService = {
    generate: vi.fn(),
  };
  const mockLoadAgent = vi.fn();
  const mockGenerateSkillMd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルト: LLM が正常に features 配列を返す
    mockLlmService.generate.mockResolvedValue(
      JSON.stringify(["feature-a", "feature-b", "feature-c"]),
    );
  });

  describe("TC-01: runCreateWorkflow が LLM から features 配列を取得すること", () => {
    it("loadAgent('plan-structure') 経由で LLM が呼ばれ features が配列として返ること", async () => {
      // TDD Red フェーズ（現時点では FAIL）
      // loadAgent と llmService.generate が呼ばれること、および戻り値が配列であることを検証
    });
  });

  describe("TC-02: 生成された features が非空配列であること", () => {
    it("返却された features の length が 1 以上であること", async () => {
      // features.length >= 1 を検証
    });
  });

  describe("TC-03: LLM 呼び出し失敗時に features: [] でフォールバックすること", () => {
    it("LLM が reject した場合でも features: [] として処理が継続されること", async () => {
      mockLlmService.generate.mockRejectedValue(new Error("LLM timeout"));
      // features が空配列になること、エラーがスローされないことを検証
    });
  });

  describe("TC-04: generateSkillMd へ features が渡されること", () => {
    it("generateSkillMd 呼び出し時に features プロパティが非空配列であること", async () => {
      // generateSkillMd の引数に features が含まれることをスパイで検証
    });
  });

  describe("TC-05: SKILL.md に features 一覧が反映されること", () => {
    it("生成された SKILL.md に features の各エントリが含まれること", async () => {
      // 生成された markdown 文字列に features のエントリが存在することを検証
    });
  });

  describe("TC-06: 既存の create ワークフローが回帰なしに動作すること", () => {
    it("create モードの他の処理（purpose・agents など）が影響を受けないこと", async () => {
      // purpose と agents が正しくセットされていることを検証
    });
  });

  describe("TC-07: update モードでも features 生成が正常に動作すること", () => {
    it("update ワークフロー実行時にも features が正常に生成・セットされること", async () => {
      // update モードでも features が LLM から取得されることを検証
    });
  });
});
```

### 2. TDD Red 確認

```bash
# 作成したテストが FAIL することを確認（Red 状態）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.features.test.ts
# 期待: FAIL（features: [] のハードコードのため）

# 既存テストが PASS していることを確認（回帰なし）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: PASS（既存テストは影響なし）
```

## 統合テスト連携【必須】

features 生成フローの統合テストシナリオを全カテゴリで作成。

| 判定項目                | 基準               | 結果    |
| ----------------------- | ------------------ | ------- |
| TC-01〜TC-07 の作成完了 | 全TC作成済み       | pending |
| TDD Red 確認            | FAIL を再現済み    | pending |
| 既存テスト PASS 確認    | 回帰なしを確認済み | pending |

## 多角的チェック観点（AIが判断）

| 観点               | チェック内容                                                                           |
| ------------------ | -------------------------------------------------------------------------------------- |
| TDD 原則           | テストが実装前に作成されており、Red 状態（FAIL）であることを確認済みか                 |
| AC 対応            | TC-01〜TC-07 が AC-1〜AC-4 を網羅しているか                                            |
| モック設計         | `loadAgent`・`llmService.generate`・`generateSkillMd` が過不足なくモック化されているか |
| 回帰テスト         | 既存テスト（TC-06・TC-07）が回帰なしで PASS することを確認しているか                   |
| フォールバック検証 | LLM 失敗時に処理が正常継続されることを検証しているか                                   |

## サブタスク管理

1. baseline 確認（既存テスト PASS）
2. テストファイル作成（`SkillCreatorService.features.test.ts`）
3. TC-01〜TC-02 正常系テスト実装（LLM 呼び出し・非空配列）
4. TC-03 異常系テスト実装（フォールバック）
5. TC-04〜TC-05 統合検証テスト実装（generateSkillMd・SKILL.md 反映）
6. TC-06〜TC-07 回帰テスト実装
7. TDD Red 確認（FAIL を確認）
8. 成果物確認

## 成果物

| 成果物         | パス                                                                                  | 説明                             |
| -------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| テストスイート | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts` | TC-01〜TC-07（TDD Red フェーズ） |

## 完了条件

- [ ] `SkillCreatorService.features.test.ts` が作成済み
- [ ] TC-01〜TC-05 の正常系・スパイ検証テストケースが実装済み
- [ ] TC-03 の異常系（フォールバック）テストが実装済み
- [ ] TC-06〜TC-07 の回帰テストが実装済み
- [ ] TDD Red 確認済み（作成テストが FAIL すること）
- [ ] 既存テストが PASS していること（baseline 確認）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SW-STRUCT-LLM-002
```

## 次Phase

Phase 5: 実装
