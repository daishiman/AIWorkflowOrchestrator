# Phase 6: 拡張テストケース

## タスクID: TASK-SDK-04-U1-F1

## 追加テストケース一覧

| TC-ID    | テスト名                                                                                        | 種別           | 期待結果                           |
| -------- | ----------------------------------------------------------------------------------------------- | -------------- | ---------------------------------- |
| TC-ADD-1 | `verification_review で selectedOptionId が空文字の場合は拒否される`                            | 境界値         | バリデーションエラー               |
| TC-ADD-2 | `recordVerifyFailure 経由の verification_review で selectedOptionId が未指定の場合は拒否される` | 境界値         | バリデーションエラー               |
| TC-ADD-3 | `plan_review で selectedOptionId が未知の文字列の場合は拒否される`                              | 境界値         | バリデーションエラー               |
| TC-ADD-4 | `recordExecutionFailure 経由で kind: single_select の verification_review request が生成される` | 呼び出し元回帰 | kind: "single_select", options 3件 |
| TC-ADD-5 | `recordVerifyFailure 経由で kind: single_select の verification_review request が生成される`    | 呼び出し元回帰 | kind: "single_select", options 3件 |

## 境界値ケースの設計根拠

| ケース                            | 検証対象                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------- |
| 空文字 `""`                       | `!submission.selectedOptionId` が `true` になることを確認（falsy check）         |
| `undefined`（フィールド未指定）   | `!submission.selectedOptionId` が `true` になることを確認                        |
| 未知文字列（plan_review）         | `request.reason !== "verification_review"` かつ options に存在しない場合のエラー |
| 未知文字列（verification_review） | NFR-3: no-op fallback として許容（既存テストで確認済み）                         |

## 呼び出し元回帰テストの設計根拠

`createVerificationReviewRequest()` は以下の 2 箇所から呼ばれる:

1. `recordExecutionFailure()` → TC-ADD-4 で確認
2. `recordVerifyFailure()` → TC-ADD-5 で確認

両呼び出し元で `kind: "single_select"` かつ `options` 3件が返ることを確認した。
