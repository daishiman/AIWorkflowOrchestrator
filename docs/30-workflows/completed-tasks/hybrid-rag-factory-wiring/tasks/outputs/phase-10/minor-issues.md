# Phase 10: 旧 MINOR 指摘の解消記録

## MINOR-01: エラーメッセージプレフィックス追加

### 状態

解消済み（2026-03-21）。

### 対象ファイル

- `packages/shared/src/services/search/hybrid-rag-factory.ts`

### 解消内容

```typescript
throw new Error(
  "HybridRAGFactory.createFull(): cohereApiKey is required when rerankerType is 'cohere'",
);
throw new Error(
  "HybridRAGFactory.createFull(): voyageApiKey is required when rerankerType is 'voyage'",
);
throw new Error(
  "HybridRAGFactory.createFull(): rerankerLlmClient is required when rerankerType is 'llm'",
);
throw new Error(
  "HybridRAGFactory.createFull(): cragLlmClient is required when enableCRAG is true",
);
```

### 影響

- 振る舞い影響: なし
- テスト影響: 期待値を prefix 付きへ更新済み
- 優先度: 低
