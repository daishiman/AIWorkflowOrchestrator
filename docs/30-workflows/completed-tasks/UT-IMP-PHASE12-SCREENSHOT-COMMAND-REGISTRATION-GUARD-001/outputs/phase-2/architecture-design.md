# Phase 2 設計書

## コマンド登録設計

- key: `screenshot:skill-import-idempotency-guard`
- value: `node scripts/capture-skill-import-idempotency-guard-screenshots.mjs`
- 命名規約: `screenshot:<feature>`

## 設計意図

| 観点   | 設計                                     |
| ------ | ---------------------------------------- |
| 発見性 | `pnpm run` 一覧に公開して検索可能化      |
| 再現性 | 文書と実行コマンドを1つに統一            |
| 監査性 | run/execute/coverage/verify を固定順序化 |

## SubAgent設計（関心分離）

| SubAgent | 並列可否 | 担当                   |
| -------- | -------- | ---------------------- |
| A        | 並列可   | package scripts 更新   |
| B        | 並列可   | Phase 11/12 文書同期   |
| C        | 直列     | 実行検証と監査ログ収集 |

## 完了判定

- [x] scripts 命名規約を定義
- [x] SubAgentごとの責務分離を定義
