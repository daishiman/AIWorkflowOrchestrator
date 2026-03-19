# agentview-improve-route - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001                          |
| タスク名     | agentview-improve-route                                       |
| 分類         | 実装                                                          |
| 対象機能     | AgentView からスキル改善への導線 + SkillAnalysisView 戻り導線 |
| 優先度       | 高                                                            |
| 見積もり規模 | 中規模                                                        |
| ステータス   | spec_created                                                  |
| 作成日       | 2026-03-17                                                    |

## タスク概要

### 目的

AgentView（スキル実行画面）でスキル実行完了後に「スキルを分析・改善する」CTA を表示し、
SkillAnalysisView へ遷移できるようにする。また SkillAnalysisView に「エージェントに戻る」
ナビゲーションリンクと「エージェントで再実行」ボタンを追加し、改善後の AgentView/Workspace
への戻り導線を配線する。

### 背景

現在の問題:

1. AgentView でスキル実行完了後、改善への導線がない（因果ループ断絶3）
2. SkillAnalysisView から Agent/Workspace への戻り導線がない（因果ループ断絶4）
3. 仕様上は「結果を見て改善判断へつなぐ」（skillLifecycleJourney.ts L62）だが、
   AgentView から分析画面への遷移が未実装
4. SkillAnalysisView は onClose コールバックのみ持ち、遷移先は呼び出し元次第

### 最終ゴール

スキル実行 → 分析・改善 → 再実行 の因果ループを UI 上で完結させる。

### 成果物一覧

| 種別       | 成果物                          | 配置先                                                                                         |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/` |
| 設計成果物 | outputs/phase-\*/               | 上記ディレクトリ配下                                                                           |
| コード     | AgentView, SkillAnalysisView 等 | `apps/desktop/src/renderer/` 配下の該当ファイル                                                |

## 参照ファイル

| 参照資料              | パス                                                                             | 内容                                            |
| --------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| パック index          | `docs/30-workflows/skill-lifecycle-routing/index.md`                             | 実行順序、依存グラフ、タスク一覧                |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                            | 実行完了後 UI の現状を確認する                  |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`               | 既存の prop 設計・onClose を確認する            |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                              | renderView の skillAnalysis case を確認する     |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                      | 遷移元情報の管理構造を確認する                  |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                  | ライフサイクル導線の正本契約を確認する（L62）   |
| Task01 index          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-*/index.md` | ViewType 基盤の成果物を確認する（依存）         |
| Task02 index          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-*/index.md` | SkillCenter 導線の成果物を確認する（依存）      |
| Task03 index          | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-*/index.md` | SkillDetailPanel 拡張の成果物を確認する（依存） |

## 受入基準（AC）

| ID   | 基準                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| AC-1 | AgentView でスキル実行完了後に「スキルを分析・改善する」CTA が表示される                |
| AC-2 | CTA クリックで `setCurrentView("skillAnalysis")` が実行される（対象スキル名が渡される） |
| AC-3 | SkillAnalysisView に「エージェントに戻る」ナビゲーションリンクが表示される              |
| AC-4 | SkillAnalysisView で改善適用後に「エージェントで再実行」ボタンが表示される              |
| AC-5 | SkillAnalysisView → AgentView 遷移時にスキル選択状態が維持される                        |
| AC-6 | スキル未実行時（実行結果がない場合）には改善 CTA は表示されない                         |
| AC-7 | Apple HIG 準拠（カラーパレット、8px グリッド、アニメーション 200-300ms）                |

## 依存関係

| 依存タスク                                           | 依存 Phase               | 理由                                                 |
| ---------------------------------------------------- | ------------------------ | ---------------------------------------------------- |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 (Task01) | Phase 3 完了後           | ViewType に skillAnalysis が追加されていることが前提 |
| TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 (Task02)       | Phase 3 完了後が望ましい | skillAnalysis への遷移が安定していることを確認する   |
| TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 (Task03)     | Phase 3 完了後が望ましい | onAnalyze prop パターンの整合性確認                  |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名       | 責務                                                | 依存 |
| ---- | ---------- | ------------------ | --------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件定義           | 現状調査・受入基準・スコープを整理する              | -    |
| T-02 | Phase 2    | 設計確定           | prop 設計・状態管理・遷移フローを確定する           | T-01 |
| T-03 | Phase 3    | 設計レビューゲート | 依存タスクとの整合性・設計妥当性を判定する          | T-02 |
| T-04 | Phase 4-7  | テスト・実装       | TDD で CTA と戻り導線を実装し、カバレッジを確保する | T-03 |
| T-05 | Phase 8-13 | 品質・ドキュメント | リファクタリング・品質検証・ドキュメント化を行う    | T-04 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                 | ステータス  |
| ----- | ---------------- | ------------------------------------------------------ | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)   | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)               | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md) | not_started |
| 4     | テスト作成       | phase-4-test-creation.md                               | not_started |
| 5     | 実装             | phase-5-implementation.md                              | not_started |
| 6     | テスト拡充       | phase-6-test-expansion.md                              | not_started |
| 7     | カバレッジ確認   | phase-7-coverage-check.md                              | not_started |
| 8     | リファクタリング | phase-8-refactoring.md                                 | not_started |
| 9     | 品質検証         | phase-9-quality-assurance.md                           | not_started |
| 10    | 最終レビュー     | phase-10-final-review.md                               | not_started |
| 11    | 手動テスト       | phase-11-manual-test.md                                | not_started |
| 12    | ドキュメント     | phase-12-documentation.md                              | not_started |
| 13    | PR 作成          | phase-13-pr-creation.md                                | not_started |

## 統合テスト連携（Phase 1〜11 で必須）

- AgentView の実行完了状態検出・CTA 表示・遷移アクションを各 Phase で確認する
- SkillAnalysisView の onNavigateBack / onNavigateToAgent prop の疎通を確認する
- navigationSlice でスキル選択状態が遷移をまたいで維持されることを確認する

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- artifacts.json を更新対象として扱う
