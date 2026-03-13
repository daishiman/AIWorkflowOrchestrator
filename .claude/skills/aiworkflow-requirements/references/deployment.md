# デプロイメント (Deployment)

## 概要
この親仕様書は分割後の entrypoint であり、詳細仕様と履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [deployment-core.md](deployment-core.md) | core specification | デプロイメント戦略概要 / Railway デプロイ戦略 / GitHub Actions CI/CD パイプライン / Electron アプリのリリース |
| [deployment-details.md](deployment-details.md) | detail specification | モニタリングとアラート / デプロイチェックリスト / GitHub Secrets の要件 |
| [deployment-history.md](deployment-history.md) | history bundle | 関連ドキュメント |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
