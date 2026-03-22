# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| Phase 名   | 手動テスト                                 |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 10                                   |
| 後続 Phase | Phase 12（ドキュメント）                   |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

設計タスクのため、Phase 11 はプロダクションコードの変更を伴わない。
設計成果物を対象とした手動 walkthrough を実施し、validation-matrix.md のシナリオ 1-4 を手動テスト計画に展開する。
CLI 環境での制約（P53）を考慮した代替証跡方針を確定する。

## 実行タスク

- walkthrough 設計: validation-matrix.md の Phase 11 シナリオ 1-4 を手動テスト計画に展開し、
  各シナリオの確認手順・期待結果・合否判定基準を `outputs/phase-11/manual-test-plan.md` に定義する。
  設計タスクのため「設計文書上で確認可能か」を判断基準とする。
- grep ベースの静的確認: surface-local な runtime 判定ロジックが設計上残存していないかを確認するための
  grep コマンドを定義し `outputs/phase-11/manual-test-plan.md` に記載する（例: `grep -rn "surfaceType" apps/desktop/src/`）。
  実行タイミングは後続実装タスクの担当者に委ねる。
- screenshot 計画と代替証跡: P53（CLI環境でのスクリーンショット取得制約）に従い、
  設計タスクでの証跡は「設計文書の diff」と「grep 実行ログ」で代替する方針を
  `outputs/phase-11/screenshot-plan.json` に記録する。
- discovered-issues 記録: walkthrough 中に発見した設計上の問題点を `outputs/phase-11/discovered-issues.md` に記録し、
  未タスク候補として Phase 12 へ引き継ぐ。

## 参照資料

| 参照資料                   | パス                                                                                                          | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                  | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                       | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                             | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                      | review gate の判定                                |
| Phase 4                    | phase-4-test-creation.md                                                                                      | Phase 4（テスト作成）の仕様書                     |
| Phase 5                    | phase-5-implementation.md                                                                                     | Phase 5（実装）の仕様書                           |
| Phase 6                    | phase-6-test-expansion.md                                                                                     | Phase 6（テスト拡充）の仕様書                     |
| Phase 7                    | phase-7-coverage-check.md                                                                                     | Phase 7（カバレッジ確認）の仕様書                 |
| Phase 8                    | phase-8-refactoring.md                                                                                        | Phase 8（リファクタリング）の仕様書               |
| Phase 9                    | phase-9-quality-assurance.md                                                                                  | Phase 9（品質検証）の仕様書                       |
| Phase 10                   | phase-10-final-review.md                                                                                      | Phase 10（最終レビュー）の仕様書                  |
| 旧canonical workflow       | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                           | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス     | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 矛盾・依存・漏れの監査軸                          |
| workflow 正本              | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | runtime 責務再配線の current canonical            |
| resource map               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                | 必要仕様の初動選定                                |
| quick reference            | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                             | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth            | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                          | auth/access 契約の親入口                          |
| api-ipc-system             | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                           | system IPC 契約の親入口                           |
| arch-state-management      | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                    | Renderer 責務境界の親入口                         |
| Task01 index               | docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md   | foundation で固定した capability 契約             |
| api-ipc-system-core        | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                                      | health route / llm IPC canonical                  |
| llm-ipc-types              | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                            | health / selected-config 型契約                   |
| security-electron-ipc-core | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                               | preload / sender 検証の境界                       |
| arch-state-management-core | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | store ownership と selector 境界                  |

## 実行手順

### ステップ1: Phase 10 の成果物を確認する

`outputs/phase-10/final-gate-decision.md` のゲート判定（PASS/MINOR）を確認し、
Phase 11 の実施前提（PASS または MINOR 処理済み）を検証する。

### ステップ2: validation-matrix.md シナリオ 1-4 を展開する

