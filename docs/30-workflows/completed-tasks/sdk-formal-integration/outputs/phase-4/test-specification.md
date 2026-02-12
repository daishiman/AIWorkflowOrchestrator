# TASK-9B-I-SDK-FORMAL-INTEGRATION: テストケース設計書

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| タスクID     | TASK-9B-I-SDK-FORMAL-INTEGRATION  |
| Phase        | 4 (テスト作成 / TDD Red)          |
| 作成日       | 2026-02-12                        |
| 対象ファイル | `SkillExecutor.sdk-types.test.ts` |

## 目的

SkillExecutor.ts の `as any` キャストを除去し、SDK 型宣言ファイルに `query` 名前付きエクスポートを追加する変更に対する型安全テストを設計する。

## 検証軸

| 軸                     | 説明                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| コンパイル時型チェック | TypeScript コンパイラが型不整合を検出できること                                            |
| 動的 import 型解決     | `await import("@anthropic-ai/claude-agent-sdk")` の結果に `query` プロパティが存在すること |
| SDK モック型互換性     | テスト用モックが SDK 型宣言と一致すること                                                  |

## テストケース一覧

### TC-001: callSDKQuery 戻り値の stream() メソッド存在確認

| 項目      | 内容                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------ |
| ID        | TC-001                                                                                           |
| 検証軸    | 動的 import 型解決                                                                               |
| **Given** | SkillExecutor が有効な API キーを持っている                                                      |
| **When**  | execute() を呼び出し、SDK query() が正常応答を返す                                               |
| **Then**  | query() の戻り値が `stream()` メソッドを持つオブジェクトであり、stream() が AsyncIterable を返す |
| 期待結果  | `mockQuery` が呼び出され、戻り値の stream() がストリームメッセージを生成する                     |

### TC-002: SDK モック query 関数のシグネチャ検証

| 項目      | 内容                                                                     |
| --------- | ------------------------------------------------------------------------ |
| ID        | TC-002                                                                   |
| 検証軸    | SDK モック型互換性                                                       |
| **Given** | SDK モックが `query` 関数を提供している                                  |
| **When**  | モック query() に `{ prompt, options }` 形式の引数を渡す                 |
| **Then**  | query() が `{ stream: () => AsyncIterable }` を返す                      |
| 期待結果  | モックの型がSDK型宣言の `QueryFunctionArgs` / `QueryConversation` と互換 |

### TC-003: SDKQueryOptions と QueryFunctionOptions の互換性

| 項目      | 内容                                                                    |
| --------- | ----------------------------------------------------------------------- |
| ID        | TC-003                                                                  |
| 検証軸    | コンパイル時型チェック                                                  |
| **Given** | SkillExecutor 内部の SDKQueryOptions が定義されている                   |
| **When**  | SDKQueryOptions のフィールドを QueryFunctionOptions に対応付ける        |
| **Then**  | `permissionMode` が `"auto" \| "ask" \| "deny" \| "default"` であること |
| 期待結果  | execute() 内で permissionMode: "default" が型エラーなく渡される         |

### TC-004: 不正な引数がコンパイルエラーになること

| 項目      | 内容                                                    |
| --------- | ------------------------------------------------------- |
| ID        | TC-004                                                  |
| 検証軸    | コンパイル時型チェック                                  |
| **Given** | SDK query() に型定義が存在する                          |
| **When**  | 数値型の prompt を渡す                                  |
| **Then**  | TypeScript コンパイラがエラーを報告する                 |
| 期待結果  | `@ts-expect-error` でエラーが期待通り発生することを確認 |

### TC-005: query() にプロンプト未指定でコンパイルエラー

| 項目      | 内容                                                    |
| --------- | ------------------------------------------------------- |
| ID        | TC-005                                                  |
| 検証軸    | コンパイル時型チェック                                  |
| **Given** | SDK query() に型定義が存在する                          |
| **When**  | prompt フィールドなしのオブジェクトを渡す               |
| **Then**  | TypeScript コンパイラがエラーを報告する                 |
| 期待結果  | `@ts-expect-error` でエラーが期待通り発生することを確認 |

### TC-006: query() 戻り値の QueryConversation 型検証

| 項目      | 内容                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| ID        | TC-006                                                                            |
| 検証軸    | 動的 import 型解決                                                                |
| **Given** | SDK query() が QueryConversation を返す型宣言がある                               |
| **When**  | query() を呼び出し、戻り値の型を検証する                                          |
| **Then**  | 戻り値が `stream()` メソッドを持ち、`stream()` が `AsyncIterable<unknown>` を返す |
| 期待結果  | 型レベルで QueryConversation の構造が保証される                                   |

## テストファイル配置

```
apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

## 既存テストとの関係

本テストファイルは **既存の6ファイルに影響を与えない独立したテスト** として作成する:

- `SkillExecutor.test.ts` - 基本実行テスト
- `SkillExecutor.auth.test.ts` - 認証テスト
- `SkillExecutor.retry.test.ts` - リトライテスト
- `SkillExecutor.integration.test.ts` - 統合テスト
- `SkillExecutor.permission.test.ts` - 権限テスト
- `SkillExecutor.type-migration.test.ts` - 型移行テスト
