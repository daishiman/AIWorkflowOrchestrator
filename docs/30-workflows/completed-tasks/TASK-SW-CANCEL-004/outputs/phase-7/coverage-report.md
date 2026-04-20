# Phase 7: カバレッジレポート

## タスクID: TASK-SW-CANCEL-004

## 対象

- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

## 対象テスト

| ファイル                          | 備考          |
| --------------------------------- | ------------- |
| `useCancelGeneration.test.ts`     | hook 単体     |
| `useCancelGeneration.e2e.test.ts` | hook 境界統合 |

## 静的カバレッジ監査

| 観点                                             | 状況             |
| ------------------------------------------------ | ---------------- |
| `startGeneration()` の signal 生成               | テストケースあり |
| `cancelGeneration()` の `abort()` 実行           | テストケースあり |
| `startGeneration()` 未実行時の cancel            | テストケースあり |
| `setStage("cancelled")`                          | テストケースあり |
| `skillCreatorAPI?.cancelGeneration?.()` 呼び出し | テストケースあり |
| `skillCreatorAPI` 未定義ガード                   | テストケースあり |
| IPC 失敗 catch 経路                              | 未検証           |

## 再計測状況

2026-04-20 の現ワークツリーで再計測を試みたが、Vitest 起動時に `esbuild` の host/binary mismatch が発生し、数値付き coverage は再取得できなかった。

## 判定

- 数値ベースの line/branch 80% 達成は現環境では未再確認
- 静的監査では主要分岐の大半に対応テストが存在する
- `catch` 経路と環境修復後の再計測が残課題
