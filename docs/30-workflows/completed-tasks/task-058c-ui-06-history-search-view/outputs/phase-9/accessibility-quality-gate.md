# Phase 9 accessibility quality gate

## キーボード操作

| 項目             | 期待結果                            | 自動 | 手動 |
| ---------------- | ----------------------------------- | ---- | ---- |
| 検索 input       | focus 可能で accessible name がある | PASS | PASS |
| accordion toggle | Enter / Space で開閉                | PASS | PASS |
| clear action     | Tab で到達できる                    | PASS | PASS |
| file link        | button / link として操作できる      | PASS | PASS |

## ARIA / role

| 項目          | 期待結果                    | 結果 |
| ------------- | --------------------------- | ---- |
| accordion     | `aria-expanded` が状態同期  | PASS |
| search        | input が明確な label を持つ | PASS |
| empty / error | copy と CTA が文脈を持つ    | PASS |

## 判定

**PASS**

WCAG 2.1 AA 観点で blocker はなし。視覚面では mobile sticky の軽微な重なりが polish 候補。
