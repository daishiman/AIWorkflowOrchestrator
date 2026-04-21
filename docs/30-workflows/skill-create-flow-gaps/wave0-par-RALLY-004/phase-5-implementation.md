# Phase 5: 実装

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 5              |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 4        |
| 後続Phase  | Phase 6        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                            | 実行形態                          |
| ---------- | ------------------------------- | --------------------------------- |
| SubAgent-A | 型定義ファイル変更（JSDoc追加） | **直列**（1ファイル・順番に変更） |

## 実装手順

1. `packages/shared/src/types/skillCreator.ts` を開く
2. `SkillCreatorUserInputSubmission` の `selectedOptionIds` フィールドに `@canonical` JSDoc を追加する
3. `SkillCreatorUserInputSubmission` の `selectedValues` フィールドに `@deprecated` JSDoc を追加する
4. `InterviewUserAnswer` の `selectedOptionIds` フィールドに `@canonical` JSDoc を追加する
5. `InterviewUserAnswer` の `selectedValues` フィールドに `@deprecated` JSDoc を追加する
6. `pnpm --filter @repo/shared typecheck` でエラーがないことを確認する
7. `pnpm --filter @repo/shared lint` でエラーがないことを確認する

## 変更対象

| ファイル                                    | 変更内容                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts` | `SkillCreatorUserInputSubmission.selectedOptionIds` に `@canonical` JSDoc 追加 |
| `packages/shared/src/types/skillCreator.ts` | `SkillCreatorUserInputSubmission.selectedValues` に `@deprecated` JSDoc 追加   |
| `packages/shared/src/types/skillCreator.ts` | `InterviewUserAnswer.selectedOptionIds` に `@canonical` JSDoc 追加             |
| `packages/shared/src/types/skillCreator.ts` | `InterviewUserAnswer.selectedValues` に `@deprecated` JSDoc 追加               |

## 実装禁止事項

- `selectedValues` フィールドの実際の削除（下位互換性のため deprecated マークに留める）
- `normalizeSelectedOptionIds` 関数の変更（RALLY-009 以降のスコープ）
- 呼び出し側コード（ConversationalInterview.tsx 等）の変更
- `selectedOptionId`（単数形・single_select 用）の変更（別フィールドのため対象外）

## 完了条件

- [ ] `SkillCreatorUserInputSubmission.selectedOptionIds` に `@canonical` JSDoc が追加されている
- [ ] `SkillCreatorUserInputSubmission.selectedValues` に `@deprecated` JSDoc が追加されている
- [ ] `InterviewUserAnswer.selectedOptionIds` に `@canonical` JSDoc が追加されている
- [ ] `InterviewUserAnswer.selectedValues` に `@deprecated` JSDoc が追加されている
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充
