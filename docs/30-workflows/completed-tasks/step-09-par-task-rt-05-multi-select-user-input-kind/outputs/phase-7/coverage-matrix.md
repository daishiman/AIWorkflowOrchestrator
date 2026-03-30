# Phase 7: Coverage Matrix

## AC → テスト coverage 対応表

| AC   | 主担当      | 代表テスト                         | coverage 状態 |
| ---- | ----------- | ---------------------------------- | ------------- |
| AC-1 | shared type | T4-1 (型定義 — コンパイル時検証)   | COVERED       |
| AC-2 | engine      | T4-2, T4-3, T4-4, T6-1, T6-2, T6-3 | COVERED       |
| AC-3 | renderer    | T4-5, T4-6                         | COVERED       |
| AC-4 | regression  | T4-7, T6-4 (既存 58 テスト全 PASS) | COVERED       |

## downstream 再利用確認

- TASK-P0-06 は同じ `SkillCreatorUserInputRequest` / `SkillCreatorUserInputSubmission` 契約を使用可能
- `kind: "multi_select"` のリクエストを生成すれば、engine と renderer が自動的に対応する
- 再実装不要

## 未カバー項目

なし — 全 AC がテストでカバーされている
