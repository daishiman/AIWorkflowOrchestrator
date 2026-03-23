# Phase 6: テスト拡充 — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 6                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Phase 7 のカバレッジ確認を先取りし、`checkHealth` メソッドの検証が充足しているか評価する。不足しているテストがあれば追加する。

## 実行タスク

### Task 6-1: カバレッジ計測の前評価

本タスク（TASK-LLM-MOD-02）の変更対象は `checkHealth` メソッド内の 1 行（L207）のみ。
以下の観点で既存テスト＋HC-001 の網羅性を評価する。

| 評価項目                                                              | 既存テスト + HC-001 | 判定     |
| --------------------------------------------------------------------- | ------------------- | -------- |
| `checkHealth` が正常応答時に `connected` を返す                       | PASS ケース済み     | 充足     |
| `checkHealth` がエラー応答時に `error` を返す                         | FAIL ケース済み     | 充足     |
| `checkHealth` リクエストの model フィールドが `claude-haiku-4-5`      | HC-001 で追加       | 充足     |
| `checkHealth` リクエストの `max_tokens` が 1                          | 未テスト            | 追加検討 |
| `checkHealth` リクエストの messages が `[{role:"user",content:"Hi"}]` | 未テスト            | 追加検討 |

### Task 6-2: 追加テストの必要性判断

`max_tokens` と `messages` の検証はヘルスチェックプロトコルの堅牢化に寄与するが、本タスクのスコープ（モデルID更新）からは外れる。以下の方針とする。

- **追加しない理由**: 本タスクの受入基準（AC-001〜AC-005）は HC-001 のみで充足している
- **未タスク化**: `max_tokens` / `messages` 固定値のテストは Phase 12 にて未タスクとして登録する（Phase 10 MINOR 扱い）

### Task 6-3: テスト実行による Green 状態の再確認

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

期待される結果:

- HC-001 `should use claude-haiku-4-5 as health check model`: **PASS**
- 既存テスト全件: **PASS**
- テスト総数: Phase 4 追加前 + 1（HC-001）

## 参照資料

| ドキュメント                                                            | 用途                                     |
| ----------------------------------------------------------------------- | ---------------------------------------- |
| `phase-5-implementation.md`                                             | Green 状態の確認（前提条件）             |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | テストファイルの全テスト確認             |
| `.claude/rules/02-code-quality.md`                                      | カバレッジ基準（Line: 80%、Branch: 60%） |

## 統合テスト連携

`checkHealth` の統合動作（Main Process から Adapter を呼び出すフロー）は Task04 のテストスコープに含まれる。本 Phase では Adapter 単体テストの充足確認のみを行う。

## 成果物

| 成果物                       | パス                                                                    | 備考                       |
| ---------------------------- | ----------------------------------------------------------------------- | -------------------------- |
| テストコード（拡充後・確認） | `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | HC-001 追加済み（Phase 4） |

## 完了条件

- [ ] `checkHealth` 関連テスト（正常・エラー・HC-001）の網羅性を評価した
- [ ] 追加テストが不要（スコープ外）であることを根拠付きで記録した
- [ ] `max_tokens` / `messages` 検証テストを Phase 12 の未タスク候補として記録した
- [ ] `cd apps/desktop && pnpm vitest run` で全テストが **PASS** である

## 次のPhase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）
