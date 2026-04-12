# Phase 1: 差分カバレッジ（インベントリ棚卸）

## 変更対象ファイル一覧

| ファイル                                                                                     | 変更種別 | 変更内容                                                                              |
| -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skill-wizard-label-map.ts`                                        | 新規作成 | QuestionSemanticLabelMap 型, SEMANTIC_LABEL_MAP 定数, resolveSemanticLabel 関数       |
| `packages/shared/package.json`                                                               | 修正     | `exports` と `typesVersions` に `./types/skillWizard` 追加                            |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 修正     | import 追加, createQuestionAnswer のハードコード除去, applySmartDefaults エクスポート |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 修正     | TC-01〜TC-12 以上のテスト追加                                                         |

## 変更対象外ファイル

- `inferSmartDefaults()` 本体（スコープ外）
- `ApplySummaryCard.tsx` 等の他のウィザードコンポーネント（影響なし）
- IPC チャンネル定義（影響なし）

## ベースラインテスト件数

- 既存: 36件（全件 PASS 状態）
- 追加目標: 10件以上（合計46件以上）
