# Coverage Report - Phase 7

## 計測対象

- `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts`（Phase 5 で新規作成）
- `packages/shared/src/services/chunking/chunking-service.ts`（Phase 5 でリファクタ）

## 計測コマンド

```bash
pnpm exec vitest run \
  src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts \
  src/services/chunking/__tests__/chunking-service.integration.test.ts \
  --coverage \
  --coverage.include='src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts' \
  --coverage.include='src/services/chunking/chunking-service.ts' \
  --coverage.reporter=text
```

## 計測結果（v8 coverage）

| File                              | % Stmts | % Branch | % Funcs | % Lines | Uncovered        |
| --------------------------------- | ------- | -------- | ------- | ------- | ---------------- |
| All files                         | 93.27   | 87.77    | 100     | 93.27   | -                |
| chunking-service.ts               | 92.33   | 86.84    | 100     | 92.33   | 286-393, 421-424 |
| chunking-late-chunking-adapter.ts | 96.96   | 92.85    | 100     | 96.96   | 119-120          |

Test Files: 2 passed (2) / Tests: 31 passed (31)

## 未カバー行分析

### `chunking-late-chunking-adapter.ts:119-120`

```typescript
if (!this.embeddingClient) {
  throw new ChunkingError("Embedding client is required");
}
```

- 位置: private `getTokenEmbeddings` 内の防御コード
- 理由: 現行ルートでは `applyLateChunking` が最初に `embeddingClient` 存在チェックを行うため到達不能
- 対応方針: **そのまま保持**（防御的実装として合理的、将来 public 化される可能性も踏まえる）
- 判断根拠: Phase 5 は「ロジック改変ゼロ」が制約。除去はスコープ外の改変となるため Phase 8 の Refactor 判断でも保持を継続。

### `chunking-service.ts:286-393, 421-424`

- 位置: `applyContextualEmbeddings` / `generateContext` / `truncateDocument` / `checkWarnings`
- 本タスクのスコープ外（Late Chunking 委譲責務に限定）
- 既存の Contextual Embeddings 正常系テスト 7 件でカバーされており、本タスクによる劣化なし

## 責務別カバレッジ（本タスク範囲）

| 責務                           | ファイル                                  | 行数レンジ       | カバー状態               |
| ------------------------------ | ----------------------------------------- | ---------------- | ------------------------ |
| `applyLateChunking` 委譲       | chunking-service.ts:367-376               | 100%             | SEP-08 / SEP-09          |
| Adapter `applyLateChunking`    | chunking-late-chunking-adapter.ts         | 100%             | SEP-01 / SEP-02          |
| `determineChunkBoundaries`     | chunking-late-chunking-adapter.ts         | 100%             | SEP-03 / SEP-04          |
| `poolTokenEmbeddings`          | chunking-late-chunking-adapter.ts         | 100%             | SEP-05 / SEP-06 / SEP-07 |
| `getTokenEmbeddings` 防御 else | chunking-late-chunking-adapter.ts:119-120 | 未到達（意図的） | -                        |

## 観測性の向上

- リファクタ前: `ChunkingService` の private 3 メソッド（`getTokenEmbeddings` / `determineChunkBoundaries` / `poolTokenEmbeddings`）は単体テスト不可能
- リファクタ後: 3 メソッドすべて public として Adapter 経由で直接観測可能に

## Phase 8 引き継ぎ

- 未カバー行 119-120 は防御コードとしてそのまま保持（lint / TypeScript strict にも適合）
- Refactor 候補: Adapter への JSDoc 整形、`applyLateChunking` 委譲メソッドの JSDoc 明示化
