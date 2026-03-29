# Phase 11 Discovered Issues

## 検出結果

- 新規 UI バグ: 0件
- 既知の検証ブロッカー: 1件

## DI-11-01: vitest 実行環境の esbuild アーキ不整合

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| 重要度   | 中                                               |
| 影響     | RT-06 の vitest 自動実行が blocked               |
| 現象     | `@esbuild/darwin-arm64` と `darwin-x64` の不一致 |
| 対応方針 | 未タスク化して実行環境整備を分離対応             |

参照: `outputs/phase-12/unassigned-task-detection.md`
