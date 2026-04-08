# 手動テスト結果 - TASK-FIX-WORKTREE-CONFLICT-001

## テスト種別: NON_VISUAL（インフラ改善・設定ファイル変更）

UI/UX 実装なし。スクリプト動作・設定ファイルの確認で検証。

## 手動検証結果

### FIX-001-A: EVALS.json merge=ours

```bash
$ grep "EVALS" .gitattributes
.claude/skills/*/EVALS.json       merge=ours
.agents/skills/*/EVALS.json       merge=ours
```

✅ 確認済み

### FIX-001-B: CI paths-ignore + merge_group:

```bash
$ grep -A 2 "claude\|agents" .github/workflows/ci.yml
      - ".claude/**"
      - ".agents/**"
  merge_group:
```

✅ 確認済み

### FIX-001-C: post-merge フック動作

```bash
$ bash .claude/hooks/post-merge-index-regenerate.sh
[post-merge] indexes/*.json を再生成中...
[post-merge] 再生成完了
```

✅ 実行成功

```bash
$ bash .claude/scripts/install-git-hooks.sh  # 2回実行
[hooks] post-merge フックのインストール完了: .husky/_/post-merge
[hooks] post-merge フックのインストール完了: .husky/_/post-merge
```

✅ 冪等動作確認

### FIX-001-D: SKILL-changelog.md 分割

```bash
$ ls .claude/skills/*/SKILL-changelog.md | wc -l
8
$ ls .agents/skills/*/SKILL-changelog.md | wc -l
8
$ grep -rn "^## 変更履歴" .claude/skills/*/SKILL.md
（結果なし）
```

✅ 16ファイル作成・変更履歴削除確認

### FIX-001-E: gwt() 関数

```bash
$ grep "_gwt_ensure_post_merge_hook" ~/.config/zsh/conf.d/73-git-worktree.zsh
_gwt_ensure_post_merge_hook() {
  _gwt_ensure_post_merge_hook "$worktree_path"
```

✅ 関数定義・呼び出し確認

### FIX-001-F: tmux bind B

```bash
$ grep "CLAUDE_SKIP_HEAVY_HOOKS" ~/.tmux.conf
  ... CLAUDE_SKIP_HEAVY_HOOKS=1 GWT_LAYOUT_REPO_ROOT=...
```

✅ 確認済み
