# Streaming Implementation

## 実装内容

1. `createEmptyChatStreamOverlayState()` を shared helper として追加した。
2. `chatSlice.endStreaming()` / `cancelStreaming()` / `setStreamingError()` が stream ids と content をクリアするように揃えた。
3. `buildChatPlatformRequest()` が mode ごとの default temperature と `stream: true` を共通化した。

## 効果

- revive 対象に一時 overlay が混ざらない。
- Workspace 側 request 生成ロジックのばらつきが減った。
- 手動検証で cancel / revive の観点を 1 つの shared helper で説明できる。
