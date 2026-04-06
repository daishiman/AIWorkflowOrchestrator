# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 1                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

2 つの独立した drift を、実コードの current facts に合わせて要件化する。
P0-07 は runtime の agent 名重複、U2 は renderer の承認済み snapshot 逸脱を対象とし、以降の Phase で迷いなく実行できる状態に固定する。

## 実行タスク

- TASK-P0-07: `RuntimeSkillCreatorFacade.plan()` の agent 名導出を `PLAN_RESOURCE_REQUESTS` に一本化する
- TASK-SDK-04-U2: `SkillLifecyclePanel.tsx` の approved snapshot を live textarea から切り離す

## 参照資料

| 資料名                     | パス                                                                                               | 参照理由                         |
| -------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| current runtime code       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                              | P0-07 の current code anchor     |
| prompt constants           | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                                    | `AGENT_NAMES` 削除対象           |
| renderer panel             | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | U2 の state owner                |
| runtime plan tests         | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`          | P0-07 の検証先                   |
| renderer llm tests         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | U2 の検証先                      |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                                               | Phase 1-13 / Phase 12 正本       |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                  | current facts / system spec 正本 |

## 問題の本質

### TASK-P0-07

- `planPromptConstants.ts` に `AGENT_NAMES` が固定値で残っているため、`PLAN_RESOURCE_REQUESTS` と重複している
- runtime の fallback path が別の名前リストを持つと、resource request と prompt の source of truth が分岐する
- 追加レイヤーを増やすより、既存の `PLAN_RESOURCE_REQUESTS` をそのまま使う方が小さくて強い

### TASK-SDK-04-U2

- `approvedSkillSpec` は plan 承認時の request snapshot を保持するための state である
- live textarea は plan review 後に変更されても、execute の入力を上書きしてはいけない
- ここで必要なのは canonical JSON ではなく、承認時に固定した request snapshot の semantics を明確にすること

## 受入基準（詳細）

### TASK-P0-07

| ID      | 基準                                                                                   | 確認方法    |
| ------- | -------------------------------------------------------------------------------------- | ----------- |
| P7-AC-1 | `AGENT_NAMES` が削除されている                                                         | grep        |
| P7-AC-2 | `RuntimeSkillCreatorFacade.plan()` が `PLAN_RESOURCE_REQUESTS` の agent エントリを読む | unit test   |
| P7-AC-3 | agent 以外の request は導出ロジックに混入しない                                        | unit test   |
| P7-AC-4 | agent 名の変更が source of truth の変更だけで反映される                                | code review |
| P7-AC-5 | 既存テストが pass する                                                                 | vitest      |
| P7-AC-6 | agent 名導出の回帰テストがある                                                         | vitest      |

### TASK-SDK-04-U2

| ID      | 基準                                                                                       | 確認方法      |
| ------- | ------------------------------------------------------------------------------------------ | ------------- |
| S4-AC-1 | `handleGeneratePlan` が plan 承認時点の request snapshot を `approvedSkillSpec` に保持する | code review   |
| S4-AC-2 | textarea を編集しても execute 先が変わらない                                               | renderer test |
| S4-AC-3 | cancel で `approvedSkillSpec` が null に戻る                                               | renderer test |
| S4-AC-4 | generate → edit → execute の drift 再現テストがある                                        | renderer test |

## スコープ外

- shared type の追加
- IPC contract の変更
- commit / PR / push

## 実行手順

### ステップ1: current facts を固定する

1. `RuntimeSkillCreatorFacade.ts` の `PLAN_RESOURCE_REQUESTS` と agent 名導出の関係を確認する
2. `SkillLifecyclePanel.tsx` の `approvedSkillSpec` と `handleExecutePlan` の関係を確認する
3. 2 タスクが重複ファイルを持たないことを確認する

### ステップ2: 真の論点を分解する

1. P0-07 の論点は「agent 名の source of truth を 1 つにすること」である
2. U2 の論点は「request snapshot を live draft から切り離すこと」である
3. 2 つの論点を混ぜず、各 phase の責務を分離する

### ステップ3: 受入基準に写像する

1. P7-AC-1〜6 を runtime 系の検証へ落とす
2. S4-AC-1〜4 を renderer 系の検証へ落とす
3. Phase 3 以降の gate がこの写像だけを参照するようにする

### ステップ4: 並列実行前提を明文化する

1. main-process 系と renderer 系は、設計確定後に並列で進める
2. 共有ファイルがある場合のみ直列化する
3. Phase 12 では両者の結果を集約して閉じる

## 成果物

| 成果物   | パス                                      | 説明                               |
| -------- | ----------------------------------------- | ---------------------------------- |
| 要件定義 | `phase-1-requirements.md`                 | current facts と acceptance の固定 |
| 要件メモ | `outputs/phase-1/requirements-summary.md` | 検証に使う要約                     |

## 完了条件

- [ ] P0-07 の source of truth が `PLAN_RESOURCE_REQUESTS` に固定されている
- [ ] U2 の snapshot semantics が live draft と分離されている
- [ ] 2 タスクの責務境界と並列可能性が明記されている
- [ ] Phase 2 へ渡せる acceptance criteria が確定している

## サブタスク管理

1. P0-07 current code anchor の確認
2. U2 current code anchor の確認
3. 30思考法の適用範囲の固定
4. acceptance criteria の 1:1 対応確認

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] current code anchor と参照資料のズレがない
- [ ] Phase 2 で使う source of truth が 1 文で言える
