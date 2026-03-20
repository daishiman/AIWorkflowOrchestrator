# [#1393] [UT-TASK06-007-EXT-006] 新関数テスト拡充（型アノテーション分析・マルチオブジェクトチャンネル解決）

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-TASK06-007-EXT-006                                        |
| 分類         | テスト品質改善                                               |
| 対象機能     | check-ipc-contracts.ts                                       |
| 優先度       | 高                                                           |
| 見積もり規模 | 小規模                                                       |
| 発見元       | UT-TASK06-007 Phase 7 カバレッジ改善セッション（2026-03-19） |

## 概要

linter（Hook）が `check-ipc-contracts.ts` に自動追加した新関数の境界値・エッジケーステストが不足:

1. `normalizeTypeAnnotation()` - 型アノテーション正規化
2. `isPrimitiveTypeAnnotation()` - プリミティブ型判定
3. `mergeChannelMaps()` - 複数ファイルからのチャンネル定数マージ
4. `CHANNEL_OBJECT_PATTERN` - 複数オブジェクト対応
5. `PRELOAD_CALL_START_PATTERN` - multi-line preload 呼び出し検出

## ゴール

- エッジケーステスト追加（union型、intersection型、空文字列等）
- 重複キー優先順位テスト、nested object テスト追加
- 全テスト PASS

## 仕様書

`docs/30-workflows/unassigned-task/ut-task06-007-ext-006-new-function-test-expansion.md`
