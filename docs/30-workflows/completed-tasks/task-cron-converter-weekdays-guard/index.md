# TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001: cronConverter weekdays=[] ガード処理追加

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| タスク名   | cronConverter weekdays=[] ガード処理追加 |
| タイプ     | bugfix                                   |
| 優先度     | medium                                   |
| スケール   | small                                    |
| 関連Issue  | #2081                                    |
| 作成日     | 2026-04-12                               |
| ステータス | phase12_completed                        |

## 概要

`cronConverter.ts` の `visualConfigToCron()` 関数に `frequency: "weekly"` かつ `weekdays: []`（空配列）を渡した場合、weekday フィールドが空文字になり `"0 9 * * "` という5フィールド構文違反の不正な cron 式が生成される問題を修正する。

現在は UI レベル（VisualCronPicker）でのバリデーションにより実害はないが、API を直接呼び出すケースではガードが存在しない（単一責任原則違反）。`visualConfigToCron()` が `weekdays: []` を受け取った際に `InvalidConfigError` を投げるよう修正し、API 契約を堅牢にする。

## ガイドライン

- Phase 1 の AC-01〜06 を canonical set とし、後続 Phase は原則として AC 番号参照に留める。
- 変更対象は `cronConverter.ts` とそのテストに閉じ、`VisualCronPicker` は既存 UI バリデーションの参照として扱う。
- Phase 12 の system spec 更新は、`InvalidConfigError` を共有/public contract に昇格させる場合のみ実施する。

## 対象ファイル

| ファイル                                                          | 責務              | 修正種別               |
| ----------------------------------------------------------------- | ----------------- | ---------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                | cron 変換ロジック | ガード追加・JSDoc 更新 |
| `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` | テスト            | テストケース追加       |

## 検証テストケース

| 入力                        | 期待結果                  |
| --------------------------- | ------------------------- |
| `weekdays: []`              | `InvalidConfigError`      |
| `weekdays: [0]`             | `"0 9 * * 0"`             |
| `weekdays: [1,2,3,4,5]`     | `"0 9 * * 1,2,3,4,5"`     |
| `weekdays: [0,1,2,3,4,5,6]` | `"0 9 * * 0,1,2,3,4,5,6"` |

## Phaseリスト

| Phase | 名前             | 概要                                    |
| ----- | ---------------- | --------------------------------------- |
| 1     | 要件定義         | 影響範囲分析・受け入れ基準定義          |
| 2     | 設計             | InvalidConfigError 設計・ガード実装方針 |
| 3     | 設計レビュー     | 設計の矛盾・漏れチェック                |
| 4     | テスト作成       | TDD Red - 失敗テスト定義                |
| 5     | 実装             | ガード追加・InvalidConfigError 実装     |
| 6     | テスト拡充       | エッジケース・回帰テスト                |
| 7     | カバレッジ確認   | カバレッジ計測・未到達分析              |
| 8     | リファクタリング | コード品質改善                          |
| 9     | 品質保証         | 静的解析・リスク評価                    |
| 10    | 最終レビュー     | Phase 1-9 の統合レビュー                |
| 11    | 手動テスト       | 実機動作確認（NON_VISUAL）              |
| 12    | ドキュメント更新 | 実装ガイド・仕様更新・フィードバック    |
| 13    | PR 作成          | blocked（PR未作成・ユーザー承認待ち）   |
