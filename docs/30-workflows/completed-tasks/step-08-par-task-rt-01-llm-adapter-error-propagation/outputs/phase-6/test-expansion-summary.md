# Phase 6: Test Expansion Summary

## 追加 Edge Cases

### ステータス再遷移

- `setLLMAdapterFailed()` → `setLLMAdapter()`: リカバリーで `"ready"` + failureReason `null`
- `setLLMAdapterFailed()` → `setLLMAdapterFailed()`: 最後の reason が保持される
- `setLLMAdapter()` → `setLLMAdapterFailed()`: `"failed"` に遷移

### タイミング競合

- initializing 中に plan() → 即座に `LLM_ADAPTER_INITIALIZING` エラーレスポンス
- `setLLMAdapter()` 直後に plan() → 最新ステータス `"ready"` を参照し正常レスポンス
- 長時間初期化シミュレーション → plan() が `"initializing"` エラーを返し続ける

### エラーメッセージパターン

- failureReason 空文字 `""` → デフォルトメッセージにフォールバック
- failureReason に `"ANTHROPIC_API_KEY"` → "APIキーを設定してください"
- failureReason に `"api_key"` → "APIキーを設定してください"
- failureReason に `"network"` → そのまま返す
- failureReason が非常に長い → truncation なしで返す

### IPC レイヤー

- `getAdapter()` が即座に throw → `setLLMAdapterFailed()` が同期的に呼ばれる
- error が Error インスタンスでない場合 → `String(error)` で処理
- error が undefined → graceful に処理され crash しない
