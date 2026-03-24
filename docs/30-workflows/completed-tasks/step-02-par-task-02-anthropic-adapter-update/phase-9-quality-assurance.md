# Phase 9: 品質保証 — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 9                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Lint・TypeScript 型チェック・全テスト実行の3点セットで品質を検証し、Phase 10 最終レビューへの移行可否を確認する。

## 実行タスク

### Task 9-1: ESLint による静的解析

```bash
pnpm --filter @repo/desktop lint -- --file apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts
```

期待される出力: エラー0件、警告0件

ESLint で検出される可能性のある項目:

| 項目                   | 確認内容                                                 |
| ---------------------- | -------------------------------------------------------- |
| 未使用 import          | 変更なし（import 追加・削除なし）                        |
| 文字列リテラルの型推論 | `model: "claude-haiku-4-5"` は `string` 型推論。問題なし |
| コメント形式           | `// 最安・最速モデル` は行コメント形式で問題なし         |

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待される出力: エラー0件

型チェックで確認する項目:

| 項目                        | 確認内容                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `checkHealth` 戻り値型      | `Promise<HealthCheckResult>` — 変更なし                                             |
| リクエストボディの型        | `{ model: string, messages: ..., max_tokens: number }` — 文字列変更のみで型影響なし |
| `AnthropicAdapter` クラス型 | `BaseLLMAdapter` 継承 — 変更なし                                                    |

### Task 9-3: 全テスト実行

変更対象ファイルの全テストを実行する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

期待される出力:

| テストID / 説明                                       | 期待結果 |
| ----------------------------------------------------- | -------- |
| `ADP-008: sendChat正常` 系テスト（2件）               | PASS     |
| `ADP-009: システムプロンプト変換`                     | PASS     |
| `ADP-010: エラーマッピング` 系テスト（4件）           | PASS     |
| `streamChat` テスト（1件）                            | PASS     |
| `checkHealth - connected status`                      | PASS     |
| `checkHealth - error status`                          | PASS     |
| `checkHealth - HC-001 (claude-haiku-4-5 model check)` | PASS     |
| `Provider ID`                                         | PASS     |

### Task 9-4: 品質保証サマリ

| 検証項目   | コマンド                                | 期待結果       |
| ---------- | --------------------------------------- | -------------- |
| Lint       | `pnpm lint`                             | エラー・警告 0 |
| TypeCheck  | `pnpm --filter @repo/desktop typecheck` | エラー 0       |
| 単体テスト | `cd apps/desktop && pnpm vitest run`    | 全件 PASS      |

## 参照資料

| ドキュメント                                                            | 用途                       |
| ----------------------------------------------------------------------- | -------------------------- |
| `phase-8-refactoring.md`                                                | リファクタリング完了の確認 |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                | 変更ファイルの最終状態確認 |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | 全テストケースの確認       |

## 統合テスト連携

本 Phase では Adapter 単体の品質を保証する。Adapter と Main Process・IPC を組み合わせた統合品質確認は Task04 完了後に行う。

## 成果物

| 成果物               | パス                                                                                          | 備考                             |
| -------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 9 品質保証記録 | `docs/30-workflows/step-02-par-task-02-anthropic-adapter-update/phase-9-quality-assurance.md` | 本ファイル（結果は実行後に記入） |

## 完了条件

- [ ] `pnpm lint` でエラー・警告が 0 件である
- [ ] `pnpm --filter @repo/desktop typecheck` でエラーが 0 件である
- [ ] `cd apps/desktop && pnpm vitest run` で `AnthropicAdapter.test.ts` の全テストが **PASS** である
- [ ] 3 項目全て合格した後に Phase 10 へ進む
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
