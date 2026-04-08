# 実装結果 - TASK-FIX-WORKTREE-CONFLICT-001

## FIX-001-A: EVALS.json merge 戦略修正

- **変更ファイル**: `.gitattributes`
- **変更内容**: `merge=union` → `merge=ours`（2行）
- **確認**: `grep "EVALS" .gitattributes` → `merge=ours` ✅

## FIX-001-B: CI 設定更新

- **変更ファイル**: `.github/workflows/ci.yml`
- **変更内容**:
  - `push.paths-ignore` に `.claude/**`, `.agents/**` 追加
  - `pull_request.paths-ignore` に `.claude/**`, `.agents/**` 追加
  - `merge_group:` トリガー追加
- **確認**: `grep -A 2 "claude\|agents" .github/workflows/ci.yml` → 2箇所に追加済み ✅

## FIX-001-C: post-merge フック実装

- **新規作成**:
  - `.claude/hooks/post-merge-index-regenerate.sh` (685 bytes, +x)
  - `.claude/scripts/install-git-hooks.sh` (895 bytes)
- **修正**: `.claude/hooks/session-init.sh` にフック自動インストールチェック追加
- **インストール先**: `.husky/_/post-merge`（プロジェクトの husky 設定に準拠）
- **確認**: `bash .claude/hooks/post-merge-index-regenerate.sh` → indexes 再生成成功 ✅

## FIX-001-D: SKILL.md 構造分割

- **対象**: `.claude/skills/` 8スキル + `.agents/skills/` 8スキル = 16ファイル
- **作成**: 各スキルに `SKILL-changelog.md`（16ファイル）
- **削除**: 各 `SKILL.md` から `## 変更履歴` セクション以降を除去
- **`.gitattributes` 追加**: `SKILL-changelog.md merge=union`
- **確認**: `grep "^## 変更履歴" .claude/skills/*/SKILL.md` → 残存なし ✅

## FIX-001-E: gwt() post-merge フック自動インストール

- **変更ファイル**: `~/.config/zsh/conf.d/73-git-worktree.zsh`
- **追加内容**:
  - `_gwt_ensure_post_merge_hook()` 関数定義（15行）
  - `gwt()` の worktree 作成成功直後に呼び出し
- **確認**: `grep "_gwt_ensure_post_merge_hook" ~/.config/zsh/conf.d/73-git-worktree.zsh` → 定義・呼び出し両方存在 ✅

## FIX-001-F: B レイアウト重いフックスキップ

- **変更ファイル**: `~/.tmux.conf`
- **変更内容**: bind B の pane 1 の `gwt-layout-init` コマンドの前に `CLAUDE_SKIP_HEAVY_HOOKS=1` を付与
- **確認**: `grep "CLAUDE_SKIP_HEAVY_HOOKS" ~/.tmux.conf` → 設定済み ✅
