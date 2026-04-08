# Phase 10 成果物: AC 充足確認

## AC 一覧

| AC    | 判定   | 備考                                                           |
| ----- | ------ | -------------------------------------------------------------- |
| AC-1  | PASS   | `ConversationRoundStep.tsx` が存在する                         |
| AC-2  | PASS   | `smartDefaults` / `onComplete` を受け取る                      |
| AC-3  | PASS   | 6問が「質問N/6」形式で表示される                               |
| AC-4  | PASS   | ページ 1 / 2 の表示切替がある                                  |
| AC-5  | PASS   | `smartDefaults` を初期値として反映する                         |
| AC-6  | PASS   | `null` は空欄扱い                                              |
| AC-7  | PASS   | 「次へ」でページ 2 に遷移する                                  |
| AC-8  | PASS   | 「完了」で `onComplete(answers)` が呼ばれる                    |
| AC-9  | PASS   | `ConversationAnswers` が渡される                               |
| AC-10 | PASS   | `pnpm --filter @repo/desktop typecheck` が PASS                |
| AC-11 | PASS   | `ConversationRoundStep.test.tsx` が PASS                       |
| AC-12 | PASS   | `onBack` がページ 1 で動作する                                 |
| AC-13 | PASS\* | `ConfigureStep.tsx` / `WizardOptions` は W2-seq-03a の委譲範囲 |

## 注記

- AC-13 は本タスクのスコープ外として W2 委譲に固定済み
- そのため Phase 10 のレビューでは FAIL 要因ではなく、後続タスクの前提条件として扱う
