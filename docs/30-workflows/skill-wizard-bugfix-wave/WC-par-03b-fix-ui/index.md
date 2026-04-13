# TASK-SW-FIX-UI-001: UI整合性修正

## タスク概要

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | TASK-SW-FIX-UI-001                                                              |
| タスク名     | UI整合性修正（カテゴリ多選択・ボタン統一・ProgressBar・カテゴリ解除）           |
| 実行Wave     | Wave C（Wave B完了後。Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整が必要） |
| 依存タスク   | TASK-SW-FIX-FEEDBACK-001（Wave B完了後・Wave Cで並列実行可）                    |
| 優先度       | 低（Tier 3）                                                                    |
| タスク種別   | UI task（VISUAL）                                                               |
| 対象問題番号 | 問題2・問題3・問題11・問題15・問題16                                            |
| 作成日       | 2026-04-12                                                                      |
| ステータス   | pending                                                                         |

## 目的

スキルウィザードのUIが実際のフロー状態と乖離し、ユーザーを混乱させている5件の問題（UIクラスターD）を解消する。
カテゴリの多選択・解除、外部連携判定の配列対応、ボタンスタイルの統一、ProgressBarの動的表示を実装し、ウィザードUIの整合性を高める。

## 問題の詳細

| 問題番号 | 問題内容                                                                             | 現状                                                                           | 期待動作                                        |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| 問題2    | カテゴリ型が`SkillCategory`の単一選択                                                | 1カテゴリしか選択できない                                                      | 複数カテゴリを選択できる（`SkillCategory[]`型） |
| 問題3    | ボタンスタイルの不統一（`bg-blue-600` vs `--status-primary`、`rounded`形状の不統一） | hardcoded色・形状が混在                                                        | 全ボタンがCSS変数で統一される                   |
| 問題11   | `InterviewProgressBar`の`currentQuestion`が固定値（Page 1で1固定、Page 2で4固定）    | 進捗が実際の回答状況を反映しない                                               | 実際の回答済み問数から動的計算                  |
| 問題15   | 選択済みカテゴリを再クリックしても解除できない                                       | `handleCategoryClick`で`if (formData.category === value) return`で早期リターン | 再クリックでトグル解除される                    |
| 問題16   | ProgressBarが「ページ先頭の質問番号」を表示し実際の進捗と乖離                        | Page 1で常に1/6、Page 2で常に4/6                                               | 回答済み問数（1/6〜6/6）を動的表示              |

## 変更対象ファイル

| ファイル                                                                        | 変更内容                                                                      |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                     | `SkillInfoFormData.category`型変更: `SkillCategory[]` へ整理（未選択は `[]`） |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`     | カテゴリ配列に対する format 推論の正本                                        |
| `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | shared 推論の再利用または薄い再エクスポート                                   |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`           | 複数選択UI・カテゴリ解除トグル実装                                            |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`        | Q5 必須判定の配列対応                                                         |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | ProgressBar `currentQuestion` 動的計算実装                                    |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`              | ボタンCSS変数統一・代表カテゴリ解決・推論呼び出し整理                         |

## Phase 一覧

| Phase    | ファイル                       | 概要                         | ステータス |
| -------- | ------------------------------ | ---------------------------- | ---------- |
| Phase 1  | `phase-1-requirements.md`      | 要件定義                     | pending    |
| Phase 2  | `phase-2-design.md`            | 設計                         | pending    |
| Phase 3  | `phase-3-design-review.md`     | 設計レビュー                 | pending    |
| Phase 4  | `phase-4-test-creation.md`     | テスト作成                   | pending    |
| Phase 5  | `phase-5-implementation.md`    | 実装                         | pending    |
| Phase 6  | `phase-6-test-expansion.md`    | テスト拡充                   | pending    |
| Phase 7  | `phase-7-coverage-check.md`    | カバレッジ確認               | pending    |
| Phase 8  | `phase-8-refactoring.md`       | リファクタリング             | pending    |
| Phase 9  | `phase-9-quality-assurance.md` | 品質保証                     | pending    |
| Phase 10 | `phase-10-final-review.md`     | 最終レビュー                 | pending    |
| Phase 11 | `phase-11-manual-test.md`      | 手動テスト（VISUAL）         | pending    |
| Phase 12 | `phase-12-documentation.md`    | ドキュメント更新             | pending    |
| Phase 13 | `phase-13-pr-creation.md`      | PR作成（ユーザー承認後のみ） | pending    |

## 実行方法

```bash
# ブランチ作成
git checkout -b fix/skill-wizard-ui-consistency

# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test

# リント
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint
```

## 依存関係

```
TASK-SW-FIX-FEEDBACK-001 (Wave B)
  └─→ TASK-SW-FIX-UI-001 (Wave C, 並列可)
```

## 参照

| ドキュメント          | パス                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| バグ修正ウェーブ全体  | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                         |
| SkillInfoStep         | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         |
| ApplySummaryCard      | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| SkillCreateWizard     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            |
| InterviewProgressBar  | `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`  |
| 型定義                | `packages/shared/src/types/skillCreator.ts`                                   |
| 推論正本              | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`   |
