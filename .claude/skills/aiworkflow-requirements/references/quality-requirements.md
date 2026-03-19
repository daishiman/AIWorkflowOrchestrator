# 非機能要件

## 概要
この親仕様書は rulebook family の入口であり、実践パターン・詳細例・履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [quality-requirements-core.md](quality-requirements-core.md) | core specification | 概要 / パフォーマンス要件 |
| [quality-requirements-details.md](quality-requirements-details.md) | detail specification | テスト戦略（TDD実践ガイド） / セキュリティ / 可用性 |
| [quality-requirements-advanced.md](quality-requirements-advanced.md) | advanced specification | 保守性 / アクセシビリティ / テストカバレッジ目標 |
| [quality-requirements-history.md](quality-requirements-history.md) | history bundle | 関連ドキュメント / 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`

## IPC契約ドリフト自動検出（UT-TASK06-007）

| 項目 | 内容 |
| --- | --- |
| スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts` |
| 実行コマンド | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` |
| 検出ルール | R-01（チャンネル孤児/warning）, R-02（引数形式不一致/error, P44対応）, R-03（ハードコード文字列/warning, P27対応）, R-04（未登録チャンネル/error） |
| Phase 9チェック | `--report-only` で exit 0 完了を確認 |
| 実装日 | 2026-03-18 |
| GitHub Issue | #1309 |
