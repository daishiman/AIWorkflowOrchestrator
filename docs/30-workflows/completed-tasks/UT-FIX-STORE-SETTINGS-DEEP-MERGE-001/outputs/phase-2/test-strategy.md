# テスト戦略書: deepMerge TDD

## アプローチ

TDD（Red → Green）: テストを先に書いてから実装する

## 追加テストケース

| TC ID | タイトル                     | 入力                                           | 更新ペイロード                  | 期待値                                          |
| ----- | ---------------------------- | ---------------------------------------------- | ------------------------------- | ----------------------------------------------- |
| TC-01 | ネスト部分更新フィールド保持 | `{ theme: { color: "dark", size: "medium" } }` | `{ theme: { color: "light" } }` | `{ theme: { color: "light", size: "medium" } }` |
| TC-02 | トップレベル上書き           | `{ language: "ja", theme: { color: "dark" } }` | `{ language: "en" }`            | `{ language: "en", theme: { color: "dark" } }`  |
| TC-03 | 配列上書き                   | `{ providers: ["a", "b"] }`                    | `{ providers: ["c"] }`          | `{ providers: ["c"] }`                          |
| TC-04 | null 上書き                  | `{ theme: { color: "dark" } }`                 | `{ theme: null }`               | `{ theme: null }`                               |
| TC-05 | 存在しない子キー追加         | `{ theme: { color: "dark" } }`                 | `{ theme: { size: "large" } }`  | `{ theme: { color: "dark", size: "large" } }`   |
