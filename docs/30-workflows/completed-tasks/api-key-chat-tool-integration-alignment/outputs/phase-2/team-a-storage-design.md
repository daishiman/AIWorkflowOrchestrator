# Team-A 設計（保存経路）

## 対象

- `apps/desktop/src/main/services/secureStorage.ts`
- `apps/desktop/src/main/ipc/apiKeyHandlers.ts`

## 設計

- `secureStorage` はローカル`api-keys`を唯一参照
- `apiKey:save/delete` 成功時に `LLMAdapterFactory.clearInstance(provider)` を実行
- 旧 `llm-api-keys` 依存を撤去
