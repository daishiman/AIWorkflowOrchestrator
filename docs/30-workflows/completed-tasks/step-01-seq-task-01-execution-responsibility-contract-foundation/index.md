# execution-responsibility-contract-foundation - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| タスク名     | execution-responsibility-contract-foundation              |
| 分類         | 設計                                                      |
| 対象機能     | execution responsibility / access capability 契約基盤     |
| 優先度       | 最優先                                                    |
| 見積もり規模 | 中規模                                                    |
| ステータス   | implementation_ready                                      |
| 作成日       | 2026-03-19                                                |
| 更新日       | 2026-03-20                                                |

## タスク概要

### 目的

auth mode toggle 起点の認知を捨て、execution responsibility / access capability / UI state vocabulary を一つの契約に収束させる。

### 背景

1. 旧パックは execution responsibility を主語に再定義したが、残タスクへ落ちる task spec が未整備である。
2. toggle / access matrix / handoff / terminal-only の語彙 drift が残ると、後続タスクで再びローカル判断が増殖する。
3. Phase 1-3 で contract foundation を固定しない限り、mainline UI・terminal・ledger 系 task の依存順が曖昧なままになる。

### 最終ゴール

integratedRuntime / terminalSurface / both / none の capability、ready / blocked / unavailable の状態語彙、primary CTA 1個 + secondary CTA 1個の CTA 契約を single source of truth として確定する。

### 配置方針

本 Task01 は親パック `tasks/` 配下ではなく、`docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/` に standalone で置く。Task02-09 の leaf task ではなく、親パック全体が参照する upstream foundation だからである。

### 3 concern 分解

| Concern | 名称            | 責務                                                                         |
| ------- | --------------- | ---------------------------------------------------------------------------- |
| A       | capability 契約 | integratedRuntime / terminalSurface / both / none の状態遷移と責務境界を定義 |
| B       | state 語彙統一  | ready / blocked / unavailable の判定ロジックと表示契約を定義                 |
| C       | CTA 契約        | primary / secondary CTA の表示条件と action wiring を定義                    |

### 成果物一覧

| 種別       | 成果物                                   | 配置先                                                                                      |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13                   | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/         |
| 設計成果物 | outputs/phase-\*/                        | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/ |
| 実装ガイド | outputs/phase-12/implementation-guide.md | 後続実装フェーズの handoff                                                                  |

## 参照ファイル

| 参照資料                                                 | パス                                                                                                          | 確認する内容                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 親パック index                                           | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | capability 4状態・禁止事項・task 依存順・lane 分離         |
| current canonical workflow                               | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | execution responsibility 系の current entrypoint           |
| 親 UI/UX 正本                                            | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | mainline / handoff / CTA 契約の workflow 正本              |
| 設計監査                                                 | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 問題設定・依存順・drift リスク                             |
| RuntimePolicyResolver                                    | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                                               | integrated_api / terminal_handoff の2択決定ロジック        |
| auth-mode.ts                                             | packages/shared/src/types/auth-mode.ts                                                                        | AuthMode型・AuthModeStatus DTO・IPCResponse envelope       |
| RuntimeResolver                                          | apps/desktop/src/main/services/runtime/RuntimeResolver.ts                                                     | runtime 解決フローと fallback 有無                         |
| TerminalHandoffBuilder                                   | apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts                                              | terminal handoff 構築と silent send 防止                   |
| interfaces-auth                                          | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                          | current auth vocabulary と transport contract の親仕様     |
| api-ipc-system                                           | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                           | system IPC 契約の親仕様                                    |
| llm-ipc-types                                            | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                            | capability / guidance 消費側で使う DTO 群                  |
| security-electron-ipc-core                               | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                               | terminal lane の禁止事項と IPC 安全境界                    |
| security-principles                                      | .claude/skills/aiworkflow-requirements/references/security-principles.md                                      | manual lane / hidden action 禁止の上位原則                 |
| ui-ux-navigation                                         | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                         | `settings` public shell / `ViewType` / `renderView()` 境界 |
| ui-ux-settings                                           | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                           | settings 関連 child companion の入口                       |
| ui-ux-settings-core                                      | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                      | AuthGuard bypass / timeout fallback / settings shell       |
| arch-state-management-core                               | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | Renderer selector 境界と既存 capability 語彙               |
| interfaces-auth-core                                     | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                                     | capability と auth 型の具体契約                            |
| api-ipc-system-core                                      | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                                      | health / selected-config IPC 契約                          |
| arch-state-management                                    | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                    | Renderer 責務境界と Zustand slice 設計                     |
| task-workflow                                            | .claude/skills/aiworkflow-requirements/references/task-workflow.md                                            | current wave の canonical 導線                             |
| task-workflow-backlog                                    | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                                    | follow-up formalization と same-wave 条件                  |
| task-workflow-completed                                  | .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md                                  | completed 化の出口条件                                     |
| lessons-learned                                          | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                                          | 横断教訓の親仕様                                           |
| lessons-learned-current                                  | .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md                                  | current wave の同期漏れ対策                                |
| lessons-learned-viewtype-electron-ui                     | .claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md                     | `ViewType` / `renderView()` drift 防止                     |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | .claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md | settings bypass / auth timeout の再発防止                  |
| spec elegance audit                                      | .claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md                          | 抽象・整合・依存レビューの基準                             |

