# スコープ定義書 - TASK-FIX-WORKTREE-CONFLICT-001

## 変更ファイル一覧

| ファイル                                           | サブタスク | 変更種別 | 変更内容                                                              |
| -------------------------------------------------- | ---------- | -------- | --------------------------------------------------------------------- |
| `.gitattributes`                                   | FIX-001-A  | 修正     | EVALS.json の `merge=union` → `merge=ours`                            |
| `.github/workflows/ci.yml`                         | FIX-001-B  | 修正     | paths-ignore に `.claude/**` / `.agents/**` 追加、`merge_group:` 追加 |
| `.claude/hooks/post-merge-index-regenerate.sh`     | FIX-001-C  | 新規     | indexes/\*.json 自動再生成シェルスクリプト                            |
| `.claude/scripts/install-git-hooks.sh`             | FIX-001-C  | 新規     | git フックインストーラー（冪等）                                      |
| `.claude/hooks/session-init.sh`                    | FIX-001-C  | 修正     | post-merge フック自動インストールチェック追加                         |
| `.gitattributes`                                   | FIX-001-D  | 修正     | `SKILL-changelog.md merge=union` 追加                                 |
| `.claude/skills/*/SKILL.md`（全8スキル）           | FIX-001-D  | 修正     | 変更履歴セクション削除                                                |
| `.claude/skills/*/SKILL-changelog.md`（全8スキル） | FIX-001-D  | 新規     | 変更履歴ファイル作成                                                  |
| `.agents/skills/*/SKILL.md`（全8スキル）           | FIX-001-D  | 修正     | 変更履歴セクション削除                                                |
| `.agents/skills/*/SKILL-changelog.md`（全8スキル） | FIX-001-D  | 新規     | 変更履歴ファイル作成                                                  |
| `~/.config/zsh/conf.d/73-git-worktree.zsh`         | FIX-001-E  | 修正     | `_gwt_ensure_post_merge_hook()` 追加・`gwt()` から呼び出し            |
| `~/.tmux.conf`                                     | FIX-001-F  | 修正     | bind B の pane 1 に `CLAUDE_SKIP_HEAVY_HOOKS=1` 追加                  |

## スコープ外（変更しない）

- アプリケーションコード（`apps/desktop/`, `apps/web/`）
- `packages/` 配下のコード
- `EVALS.json` の JSONL 移行（将来タスク）

## 実行順序

| 並列グループ      | サブタスク                                 | 依存関係         |
| ----------------- | ------------------------------------------ | ---------------- |
| グループ1（並列） | FIX-001-A, FIX-001-B, FIX-001-C, FIX-001-D | なし             |
| グループ2（直列） | FIX-001-E, FIX-001-F                       | FIX-001-C 完了後 |
