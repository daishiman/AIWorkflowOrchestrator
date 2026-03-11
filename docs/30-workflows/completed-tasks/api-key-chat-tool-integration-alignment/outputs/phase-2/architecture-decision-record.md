# ADR: APIキー連動とチャット経路整合

## ADR-01 単一正本化

- 採用: `secureStorage` から `createApiKeyStorage` を参照
- 棄却: `api-keys` と `llm-api-keys` の双方向同期
- 理由: 双方向同期は競合と欠損リスクが高い

## ADR-02 選択値伝搬

- 採用: `AIChatRequest` に `providerId/modelId` を追加
- 理由: `ai.chat` と `llm.*` の契約を一致させる

## ADR-03 AuthKey可視化

- 採用: `auth-key:exists` が `source` を返す
- 理由: UI表示と実際の認証経路の乖離を防ぐ
