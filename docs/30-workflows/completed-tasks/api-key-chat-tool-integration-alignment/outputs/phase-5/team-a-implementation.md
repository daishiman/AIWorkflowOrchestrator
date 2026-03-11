# Team-A 実装詳細

## 変更

- `secureStorage.ts`: `createApiKeyStorage` を参照するFacade化
- `apiKeyHandlers.ts`: save/delete 成功時の `LLMAdapterFactory.clearInstance` 追加

## 効果

- Settings保存キーとLLM実行キーの分断を解消
