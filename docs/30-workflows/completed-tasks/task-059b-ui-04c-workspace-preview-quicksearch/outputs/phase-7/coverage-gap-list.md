# Phase 7 カバレッジギャップ一覧

## 閾値未達の blocking gap

- なし

## 相対的に薄い箇所

| ファイル                  | 実測                             | メモ                                                              |
| ------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `WorkspaceView/index.tsx` | Functions 76.92 / Branches 68.08 | 04A 由来の layout 分岐まで含むため、task-scope で未通過の枝が残る |
| `PreviewPanel.tsx`        | Lines 75.72 / Branches 80.00     | 全 preview 種別を通したが、読み込み中など一部の枝が未通過         |
| `preview-utils.ts`        | Branches 59.45                   | 対応拡張子の全組み合わせを task-scope では網羅しきっていない      |
| `useFileWatcher.ts`       | Branches 68.42                   | `watchStart` 失敗枝と no-API 枝が軽めの coverage                  |
| `PanelResizeHandle.tsx`   | Branches 50.00                   | 04A 基盤の非 task-core 分岐が残る                                 |

## 判断

- いずれも 04C の受け入れ条件を阻害しない
- task-scope 総量では gate を上回っているため、Phase 8 以降へ進行した
