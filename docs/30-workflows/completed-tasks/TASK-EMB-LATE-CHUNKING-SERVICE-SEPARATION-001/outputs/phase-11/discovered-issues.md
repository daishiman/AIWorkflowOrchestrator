# Discovered Issues

タスク ID: `TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001`

## 判定

MAJOR 以上の新規課題はなし。

## MINOR

| ID       | 内容                                                         | 対応                                                                                                          |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| MINOR-01 | Phase 11 canonical artifact 名と実在 evidence 名がずれていた | `manual-test-checklist.md` / `evidence-collection.md` / `manual-test-result.md` を補完し、Phase 12 参照も修正 |
| MINOR-02 | 仕様書本文に旧想定 `LateChunkingService` 名が残っていた      | Phase 11/12 仕様書と implementation guide を `ChunkingLateChunkingAdapter` 基準へ更新                         |

## 結論

Phase 12 へ進行可能。
