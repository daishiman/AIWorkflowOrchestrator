# Phase 11: 発見課題

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 状態   | not_run                               |

## current facts

Phase 11 の実 UI 評価はまだ実行していない。
そのため本ファイルは「検出済み不具合一覧」ではなく、「未実行であること」と「実行後に更新すべき観点」を保持する current placeholder として扱う。

| 区分                | 状態   | 備考                             |
| ------------------- | ------ | -------------------------------- |
| Semantic 実測課題   | 未検出 | Playwright `_electron` 実行前    |
| Visual 実測課題     | 未検出 | representative screenshot 未取得 |
| AI UX 実測課題      | 未検出 | Claude API 評価未実行            |
| HIGH 由来の未タスク | 0 件   | 実行後にのみ生成対象             |

## 実行後に更新する項目

- `manual-test-result.md` の FAIL / WARN 行
- `ai-ux-evaluation.md` の usability / accessibility issue
- `unassigned-task/ui-ux-issue-*.md` の生成有無
