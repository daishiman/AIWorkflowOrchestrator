# UT-LLM-MOD-03-TYPE-01: buildRequestBody 戻り値型の厳密化（GeminiRequestBody 型定義）

## メタ情報

| 項目         | 値                                           |
| ------------ | -------------------------------------------- |
| タスクID     | UT-LLM-MOD-03-TYPE-01                        |
| 由来         | TASK-LLM-MOD-03 Phase 10 Task 10-5 MINOR指摘 |
| 優先度       | 低                                           |
| 発見日       | 2026-03-24                                   |
| issue_number | 1547                                         |

## 目的

GoogleAdapter の `buildRequestBody` メソッドの戻り値型を `Record<string, unknown>` から厳密な `GeminiRequestBody` インターフェースに変更し、型安全性を向上させる。

## 対応方針

1. `GeminiRequestBody` インターフェースを定義する（`contents`, `generationConfig`, `system_instruction?` フィールド）
2. `buildRequestBody` の戻り値型を `GeminiRequestBody` に変更
3. 既存テストが全て PASS することを確認

## 対象ファイル

- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`

## 完了条件

- [ ] `GeminiRequestBody` インターフェースが定義されている
- [ ] `buildRequestBody` の戻り値型が `GeminiRequestBody` である
- [ ] TypeScript コンパイルが通る
- [ ] 既存テストが全て PASS する
