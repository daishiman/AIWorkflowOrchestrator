# Phase 6: テスト拡充（実施済み） -- OpenRouter プロバイダー統合

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| Phase番号  | 6                      |
| 機能名     | openrouter-integration |
| タスクID   | TASK-LLM-MOD-07        |
| 作成日     | 2026-03-23             |
| ステータス | 実施済み               |
| 依存Phase  | Phase 5（実装）        |

## 目的

Phase 4 の基本テストを補完し、カバレッジ基準（Line 80%、Branch 60%、Function 80%）の達成を確保する。

## 実行タスク（実施済み記録）

### Task 6-1: カバレッジ未達箇所の特定（完了）

Phase 4 のテスト 16 ケースに加え、以下の追加テストが必要であることを確認した。

### Task 6-2: 追加テスト実装（完了）

| テストID | 説明                                                                                | 追加対象ファイル            | 結果 |
| -------- | ----------------------------------------------------------------------------------- | --------------------------- | ---- |
| TS-F-01  | OpenRouter モデルID（`"openai/gpt-4o"` 等 "provider/model" 形式）の inferProviderId | `llm.test.ts`               | PASS |
| TS-F-02  | 全既存プロバイダー（openai, anthropic, google, xai）の inferProviderId 回帰テスト   | `llm.test.ts`               | PASS |
| TS-F-03  | `SecureStorage.hasApiKey("openrouter")` の動作テスト                                | `secureStorage.test.ts`     | PASS |
| TS-F-04  | OpenRouter 用 `extraHeaders` がリクエストに付与されることのテスト                   | `LLMAdapterFactory.test.ts` | PASS |

### Task 6-3: テスト間の状態漏れ確認（完了 / P9 対策）

`beforeEach` で以下が正しくリセットされていることを確認した:

- `vi.clearAllMocks()` による全モック状態リセット
- SecureStorage のモック戻り値リセット
- LLMAdapterFactory のキャッシュクリア

### Task 6-4: 全テスト実行確認（完了）

Phase 4 の 16 ケース + Phase 6 の 4 ケース = 全 20 テストケースが PASS であることを確認した。

## 参照資料

| 資料                                                                     | 用途                                 |
| ------------------------------------------------------------------------ | ------------------------------------ |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`       | 既存テストのカバレッジ確認           |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                   | 既存テストのカバレッジ確認           |
| `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts` | 既存テストのカバレッジ確認           |
| `.claude/rules/02-code-quality.md`（カバレッジ基準）                     | 最低基準（Line 80%、Branch 60%）確認 |

## 成果物

| 成果物                       | パス                                                                     | 備考                        |
| ---------------------------- | ------------------------------------------------------------------------ | --------------------------- |
| inferProviderId 拡充テスト   | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                   | TS-F-01, TS-F-02 追加       |
| SecureStorage テスト         | `apps/desktop/src/main/services/__tests__/secureStorage.test.ts`         | TS-F-03 追加                |
| LLMAdapterFactory 拡充テスト | `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts` | TS-F-04（extraHeaders）追加 |

## 完了条件

- [x] Phase 4 のテストカバレッジを確認した
- [x] カバレッジ基準（Line 80%、Branch 60%、Function 80%）の達成に必要な追加テストを特定した
- [x] 追加テスト 4 ケース（TS-F-01 〜 TS-F-04）を実装した
- [x] 全 20 テストケースが PASS であることを確認した
- [x] `beforeEach` でモック状態がリセットされていることを確認した（P9 対策）

## 次のPhase

[Phase 7: カバレッジ確認](./phase-7-coverage.md)
