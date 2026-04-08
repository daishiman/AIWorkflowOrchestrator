# テスト拡充結果 - TASK-FIX-WORKTREE-CONFLICT-001

## エッジケース検証結果

| TC      | シナリオ                               | 結果                | 備考                                                                                         |
| ------- | -------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| TC-A-03 | EVALS.json 空ファイルのマージ          | ✅ PASS             | merge=ours は空ファイルでも現ブランチを保持                                                  |
| TC-A-04 | 3ブランチ同時マージ                    | ✅ PASS（設計確認） | 最後にマージした値が保持される merge=ours の動作                                             |
| TC-C-04 | node が PATH にない環境                | ✅ PASS（修正後）   | `command -v node` チェック追加で正常終了                                                     |
| TC-C-05 | .git が worktree ポインタの場合        | ✅ PASS             | `git rev-parse --show-toplevel` は worktree でも正しい toplevel を返す                       |
| TC-D-04 | SKILL.md に変更履歴が複数セクション    | ✅ PASS             | 最初の `## 変更履歴` から EOF まで全て changelog に移動（task-specification-creator で確認） |
| TC-D-05 | agents/skills が空の場合               | ✅ PASS             | bash for ループはパターンがマッチしない場合はスキップ                                        |
| TC-E-01 | gwt() 新規 worktree 作成後 hook 再適用 | ✅ PASS             | `_gwt_ensure_post_merge_hook` が gwt() 内で呼び出されている                                  |
| TC-E-02 | 既存 hook がある場合の冪等性           | ✅ PASS             | 2回実行してもエラーなし・hook 実行可能状態を維持                                             |
| TC-F-01 | bind B pane 1 CLAUDE_SKIP_HEAVY_HOOKS  | ✅ PASS             | `~/.tmux.conf` に設定済み確認                                                                |

## TC-C-04 修正内容

**問題**: `set -euo pipefail` + `node: command not found` → 終了コード 127 で失敗

**修正**: `command -v node > /dev/null 2>&1 &&` を条件に追加

```diff
- if [ -f "$SCRIPT" ]; then
+ if command -v node > /dev/null 2>&1 && [ -f "$SCRIPT" ]; then
```

**修正後確認**: 終了コード 0 ✅

## 全 TC サマリー

| フェーズ                | TC件数 | PASS | FAIL                  |
| ----------------------- | ------ | ---- | --------------------- |
| 基本シナリオ（Phase 5） | 6      | 6    | 0                     |
| エッジケース（Phase 6） | 9      | 9    | 0（1件は修正後 PASS） |
| 合計                    | 15     | 15   | 0                     |
