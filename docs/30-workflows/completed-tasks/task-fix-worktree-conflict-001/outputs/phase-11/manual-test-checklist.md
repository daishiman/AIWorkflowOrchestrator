# Phase 11: manual-test-checklist

## チェック項目

| 項目 | 状態 | 確認内容                                                                                     |
| ---- | ---- | -------------------------------------------------------------------------------------------- |
| 1    | PASS | `git merge` 後に `post-merge` フックが自動再生成を実行する                                   |
| 2    | PASS | `git diff --check` で破損した差分が残っていない                                              |
| 3    | PASS | `.claude/skills` と `.agents/skills` の `diff -qr` が 0 件                                   |
| 4    | PASS | `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "post-merge"` が動作する |

## 補足

- 本 task は NON_VISUAL のため、スクリーンショットではなくコマンド実行結果で代替した
- 画面証跡は要求せず、ローカルの統合確認だけを行う
