# Phase 4: テスト仕様書

## テストマトリクス（TC-01〜TC-12）

| TC番号 | テスト名                                 | 対象                 | 入力                                                         | 期待値                           |
| ------ | ---------------------------------------- | -------------------- | ------------------------------------------------------------ | -------------------------------- |
| TC-01  | q1 "自分だけ" → "自分のみ"               | resolveSemanticLabel | value: "自分だけ", questionId: "q1"                          | "自分のみ"                       |
| TC-02  | q5 "slack" → "Slack"                     | resolveSemanticLabel | value: "slack", questionId: "q5"                             | "Slack"                          |
| TC-03  | q5 "github" → "GitHub"                   | resolveSemanticLabel | value: "github", questionId: "q5"                            | "GitHub"                         |
| TC-04  | undefined 入力 → undefined               | resolveSemanticLabel | value: undefined, questionId: "q1"                           | undefined                        |
| TC-05  | 未定義 questionId → フォールバック       | resolveSemanticLabel | value: "任意", questionId: "q99"                             | "任意"                           |
| TC-06  | 未定義 rawValue → フォールバック         | resolveSemanticLabel | value: "存在しない値", questionId: "q1"                      | "存在しない値"                   |
| TC-07  | カスタム labelMap DI                     | resolveSemanticLabel | value: "foo", questionId: "qX", labelMap: {qX: {foo: "bar"}} | "bar"                            |
| TC-08  | q1 smartDefaults.who変換（自分だけ）     | applySmartDefaults   | who: "自分だけ"                                              | q1.selectedOptions: ["自分のみ"] |
| TC-09  | q3 smartDefaults.timing変換（scheduled） | applySmartDefaults   | timing: "scheduled"                                          | q3.selectedOptions: ["定期実行"] |
| TC-10  | q5 smartDefaults.tool変換（slack）       | applySmartDefaults   | tool: "slack"                                                | q5.selectedOptions: ["Slack"]    |
| TC-11  | 空文字列入力のハンドリング               | resolveSemanticLabel | value: "", questionId: "q1"                                  | ""                               |
| TC-12  | SEMANTIC_LABEL_MAP import 確認           | import               | SEMANTIC_LABEL_MAP                                           | toBeDefined()                    |

## 注記

TC-01 は Phase 4 仕様書では questionId: "q5" とあるが、
Phase 12 仕様（q1: { "自分だけ": "自分のみ" }）を正として q1 を使用する。
