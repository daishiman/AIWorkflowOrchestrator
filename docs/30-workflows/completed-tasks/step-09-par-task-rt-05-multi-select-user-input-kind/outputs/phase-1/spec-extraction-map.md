# Phase 1: Spec Extraction Map

## AC → ファイル・関数 写像

| AC   | ファイル                                                               | 関数 / 型                                       | 変更内容                              |
| ---- | ---------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| AC-1 | `packages/shared/src/types/skillCreator.ts`                            | `SkillCreatorUserInputKind`                     | `"multi_select"` リテラルを追加       |
| AC-2 | `packages/shared/src/types/skillCreator.ts`                            | `SkillCreatorUserInputSubmission`               | `selectedOptionIds?: string[]` を追加 |
| AC-2 | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `validateUserInputSubmission`                   | `multi_select` case を追加            |
| AC-3 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | Question Host JSX + `handleSubmitWorkflowInput` | checkbox host と submit 分岐を追加    |
| AC-4 | 上記 3 ファイル                                                        | —                                               | 既存 4 kind の分岐を変更しない        |

## 既存 submission 契約の確認

| kind             | submission field        | validation rule                                    |
| ---------------- | ----------------------- | -------------------------------------------------- |
| single_select    | `selectedOptionId`      | 必須 + options 内に存在                            |
| free_text        | `textValue`             | 必須 + 空文字不可                                  |
| secret           | `secretValue`           | 必須 + 空文字不可                                  |
| confirm          | `confirmed`             | boolean 型必須                                     |
| **multi_select** | **`selectedOptionIds`** | **配列必須 + 1件以上 + 全要素が options 内に存在** |

## multi_select 最小契約

- kind: `"multi_select"`
- submission field: `selectedOptionIds?: string[]`
- 必須条件: 配列が存在し 1 件以上の id を含む
- 妥当性条件: 全要素が `request.options[].id` に存在する
- renderer: checkbox 群で表示、`string[]` state で保持
- 非対象: min/max selection、並び替え、全選択/全解除
