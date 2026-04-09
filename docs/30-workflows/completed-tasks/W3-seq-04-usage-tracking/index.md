# W3-seq-04: 使用率計装（usage tracking）

## メタ情報

| 項目         | 内容                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W3-seq-04                                                                                                                |
| タスク名     | 使用率計装（usage tracking）                                                                                                             |
| 実行順       | Wave 3（直列・W2-seq-03a完了後）                                                                                                         |
| 依存タスク   | W2-seq-03a                                                                                                                               |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`, `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` |
| 作成日       | 2026-04-07                                                                                                                               |
| ステータス   | completed                                                                                                                                |

## 概要

`SkillCreateWizard.tsx` および `CompleteStep.tsx` に使用率計装（trackEvent）を追加する。  
5つの計装ポイントを定義し、renderer-local の薄い `trackEvent` 抽象として最小実装を行う。  
既存の `SkillAnalytics` / `AnalyticsStore` は execution-centric のため、W3 の UI 計装とは直接接続しない。

## 計装ポイント

| イベント名                          | 発火タイミング           |
| ----------------------------------- | ------------------------ |
| `skill_wizard_started`              | ウィザード起動時         |
| `skill_wizard_step1_completed`      | Step 1完了またはスキップ |
| `skill_wizard_generation_completed` | LLM生成完了時            |
| `skill_skeleton_quality_feedback`   | 品質フィードバック送信時 |
| `skill_wizard_next_action`          | ネクストアクション選択時 |

## trackEvent実装方針

既存トラッキング基盤を確認しつつ、`trackEvent` は renderer-local の薄い抽象として実装する。  
`skill_wizard_started` は空 payload とし、`SkillCategory` は `packages/shared/src/types/skill.ts` から参照する。

## Phaseリスト

| Phase | 名前         | 概要                                 |
| ----- | ------------ | ------------------------------------ |
| 1     | 要件定義     | 計装ポイント・イベントスキーマ定義   |
| 2     | 設計         | trackEvent実装方針・拡張設計         |
| 3     | 設計レビュー | 設計の矛盾・漏れチェック             |
| 4     | テスト作成   | trackEventモックテスト定義           |
| 5     | 実装         | 5計装ポイントの実装                  |
| 6     | テスト拡充   | エッジケース・回帰テスト             |
| 7     | カバレッジ   | カバレッジ計測・未到達分析           |
| 8     | リファクタ   | コード品質改善                       |
| 9     | 品質保証     | 静的解析・リスク評価                 |
| 10    | 最終レビュー | Phase 1-9 の成果物統合レビュー       |
| 11    | 手動テスト   | 実機でのイベント発火確認             |
| 12    | ドキュメント | 実装ガイド・仕様更新・フィードバック |
| 13    | PR作成       | 提出準備・承認待ち                   |
