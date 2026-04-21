# Manual Test Checklist

タスク ID: `TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001`
分類: `NON_VISUAL`

## TC 一覧

| TC    | 検証対象                                                                             | primary evidence                               |
| ----- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| TC-01 | `ChunkingLateChunkingAdapter.applyLateChunking()` が単一チャンク・mean で正常動作    | `automated-test-evidence.md` SEP-01            |
| TC-02 | `ChunkingLateChunkingAdapter.applyLateChunking()` が複数チャンク・cls で正常動作     | `automated-test-evidence.md` SEP-02            |
| TC-03 | `ChunkingLateChunkingAdapter.determineChunkBoundaries()` が複数チャンク境界を返す    | `automated-test-evidence.md` SEP-03            |
| TC-04 | `ChunkingLateChunkingAdapter.poolTokenEmbeddings()` が mean / cls / attention を処理 | `automated-test-evidence.md` SEP-05〜SEP-07    |
| TC-05 | `ChunkingService.chunk()` の外部入出力契約が変化しない                               | `static-analysis-evidence.md` public API 表    |
| TC-06 | `ChunkingService` の既存 3 引数呼び出しが後方互換を維持                              | `static-analysis-evidence.md` constructor 差分 |
| TC-07 | `ChunkingService` が `ChunkingLateChunkingAdapter` へ委譲する                        | `automated-test-evidence.md` SEP-08 / SEP-09   |

## 補足

- UI/UX 変更はないためスクリーンショットは不要。
- 補助証跡として `non-visual-classification.md`、`automated-test-evidence.md`、`static-analysis-evidence.md` を併用する。
