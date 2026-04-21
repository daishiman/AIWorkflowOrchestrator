# Regression Expansion Plan - Phase 6

## 目的

Phase 5 で抽出した `ChunkingLateChunkingAdapter` への委譲が、`ChunkingService` 側で意図どおり動作することを機械的に証明する。
本ファサードは「いつ委譲するか（enabled 制御）」と「どの引数で委譲するか（text / chunks / options）」の 2 軸のみ責務を持つため、両方を独立に検証する。

## 追加テスト（SEP-08 / SEP-09）

| ID     | テスト名                                                                   | 検証対象                                                                       |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| SEP-08 | `lateChunking.enabled=true` のとき Adapter.applyLateChunking に委譲する    | 呼び出し回数=1、引数 `(text, Chunk[], LateChunkingOptions)` が正しく透過される |
| SEP-09 | `lateChunking.enabled=false` のとき Adapter.applyLateChunking は呼ばれない | 呼び出し回数=0（`enabled:false` / `advanced` 未指定の両ケース）                |

配置ファイル: `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
`describe("Late Chunking - 委譲確認", ...)` ブロック新設。

## 実装方針

- `ChunkingLateChunkingAdapter` の実体を DI で注入（コンストラクタ第 4 引数）
- `vi.spyOn(mockAdapter, "applyLateChunking").mockImplementation(async (_text, chunks) => chunks)` で副作用を抑止
- spy の `mock.calls[0]` を分解して、`text` 一致・`Chunk[]` 非空・`LateChunkingOptions` 完全一致を検証
- SEP-09 は 2 パターン（`enabled:false` と `advanced` 未指定）を直列実行し、両方で `not.toHaveBeenCalled()` を保証

## 仕様書乖離メモ

当初の仕様書は `vi.fn()` によるモック注入を想定していたが、TypeScript の型安全性を担保するため `new ChunkingLateChunkingAdapter(...)` のインスタンス生成 + `vi.spyOn()` 方式に変更（挙動は等価）。

## テスト結果

### 統合テスト（ChunkingService Integration Tests）

```
✓ src/services/chunking/__tests__/chunking-service.integration.test.ts (24 tests) 77ms

Test Files  1 passed (1)
Tests       24 passed (24)
```

内訳:

- Contextual Embeddings 正常系: 7 件（既存）
- Contextual Embeddings 異常系: 2 件（既存）
- Late Chunking 正常系: 3 件（既存）
- Late Chunking 異常系: 1 件（既存）
- **Late Chunking 委譲確認: 2 件（SEP-08 / SEP-09、新規）**
- ChunkingService その他: 6 件（既存）
- chunkStream: 2 件（既存）
- - Late Chunking 委譲確認の 1 describe 分（2 tests） → 合計 24

### Adapter 単体テスト（SEP-01〜SEP-07）

```
✓ src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts (7 tests) 21ms
```

回帰 0 件。

## カバレッジ軸の獲得

| 観測軸                           | Before (Phase 4)           | After (Phase 6)                            |
| -------------------------------- | -------------------------- | ------------------------------------------ |
| Adapter のプーリング戦略別挙動   | 間接（統合テスト経由のみ） | 直接（SEP-01〜SEP-07）                     |
| Boundary 計算                    | 観測不能（private）        | 直接（SEP-03 / SEP-04）                    |
| `ChunkingService → Adapter` 委譲 | 未検証                     | 直接（SEP-08 呼び出し・SEP-09 非呼び出し） |

## Phase 7 引き継ぎ

- カバレッジ計測は `chunking-late-chunking-adapter.ts` と `chunking-service.ts:applyLateChunking` の両ファイルで行う
- 委譲メソッドは 2 行（early return + 委譲呼び出し）に縮退したため 100% 到達見込み
