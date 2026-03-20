# [#1394] [UT-TASK06-007-EXT-007] CLI スクリプトテスト process.argv[1] パス解決パターン標準化

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-TASK06-007-EXT-007                                           |
| 分類         | テスト基盤改善                                                  |
| 対象機能     | apps/desktop/scripts/ 配下の CLI スクリプト全般                 |
| 優先度       | 中                                                              |
| 見積もり規模 | 小規模                                                          |
| 発見元       | UT-TASK06-007 Phase 7 main() テスト実装セッション（2026-03-19） |

## 概要

CLI スクリプトテストの `process.argv[1]` パス解決問題を標準化ユーティリティとして解決。

### 問題点

1. vitest から main() を呼ぶと process.argv[1] が二重パスになる
2. vi.mock("fs") の describe 内配置制約
3. CLI エントリポイントのカバレッジ改善困難

## ゴール

1. `scripts/__tests__/test-helpers.ts` にヘルパー関数を作成
2. `check-ipc-contracts.test.ts` のリファクタリング
3. CLI テストパターンの文書化

## 仕様書

`docs/30-workflows/unassigned-task/ut-task06-007-ext-007-cli-test-argv-pattern-standardization.md`
