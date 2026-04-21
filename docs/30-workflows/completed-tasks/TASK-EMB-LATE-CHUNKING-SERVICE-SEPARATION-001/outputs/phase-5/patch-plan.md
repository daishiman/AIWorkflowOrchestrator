# Patch Plan - Phase 5

## 適用順序

1. ✅ `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts` 作成
2. ✅ `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts` 作成
3. ✅ `packages/shared/src/services/embedding/late-chunking/index.ts` 更新（`ChunkingLateChunkingAdapter` export 追加）
4. ✅ `packages/shared/src/services/chunking/chunking-service.ts` 更新:
   - import 追加
   - プロパティ `lateChunkingAdapter` 追加
   - コンストラクタ第 4 引数追加
   - `applyLateChunking` 委譲形へ書き換え
   - `getTokenEmbeddings` / `determineChunkBoundaries` / `poolTokenEmbeddings` 削除

## テスト結果

### SEP 単体テスト

```
✓ SEP-01 single chunk mean pooling → applied=true, dim>0
✓ SEP-02 multiple chunks cls pooling (maxSequenceLength=3) → applied=true, dim>0 for all
✓ SEP-03 determineChunkBoundaries multi → [10, 20]
✓ SEP-04 determineChunkBoundaries empty → []
✓ SEP-05 poolTokenEmbeddings mean
✓ SEP-06 poolTokenEmbeddings cls
✓ SEP-07 poolTokenEmbeddings attention

Test Files  1 passed (1)
Tests  7 passed (7)
```

### 既存回帰テスト

```
✓ ChunkingService Integration Tests (22 tests)
  - Contextual Embeddings 正常系 7 件
  - Contextual Embeddings 異常系 2 件
  - Late Chunking 正常系 3 件
  - Late Chunking 異常系 1 件
  - ChunkingService その他 6 件
  - chunkStream 2 件

Test Files  1 passed (1)
Tests  22 passed (22)
```

### typecheck

```
> tsc --noEmit
(exit 0, no errors)
```

## 発見事項

- `pnpm install` を実行して esbuild バージョン不整合を解消
- SEP-02 のテスト条件を簡略化実装の実挙動に合わせて修正（`maxSequenceLength < tokens.length` の条件設定で複数セグメント生成を保証）

## ロジック改変の有無

- 本体ロジック: ゼロ改変（コピー移動のみ）
- テスト内容の修正: SEP-02 の入力条件のみ（挙動仕様は変更なし）

## Phase 6 引き継ぎ事項

- SEP-08/SEP-09（委譲確認テスト）を `chunking-service.integration.test.ts` に追加する
- 委譲確認は `vi.fn()` でモックした `ChunkingLateChunkingAdapter` を DI 注入して検証
