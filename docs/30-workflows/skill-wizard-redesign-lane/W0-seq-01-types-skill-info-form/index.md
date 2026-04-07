# W0-seq-01: スキルウィザード共有型定義追加

## タスク概要

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W0-seq-01                   |
| タスク名     | スキルウィザード共有型定義追加              |
| 実行順       | Wave 0（先行必須・直列）                    |
| 依存タスク   | なし                                        |
| 優先度       | 高（W1/W2 のブロッカー）                    |
| 対象ファイル | `packages/shared/src/types/skillCreator.ts` |
| 作成日       | 2026-04-07                                  |

## 目的

スキルウィザード再設計（skill-wizard-redesign）において、Step 0 / Step 1 / Step 3 が共通利用する型契約を `skillCreator.ts` に一元定義する。入力フォーム、6問回答、スマートデフォルト、Q3 スケジュール、最終フィードバックを重複なしで扱えるようにし、後続 wave が迷わず参照できる状態を先に作る。

## 追加する型一覧

| 型名                        | 種別          | 説明                                                |
| --------------------------- | ------------- | --------------------------------------------------- |
| `SkillCategory`             | type（union） | Step 0 のカテゴリ選択値                             |
| `SkillInfoFormData`         | interface     | Step 0 のフォーム入力                               |
| `SkillWizardScheduleConfig` | interface     | Q3 の定期実行設定（既存 `ScheduleConfig` と別概念） |
| `QuestionAnswer`            | interface     | Q1〜Q6 の個別回答                                   |
| `ConversationAnswers`       | interface     | 6問の回答集約                                       |
| `SmartDefaultResult`        | interface     | Q1〜Q6 のスマートデフォルトと推論ログ               |
| `SkeletonQualityFeedback`   | interface     | 骨格品質フィードバック                              |

## 契約要点

- `SkillInfoFormData.skillName` は任意入力で、未設定時は省略できる。
- `SkillInfoFormData.category` は `SkillCategory | null` とし、未選択状態を `null` で表す。
- `QuestionAnswer.scheduleConfig` は Q3 のときのみ `SkillWizardScheduleConfig` を持つ。
- `SmartDefaultResult` は `who / input / timing / output / tool / format` と `inferenceLog` を持つ。
- `SkillWizardScheduleConfig` は `cronExpression` と `timezone` のみを持つ。
- 既存の `ScheduleConfig` は別用途の既存定義なので、新しいスケジュール設定は `SkillWizardScheduleConfig` で固定する。
- `skill.ts` には別の `SkillCategory` が既に存在するため、公開経路は `@repo/shared/types/skillCreator` に閉じ、root `@repo/shared` へは載せない。

## Phase 一覧

| Phase    | ファイル                    | 概要                          |
| -------- | --------------------------- | ----------------------------- |
| Phase 1  | `phase-1-requirements.md`   | 要件定義                      |
| Phase 2  | `phase-2-design.md`         | 設計                          |
| Phase 3  | `phase-3-design-review.md`  | 設計レビュー                  |
| Phase 4  | `phase-4-test-creation.md`  | テスト作成                    |
| Phase 5  | `phase-5-implementation.md` | 実装                          |
| Phase 6  | `phase-6-test-expansion.md` | テスト拡充                    |
| Phase 7  | `phase-7-coverage.md`       | カバレッジ確認                |
| Phase 8  | `phase-8-refactoring.md`    | リファクタリング              |
| Phase 9  | `phase-9-qa.md`             | 品質保証                      |
| Phase 10 | `phase-10-final-review.md`  | 最終レビュー                  |
| Phase 11 | `phase-11-manual-test.md`   | 手動テスト                    |
| Phase 12 | `phase-12-docs.md`          | ドキュメント更新              |
| Phase 13 | `phase-13-pr.md`            | PR 作成（ユーザー承認後のみ） |

## 実行方法

```bash
# ブランチ作成
git checkout -b feat/skill-wizard-t01-skill-info-form-types

# 実装（Phase 5）
# packages/shared/src/types/skillCreator.ts へ型を追記

# テスト実行
pnpm --filter @repo/shared test

# 型チェック
pnpm --filter @repo/shared typecheck

# リント
pnpm --filter @repo/shared lint
```

## 依存関係図

```
UT-SKILL-WIZARD-W0-seq-01（Wave 0）
        ↓
Wave 1（SkillInfoStep / ConversationRoundStep）
        ↓
Wave 2（SkillCreateWizard / exports）
        ↓
Wave 3（usage tracking）
```
