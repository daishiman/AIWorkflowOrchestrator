# Phase 2: 設計

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 2                                                  |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 1                                            |
| 後続Phase  | Phase 3                                            |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

`recordExecuteResult()` と `recordVerifyFailure()` が `verify_result` artifact を append する設計と、対象テストの観点を確定する。

## 責務境界テーブル

| レイヤ                       | 役割                                              | 書き込み可否 | この task の判断                  |
| ---------------------------- | ------------------------------------------------- | ------------ | --------------------------------- |
| `SkillCreatorWorkflowEngine` | failure payload 生成、state 更新、artifact append | 可           | append 正本 owner                 |
| `RuntimeSkillCreatorFacade`  | engine 結果の public response 化                  | 不可         | artifact reader のみ              |
| `phaseArtifacts`             | 実行履歴 ledger                                   | append のみ  | failure ごとに件数増加            |
| `state.verifyResult`         | 最新 verify 状態                                  | 上書き可     | latest snapshot として保持        |
| Phase 12 ledger              | workflow / lessons / completed record 判断        | N/A          | 実装完了後に Step 1-A〜1-C へ反映 |

## 設計判断

| 観点             | 判断                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| source of truth  | 履歴正本は `phaseArtifacts.verify_result`、`state.verifyResult` は latest snapshot                 |
| 更新順序         | failure summary 生成 -> `state.verifyResult` 更新 -> `verify_result` append -> facade 読み出し確認 |
| repeated failure | fail ごとに `execute_result` と `verify_result` を append し、upsert に戻さない                    |
| validation path  | engine test で write path、facade test で read path、Phase 11 で順序を確認する                     |

## 実行タスク

- failure path の state 更新順序を設計する
- `verify_result` payload を state と artifact で同値に保つ設計を定義する
- repeated failure 時の artifact 増分ルールを固定する
- engine test と facade test の責務境界を定義する

## 参照資料

| 参照資料            | パス                                                                                                                              | 内容             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1             | `phase-1-requirements.md`                                                                                                         | AC とスコープ    |
| 親 workflow Phase 2 | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-2-design.md`                   | owner 設計の基準 |
| 親 ownership matrix | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md` | artifact owner   |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                        | 内容                               |
| ----------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| runtime public contract | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | RuntimeSkillCreatorExecuteResponse |
| service details         | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | engine owner の正本                |

## 統合テスト連携

| 観点        | 連携内容                          |
| ----------- | --------------------------------- |
| engine test | failure append の順序を固定する   |
| facade test | artifact 正本の読み出しを固定する |

## 成果物

| 成果物           | パス                                  | 説明                        |
| ---------------- | ------------------------------------- | --------------------------- |
| ownership matrix | `outputs/phase-2/ownership-matrix.md` | state / artifact の更新責務 |

## 完了条件

- [ ] `recordExecuteResult()` / `recordVerifyFailure()` の更新順が設計で一意に定まっている
- [ ] `execute_result` と `verify_result` の failure pair ルールが定義されている
- [ ] repeated failure で append 件数が増える前提が書かれている
- [ ] engine test と facade test の観点が分離されている
