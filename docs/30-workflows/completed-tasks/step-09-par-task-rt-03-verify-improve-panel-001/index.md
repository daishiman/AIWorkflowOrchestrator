# TASK-RT-03-VERIFY-IMPROVE-PANEL-001: Verify / Improve 結果パネル実装

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                             |
| タスク名     | Verify / Improve 結果パネル実装                                 |
| 分類         | feat（新規UIコンポーネント）                                    |
| 対象機能     | SkillLifecyclePanel の verify / improve フェーズ結果表示        |
| 優先度       | MEDIUM                                                          |
| 見積もり規模 | M（新規コンポーネント 2件 + テスト + SkillLifecyclePanel 統合） |
| ステータス   | spec_created（Phase 1-12 completed / Phase 13 blocked）         |
| 発見元       | TASK-RT-03 Phase 1 スコープ定義（スコープ外として明示）         |
| 作成日       | 2026-04-03                                                      |
| GitHub Issue | #1751                                                           |

## 背景

TASK-RT-03 で plan / execute フェーズの結果パネルを実装したが、verify / improve フェーズの結果パネルはスコープ外とされた。スキル作成ワークフローのフルサイクル（plan → execute → verify → improve）を完成させるため、残り2フェーズの結果パネルを実装する。

## 現状ベースライン

- `SkillLifecyclePanel.tsx` の verify detail inline 表示ブロックは `VerifyResultDetailPanel` に抽出済み
- `SkillLifecyclePanel.tsx` の `runtimeImproveResult` は `ImproveResultDetailPanel` に分離済みで、`ImprovementProposalPanel` は操作面として共存している
- `result-panel-parts.tsx` の `StatusBadge` には verify/status 差分を吸収する label override が追加済み

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | inline verify detail と runtime improve flow を、既存の責務境界を壊さずに dedicated result panel へ分離し、可読性と再利用性を同時に上げること                |
| 依存関係・責務境界   | `ImprovementProposalPanel` は apply/feedback の操作面に残し、`VerifyResultDetailPanel` / `ImproveResultDetailPanel` は read-only の表示責務に閉じる          |
| 価値とコストの不均衡 | 新規 API は不要で、既存の `verifyDetail` / `runtimeImproveResult` / `result-panel-parts.tsx` を再利用できるため、UI の分離コストに対する UX 改善効果が大きい |
| 改善優先順位         | 1. inline verify detail の抽出 2. verify status badge の語彙整合 3. improve result の read-only 化 4. empty state / error state の明示 5. 既存 flow との共存 |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 高                                                                                                            |

## 最終ゴール

1. verify フェーズ完了後に `VerifyResultDetailPanel` が `SkillLifecyclePanel` に表示される
2. improve フェーズ完了後に `ImproveResultDetailPanel` が `SkillLifecyclePanel` に表示される
3. 各パネルが `result-panel-parts.tsx` の共有部品（SectionHeader / TagList / StatusBadge / DetailFooter）を必要箇所で再利用している
4. テストカバレッジが plan / execute パネルと同水準（Verify 25件 / Improve 15件）

## スコープ

| 区分       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| スコープ内 | VerifyResultDetailPanel.tsx 新規実装                             |
| スコープ内 | ImproveResultDetailPanel.tsx 新規実装                            |
| スコープ内 | SkillLifecyclePanel.tsx への verify / improve フェーズ統合       |
| スコープ内 | result-panel-parts.tsx の StatusBadge label override 追加        |
| スコープ内 | 各パネルのユニットテスト                                         |
| スコープ内 | 型定義の確認・必要に応じた拡張                                   |
| スコープ外 | verify / improve の IPC 通信・バックエンドロジック               |
| スコープ外 | Storybook Story 作成（別タスク TASK-RT-03-STORYBOOK-001 で対応） |

## Phase構成

| Phase | 名称             | 状態      |
| ----- | ---------------- | --------- |
| 1     | 要件定義         | completed |
| 2     | 設計             | completed |
| 3     | 設計レビュー     | completed |
| 4     | テスト作成       | completed |
| 5     | 実装             | completed |
| 6     | テスト拡充       | completed |
| 7     | カバレッジ確認   | completed |
| 8     | リファクタリング | completed |
| 9     | 品質保証         | completed |
| 10    | 最終レビュー     | completed |
| 11    | 手動テスト       | completed |
| 12    | ドキュメント     | completed |
| 13    | PR作成           | blocked   |

## 依存タスク

| タスク      | 関係                                                      |
| ----------- | --------------------------------------------------------- |
| TASK-RT-03  | plan / execute パネル（実装済み・参照元）                 |
| TASK-SDK-02 | SkillCreatorWorkflowEngine（state管理との統合確認が必要） |

## 参照資料

| 資料                          | パス                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| SkillLifecyclePanel 設計      | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` |
| RuntimeSkillCreator 型定義    | `packages/shared/src/types/skillCreator.ts`                                                                    |
| 共有UIパーツ                  | `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx`                                            |
| 既存 PlanResultDetailPanel    | `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`                                         |
| 既存 ExecuteResultDetailPanel | `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx`                                      |

## Phase 12 成果物

| 成果物                       | 配置先                                                   |
| ---------------------------- | -------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              |
| タスク仕様準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## Phase 11 画面証跡

| 成果物           | 配置先                                                        |
| ---------------- | ------------------------------------------------------------- |
| capture metadata | `outputs/phase-11/verify-improve-panel-capture-metadata.json` |
| capture plan     | `outputs/phase-11/verify-improve-panel-screenshot-plan.json`  |
| screenshot 11-01 | `outputs/phase-11/screenshots/TC-11-01-verify-pass.png`       |
| screenshot 11-02 | `outputs/phase-11/screenshots/TC-11-02-verify-fail.png`       |
| screenshot 11-03 | `outputs/phase-11/screenshots/TC-11-03-improve-default.png`   |

## Phase 13 成果物

| 成果物             | 配置先                                   |
| ------------------ | ---------------------------------------- |
| local-check-result | `outputs/phase-13/local-check-result.md` |
| change-summary     | `outputs/phase-13/change-summary.md`     |
| pr-info            | `outputs/phase-13/pr-info.md`            |
| pr-creation-result | `outputs/phase-13/pr-creation-result.md` |
