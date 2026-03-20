# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| Phase 名   | テスト作成                                 |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 3                                    |
| 後続 Phase | Phase 5（実装）                            |
| ステータス | not_started                                |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

surface 横断 runtime policy の中央集約 を future implementation で破綻なく実行できる test design を作る。

## 実行タスク

- 契約テスト設計: surface 横断 runtime policy の中央集約 の state / action / DTO 契約テストを設計する
- 統合シナリオ設計: surface 横断または IPC 連携の統合シナリオを定義する
- モック戦略: store / IPC / service dependency の mock 境界を決める

## 参照資料

| 参照資料                   | パス                                                                                                                               | 内容                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                         | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-02-seq-task-02-runtime-policy-centralization/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                                            | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                                                  | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                                           | review gate の判定                                |
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

### ステップ1: 前Phaseの成果物を確認する

直前までの gate 条件と outputs を確認し、今回の phase scope を固定する。

### ステップ2: 実行タスクを上から処理する

この phase のタスクを順番に実施し、成果物へ反映する。

### ステップ3: 統合テスト連携を更新する

phase 固有の integration 観点を outputs とチェックリストへ反映する。

### ステップ4: 完了条件と次Phase handoff を確認する

残件・blocked 条件・次Phase 前提を記録する。

## 統合テスト連携（Phase 1〜11は必須）

unit / integration / manual の test type ごとに対象シナリオを切り分ける。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 各 surface のローカル runtime 判定を中央 policy / resolver に寄せ、消費契約を統一する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                             | 内容                                              |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| テストマトリクス | outputs/phase-4/test-matrix.md   | unit / integration / contract / manual の観点整理 |
| モック戦略       | outputs/phase-4/mock-strategy.md | dependency / IPC / store mock 方針                |

## 完了条件

- [ ] テストタイプごとの責務分離が定義されている
- [ ] contract / integration / manual の対象シナリオが網羅されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-4/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
