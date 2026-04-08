# サブタスク詳細設計 - TASK-FIX-WORKTREE-CONFLICT-001

## FIX-001-C: post-merge-index-regenerate.sh

```bash
#!/usr/bin/env bash
# post-merge フック: indexes/*.json の自動再生成
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT="$REPO_ROOT/.claude/skills/aiworkflow-requirements/scripts/generate-index.js"

if [ -f "$SCRIPT" ]; then
  echo "[post-merge] indexes/*.json を再生成中..."
  node "$SCRIPT" --quiet
  echo "[post-merge] 再生成完了"
fi
```

## FIX-001-C: install-git-hooks.sh

```bash
#!/usr/bin/env bash
# git フックインストーラー（冪等）
SOURCE_DIR="$(git rev-parse --show-toplevel)/.claude/hooks"
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"

cp "$SOURCE_DIR/post-merge-index-regenerate.sh" "$HOOK_PATH"
chmod +x "$HOOK_PATH"
echo "[hooks] post-merge フックのインストール完了"
```

## FIX-001-C: session-init.sh への追加

```bash
# post-merge フックの自動インストールチェック
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge 2>/dev/null)"
INSTALL_SCRIPT="$(git rev-parse --show-toplevel 2>/dev/null)/.claude/scripts/install-git-hooks.sh"

if [ ! -f "$HOOK_PATH" ] && [ -f "$INSTALL_SCRIPT" ]; then
  echo "[session-init] post-merge フックを自動インストールします..."
  bash "$INSTALL_SCRIPT"
fi
```

## FIX-001-D: SKILL-changelog.md テンプレート

```markdown
# {スキル名} - 変更履歴

## v{バージョン} - {日付}

### 変更内容

- {変更点 1}
- {変更点 2}
```

## FIX-001-E: `_gwt_ensure_post_merge_hook()` 関数

```zsh
# post-merge フックを worktree に自動インストールする（冪等）
_gwt_ensure_post_merge_hook() {
  local repo_root="$1"
  local hook_file="$(git -C "$repo_root" rev-parse --git-path hooks/post-merge)"
  local hook_script="${repo_root}/.claude/hooks/post-merge-index-regenerate.sh"
  [ -f "$hook_script" ] || return 0
  [ ! -f "$hook_file" ] || return 0
  cp "$hook_script" "$hook_file"
  chmod +x "$hook_file"
  echo "🔧 post-mergeフックをインストールしました（indexes再生成用）"
}
```

**呼び出し位置**: `git worktree add` 成功後（`echo "✅ worktreeを作成しました！"` 直後）

## FIX-001-F: tmux bind B 変更概念

**変更前**:

```
send-keys "gwt-layout-init 'タスク名'" Enter
```

**変更後**:

```
send-keys "CLAUDE_SKIP_HEAVY_HOOKS=1 gwt-layout-init 'タスク名'" Enter
```
