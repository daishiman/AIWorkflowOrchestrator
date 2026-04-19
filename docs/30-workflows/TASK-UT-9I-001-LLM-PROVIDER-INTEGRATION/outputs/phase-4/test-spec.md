# Phase 4: テスト仕様書（TC-01〜TC-11）

## テスト1: LLMClient ユニットテスト

**ファイルパス**: `apps/desktop/src/main/services/llm/__tests__/LLMClient.test.ts`

| テストケース | 入力                               | 期待結果                                                             | 実装状況 |
| ------------ | ---------------------------------- | -------------------------------------------------------------------- | -------- |
| TC-01        | 正常なプロンプト                   | `{ success: true, content: "<生成コンテンツ>" }`                     | ✅       |
| TC-02        | APIキー未設定（null/空文字）       | `{ success: false, errorCode: "API_KEY_MISSING", retryable: false }` | ✅       |
| TC-03        | APIキー無効（401/403）             | `{ success: false, errorCode: "API_KEY_INVALID", retryable: false }` | ✅       |
| TC-04        | レート制限（429）                  | `{ success: false, errorCode: "RATE_LIMIT", retryable: true }`       | ✅       |
| TC-05        | サーバーエラー（500）              | `{ success: false, errorCode: "SERVER_ERROR", retryable: true }`     | ✅       |
| TC-06        | タイムアウト（30秒超過）           | `{ success: false, errorCode: "TIMEOUT", retryable: true }`          | ✅       |
| TC-07        | ネットワークエラー（ECONNREFUSED） | `{ success: false, errorCode: "NETWORK_ERROR", retryable: true }`    | ✅       |

## テスト2: skillHandlers.docs 統合テスト

**ファイルパス**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.docs.test.ts`

| テストケース | シナリオ                            | 期待する IPC 返却                                   | 実装状況            |
| ------------ | ----------------------------------- | --------------------------------------------------- | ------------------- |
| TC-08        | docs 生成成功（ja）                 | `{ success: true, data: { ... } }`                  | ✅ (H-12)           |
| TC-09        | APIキー未設定でのdocs生成           | `{ success: false, error: "APIキーが...", ... }`    | ✅ (error handling) |
| TC-10        | タイムアウトでのdocs生成            | `{ success: false, error: "タイムアウト...", ... }` | ✅ (error handling) |
| TC-11        | LLMDocQueryAdapter の stub 排除確認 | `Generated content for:` が存在しない               | ✅ (stub 排除確認)  |

## テスト命名規則

- `describe('LLMClient', () => { it('should ...') })` 形式
- エラーパス: `should return RATE_LIMIT errorCode when 429 received`
- Phase 2 設計の `LLMQueryResult` 型と一致

## モック設計

- `@anthropic-ai/sdk` を `vi.mock()` でモック
- `mockMessagesCreate` でAPI応答をシミュレート
- `vi.useFakeTimers()` でタイムアウトテストを制御
