# Phase 1 インターフェースインベントリ

## IEmbeddingClient 実装クラス一覧

| クラス名                    | ファイルパス                                                                   | getTokenEmbeddings 実装            |
| --------------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| MockEmbeddingClient         | packages/shared/src/services/chunking/**tests**/mocks/mock-embedding-client.ts | なし（オプショナルのため変更不要） |
| ConfigurableEmbeddingClient | packages/shared/src/services/chunking/**tests**/mocks/mock-embedding-client.ts | なし（オプショナルのため変更不要） |

## 既存モック箇所と影響範囲

| テストファイル                       | モック箇所                 | 影響                                                   |
| ------------------------------------ | -------------------------- | ------------------------------------------------------ |
| chunking-service.integration.test.ts | MockEmbeddingClient を使用 | `getTokenEmbeddings?` がオプショナルのため型エラーなし |

## P50 判定結果

- current branch では token-level provider 契約追加は未完了
- `implementation_mode` は `new` とする
- 既存テストは引き続き PASS する（オプショナル追加による破壊的変更なし）
