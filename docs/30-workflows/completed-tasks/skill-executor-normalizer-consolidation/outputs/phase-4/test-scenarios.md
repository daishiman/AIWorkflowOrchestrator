# Phase 4: テストシナリオ 成果物

## 既存テスト Baseline

| テストファイル                    | テスト数 | 結果      | 実行時間 |
| --------------------------------- | -------- | --------- | -------- |
| `sdkMessageNormalizer.test.ts`    | 32       | 全件 PASS | 8ms      |
| `SkillExecutor.sdk-types.test.ts` | 13       | 全件 PASS | 7ms      |

## 新規テストケース（sdkMessageUtils.test.ts）

### asSdkMessageRecord

| テストケース                              | 入力                                 | 期待結果      |
| ----------------------------------------- | ------------------------------------ | ------------- |
| null を渡す                               | `null`                               | null          |
| undefined を渡す                          | `undefined`                          | null          |
| 文字列を渡す                              | `"hello"`                            | null          |
| 数値を渡す                                | `42`                                 | null          |
| 配列を渡す                                | `[1, 2, 3]`                          | null          |
| 空オブジェクトを渡す                      | `{}`                                 | record を返す |
| type フィールドを持つ plain object を渡す | `{ type: "text", content: "hello" }` | record を返す |

### getSdkMessageType

| テストケース                    | 入力                   | 期待結果    |
| ------------------------------- | ---------------------- | ----------- |
| type: "text" のメッセージ       | `{ type: "text" }`     | `"text"`    |
| type: "error" のメッセージ      | `{ type: "error" }`    | `"error"`   |
| type フィールドなしのメッセージ | `{ content: "hello" }` | `undefined` |
| type: 123 (数値) のメッセージ   | `{ type: 123 }`        | `undefined` |
| type: "" (空文字) のメッセージ  | `{ type: "" }`         | `""`        |

## テスト状態

テストは Red 状態（sdkMessageUtils.ts が未実装のため import エラーで FAIL）。
Phase 5 で実装を行い Green にする。
