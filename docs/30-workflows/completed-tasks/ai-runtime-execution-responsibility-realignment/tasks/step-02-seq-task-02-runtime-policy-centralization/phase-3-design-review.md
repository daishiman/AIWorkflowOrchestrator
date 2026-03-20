# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 3                                          |
| Phase 名   | 設計レビュー                               |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 2                                    |
| 後続 Phase | Phase 4（テスト作成）                      |
| ステータス | not_started                                |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

surface 側の local if / duplicate DTO / legacy route drift を review gate で除去するための review gate を実施し、Phase 4 着手条件を確定する。

## 実行タスク

- 設計レビュー: surface 側の local if / duplicate DTO / legacy route drift を review gate で除去する
- 代替案比較: より単純な代替案と trade-off を記録する
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL の戻り先を決める
- Phase 4 条件: Phase 4+ の着手条件と blocked 条件を固定する

## 参照資料

| 参照資料                   | パス                                                                                                                               | 内容                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                         | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-02-seq-task-02-runtime-policy-centralization/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                                            | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                                                  | 設計内容と validation matrix                      |
| 旧canonical workflow       | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                      | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                                             | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                                                | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス     | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                                           | 矛盾・依存・漏れの監査軸                          |
| workflow 正本              | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md                      | runtime 責務再配線の current canonical            |
| resource map               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                                     | 必要仕様の初動選定                                |
| quick reference            | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                                                  | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth            | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                                               | auth/access 契約の親入口                          |
| api-ipc-system             | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                                                | system IPC 契約の親入口                           |
| arch-state-management      | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                                         | Renderer 責務境界の親入口                         |
| Task01 index               | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md                                        | foundation で固定した capability 契約             |
| api-ipc-system-core        | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                                                           | health route / llm IPC canonical                  |
| llm-ipc-types              | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                 | health / selected-config 型契約                   |
| security-electron-ipc-core | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                                                    | preload / sender 検証の境界                       |
| arch-state-management-core | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                                                    | store ownership と selector 境界                  |

## 実行手順

### ステップ1: 設計レビューを実施する

surface 側の local if / duplicate DTO / legacy route drift を review gate で除去する観点で PASS / MINOR / MAJOR / CRITICAL を判定する。

### ステップ2: simpler alternative を再確認する

もっと単純な案で同じ責務を果たせるかを再評価する。

### ステップ3: Phase 4 着手条件を固定する

未解消の MINOR と、MAJOR 発生時の戻り先を gate-decision に記録する。

### ステップ4: Phase 13 blocked 条件を残す

ユーザー承認なしの commit / PR を禁止する条件を明記する。

## 統合テスト連携（Phase 1〜11は必須）

integration matrix をレビューし、戻り先・blocked 条件・phase gate を決定する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: surface 側の local if / duplicate DTO / legacy route drift を review gate で除去する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                    | 内容                                   |
| ---------------- | --------------------------------------- | -------------------------------------- |
| 設計レビュー報告 | outputs/phase-3/design-review-report.md | PASS/MINOR/MAJOR の判定と根拠          |
| ゲート判定       | outputs/phase-3/gate-decision.md        | Phase 4 着手条件・戻り先・blocked 条件 |

## 完了条件

- [ ] PASS / MINOR / MAJOR / CRITICAL の判定基準が定義されている
- [ ] Phase 4 着手条件と Phase 13 blocked 条件が残されている
- [ ] MINOR の追跡先 phase が決まっている
- [ ] 戻り先と再レビュー条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-3/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md)
