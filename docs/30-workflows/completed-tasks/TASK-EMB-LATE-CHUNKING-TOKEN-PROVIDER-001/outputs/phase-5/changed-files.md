# Phase 5 変更ファイル一覧

## 変更ファイル（6件）

1. `packages/shared/src/services/chunking/types.ts`
   - `TokenEmbeddingsResult` 型を追加

2. `packages/shared/src/services/chunking/interfaces.ts`
   - `IEmbeddingClient.getTokenEmbeddings?()` を追加

3. `packages/shared/src/services/chunking/index.ts`
   - `TokenEmbeddingsResult` を export へ追加

4. `packages/shared/src/services/chunking/chunking-service.ts`
   - `chunk()` 本流の Late Chunking が token provider を優先利用するよう変更
   - fallback を `chunks.length` 基準の返却へ修正
   - 文字境界ベースの token span 集約と平均化を追加

5. `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
   - TP-02 の戻り件数検証を追加
   - `chunk()` 本流での provider 優先 / fallback 維持テストを追加

6. `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`
   - token-level provider の決定論的モックを追加

## 新規テストファイル

1. `packages/shared/src/services/embedding/providers/__tests__/mock-token-embedding-provider.test.ts`
   - TP-MOCK-01 を追加
