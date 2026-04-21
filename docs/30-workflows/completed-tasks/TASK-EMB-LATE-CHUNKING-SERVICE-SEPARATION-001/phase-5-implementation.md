# Phase 5: 実装

## メタ情報

| 項目     | 値                                                                                           |
| -------- | -------------------------------------------------------------------------------------------- |
| Phase    | 5                                                                                            |
| タスクID | `TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001`                                              |
| 目的     | `ChunkingService` の Late Chunking 責務を `ChunkingLateChunkingAdapter` へ分離し、委譲化する |

## current fact

当初仕様は `LateChunkingService` へ 9 メソッドを移す前提だったが、実コードには既に token-level `LateChunkingService` が存在していた。そのため本 Phase では、名前衝突を避けつつ `ChunkingService` 専用責務を切り出すために `ChunkingLateChunkingAdapter` を導入した。

## 実装対象

| 種別 | パス                                                                                                    | 内容                                        |
| ---- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 新規 | `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts`                | `ChunkingService` 向け Late Chunking 委譲先 |
| 新規 | `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts` | Adapter 単体テスト                          |
| 変更 | `packages/shared/src/services/chunking/chunking-service.ts`                                             | Adapter 注入 + 委譲                         |
| 変更 | `packages/shared/src/services/embedding/late-chunking/index.ts`                                         | export 追加                                 |
| 変更 | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`                  | 委譲確認テスト追加                          |

## 実装方針

1. `ChunkingService` の公開契約は維持する
2. コンストラクタ第 4 引数 `lateChunkingAdapter?: ChunkingLateChunkingAdapter` を追加する
3. `applyLateChunking()` は Adapter 呼び出しのみを担当する
4. Adapter 側で境界と pooling strategy が結果へ反映されるようにする
5. 既存 token-level `LateChunkingService` とは責務を分離して共存させる

## 完了条件

- `ChunkingService` から Late Chunking 固有ロジックが分離されている
- `ChunkingLateChunkingAdapter` の単体テストが存在する
- `chunking-service.integration.test.ts` で委譲を確認できる
- 外部の `chunk()` 利用契約は非破壊である
