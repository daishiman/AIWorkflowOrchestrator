# UT-LLM-MOD-03-TYPE-02: GeminiGenerateContentResponse の usageMetadata optional 化

## メタ情報

| 項目         | 値                                           |
| ------------ | -------------------------------------------- |
| タスクID     | UT-LLM-MOD-03-TYPE-02                        |
| 由来         | TASK-LLM-MOD-03 Phase 10 Task 10-5 MINOR指摘 |
| 優先度       | 低                                           |
| 発見日       | 2026-03-24                                   |
| issue_number | 1548                                         |

## 目的

`GeminiGenerateContentResponse` インターフェースの `usageMetadata` フィールドを optional（`usageMetadata?`）に変更し、ストリーミングレスポンスのチャンクで `usageMetadata` が省略される場合のランタイムエラーを防止する。

## 対応方針

1. `usageMetadata` を `usageMetadata?` に変更
2. `sendChat` の L75-77 で optional chaining（`response.usageMetadata?.promptTokenCount ?? 0`）を使用
3. テストに `usageMetadata` なしのレスポンスケースを追加

## 対象ファイル

- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`

## 完了条件

- [ ] `usageMetadata` が optional 型になっている
- [ ] `usageMetadata` が undefined の場合にデフォルト値（0）が使用される
- [ ] TypeScript コンパイルが通る
- [ ] テストで `usageMetadata` なしケースがカバーされている
