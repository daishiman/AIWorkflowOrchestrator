# DevOps技術スタック（パッケージ管理・CI/CD）

## 概要
この親仕様書は support / platform の入口であり、target 別詳細と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [technology-devops-core.md](technology-devops-core.md) | core specification | 概要 / パッケージ構成詳細 / 依存関係管理戦略 / 無料枠の活用ガイド |
| [technology-devops-details.md](technology-devops-details.md) | detail specification | マイグレーション計画 / CI最適化パターン（TASK-OPT-CI-TEST-PARALLEL-001 2026-02-02追加） |
| [technology-devops-history.md](technology-devops-history.md) | history bundle | 関連ドキュメント / 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`

## IPC契約ドリフト品質ゲート（UT-TASK06-007）

- `apps/desktop/scripts/check-ipc-contracts.ts` は desktop IPC 契約の静的監査コマンドとして再利用できる。
- 推奨順序は `typecheck` → 対象テスト → `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict`。
- これは CI に組み込み可能な品質ゲートの定義であり、ドキュメント上は「実行可能コマンド」を正本として保持する。ブランチごとの GHA wiring 有無は `deployment-gha.md` 側で扱う。
