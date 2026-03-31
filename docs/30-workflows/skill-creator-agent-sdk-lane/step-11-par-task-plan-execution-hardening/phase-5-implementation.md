# Phase 5: 実装

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 5                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

Phase 4 で定義した RED を GREEN にする。
P0-07 と U2 は独立しているため、設計が固まった後は並列で実装する。

## SubAgent 分担

| SubAgent | 担当範囲                                                                                             | 実行形態         | 完了条件                                             |
| -------- | ---------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------- |
| A        | `planPromptConstants.ts` / `RuntimeSkillCreatorFacade.ts` / `RuntimeSkillCreatorFacade.plan.test.ts` | 直列の起点       | `AGENT_NAMES` 削除と `PLAN_RESOURCE_REQUESTS` 一本化 |
| B        | `SkillLifecyclePanel.tsx` / `SkillLifecyclePanel.llm-generation.test.tsx`                            | A と並列         | approved snapshot semantics の固定                   |
| C        | A/B の実装差分確認とテスト再実行                                                                     | A/B 完了後に直列 | drift 再発なし                                       |

## 実行タスク

- P0-07: `AGENT_NAMES` を削除し、`PLAN_RESOURCE_REQUESTS` から agent 名を導出する
- P0-07: `RuntimeSkillCreatorFacade.plan()` の fallback path を source of truth ベースに整理する
- U2: `approvedSkillSpec` を plan 承認時の request snapshot として保持する
- U2: `handleExecutePlan` が live textarea ではなく approved snapshot を使うことを保証する

## 更新すべき仕様書のリスト

### TASK-P0-07 対象

| ファイル                                                                                  | 変更内容                                           |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                           | `AGENT_NAMES` 削除                                 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | `PLAN_RESOURCE_REQUESTS` ベースの agent 導出へ変更 |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | agent 導出の回帰テスト追加 / 更新                  |

### TASK-SDK-04-U2 対象

| ファイル                                                                                           | 変更内容                             |
| -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | approved snapshot semantics を明確化 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | drift 防止テスト追加 / 更新          |

## 実装手順

### ステップ1: P0-07 の source of truth を一本化する

1. `RuntimeSkillCreatorFacade.ts` の fallback path を確認する
2. `PLAN_RESOURCE_REQUESTS` の agent エントリだけを `loadAgent` へ渡す
3. `planPromptConstants.ts` から `AGENT_NAMES` を削除する
4. runtime test を更新し、agent 導出が current source of truth に追随することを固定する

### ステップ2: U2 の snapshot semantics を明示する

1. `SkillLifecyclePanel.tsx` の `handleGeneratePlan` で request snapshot を固定する
2. `approvedSkillSpec` が live textarea と独立していることをコメントまたは補助変数で明確化する
3. `handleExecutePlan` が approved snapshot のみを送ることを維持する
4. renderer test を更新し、generate → edit → execute の drift を固定する

### ステップ3: 並列実装後の統合確認を行う

1. A/B の変更ファイルに重複がないことを確認する
2. runtime と renderer のテストを再実行する
3. `AGENT_NAMES` の残留参照が 0 件であることを確認する

## 参照資料

| 資料名         | パス                                                                  | 参照理由              |
| -------------- | --------------------------------------------------------------------- | --------------------- |
| Phase 2 設計   | `phase-2-design.md`                                                   | 実装方針の正本        |
| runtime facade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | main-process 実装対象 |
| renderer panel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | renderer 実装対象     |

## 成果物

| 成果物   | パス                                    | 説明                 |
| -------- | --------------------------------------- | -------------------- |
| 実装記録 | `phase-5-implementation.md`             | 実装手順と結果の固定 |
| 実装メモ | `outputs/phase-5/implementation-log.md` | A/B の作業結果       |

## 完了条件

- [ ] `AGENT_NAMES` が runtime services から消えている
- [ ] `approvedSkillSpec` が request snapshot として振る舞う
- [ ] P0-07 と U2 のテストがともに pass する
- [ ] A/B が並列で実装でき、C で統合できる

## サブタスク管理

1. A: P0-07 実装
2. B: U2 実装
3. C: 統合確認
4. テストの再実行

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 変更ファイルの責務が混在していない
- [ ] Phase 6 へ渡せる GREEN 状態になっている
