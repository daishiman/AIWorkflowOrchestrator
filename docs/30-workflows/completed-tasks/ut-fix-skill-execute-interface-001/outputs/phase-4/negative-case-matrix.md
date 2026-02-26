# Phase 4 異常系マトリクス

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 4

## 入力不正マトリクス（skill:execute skillNameパス）

| ケースID | skillName     | prompt  | workingDirectory | 想定エラー                                         | エラーメッセージ                       | 備考                       |
| -------- | ------------- | ------- | ---------------- | -------------------------------------------------- | -------------------------------------- | -------------------------- |
| NC-01    | `""`          | `"ok"`  | -                | VALIDATION_ERROR (throw)                           | "skillName must be a non-empty string" | 空文字                     |
| NC-02    | `"   "`       | `"ok"`  | -                | VALIDATION_ERROR (throw)                           | "skillName must be a non-empty string" | trim空白                   |
| NC-03    | `"\n\t"`      | `"ok"`  | -                | VALIDATION_ERROR (throw)                           | "skillName must be a non-empty string" | 制御文字のみ               |
| NC-04    | `null`        | `"ok"`  | -                | VALIDATION_ERROR (throw)                           | "skillName must be a non-empty string" | 型不一致                   |
| NC-05    | `123`         | `"ok"`  | -                | VALIDATION_ERROR (throw)                           | "skillName must be a non-empty string" | 型不一致                   |
| NC-06    | `undefined`   | `"ok"`  | -                | isSkillNameRequest → false → skillIdパスへ         | "skillId must be a non-empty string"   | 型ガード分岐               |
| NC-07    | `"valid"`     | `null`  | -                | **現状: Service層到達** / 改善後: VALIDATION_ERROR | DG-01                                  | promptバリデーション未実施 |
| NC-08    | `"valid"`     | `123`   | -                | **現状: Service層到達** / 改善後: VALIDATION_ERROR | DG-01                                  | promptバリデーション未実施 |
| NC-09    | `"valid"`     | `""`    | -                | **現状: Service層到達** / 改善後: VALIDATION_ERROR | DG-01                                  | promptバリデーション未実施 |
| NC-10    | `"valid"`     | `"   "` | -                | **現状: Service層到達** / 改善後: VALIDATION_ERROR | DG-01                                  | promptバリデーション未実施 |
| NC-11    | `"not-found"` | `"ok"`  | -                | 業務エラー (return)                                | "スキルが見つかりません"               | 名前解決失敗               |

## 入力不正マトリクス（skill:execute skillIdパス）

| ケースID | skillId | params | 想定エラー               | エラーメッセージ                     | 備考     |
| -------- | ------- | ------ | ------------------------ | ------------------------------------ | -------- |
| NC-20    | `""`    | -      | VALIDATION_ERROR (throw) | "skillId must be a non-empty string" | 空文字   |
| NC-21    | `"   "` | -      | VALIDATION_ERROR (throw) | "skillId must be a non-empty string" | trim空白 |
| NC-22    | `null`  | -      | VALIDATION_ERROR (throw) | "skillId must be a non-empty string" | 型不一致 |
| NC-23    | `123`   | -      | VALIDATION_ERROR (throw) | "skillId must be a non-empty string" | 型不一致 |

## 失敗時の観測ポイント

| 観測項目                 | 確認方法                              | 期待結果                                                                      |
| ------------------------ | ------------------------------------- | ----------------------------------------------------------------------------- |
| エラーコードの統一性     | VALIDATION_ERROR が throw される      | バリデーションエラーは全て `{ code: "VALIDATION_ERROR" }`                     |
| エラーメッセージの情報量 | メッセージが入力原因を示す            | "skillName must be a non-empty string" / "skillId must be a non-empty string" |
| sender検証の完全性       | 不正ウィンドウからの呼び出し          | toIPCValidationError が throw される                                          |
| エラー処理の非対称性     | バリデーション = throw, 業務 = return | パターンが一貫していること                                                    |
| 型ガード分岐の正確性     | skillName/skillIdの境界入力           | isSkillNameRequestが正しいパスに分岐                                          |

## 型ガード境界ケース

| ケースID | 入力                                              | isSkillNameRequest判定 | 分岐先パス                         | 備考                         |
| -------- | ------------------------------------------------- | ---------------------- | ---------------------------------- | ---------------------------- |
| NC-30    | `{ skillName: "x", prompt: "y" }`                 | true                   | skillNameパス                      | 正規の SkillExecutionRequest |
| NC-31    | `{ skillId: "abc" }`                              | false                  | skillIdパス                        | 正規の skillId入力           |
| NC-32    | `{ skillName: "x", skillId: "abc", prompt: "y" }` | true                   | skillNameパス                      | 両方含む: skillNameが優先    |
| NC-33    | `{}`                                              | false                  | skillIdパス → バリデーションエラー | 空オブジェクト               |
| NC-34    | `null`                                            | -                      | 型ガード前にエラー                 | null入力                     |

## 完了記録

- [x] 異常系マトリクスを定義（skillNameパス11件 + skillIdパス4件 + 型ガード5件 = 20件）
- [x] P42観点を網羅（型/空文字/trim の各段階）
- [x] DG-01（promptバリデーション）の現状と改善後の期待結果を並記
- [x] 型ガード境界ケースを追加
