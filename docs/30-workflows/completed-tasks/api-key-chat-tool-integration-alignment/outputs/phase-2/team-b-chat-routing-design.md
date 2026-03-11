# Team-B 設計（チャット実行経路）

## 対象

- `apps/desktop/src/main/ipc/aiHandlers.ts`
- `apps/desktop/src/main/handlers/llm.ts`
- `apps/desktop/src/renderer/store/slices/{llmSlice.ts,chatSlice.ts}`

## 設計

- `AIChatRequest.providerId/modelId` を優先使用
- 片方のみ指定はエラー
- 指定なし時のみ `getSelectedLLMConfig()` を使用
- `llm:set-selected-config` で Renderer 選択を Main 側へ同期
