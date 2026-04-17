# Phase 1: 受け入れ基準 AC-1〜AC-7

- AC-1: 実 LLM プロバイダ（Anthropic）で `skill:docs:generate` が成功レスポンスを返す
- AC-2: API キー未設定時に `{ success: false, error: { code: 2001, retryable: false } }` を返す
- AC-3: API キー無効時に `{ success: false, error: { code: 2002, retryable: false } }` を返す
- AC-4: 429 応答時に `{ success: false, error: { code: 3002, retryable: true } }` を返す
- AC-5: 5xx 応答時に `{ success: false, error: { code: 3003, retryable: true } }` を返す
- AC-6: タイムアウト時に `{ success: false, error: { code: 3001, retryable: true } }` を返す
- AC-7: `LLMDocQueryAdapter.query()` の stub 実装（`Generated content for:`）が本番経路から完全に排除される
