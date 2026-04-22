# Phase 8 成果物: 責務境界マップ

## タスクID: TASK-RALLY-002

| 領域                               | 現在の責務                                              | 本タスクでの変更               | 後続タスクへの境界                             |
| ---------------------------------- | ------------------------------------------------------- | ------------------------------ | ---------------------------------------------- |
| `ConversationalInterview.tsx`      | `pendingRequest` の選択と表示切替                       | 優先ルールコメントの明文化     | RALLY-010〜013 が UI/UX 拡張を担当             |
| `useEffect(clear)`                 | 新しい `awaitingUserInput` 到着時の restored state 解放 | 意図説明コメントの追加         | clear 条件そのものの再設計は扱わない           |
| `ConversationalInterview.test.tsx` | UIウィジェット表示と送信のシナリオ検証                  | restore/clear 契約テストを追加 | 後続タスクは既存契約を前提に UI を拡張する     |
| workflow docs                      | close-out と handoff の追跡                             | Phase 8〜12 成果物を補完       | 後続Waveは task-local outputs を正本として参照 |

## 境界ルール

- 本タスクは `pendingRequest` 表示契約の明文化まで
- サーバー側 rollback API や完了UIの追加は対象外
- 新しい state や helper を増やさず、既存責務の説明と検証に限定する
