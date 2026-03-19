# TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001

## メタ情報

| 項目       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001                                   |
| 責務       | 品質ゲートラベル表示（QualityGateLabel）と実行時バナー強化（RuntimeBanner） |
| 親パック   | `docs/30-workflows/skill-lifecycle-unification/index.md`                    |
| 優先度     | high                                                                        |
| ステータス | phase-1-in-progress                                                         |
| 作成日     | 2026-03-17                                                                  |

## 目的

ui-ux-realization.md が定義する UI 契約のうち、以下の2点を実装する。

1. **quality gate ラベル（QualityGateLabel）**: `improve` ステップで `NEEDS_IMPROVEMENT` / `SAVE_ALLOWED` / `USE_ALLOWED` / `RECOMMENDED` の品質ゲート結果を明示表示する。現状の ScoreDisplay.tsx は色変化のみで間接表示しており、ゲート判定結果を文字ラベルで示していない（C-05）。
2. **RuntimeBanner 強化**: `execute` ステップで小さな StatusBadge にとどまる現状を、実行経路と trust 境界を同時に表示するバナー形式に強化する（C-06）。

## 前提

| 前提資料             | パス                                                                          | 参照目的                                       |
| -------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| UI/UX 契約           | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`          | execute/improve の必須 UI 要件                 |
| コンポーネント図     | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`             | RuntimeBanner / QualityGateLabel の位置        |
| ScoringGate 型定義   | `packages/shared/src/types/skill-improver.ts`（L322-366）                     | getScoreGate / getScoreGateResult の戻り値仕様 |
| CTA 可視性マトリクス | `packages/shared/src/types/cta-visibility.ts`                                 | getCTAVisibilityFromScore の表示ロジック       |
| 既存スコア表示       | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`                 | 色変化ロジック（L84-110）の現状把握            |
| 既存 StatusBadge     | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（L50-67） | RuntimeBanner の置き換え対象                   |

## Phase 一覧

| Phase | 名称             | 成果物パス                                                        | ステータス  |
| ----- | ---------------- | ----------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | `outputs/phase-1/requirements-analysis.md`                        | in-progress |
| 2     | 設計             | `outputs/phase-2/design-document.md`                              | pending     |
| 3     | 設計レビュー     | `outputs/phase-3/design-review-report.md`                         | pending     |
| 4     | テスト作成       | `outputs/phase-4/`                                                | pending     |
| 5     | 実装             | `apps/desktop/src/renderer/components/skill/QualityGateLabel.tsx` | pending     |
|       |                  | `apps/desktop/src/renderer/components/skill/RuntimeBanner.tsx`    | pending     |
| 6     | テスト拡充       | -                                                                 | pending     |
| 7     | カバレッジ確認   | -                                                                 | pending     |
| 8     | リファクタリング | -                                                                 | pending     |
| 9     | 品質検証         | -                                                                 | pending     |
| 10    | 最終レビュー     | -                                                                 | pending     |
| 11    | 手動テスト       | -                                                                 | pending     |
| 12    | ドキュメント     | -                                                                 | pending     |
| 13    | 完了             | -                                                                 | pending     |

## 成果物

| 成果物                          | パス                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| QualityGateLabel コンポーネント | `apps/desktop/src/renderer/components/skill/QualityGateLabel.tsx`                       |
| RuntimeBanner コンポーネント    | `apps/desktop/src/renderer/components/skill/RuntimeBanner.tsx`                          |
| SkillAnalysisView 統合          | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`（既存ファイル更新）  |
| SkillStreamingView 統合         | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（既存ファイル更新） |

## 関連タスク

| タスクID                | 関係                                       |
| ----------------------- | ------------------------------------------ |
| TASK-SKILL-LIFECYCLE-04 | getScoreGate / ScoringGate 型の定義元      |
| TASK-SKILL-LIFECYCLE-05 | getCTAVisibilityFromScore の定義元         |
| TASK-SKILL-LIFECYCLE-06 | trust 境界・permission governance の設計元 |
