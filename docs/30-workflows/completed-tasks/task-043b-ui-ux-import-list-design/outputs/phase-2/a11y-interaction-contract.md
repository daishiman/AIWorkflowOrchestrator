# Phase 2 A11y 操作契約

## Role / ARIA

| 要素                      | 契約                                                        |
| ------------------------- | ----------------------------------------------------------- |
| panel                     | `data-testid="skill-management-panel"`                      |
| search                    | ラベル `スキルを検索`                                       |
| imported / available list | `role="list"` + child `role="listitem"`                     |
| success                   | `role="status"` + `aria-live="polite"`                      |
| error                     | `role="alert"`                                              |
| dialog                    | `role="dialog"` + `aria-modal="true"` + title / description |

## キーボード

- `Tab` で検索 → card actions / row CTA → dialog actions へ移動
- `Enter` で row CTA / dialog confirm を実行
- `Escape` で dialog を閉じる
- dialog close 後は trigger へ戻る
- import success 後は imported card root へ戻る

## フォーカス原則

- imported card root は `tabIndex={-1}` を持ち、success focus target になる
- row CTA は aria-label に skill 名を含める
- dialog 内は簡易 focus trap を維持する
