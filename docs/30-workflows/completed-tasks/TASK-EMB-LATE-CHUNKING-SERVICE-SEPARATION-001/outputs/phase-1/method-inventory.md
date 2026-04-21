# Method Inventory - Phase 1

## 走査対象

- `packages/shared/src/services/chunking/chunking-service.ts`（現在 502 行）

## 仕様書前提と実態の乖離サマリ

| 項目                     | 仕様書前提                       | 実態（2026-04-20）                                                                                         |
| ------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ファイル行数             | 638                              | 502                                                                                                        |
| Late Chunking メソッド数 | 9                                | 4                                                                                                          |
| `IEmbeddingClient`       | `getTokenEmbeddings?()` 定義済み | 未定義（`embed`/`embedBatch` のみ。先行タスク TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 未完了前提で進行） |

## 実在する 4 メソッド（抽出対象）

| メソッド名                 | 現在の行範囲 | 現在の可視性 | 移動先可視性 | 依存先                         | 備考                                                                                        |
| -------------------------- | ------------ | ------------ | ------------ | ------------------------------ | ------------------------------------------------------------------------------------------- |
| `applyLateChunking`        | L358-L397    | private      | public       | `tokenizer`, `embeddingClient` | Late Chunking のエントリーポイント。外部呼び出し対象として public 昇格                      |
| `getTokenEmbeddings`       | L402-L421    | private      | private      | `tokenizer`, `embeddingClient` | `maxSequenceLength` でチャンク分割し `embeddingClient.embed()` フォールバックで埋め込み取得 |
| `determineChunkBoundaries` | L426-L428    | private      | public       | なし                           | `chunks[i].position.end` を返す純粋関数。境界計算の境界値テストに public 昇格               |
| `poolTokenEmbeddings`      | L433-L450    | private      | public       | なし                           | `mean/cls/attention` の簡略化プーリング。単体テストで戦略別検証のため public 昇格           |

## 仕様書が前提とする 5 メソッド（存在せず・抽出対象外）

| メソッド名                 | 状態 | 理由                                                                |
| -------------------------- | ---- | ------------------------------------------------------------------- |
| `charPositionToTokenIndex` | 不在 | 真の token-level Late Chunking 用。先行タスク完了時に追加される想定 |
| `hasTokenOverlap`          | 不在 | 同上                                                                |
| `calculateOverlapTokens`   | 不在 | 同上                                                                |
| `findNearestSegment`       | 不在 | 同上                                                                |
| `averageEmbeddings`        | 不在 | 同上                                                                |

## 移動しない依存

- `LateChunkingOptions` 型 (`chunking/types.ts` L135-L146) — canonical 位置として `chunking/types.ts` に残す
- `ChunkBoundary` / `PoolingStrategy` 型 (`chunking/types.ts` L34, L39) — 同上
- `ITokenizer` / `IEmbeddingClient` インターフェース (`chunking/interfaces.ts`) — 同上
- `ChunkingError` (`chunking/errors.ts`) — 同上

## 参照方向（確定）

```
embedding/late-chunking/LateChunkingService.ts
          │
          │ imports (type only)
          ▼
chunking/types.ts         (LateChunkingOptions, ChunkBoundary, PoolingStrategy)
chunking/interfaces.ts    (ITokenizer, IEmbeddingClient)
chunking/errors.ts        (ChunkingError)
```

- 一方向 `embedding → chunking`
- 逆方向参照なし（`chunking → embedding` は発生しない。`ChunkingService` は `LateChunkingService` を DI で受け取るのみで型 import は `embedding/late-chunking/index.ts` から行う）

## 既存統合テスト

- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
  - Late Chunking 関連ケース: `input.advanced.lateChunking.enabled = true` でのメタデータ付与確認
  - Phase 5 実装後も全件 PASS を維持する

## 実装モード

- `implementation_mode = "new"`（新規サービス作成 + 既存4メソッド移動）
