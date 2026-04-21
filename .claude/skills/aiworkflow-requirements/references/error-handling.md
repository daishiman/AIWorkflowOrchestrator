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

## EVALS validator エラー分類（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）

`validate-evals.js` のエラーは以下の 3 層で扱う。

| 層 | 検出内容 | 代表例 | 実行結果 |
| --- | --- | --- | --- |
| L1 | JSON パース失敗 | 破損JSON / 空ファイル | exit code 1 |
| L2 | top-level 必須キー欠落 | `skillName/skill_name` 欠落 / `currentLevel/current_level` 欠落 / `metrics` 欠落 | exit code 1 |
| L3 | dual root 不一致 | `.claude` と `.agents` の EVALS.json 差分 / ミラー欠損 | exit code 1 |

運用上は `phase-10/final-review-result.md` と `phase-11/manual-test-result.md` に実測値を残し、close-out 時は `system-spec-update-summary.md` へ replay 結果を転記する。
