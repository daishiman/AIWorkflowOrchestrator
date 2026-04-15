# Phase 5 実装ログ: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## 作成・変更ファイル

### 新規作成

| ファイル                                                                                  | 内容                                                           |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/fetchToolIntegrationInfo.ts`                  | `ExternalToolIntegration` 型 + `fetchToolIntegrationInfo` 関数 |
| `apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts` | TC-1〜TC-13 のユニットテスト                                   |

### 変更

| ファイル                                                                                     | 変更内容                                                                                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | `resolveExternalIntegration` を `string[]` → `Promise<MergedExternalIntegration>` に刷新、呼び出し箇所3件を更新、M-01 TODO 解消 |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | `MAIN_TOOL_BADGE_ENABLED`・`shouldShowMainToolBadge`・バッジ JSX・TODO コメントを削除                                           |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | バッジ関連 describe ブロック（TC-1〜TC-6・拡充テスト）を削除                                                                    |

## AC チェックリスト

| AC   | 状態 | 確認方法                                                 |
| ---- | ---- | -------------------------------------------------------- |
| AC-1 | ✅   | TC-1: Promise.all で並列呼び出し確認                     |
| AC-2 | ✅   | TC-3: apiEndpoints/authMethods/mainOperations マージ確認 |
| AC-3 | ✅   | TC-5: 単一ツール入力で従来同等の結果                     |
| AC-4 | ✅   | TC-6〜TC-11: 空配列・失敗・正規化                        |
| AC-5 | ✅   | 3箇所の呼び出しが `selectedOptions` を渡す               |
| AC-6 | ✅   | 13テスト通過（カバレッジ 90%+）                          |
| AC-7 | ✅   | `grep` で 0 件確認済み                                   |

## テスト結果

```
resolveExternalIntegration.test.ts: 13 passed
ConversationRoundStep.test.tsx:     78 passed
TypeScript typecheck:                PASS (0 errors)
ESLint:                              PASS (0 errors, 8 warnings in pre-existing files)
```
