# 変更ファイル一覧

## 新規作成

```
packages/shared/src/services/embedding/late-chunking/
├── late-chunking-types.ts
├── late-chunking-interfaces.ts
├── token-boundary-calculator.ts
├── hidden-state-pooler.ts
├── window-splitter.ts
├── late-chunking-service.ts
└── index.ts

packages/shared/src/services/embedding/__tests__/late-chunking/
├── token-boundary-calculator.test.ts
├── hidden-state-pooler.test.ts
├── window-splitter.test.ts
├── late-chunking-service.test.ts
└── late-chunking-edge.test.ts
```

## 修正

```
packages/shared/src/services/embedding/embedding-service.ts
  - import追加: ILateChunkingService, ChunkBoundary, LateChunkingConfig, ChunkEmbeddingResult
  - EmbeddingServiceConfig に lateChunkingService?: ILateChunkingService 追加
  - EmbeddingService に lateChunkingService フィールド追加
  - generateChunkEmbeddings() メソッド追加
```
