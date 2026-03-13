# エラーハンドリング仕様

## 概要
この親仕様書は rulebook family の入口であり、実践パターン・詳細例・履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [error-handling-core.md](error-handling-core.md) | core specification | エラー分類 / 認可エラー（UnauthorizedError） / 外部ストレージ取得フォールバックパターン（TASK-FIX-4-2） / リトライ戦略 |
| [error-handling-details.md](error-handling-details.md) | detail specification | TokenRefreshScheduler リトライ戦略（TASK-AUTH-SESSION-REFRESH-001） / SkillExecutor 実行エラーコード（TASK-8A） / OAuthエラーコードマッピング（TASK-FIX-GOOGLE-LOGIN-001） / AuthMode IPC エラー envelope（TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001） |
| [error-handling-history.md](error-handling-history.md) | history bundle | 関連ドキュメント / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
