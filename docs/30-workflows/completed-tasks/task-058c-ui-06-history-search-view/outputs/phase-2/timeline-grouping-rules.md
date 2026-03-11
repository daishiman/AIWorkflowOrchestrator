# Phase 2 タイムライングループ規則

## 判定順

1. invalid date は `日付不明`
2. 今日なら `きょう`
3. 昨日なら `きのう`
4. 直近 7 日以内なら `今週`
5. 直近 14 日以内なら `先週`
6. それ以外は `M月`

## ソート規則

- 一次キー: timestamp 降順
- 二次キー: `id` 昇順
- invalid timestamp は最後尾

## sticky 規則

| viewport | `top` 値                    |
| -------- | --------------------------- |
| desktop  | `0px`                       |
| mobile   | 検索バー高を考慮した `48px` |

## 表示規則

- header は group 単位で 1 回のみ表示する
- group が 1 件でも header は省略しない
