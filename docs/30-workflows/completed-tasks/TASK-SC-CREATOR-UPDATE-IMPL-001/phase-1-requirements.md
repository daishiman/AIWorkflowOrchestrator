# Phase 1: 要件定義

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 1                               |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| 機能名              | SkillCreatorService update mode |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | -                               |
| 後続Phase           | Phase 2                         |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

`runUpdateWorkflow()` 実装の前提を事実ベースで固定し、code / test / system spec / close-out の4系統を一つの task workflow として結び直す。Phase 1 の責務は調査の網羅ではなく、後続 Phase が迷わないための判断材料を最小集合で確定することにある。

## 実行タスク

### タスク1: P50チェックと implementation_mode 妥当性確認

- `SkillCreatorService.ts` の `update` 分岐がスタブであることを確認する
- 前タスク `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` が dispatch 接続まで完了していることを確認する
- 本 task が `verify_existing` ではなく実処理追加を伴う `new` とみなせる理由を記録する
- `implementation_mode` の skill 内定義衝突（`new` vs `new_feature`）をリスクとして記録する

### タスク2: current state inventory の固定

- `runCreateWorkflow()`、`extractPurposeWithLlm()`、`throwIfAborted()`、`PROGRESS_FLOWS.update` の current fact を収集する
- `options` 型と `SkillService.updateSkill()` の責務境界候補を整理する
- 関連テストの既存 coverage を確認する

### タスク3: system spec anchor の抽出

- `aiworkflow-requirements` から update mode に関係する正本仕様を選定する
- current code anchor と system spec anchor の 1:1 対応を `spec-extraction-map.md` に固定する
- Phase 12 Step 2 が必要かどうかの初期仮説を記録する

### タスク4: 受け入れ基準と論点の固定

- AC-1〜AC-7 を検証可能な文として確定する
- 真の論点を「workflow 完結性」「実装パターン踏襲」「system spec sync 要否」の3つに絞る
- スコープ外を再確認し、`runImprovePromptWorkflow()` を本 task から除外する

## 参照資料

| 資料       | パス                                                                                 | 用途                 |
| ---------- | ------------------------------------------------------------------------------------ | -------------------- |
| 対象実装   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                        | current fact 確認    |
| 関連テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`         | Phase 4-7 設計の基礎 |
| 関連テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` | LLM purpose 経路確認 |
| 関連テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`  | AbortSignal 経路確認 |
| 前タスク   | `docs/30-workflows/unassigned-task/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE.md`   | 依存と受入基準確認   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存契約との整合性を確保する。

| 参照資料                | パス                                                                                          | 内容                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| skill creator core      | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`           | skill creator runtime / progress / mode 契約 |
| task workflow completed | `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md`                | 類似 close-out と lessons の確認             |
| lessons learned         | `.agents/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04-cancel.md` | implementation_mode 判定の知見               |

## 実行手順

1. `git log --oneline -20 -- apps/desktop/src/main/services/skill/SkillCreatorService.ts` で前提変更を確認する
2. `SkillCreatorService.ts` の `update` 分岐、`runCreateWorkflow()`、`extractPurposeWithLlm()`、`throwIfAborted()` を読み、current fact を抽出する
3. 既存テスト3本を読み、テスト資産と不足観点を棚卸しする
4. `aiworkflow-requirements` から関係仕様を選び、`spec-extraction-map.md` に code anchor 対応を記録する
5. AC と implementation_mode リスクを確定し、Phase 2 の入力を固定する

## 統合テスト連携

| 判定項目              | 基準                                          | 結果    |
| --------------------- | --------------------------------------------- | ------- |
| current fact 抽出完了 | `runUpdateWorkflow` 周辺の code anchor が揃う | pending |
| 既存テスト棚卸し完了  | 3本の関連テストの役割が整理される             | pending |
| spec anchor 抽出完了  | `spec-extraction-map.md` の対象が固定される   | pending |

## 多角的チェック観点（AIが判断）

- 論理分析系: `new` 採用の妥当性と skill 内定義衝突の扱いが明確か
- 構造分解系: code / test / spec / close-out の4系統が漏れなく抽出されているか
- メタ・抽象系: 調査メモが workflow 本文に過剰流入していないか
- システム系: Phase 12 Step 2 要否の初期判断が置けているか
- 問題解決系: 後続 Phase が迷わないレベルで論点が絞れているか

## サブタスク管理

| サブタスク | 責務                           | 状態    |
| ---------- | ------------------------------ | ------- |
| ST-1       | current state inventory 作成   | pending |
| ST-2       | spec-extraction-map 作成       | pending |
| ST-3       | implementation_mode リスク記録 | pending |

## 成果物

| 成果物     | パス                                         | 説明                                      |
| ---------- | -------------------------------------------- | ----------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | AC・スコープ・前提条件                    |
| 正本対応表 | `outputs/phase-1/spec-extraction-map.md`     | system spec と code anchor の 1:1 対応    |
| 現状棚卸し | `outputs/phase-1/current-state-inventory.md` | stub 状態、既存パターン、既存テストの整理 |

## 完了条件

- [ ] P50チェックを実施した
- [ ] `implementation_mode = new` 採用理由と skill 内定義衝突リスクを記録した
- [ ] `spec-extraction-map.md` の対象仕様を固定した
- [ ] AC-1〜AC-7 を確定した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] Phase 2 へ渡す入力が固定されている

## 次Phase

Phase 2: 設計
