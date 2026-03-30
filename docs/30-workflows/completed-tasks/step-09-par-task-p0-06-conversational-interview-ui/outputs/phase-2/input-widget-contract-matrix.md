# Input Widget Contract Matrix — TASK-P0-06

## UserInputKind → UI 対応表

| Kind          | UI Widget              | 入力方式              | 戻り値                        | Keyboard       | Error                  |
| ------------- | ---------------------- | --------------------- | ----------------------------- | -------------- | ---------------------- |
| single_select | 選択チップ群           | 1クリック選択         | `selectedOptionId: string`    | Enter/Space    | 未選択で送信 → エラー  |
| multi_select  | チェックボックスリスト | 複数トグル+確定       | `selectedOptionIds: string[]` | Space でトグル | 0件で送信 → エラー     |
| free_text     | インラインテキスト入力 | テキスト入力+送信     | `textValue: string`           | Enter で送信   | 空文字で送信 → エラー  |
| confirm       | Yes/No CTA ボタン      | 1クリック選択         | `confirmed: boolean`          | Y/N キー       | 即時反映（エラーなし） |
| secret        | マスク付き入力         | テキスト入力+表示切替 | `secretValue: string`         | Enter で送信   | 空文字で送信 → エラー  |

## UI 共通仕様

| 項目               | 仕様                                                     |
| ------------------ | -------------------------------------------------------- |
| チャットバブル形式 | assistant=左寄せ、user=右寄せ                            |
| 自動スクロール     | 新メッセージ追加時に最下部へスクロール                   |
| 進捗インジケーター | プログレスバー + `{current}/{total}` テキスト            |
| undo/back          | 「戻る」ボタン（最後の回答を取り消し、前の質問を再表示） |
| 熟練度適応         | beginner: 説明テキスト表示、engineer: 質問のみ簡潔       |
| 一時状態保持       | React state で同一セッション内維持                       |
| アニメーション     | フェードイン（CSS transition）                           |

## Accessibility

| 項目             | 仕様                                       |
| ---------------- | ------------------------------------------ |
| role 属性        | `role="log"` でチャットエリア              |
| aria-live        | `aria-live="polite"` で新メッセージ通知    |
| focus management | 新質問表示時に入力ウィジェットへフォーカス |
| tab order        | 選択肢 → 送信ボタンの順                    |
