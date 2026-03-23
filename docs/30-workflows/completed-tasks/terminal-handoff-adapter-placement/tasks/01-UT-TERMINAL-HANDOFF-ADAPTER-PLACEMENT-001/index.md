# UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| タスクID   | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001        |
| タスク名   | toHandoffGuidance() Adapter 配置先確定と統一実装 |
| カテゴリ   | アーキテクチャ / アダプター設計                  |
| 優先度     | high（後続実装タスクのブロッカー）               |
| 規模       | small-medium                                     |
| ステータス | spec_created                                     |
| 作成日     | 2026-03-22                                       |
| 依存関係   | なし                                             |

## 目的

`toHandoffGuidance()` adapter 関数の配置先（`apps/desktop/src/main/adapters/handoff/`）を確定し、Consumer 全 5 件の変換ロジックを統一パスで動作させる。

## 受入基準

- [ ] `toHandoffGuidance()` の配置先が決定し文書化されている
- [ ] Consumer 全 5 件の変換が統一パスで動作する
- [ ] unit test が作成されている（変換ロジックのカバレッジ 90% 以上）
- [ ] import サイクルがないことが確認されている
- [ ] `HandoffBlock.tsx` のローカル型定義が `@repo/shared` の正本 import に置換されている

## Phase 一覧

| Phase | 名称             | 仕様書                      |
| ----- | ---------------- | --------------------------- |
| 1     | 要件定義         | `phase-1-requirements.md`   |
| 2     | 設計             | `phase-2-design.md`         |
| 3     | 設計レビュー     | `phase-3-design-review.md`  |
| 4     | テスト作成       | `phase-4-test.md`           |
| 5     | 実装             | `phase-5-implementation.md` |
| 6     | テスト拡充       | `phase-6-test-expansion.md` |
| 7     | カバレッジ確認   | `phase-7-coverage.md`       |
| 8     | リファクタリング | `phase-8-refactoring.md`    |
| 9     | 品質検証         | `phase-9-quality.md`        |
| 10    | 最終レビュー     | `phase-10-final-review.md`  |
| 11    | 手動テスト       | `phase-11-manual-test.md`   |
| 12    | ドキュメント     | `phase-12-documentation.md` |
| 13    | 完了             | `phase-13-pr-creation.md`   |