`phase-2-design.md` の validation-matrix.md を参照し、Phase 11 シナリオ 1-4 を手動テスト計画に展開する。
各シナリオに対して以下を定義する:

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| TC-ID        | テストケース識別子（例: MT-11-001）       |
| シナリオ概要 | validation-matrix.md のシナリオ名         |
| 確認手順     | 設計文書上で確認する手順（最大3ステップ） |
| 期待結果     | 検証可能な具体的状態                      |
| 合否判定基準 | PASS / FAIL の判定条件                    |
| 証跡方法     | 設計文書 diff / grep ログ / コメント      |

### ステップ3: grep ベースの静的確認コマンドを定義する

後続実装タスクの担当者が使用する静的確認コマンドを `manual-test-plan.md` に定義する。
例:

- `grep -rn "surfaceType\|surface_type" apps/desktop/src/` （surface-local 判定の残存確認）
- `grep -rn "isRuntimeAllowed\|canExecute" apps/desktop/src/` （Policy Consumption Contract 準拠確認）

### ステップ4: P53 準拠の証跡方針を確定し次Phase へ引き継ぐ

P53 に従い、CLI 環境では実際の画面キャプチャは取得できない。
`outputs/phase-11/screenshot-plan.json` に代替証跡方針（git diff / grep ログ）を記録する。
`outputs/phase-11/discovered-issues.md` に発見した設計上の問題点を記録し、Phase 12 へ引き継ぐ。

## 統合テスト連携（Phase 1〜11は必須）

設計タスクのため自動テスト実行は対象外。ただし以下を手動テスト計画に含める:

- validation-matrix.md の Phase 11 シナリオ全件（TC-ID 付き）が manual-test-plan.md に展開されていること
- P53 準拠の代替証跡方針が screenshot-plan.json に記録されていること

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 設計タスク。validation-matrix.md のシナリオ 1-4 を手動テスト計画に展開し、grep ベースの静的確認コマンドを定義する。P53 準拠の代替証跡方針（設計文書 diff / grep ログ）を確定する。プロダクションコードの変更は行わない。

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 10 成果物 + validation-matrix.md Phase 11 シナリオ）
2. walkthrough 設計: シナリオ 1-4 を TC-ID 付きで manual-test-plan.md に展開
3. grep ベースの静的確認コマンドを manual-test-plan.md に定義
4. P53 準拠の代替証跡方針を screenshot-plan.json に記録
5. discovered-issues.md への発見事項記録（0件でも作成必須）
6. 成果物パスと outputs/phase-11 の整合確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物                   | パス                                      | 内容                                                    |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------- |
| 手動テスト計画           | outputs/phase-11/manual-test-plan.md      | TC-ID 付きシナリオ 1-4 の手順 + grep 静的確認コマンド   |
| 手動テストチェックリスト | outputs/phase-11/manual-test-checklist.md | 設計 walkthrough の実施確認項目                         |
| 手動テスト結果           | outputs/phase-11/manual-test-result.md    | walkthrough 判定と代替証跡の記録                        |
| スクリーンショット計画   | outputs/phase-11/screenshot-plan.json     | P53 準拠の代替証跡方針（設計文書 diff / grep ログ）     |
| 発見事項                 | outputs/phase-11/discovered-issues.md     | walkthrough で発見した設計上の問題点（0件でも作成必須） |

## 完了条件

- [ ] validation-matrix.md の Phase 11 シナリオ 1-4 が全て TC-ID 付きで manual-test-plan.md に展開されている
- [ ] grep ベースの静的確認コマンドが manual-test-plan.md に定義されている
- [ ] P53 準拠の代替証跡方針が screenshot-plan.json に記録されている（CLI 環境での実画面キャプチャ不可の旨を明記）
- [ ] discovered-issues.md が作成されている（0件の場合は「発見なし」として明記）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-11/` と一致している
- [ ] 設計タスクのためプロダクションコード変更が0件であることを確認
- [ ] 前Phaseの gate 条件（Phase 10 PASS または MINOR 処理済み）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)
