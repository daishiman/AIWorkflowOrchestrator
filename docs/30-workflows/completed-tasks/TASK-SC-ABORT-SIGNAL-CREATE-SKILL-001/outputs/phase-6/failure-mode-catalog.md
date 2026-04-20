# Phase 6 Failure Mode Catalog

| 分類             | 症状                                                    | 対応                                                 |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| abort guard 欠落 | aborted signal を渡しても private workflow が進行する   | 入口 `throwIfAborted(signal)` を追加                 |
| 回帰未検知       | 将来 `_signal` が未使用に戻っても検知できない           | private minimal test を追加                          |
| 環境要因         | Vitest 実行時に esbuild host/binary mismatch が発生する | `pnpm install` と targeted rerun を Phase 9 で再試行 |
