# agentview-improve-route - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001                                |
| タスク名     | agentview-improve-route                                             |
| 分類         | 実装                                                                |
| 対象機能     | AgentView 実行後の改善 handoff + SkillAnalysisView 戻り導線         |
| 優先度       | 高                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | Phase 1-12 完了 / Phase 13 未実施（ユーザー指示で commit・PR 停止） |
| 作成日       | 2026-03-17                                                          |

## タスク概要

### 目的

AgentView で実行済みスキルに対する改善 CTA を追加し、`skillAnalysis` へ正しく handoff できるようにする。あわせて SkillAnalysisView に Agent 起点の戻り導線を追加し、既存の `onClose -> skillCenter` 契約を壊さずに「実行 -> 分析 -> 再実行」のループを閉じる。

### 背景

現在の問題:

1. `skillLifecycleJourney.ts` は Agent を「改善判断の起点」と定義しているが、現行 AgentView には `skillAnalysis` への導線がない
2. SkillAnalysisView の現行 props は `skillName` と `onClose` のみで、Agent 起点の戻り導線がない
3. `skillAnalysis` の現行到達経路は SkillCenter / DetailPanel 側が中心で、Agent 起点 handoff の責務分離が未定義
4. 現行 state 契約は `selectedSkillName`（agentSlice）と `currentSkillName`（navigationSlice）に分かれており、ここを整理せずに実装すると handoff が破綻しやすい

### 最終ゴール

実行済みスキルに対して、AgentView から SkillAnalysisView へ遷移し、Agent 起点で入った場合だけ戻る / 再実行導線を表示できる状態にする。

### 成果物一覧

| 種別       | 成果物                          | 配置先                                                                                         |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/` |
| 設計成果物 | `outputs/phase-*`               | 上記ディレクトリ配下                                                                           |
| コード     | AgentView, SkillAnalysisView 等 | `apps/desktop/src/renderer/` 配下の該当ファイル                                                |

## 参照ファイル

| 参照資料              | パス                                                                             | 内容                                                      |
| --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| パック index          | `docs/30-workflows/skill-lifecycle-routing/index.md`                             | 実行順序、依存グラフ、タスク一覧                          |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                            | `selectedSkillName` / `skillExecutionStatus` の現状確認   |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`               | 既存 props / footer / `onClose` 契約を確認する            |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                              | `skillAnalysis` case と `currentSkillName` handoff を確認 |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                      | `currentView` / `viewHistory` / `currentSkillName` を確認 |
| SkillCenter handoff   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`        | 既存 `handleAnalyzeSkill()` 契約を確認する                |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                  | Agent -> Skill Analysis handoff の正本契約                |
| Task01 index          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-*/index.md` | ViewType / renderView 基盤の成果物を確認する              |
| Task02 index          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-*/index.md` | SkillCenter 導線の成果物を確認する                        |
| Task03 index          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-*/index.md` | DetailPanel analyze handoff の成果物を確認する            |

## 受入基準（AC）

| ID   | 基準                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-1 | AgentView で対象スキルが確定し、既存実行状態（`skillExecutionStatus` / `recentExecutions` / `isExecuting`）から「改善提案を出せる」と判定されたときだけ CTA が表示される |
| AC-2 | CTA クリック時に `selectedSkillName` を `currentSkillName` へ引き継いだ上で `setCurrentView("skillAnalysis")` が実行される                                               |
| AC-3 | SkillAnalysisView へ Agent 起点で入った場合のみ戻り導線が表示され、既存 `onClose` 契約と両立したまま `viewHistory` / `goBack()` で Agent へ戻れる                        |
| AC-4 | SkillAnalysisView へ Agent 起点で入った場合のみ再実行導線が表示され、Agent へ戻って再実行を始められる                                                                    |
| AC-5 | AgentView -> SkillAnalysisView -> AgentView の往復で `currentSkillName` と Agent 側の選択スキルが不整合を起こさない                                                      |
| AC-6 | スキル未選択、空文字 / 空白のみ、実行中、または実行結果が未成立の状態では改善 CTA を表示しない                                                                           |
| AC-7 | Apple HIG 準拠（8px グリッド、既存色トークン利用、200-300ms の軽い遷移、WCAG 2.1 AA）を満たす                                                                            |

## 依存関係

| 依存タスク                                           | 依存 Phase               | 理由                                                            |
| ---------------------------------------------------- | ------------------------ | --------------------------------------------------------------- |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 (Task01) | Phase 3 完了後           | `skillAnalysis` ViewType / renderView 基盤が前提                |
| TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 (Task02)       | Phase 3 完了後が望ましい | SkillCenter 側の既存 analyze handoff と重複しないことを確認する |
| TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 (Task03)     | Phase 3 完了後が望ましい | DetailPanel analyze handoff と `currentSkillName` 契約を揃える  |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名       | 責務                                                    | 依存 |
| ---- | ---------- | ------------------ | ------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件定義           | current code anchor と system spec 抽出マップを固定する | -    |
| T-02 | Phase 2    | 設計確定           | CTA 条件、handoff state、App 注入方針を確定する         | T-01 |
| T-03 | Phase 3    | 設計レビューゲート | current code / system spec との整合を判定する           | T-02 |
| T-04 | Phase 4-7  | テスト・実装       | TDD で CTA と戻り導線を実装し、カバレッジを確保する     | T-03 |
| T-05 | Phase 8-13 | 品質・ドキュメント | リファクタリング・品質検証・仕様同期を行う              | T-04 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR 作成          | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 統合テスト連携（Phase 1〜11 で必須）

- AgentView の CTA 表示条件が `selectedSkillName` / 既存実行状態 / `currentSkillName` handoff と追跡可能であることを確認する
- SkillAnalysisView の `onClose` と `onNavigateBack` / `onNavigateToAgent` の共存を確認する
- `navigationSlice` の `viewHistory` / `currentSkillName` と Agent 側の選択スキルが往復後も整合することを確認する

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- `artifacts.json` を更新対象として扱う
