# GREEN 確認記録 - TASK-FIX-WORKTREE-CONFLICT-001

## AC 別確認結果

| AC   | 基準                               | 結果                                        | 確認コマンド                                             |
| ---- | ---------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| AC-2 | EVALS.json JSON 構造有効           | ✅ PASS（12ファイル全て jq PASS）           | `jq . .claude/skills/*/EVALS.json`                       |
| AC-3 | .claude/\*\* CI スキップ設定       | ✅ PASS（paths-ignore 追加済み）            | `grep ".claude" .github/workflows/ci.yml`                |
| AC-4 | indexes/\*.json マージ後再生成     | ✅ PASS（post-merge フック動作確認済み）    | `bash .claude/hooks/post-merge-index-regenerate.sh`      |
| AC-6 | 全スキル SKILL-changelog.md 存在   | ✅ PASS（16/16 ファイル存在）               | `ls .claude/skills/*/SKILL-changelog.md`                 |
| AC-6 | SKILL.md に変更履歴残存なし        | ✅ PASS（grep 0件）                         | `grep "^## 変更履歴" .claude/skills/*/SKILL.md`          |
| AC-7 | post-merge フック実行可能          | ✅ PASS（.husky/\_/post-merge, -rwxr-xr-x） | `test -x "$(git rev-parse --git-path hooks/post-merge)"` |
| AC-8 | CLAUDE_SKIP_HEAVY_HOOKS=1 設定済み | ✅ PASS（tmux.conf 確認済み）               | `grep "CLAUDE_SKIP_HEAVY_HOOKS" ~/.tmux.conf`            |

## TC 実行結果

| TC      | シナリオ                          | 結果                                        |
| ------- | --------------------------------- | ------------------------------------------- |
| TC-A-02 | EVALS.json jq 検証                | ✅ PASS（12ファイル全て有効 JSON）          |
| TC-C-02 | install-git-hooks.sh 冪等性       | ✅ PASS（2回実行でエラーなし）              |
| TC-C-03 | post-merge フック単体ドライラン   | ✅ PASS（indexes 再生成成功、終了コード 0） |
| TC-D-02 | SKILL-changelog.md 全スキル存在   | ✅ PASS（8+8=16 ファイル）                  |
| TC-D-03 | SKILL.md 変更履歴残存なし         | ✅ PASS                                     |
| TC-F-01 | tmux CLAUDE_SKIP_HEAVY_HOOKS 設定 | ✅ PASS                                     |

## 注記

- `git rev-parse --git-path hooks/post-merge` は husky 設定により `.husky/_/post-merge` を返す
- このプロジェクトは husky を使用しており、`.husky/_/` が git フックの実体ディレクトリ
- TC-B-01/02（CI スキップ）は push が必要なため手動確認が必要（Phase 11 で実施）
- TC-A-01（並列マージ）は別ブランチが必要なため Phase 11 で実施
