# Team-B 実装詳細

## 変更

- `AIChatRequest` に `providerId/modelId` 追加
- `aiHandlers.ts` で request優先、片指定エラー化
- `llm.ts` に `llm:set-selected-config` 追加
- `llmSlice.ts` から Main へ選択同期
- `chatSlice.ts` から `ai.chat` へ選択値送信

## 効果

- `ai.chat` と `llm.*` の実行条件が一致
