# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 4                                             |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 3                                       |
| 後続Phase  | Phase 5                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

TDD の Red フェーズとして、`structurePlan` 接続配線のテストを実装前に作成する。
Phase 5 の実装でこれらが Green になることを目標とする。

## 実行タスク

- テスト設計書の作成: `outputs/phase-4/TASK-SW-STRUCT-002-test-design.md`
- 正常系テストケースの設計（TC-01〜TC-04）
- 異常系テストケースの設計（TC-05〜TC-06）
- 回帰テストの設計（TC-07）
- TDD Red 確認（実装前に FAIL することを確認）

## 参照資料

| 資料名                 | パス                                                                         | 用途               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 2 設計書         | `outputs/phase-2/TASK-SW-STRUCT-002-design.md`                               | テスト設計の根拠   |
| Phase 1 受け入れ基準   | `outputs/phase-1/TASK-SW-STRUCT-002-requirements.md`                         | AC 参照            |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | テスト対象ファイル |
| 既存テスト             | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 回帰テスト参照     |

## テストケース一覧

### 正常系テストケース

| TC ID | テスト名                                                                                      | 検証内容                                                                                   | AC         |
| ----- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| TC-01 | `create` モードで `structurePlan.skillName` が `plan.skillName` に反映される                  | `structurePlan.skillName` が `plan.skillName` として `generate_skill_md.js` に渡されること | AC-1, AC-2 |
| TC-02 | `create` モードで `structurePlan.purpose` が `plan.workflow.trigger.description` に反映される | `structurePlan.purpose` が trigger description として渡されること                          | AC-2       |
| TC-03 | `create` モードで `structurePlan.description` が `plan.workflow.summary` に反映される         | `structurePlan.description` が summary として渡されること                                  | AC-2       |
| TC-04 | `void structurePlan` が削除されている（コードレベル確認）                                     | `:126` 付近に `void structurePlan` が存在しないこと                                        | AC-1       |

### 異常系テストケース

| TC ID            | テスト名                                                                         | 検証内容                                                                     | AC          |
| ---------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------- |
| TC-05            | `structurePlan` が `null` の場合はフォールバック `plan` を使用する               | `structurePlan` が null のとき `options.name` ベースの `plan` が使われること | AC-4 (AC-3) |
| TC-06            | `structurePlan.anchors` が未定義の場合は `[]` を使用する                         | `anchors` が undefined のとき `[]` にフォールバックされること                | AC-2        |
| TC-07（p08補完） | `generate_skill_md.js` が失敗した場合 `ensureSkillMdExists` にフォールバックする | `createSkill()` が例外をスローしない                                         | AC-3        |

### 回帰テストケース

| TC ID  | テスト名                                                      | 検証内容                                                                  | AC         |
| ------ | ------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| TC-R01 | `collaborative` モードの既存テストが全て PASS する            | `collaborative` モードのテストが `structurePlan` 変更の影響を受けないこと | AC-3, AC-5 |
| TC-R02 | `collaborative` モード: `runCollaborativeWorkflow` が正常動作 | `collaborative` の既存ワークフローが破壊されていないこと                  | AC-4       |
| TC-R03 | `orchestrate` モード: `runOrchestrateWorkflow` が正常動作     | `orchestrate` の既存ワークフローが破壊されていないこと                    | AC-4       |

## 実行手順

### 0. TDD Red 確認（テスト作成前の状態確認）

```bash
# 既存テストが PASS していることを確認（baseline）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
```

### 1. テスト設計書の作成

`outputs/phase-4/TASK-SW-STRUCT-002-test-design.md` にテストケース一覧・テスト方針・回帰テスト計画を記述する。

### 2. テストコードの実装

既存の `SkillCreatorService.test.ts` に `create` モードの `structurePlan` 接続テストを追加する:

```typescript
// 追加テストケース例（SkillCreatorService.test.ts への追加）
describe("createSkill - create モードの structurePlan 接続", () => {
  describe("TC-01: structurePlan.skillName が plan に反映される", () => {
    it("structurePlan.skillName が plan.skillName として渡されること", async () => {
      // STRUCT-001 完了後の structurePlan を mock して検証
      // generate_skill_md.js への plan 引数を検証
    });
  });

  describe("TC-05: structurePlan が null の場合のフォールバック", () => {
    it("structurePlan が null のとき options.name ベースの plan が使われること", async () => {
      // runCreateWorkflow が null を返すケースを mock
      // フォールバック plan の skillName が options.name であることを検証
    });
  });
});
```

### 3. TDD Red 確認

```bash
# 作成したテストが FAIL することを確認（Red 状態）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
# 期待: FAIL（void structurePlan が残っているため接続なし）

# 既存テストが PASS していることを確認（回帰なし）
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: PASS（collaborative モードは影響なし）
```

## 統合テスト連携【必須】

TDD Red フェーズテストケースと回帰テスト計画を作成。

| 判定項目                | 基準          | 結果     |
| ----------------------- | ------------- | -------- |
| TC-01〜TC-07 の設計完了 | 全TC設計済み  | **完了** |
| TDD Red 確認            | FAIL 確認済み | **完了** |
| 既存テスト PASS 確認    | 回帰なし      | **完了** |

## 多角的チェック観点

| 観点                | チェック内容                                                             |
| ------------------- | ------------------------------------------------------------------------ |
| TDD 原則            | テストが実装前に作成されており、Red 状態（FAIL）であることを確認済みか   |
| AC 対応             | TC-01〜TC-07 が AC-1〜AC-5 を網羅しているか                              |
| null フォールバック | TC-05 が `structurePlan === null` の安全なフォールバックを検証しているか |
| 回帰テスト          | TC-07 が `collaborative` モードの既存動作を保護しているか                |

## 成果物

| 成果物       | パス                                                | 説明                               |
| ------------ | --------------------------------------------------- | ---------------------------------- |
| テスト設計書 | `outputs/phase-4/TASK-SW-STRUCT-002-test-design.md` | TDD Red フェーズのテストケース設計 |

## 完了条件

- [x] テスト設計書（`outputs/phase-4/TASK-SW-STRUCT-002-test-design.md`）が作成済み
- [x] TC-01〜TC-04 の正常系テストケースが設計済み
- [x] TC-05〜TC-07 の異常系テストケースが設計済み（p08版 TC-07 を補完追加）
- [x] TC-R01〜TC-R03 の回帰テストが設計済み
- [x] TDD Red 確認済み
- [x] 既存テストが PASS していること（baseline 確認）
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. baseline 確認（既存テスト PASS）
2. テスト設計書作成（`outputs/phase-4/TASK-SW-STRUCT-002-test-design.md`）
3. TC-01〜TC-04 正常系テスト設計
4. TC-05〜TC-07 異常系テスト設計
5. TC-R01〜TC-R03 回帰テスト設計
6. TDD Red 確認（FAIL を確認）
7. 成果物確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 5: 実装
