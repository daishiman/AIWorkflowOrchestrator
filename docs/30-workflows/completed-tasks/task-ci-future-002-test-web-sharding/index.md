# task-ci-future-002-test-web-sharding - タスク実行仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| 機能名     | task-ci-future-002-test-web-sharding |
| 作成日     | 2026-04-15                           |
| タスク種別 | docs-only                            |
| ステータス | 完了                                 |
| 総Phase数  | 13                                   |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス                  |
| ----- | -------------------- | ------------------------------------------------------------ | --------------------------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了                        |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了                        |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了                        |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了                        |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了                        |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了                        |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了                        |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了                        |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了                        |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了                        |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了                        |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了                        |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | ユーザー指示待ち（blocked） |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-ci-future-002-test-web-sharding --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受入基準一覧, P50チェック結果, 並列数ベースライン, 並列数計算シート, test-web ベースライン実行時間, vitest.config.ts 確認結果                   |
| 2     | アーキテクチャ設計, CI 設定差分イメージ, test-desktop 削減影響評価, シャード数設計書, シャード設計の補助記録, テスト戦略, vitest.config.ts 修正要否判断結果 |
| 3     | 設計レビュー結果, Phase 4 進行可否の判定, MINOR 追跡テーブル, 並列数最終検証テーブル                                                                        |
| 4     | ローカルシャード実行確認, RED 確認結果, テストマトリクス                                                                                                    |
| 5     | GREEN 確認結果, 実装結果サマリー, test-web ジョブへの matrix shard 設定追加, web の vitest 設定確認（変更なし）                                             |
| 6     | エッジケース検証結果                                                                                                                                        |
| 7     | カバレッジレポート, Phase 8 進行可否の判定, 並列数カバレッジ可視化, トレーサビリティカバレッジ, 未カバーシナリオ一覧                                        |
| 8     | リファクタリング結果                                                                                                                                        |
| 9     | 品質チェック結果                                                                                                                                            |
| 10    | AC 検証記録, 最終レビュー結果                                                                                                                               |
| 11    | CI 実行時間計測, 発見課題一覧, 手動テストレポート, 手動テスト結果, capture メタデータ, 非視覚レビュー                                                       |
| 12    | ドキュメント更新履歴, 実装ガイド, Phase 12 準拠チェック結果, スキルフィードバックレポート, システム仕様書更新サマリー, 未タスク検出レポート                 |
| 13    | 変更要約, CI 結果, ローカル確認結果, PR 情報, PR 準備状況レポート                                                                                           |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-04-15T10:30:07.193Z_
