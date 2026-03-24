# Phase 3: 設計レビュー結果 - TASK-LLM-MOD-03

## 判定: PASS

全要件がカバーされており、重大な設計問題はない。

## 要件カバレッジ検証

| FR番号   | 設計での対応                    | カバレッジ |
| -------- | ------------------------------- | ---------- |
| FR-03-01 | Task 2-2: formatContents 変更   | OK         |
| FR-03-02 | Task 2-3: buildRequestBody 設計 | OK         |
| FR-03-03 | Task 2-4: sendChat/streamChat   | OK         |
| FR-03-04 | Task 2-5: v1beta 採用           | OK         |

## AC 照合

| AC番号   | 充足方法                                        | 判定 |
| -------- | ----------------------------------------------- | ---- |
| AC-05    | `buildRequestBody` で `system_instruction` 設定 | OK   |
| AC-06    | `if (request.systemPrompt)` 条件付き追加        | OK   |
| AC-03-01 | systemPrompt 挿入ロジック削除                   | OK   |
| AC-03-02 | buildRequestBody 実装コード                     | OK   |
| AC-03-03 | if 条件分岐                                     | OK   |
| AC-03-04 | sendChat で buildRequestBody 使用               | OK   |
| AC-03-05 | streamChat で buildRequestBody 使用             | OK   |
| AC-07    | Record<string, unknown> で型安全                | OK   |

## MINOR 指摘事項（Phase 4 で対処）

1. 既存テストの MSW モック URL を `v1` -> `v1beta` に全件更新する必要がある
2. `system_instruction` 対応の新規テストケースを追加する必要がある

## 既存テスト影響分析

- `"should prepend systemPrompt as user message"`: Red になる -> Phase 4 で置換
- MSW モック URL: `v1beta` への全件更新が必要 -> Phase 4 で対処
- `checkHealth` テスト: URL 更新が必要 -> Phase 4 で対処

## 完了条件

- [x] 全 FR カバレッジ確認済み
- [x] 全 AC 充足方法確認済み
- [x] アーキテクチャ整合性チェック完了
- [x] 既存テスト影響分析完了
- [x] PASS 判定記録済み
- [x] 本Phase内の全タスクを100%実行完了
