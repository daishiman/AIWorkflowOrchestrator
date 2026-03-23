# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| タスクID   | TASK-LLM-MOD-06                                |
| 機能名     | openai-compatible-adapter                      |
| タスク名   | OpenAICompatibleAdapter 統一アーキテクチャ実装 |
| 前提Phase  | Phase 3                                        |
| 後続Phase  | Phase 5                                        |
| 作成日     | 2026-03-23                                     |
| ステータス | completed                                      |

## 目的

OpenAICompatibleAdapter のテストケースを設計し、パラメトリックテストで openai/xai/openrouter の3プロバイダーを1つのテストスイートでカバーする。

## 実行タスク

- パラメトリックテスト設計: openai/xai/openrouter を `describe.each` で1スイートにまとめる
- sendChat テスト: 正常系レスポンスのパース、messages フォーマット検証
- streamChat テスト: SSE チャンク処理、AsyncGenerator yield 検証
- checkHealth テスト: モデル一覧取得による接続確認
- extraHeaders 注入テスト: OpenRouter 用 HTTP-Referer ヘッダーの付与確認
- エラーハンドリングテスト: 401 Unauthorized / 429 Rate Limit / 500 Internal Server Error

## 参照資料

| 参照資料          | パス                                                      | 説明                 |
| ----------------- | --------------------------------------------------------- | -------------------- |
| BaseLLMAdapter    | `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`    | 基底クラス           |
| AnthropicAdapter  | `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`  | 既存アダプター実装例 |
| GoogleAdapter     | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`     | 既存アダプター実装例 |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | ファクトリクラス     |
| LLM ハンドラ      | `apps/desktop/src/main/handlers/llm.ts`                   | IPC ハンドラ         |

## 実行手順

1. テスト対象のインターフェース（sendChat / streamChat / checkHealth）を確認する
2. パラメトリックテスト構造を設計する（providerConfigs 配列を `describe.each` に渡す）
3. 各プロバイダーの baseUrl / extraHeaders の差異をテストパラメータとして定義する
4. sendChat の正常系テスト: モックされた fetch レスポンスから ChatCompletionResponse をパースできることを検証する
5. streamChat の正常系テスト: SSE 形式のレスポンスから AsyncGenerator で chunk を yield できることを検証する
6. checkHealth のテスト: models エンドポイントへのリクエスト成功を検証する
7. extraHeaders テスト: OpenRouter 設定で HTTP-Referer が付与されることを検証する
8. エラーハンドリングテスト: 401/429/500 レスポンスで適切なエラーオブジェクトが返されることを検証する

## テストケース一覧

| ID    | カテゴリ     | テストケース                                      | 期待結果                                     |
| ----- | ------------ | ------------------------------------------------- | -------------------------------------------- |
| TC-01 | sendChat     | 正常系: openai プロバイダーでチャット送信         | ChatCompletionResponse が正しくパースされる  |
| TC-02 | sendChat     | 正常系: xai プロバイダーでチャット送信            | ChatCompletionResponse が正しくパースされる  |
| TC-03 | sendChat     | 正常系: openrouter プロバイダーでチャット送信     | ChatCompletionResponse が正しくパースされる  |
| TC-04 | streamChat   | 正常系: SSE ストリーミングレスポンスの chunk 処理 | AsyncGenerator が正しく chunk を yield する  |
| TC-05 | checkHealth  | 正常系: models エンドポイントからモデル一覧を取得 | isHealthy: true が返される                   |
| TC-06 | extraHeaders | OpenRouter 用 HTTP-Referer ヘッダーが付与される   | リクエストヘッダーに HTTP-Referer が含まれる |
| TC-07 | エラー系     | 401 Unauthorized レスポンス                       | 認証エラーが返される                         |
| TC-08 | エラー系     | 429 Rate Limit レスポンス                         | レート制限エラーが返される                   |
| TC-09 | エラー系     | 500 Internal Server Error レスポンス              | サーバーエラーが返される                     |
| TC-10 | format       | system prompt 有りの messages フォーマット        | system ロールのメッセージが先頭に配置される  |
| TC-11 | format       | system prompt 無しの messages フォーマット        | user ロールのメッセージのみが送信される      |

## 成果物

| 成果物       | パス                                    | 説明                     |
| ------------ | --------------------------------------- | ------------------------ |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | パラメトリックテスト仕様 |
| テストコード | `OpenAICompatibleAdapter.test.ts`       | テスト実装ファイル       |

## 完了条件

- [x] パラメトリックテストで openai/xai/openrouter の3プロバイダーをカバー
- [x] sendChat / streamChat / checkHealth の正常系テストが設計済み
- [x] extraHeaders 注入テストが設計済み
- [x] エラーハンドリングテスト（401/429/500）が設計済み
- [x] 全テストが Red 状態で実行可能（Phase 5 実装前）

## 次のPhase

Phase 5: 実装
