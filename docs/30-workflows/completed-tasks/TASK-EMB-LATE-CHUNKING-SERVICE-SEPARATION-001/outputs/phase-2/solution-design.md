# Solution Design

## 設計結論

`ChunkingService` に埋め込まれていた Late Chunking 処理は、既存 token-level `LateChunkingService` とは別責務であるため、`ChunkingLateChunkingAdapter` として分離する。

## ディレクトリ構成

```text
packages/shared/src/services/embedding/late-chunking/
├── late-chunking-service.ts
├── chunking-late-chunking-adapter.ts
├── token-boundary-calculator.ts
├── hidden-state-pooler.ts
├── window-splitter.ts
└── __tests__/chunking-late-chunking-adapter.test.ts
```

## `ChunkingService` 組み込み方針

```ts
new ChunkingService(
  tokenizer,
  embeddingClient?,
  llmClient?,
  lateChunkingAdapter?,
)
```

- `lateChunkingAdapter` 未指定かつ `embeddingClient` あり: 自動生成
- `lateChunkingAdapter` 指定あり: 注入優先
- `embeddingClient` も Adapter もなし: Late Chunking 利用時に `ChunkingError`

## 責務境界

| クラス                        | 責務                                                            |
| ----------------------------- | --------------------------------------------------------------- |
| `ChunkingService`             | チャンキング戦略統合、Contextual Embeddings、Late Chunking 委譲 |
| `ChunkingLateChunkingAdapter` | `ChunkingService` 用の境界計算・segment pooling・metadata 付与  |
| `LateChunkingService`         | token-level `IEncoder` ベースの埋め込み生成                     |

## 設計上の注意

- barrel export は維持するが、`ChunkingService` からの import は具体ファイルで固定
- 命名差異は Phase 12 で仕様・成果物へ同期する
- 後続の pipeline integration で 2 系統の責務を再整理する