## 受入基準（AC）

| ID   | 基準                                                                                                  | 検証方法                                                             |
| ---- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| AC-1 | capability 4状態（integratedRuntime / terminalSurface / both / none）の責務と表示契約が定義されている | contract-matrix に 4 行 × state/CTA 列が全て記載されていること       |
| AC-2 | UI 状態語彙（ready / blocked / unavailable）と CTA 契約が 1:1 で定義されている                        | contract-matrix の state × CTA セルが全て「primary + secondary」形式 |
| AC-3 | silent fallback / auto-send / hidden prompt injection を禁止する境界が文章化されている                | 禁止事項が test / review / manual の各層で検証可能なこと             |
| AC-4 | Step 02 以降が参照すべき canonical doc set が明示されている                                           | canonical doc set 一覧が contract-matrix に併記されていること        |

## 依存関係

- 上流: なし（本タスクが依存グラフの起点）
- 下流: Task02（RuntimePolicy Centralization）が本タスクの contract を消費する

## タスク分解サマリー

| ID   | フェーズ    | サブタスク名  | 責務                                                      | 依存 |
| ---- | ----------- | ------------- | --------------------------------------------------------- | ---- |
| T-01 | Phase 1     | 要件定義      | 現状棚卸し・FR/NFR・AC・対象境界を定義する                | -    |
| T-02 | Phase 2     | 設計          | 3 concern 分解・contract-matrix・validation-matrix を作る | T-01 |
| T-03 | Phase 3     | 設計レビュー  | 語彙drift/state drift/simpler alt の3方向 review gate     | T-02 |
| T-04 | Phase 4-7   | テスト/実装   | concern別テスト設計・実装順序・coverage gate を組み立てる | T-03 |
| T-05 | Phase 8-10  | 品質/レビュー | refactor boundary・品質5軸・最終AC照合を実施する          | T-04 |
| T-06 | Phase 11-13 | 検証/文書/PR  | walkthrough・Phase12 canonical sync・PR準備を整理する     | T-05 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス | 主な成果物                                                                                               |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  | requirements-definition / scope-definition / inventory                                                   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  | design-summary / contract-matrix / validation-matrix                                                     |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  | design-review-report / gate-decision                                                                     |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  | test-matrix / mock-strategy                                                                              |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  | implementation-plan / file-change-scope                                                                  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  | regression-expansion-plan / edge-case-matrix                                                             |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  | coverage-targets / integration-gate                                                                      |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  | refactor-boundaries / simplification-candidates                                                          |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  | quality-checklist / risk-register                                                                        |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  | final-review-report / final-gate-decision                                                                |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  | manual-test-plan / manual-test-result / screenshot-plan / screenshot-coverage / discovered-issues        |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  | implementation-guide / system-spec-update-summary / changelog / unassigned / feedback / compliance-check |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    | pr-preparation                                                                                           |

## 統合テスト連携（Phase 1〜11 で必須）

| Phase    | 統合テスト観点                                                             |
| -------- | -------------------------------------------------------------------------- |
| Phase 1  | capability / state / CTA の gap を integration point として要件に含める    |
| Phase 2  | contract-matrix に integration 列を追加し、Phase 4/11 の検証対象を明示する |
| Phase 3  | integration completeness を review 観点に含める                            |
| Phase 4  | surface 横断の統合シナリオ S-1〜S-3 を定義する                             |
| Phase 5  | 変更順序が integration contract を壊さないことを前提条件として書く         |
| Phase 6  | regression テストに blocked/fallback/legacy coexistence の観点を追加する   |
| Phase 7  | smoke / integration / walkthrough の 3 ゲートを定義する                    |
| Phase 8  | refactor 後も integration contract を維持する invariants を記録する        |
| Phase 9  | manual / automated / system spec の 3 系統で品質確認する                   |
| Phase 10 | integration completeness と documentation completeness を同時確認する      |
| Phase 11 | capability 状態別 TC-01〜TC-06 の manual walkthrough を実施する            |

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- `artifacts.json` / `outputs/artifacts.json` / index / phase 本文の同期方針を確認する

## task 固有の重点

語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く
