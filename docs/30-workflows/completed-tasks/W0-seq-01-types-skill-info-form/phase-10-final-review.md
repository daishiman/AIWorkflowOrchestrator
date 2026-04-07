# Phase 10: 最終レビュー

## メタ情報

- Phase: 10
- タスクID: UT-SKILL-WIZARD-W0-seq-01
- 機能名: スキルウィザード共有型定義追加
- 作成日: 2026-04-07

## 目的

QA 完了後の成果物を最終的にレビューし、PR 提出前の最後のゲートチェックを行う。実装内容が要件・設計・レビュー結果と一致していることを確認する。

## 実行タスク

- [ ] 要件定義（Phase 1）との照合
- [ ] 設計（Phase 2）との照合
- [ ] 設計レビュー（Phase 3）の指摘事項が全て反映されているか確認
- [ ] コミットメッセージの準備
- [ ] 変更差分の最終確認

## 参照資料

| 資料名           | パス                                        | 説明               |
| ---------------- | ------------------------------------------- | ------------------ |
| 要件定義         | `phase-1-requirements.md`                   | 照合元             |
| 設計書           | `phase-2-design.md`                         | 照合元             |
| 設計レビュー     | `phase-3-design-review.md`                  | 指摘事項の反映確認 |
| 追記対象ファイル | `packages/shared/src/types/skillCreator.ts` | 最終確認対象       |

## 実行手順

### Step 1: 要件との照合チェックリスト

| 要件                                   | 実装内容                     | 照合結果 |
| -------------------------------------- | ---------------------------- | -------- |
| `SkillCategory` を追加する             | `skillCreator.ts` 末尾に追記 | 要確認   |
| `SkillInfoFormData` を追加する         | `skillCreator.ts` 末尾に追記 | 要確認   |
| `SkillWizardScheduleConfig` を追加する | `skillCreator.ts` 末尾に追記 | 要確認   |
| `QuestionAnswer` を追加する            | `skillCreator.ts` 末尾に追記 | 要確認   |
| `ConversationAnswers` を追加する       | `skillCreator.ts` 末尾に追記 | 要確認   |
| `SmartDefaultResult` を追加する        | `skillCreator.ts` 末尾に追記 | 要確認   |
| `SkeletonQualityFeedback` を追加する   | `skillCreator.ts` 末尾に追記 | 要確認   |
| 既存ファイルへの追記である             | 新規ファイル作成ではなく追記 | 要確認   |

### Step 2: 設計レビュー（Phase 3）指摘事項の反映確認

| Phase 3 指摘事項                          | 反映内容                                                | 確認   |
| ----------------------------------------- | ------------------------------------------------------- | ------ |
| `ScheduleConfig` との衝突回避             | `SkillWizardScheduleConfig` に改名                      | 要確認 |
| `skill.ts` との `SkillCategory` 混同防止  | モジュール境界を明記                                    | 要確認 |
| `skillName` / `category` の nullable 方針 | `skillName?: string`, `category: SkillCategory \| null` | 要確認 |
| `ConversationAnswers` の形状              | `q1`〜`q6` + `QuestionAnswer` へ統一                    | 要確認 |
| `SmartDefaultResult` のキー               | `who/input/timing/output/tool/format` に統一            | 要確認 |
| `inferenceLog` の追加                     | 推論根拠を保持                                          | 要確認 |

### Step 3: 差分確認

```bash
# 変更差分を確認
git diff packages/shared/src/types/skillCreator.ts

# 新規ファイル確認
git status packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
```

確認ポイント:

- 差分が追加（`+`）のみであること（既存型の削除・変更がないこと）
- セクション区切りコメントが含まれていること
- 全 7 型が含まれていること

### Step 4: コミット準備

```bash
# ステージング
git add packages/shared/src/types/skillCreator.ts
git add packages/shared/src/types/__tests__/skillCreator-wizard.test.ts

# コミットメッセージ（例）
# feat(shared/types): UT-SKILL-WIZARD-W0-seq-01 スキルウィザード共有型定義追加
#
# - SkillInfoFormData / SkillCategory を追加
# - QuestionAnswer / ConversationAnswers / SmartDefaultResult / SkeletonQualityFeedback を追加
# - 既存 ScheduleConfig との衝突を SkillWizardScheduleConfig 命名で回避
```

### Step 5: 最終品質確認

```bash
# 最終確認（全項目を一括実行）
pnpm --filter @repo/shared typecheck && \
pnpm --filter @repo/shared lint && \
pnpm --filter @repo/shared test
```

全コマンドが成功することを確認する。

## 成果物

- 最終レビュー済みの `packages/shared/src/types/skillCreator.ts`
- 最終レビュー済みの `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`

## 完了条件

- [ ] 要件定義との照合が完了し、全要件が実装されている
- [ ] Phase 3 の設計レビュー指摘事項が全て反映されている
- [ ] 変更差分が追加のみ（既存型の削除・変更なし）であることを確認している
- [ ] コミットメッセージが準備されている
- [ ] 全チェック（型チェック・リント・テスト）が最終実行で通過している
