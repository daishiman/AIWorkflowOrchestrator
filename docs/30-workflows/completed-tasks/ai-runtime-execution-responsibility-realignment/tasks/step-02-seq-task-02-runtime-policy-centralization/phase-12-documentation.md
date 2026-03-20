# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 12                                         |
| Phase 名   | ドキュメント                               |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 11                                   |
| 後続 Phase | Phase 13（PR作成）                         |
| ステータス | not_started                                |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

surface 横断 runtime policy の中央集約 の system spec / workflow / backlog / lessons の更新手順を定義する。

## 実行タスク

- implementation guide: future executor 向けの実装順序と注意点を記述する
- system spec sync: workflow / backlog / lessons / canonical refs の同期先を整理する
- unassigned formalization: follow-up へ落とす項目と current/baseline 切り分けを定義する

## 参照資料

| 参照資料                   | パス                                                                                                                               | 内容                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                         | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-02-seq-task-02-runtime-policy-centralization/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                                            | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                                                  | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                                           | review gate の判定                                |
| Phase 4                    | phase-4-test-creation.md                                                                                                           | Phase 4（テスト作成）の仕様書                     |
| Phase 5                    | phase-5-implementation.md                                                                                                          | Phase 5（実装）の仕様書                           |
| Phase 6                    | phase-6-test-expansion.md                                                                                                          | Phase 6（テスト拡充）の仕様書                     |
| Phase 7                    | phase-7-coverage-check.md                                                                                                          | Phase 7（カバレッジ確認）の仕様書                 |
| Phase 8                    | phase-8-refactoring.md                                                                                                             | Phase 8（リファクタリング）の仕様書               |
| Phase 9                    | phase-9-quality-assurance.md                                                                                                       | Phase 9（品質検証）の仕様書                       |
| Phase 10                   | phase-10-final-review.md                                                                                                           | Phase 10（最終レビュー）の仕様書                  |
| Phase 11                   | phase-11-manual-test.md                                                                                                            | Phase 11（手動テスト）の仕様書                    |
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

| 成果物               | パス                                                   | 内容                               |
| -------------------- | ------------------------------------------------------ | ---------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md               | 後続実装者への handoff             |
| 仕様同期サマリー     | outputs/phase-12/system-spec-update-summary.md         | system spec / workflow sync の要約 |
| 更新履歴             | outputs/phase-12/documentation-changelog.md            | 同ターン更新の記録                 |
| 未タスク検出         | outputs/phase-12/unassigned-task-detection.md          | formalize 対象の follow-up 一覧    |
| Phase12 準拠チェック | outputs/phase-12/phase12-task-spec-compliance-check.md | task-spec skill 準拠確認           |

## 完了条件

- [ ] implementation-guide / system-spec-update-summary / unassigned formalization の構成が揃っている
- [ ] same-wave sync 対象が漏れなく列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-12/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
