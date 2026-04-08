# Phase 5: 実装

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 5                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

Phase 4 で定義した検証シナリオを GREEN にするため、6 サブタスク（FIX-001-A〜F）を順番に実装する。
A〜D は独立して並列化でき、E / F は FIX-001-C 完了後に直列で実施する。

---

## 実行タスク

- **タスク1**: FIX-001-A 実装（`.gitattributes` の EVALS.json merge=ours 変更）
- **タスク2**: FIX-001-B 実装（`.github/workflows/ci.yml` の paths-ignore / merge_group: 追加）
- **タスク3**: FIX-001-C 実装（post-merge フックスクリプト新規作成・session-init.sh 修正）
- **タスク4**: FIX-001-D 実装（全スキルの SKILL.md 分割・SKILL-changelog.md 作成・.gitattributes 追加）
- **タスク5**: FIX-001-E 実装（`~/.config/zsh/conf.d/73-git-worktree.zsh` の `_gwt_ensure_post_merge_hook()` 追加）
- **タスク6**: FIX-001-F 実装（`~/.tmux.conf` の bind B に `CLAUDE_SKIP_HEAVY_HOOKS=1` 付与）
- **タスク7**: 実装後の動作確認（TC-A〜F の主要シナリオ実行）

---

## 参照資料

| 資料名                   | パス                                        | 説明              |
| ------------------------ | ------------------------------------------- | ----------------- |
| Phase 2 設計決定記録     | `outputs/phase-2/design-decisions.md`       | 実装方針          |
| Phase 4 テストマトリクス | `outputs/phase-4/test-matrix.md`            | GREEN にすべき TC |
| Phase 4 検証シナリオ     | `outputs/phase-4/verification-scenarios.md` | 実行手順          |
| 現在の .gitattributes    | `.gitattributes`                            | 変更対象          |
| CI ワークフロー          | `.github/workflows/ci.yml`                  | 変更対象          |
| session-init.sh          | `.claude/hooks/session-init.sh`             | 修正対象          |

---

## 実行手順

### ステップ0: 実装前ベースライン確認【必須】

```bash
# .gitattributes の現在の EVALS.json 設定確認
grep "EVALS" .gitattributes

# CI ワークフローの paths-ignore 確認
grep -n "paths-ignore\|merge_group" .github/workflows/ci.yml || echo "未設定"

# post-merge フックの存在確認
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
ls "$HOOK_PATH" 2>/dev/null || echo "未存在"

# 全スキルの SKILL-changelog.md 存在確認
ls .claude/skills/*/SKILL-changelog.md .agents/skills/*/SKILL-changelog.md 2>/dev/null || echo "未存在"
```

---

### ステップ1: FIX-001-A 実装

**変更ファイル**: `.gitattributes`

`.gitattributes` の EVALS.json 行を `merge=union` から `merge=ours` に変更する。

```bash
# 変更前の確認
grep "EVALS" .gitattributes

# 変更後の期待値
# .claude/skills/*/EVALS.json       merge=ours
# .agents/skills/*/EVALS.json       merge=ours
```

**確認**:

```bash
grep "EVALS" .gitattributes
# → merge=ours が設定されていること
```

---

### ステップ2: FIX-001-B 実装

**変更ファイル**: `.github/workflows/ci.yml`

CI ワークフローの `on:` セクションに `paths-ignore` と `merge_group:` を追加する。

**実装方針**:

1. 既存の `push:` / `pull_request:` トリガーに `paths-ignore` を追加
2. `merge_group:` トリガーを新規追加

**確認**:

```bash
# 変更後の確認
grep -A 15 "^on:" .github/workflows/ci.yml
```

---

### ステップ3: FIX-001-C 実装

**新規作成ファイル**:

- `.claude/hooks/post-merge-index-regenerate.sh`
- `.claude/scripts/install-git-hooks.sh`

**修正ファイル**:

- `.claude/hooks/session-init.sh`

**実装方針**:

1. `post-merge-index-regenerate.sh` を作成（`set -euo pipefail`、スクリプト存在チェック付き）
2. `install-git-hooks.sh` を作成（冪等インストール）
3. `session-init.sh` の末尾にフック自動インストールチェックを追加

**確認**:

```bash
# スクリプトが作成されていること
ls -la .claude/hooks/post-merge-index-regenerate.sh
ls -la .claude/scripts/install-git-hooks.sh

# 実行権限の確認
bash .claude/scripts/install-git-hooks.sh
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
test -x "$HOOK_PATH" && echo "PASS: hook executable" || echo "FAIL: hook not executable"
```

---

### ステップ4: FIX-001-D 実装

**対象スキル確認**:

```bash
# 全スキル一覧
ls .claude/skills/
ls .agents/skills/ 2>/dev/null

# 変更履歴セクションが存在するスキルを確認
grep -rln "変更履歴\|## Changelog\|## History" \
  .claude/skills/*/SKILL.md .agents/skills/*/SKILL.md 2>/dev/null
```

**実装方針**:

各スキルに対して以下を実行:

1. `SKILL.md` から変更履歴セクションを切り出す
2. `SKILL-changelog.md` を新規作成し、切り出した内容を移動
3. `SKILL.md` の変更履歴セクションを削除

変更履歴セクションが存在しないスキルは、空の `SKILL-changelog.md` を作成する。

```bash
# テンプレート: SKILL-changelog.md の初期内容（変更履歴なしスキル用）
# # {スキル名} - 変更履歴
#
# （変更履歴なし）
```

**`.gitattributes` への追加**:

```
.claude/skills/*/SKILL-changelog.md  merge=union
.agents/skills/*/SKILL-changelog.md  merge=union
```

**確認**:

```bash
# 全スキルに SKILL-changelog.md が存在すること
ls .claude/skills/*/SKILL-changelog.md

# SKILL.md に変更履歴が残っていないこと
grep -rn "変更履歴\|## Changelog\|## History" .claude/skills/*/SKILL.md && echo "残存あり" || echo "PASS"

# .gitattributes に SKILL-changelog.md 設定が追加されていること
grep "SKILL-changelog" .gitattributes
```

---

### ステップ5: FIX-001-E 実装

**変更ファイル**: `~/.config/zsh/conf.d/73-git-worktree.zsh`

**実装内容**:

1. `_gwt_ensure_post_merge_hook()` 関数を追加（`gwt()` 関数定義の直前に配置）
2. `git worktree add` 成功直後（worktree ディレクトリが確定した時点）に `_gwt_ensure_post_merge_hook "$worktree_path"` を呼び出す

**追加する関数（実装）**:

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

**確認**:

```bash
# 関数が定義されていること
grep -n "_gwt_ensure_post_merge_hook" ~/.config/zsh/conf.d/73-git-worktree.zsh

# 新規 worktree 作成後にフックがインストールされ実行可能であること（AC-7）
# gwt test-hook-install でテスト後:
ls .worktrees/*/  # 作成された worktree のパスを確認
WORKTREE_PATH="$(ls -d .worktrees/*/ | head -1)"
HOOK_PATH="$(git -C "$WORKTREE_PATH" rev-parse --git-path hooks/post-merge)"
test -x "$HOOK_PATH" && echo "PASS: AC-7" || echo "FAIL: AC-7"
```

---

### ステップ6: FIX-001-F 実装

**変更ファイル**: `~/.tmux.conf`

**実装内容**:

bind B の pane 1 の `send-keys` コマンド先頭に `CLAUDE_SKIP_HEAVY_HOOKS=1` を追加する。

**変更前の確認**:

```bash
grep -n "gwt-layout-init\|CLAUDE_SKIP" ~/.tmux.conf
```

**変更後の期待値**:

```tmux
send-keys -t "$session:0.1" "CLAUDE_SKIP_HEAVY_HOOKS=1 gwt-layout-init ..." Enter
```

**確認**:

```bash
# 変更が反映されていること
grep "CLAUDE_SKIP_HEAVY_HOOKS" ~/.tmux.conf && echo "PASS: AC-8 設定確認" || echo "FAIL"
```

---

### ステップ7: 動作確認

```bash
# AC-2: EVALS.json の JSON 構造確認 + 状態値消失検知
for f in .claude/skills/*/EVALS.json .agents/skills/*/EVALS.json; do
  jq . "$f" > /dev/null && echo "PASS: $f" || echo "FAIL: $f"
done

# AC-4: post-merge フックのドライラン（復元確認）
bash .claude/hooks/post-merge-index-regenerate.sh

# AC-6: SKILL-changelog.md の存在確認
ls .claude/skills/*/SKILL-changelog.md | wc -l

# AC-7: gwt() で新規 worktree 作成後 post-merge フックが実行可能であること
# (手動確認: gwt test-e2e-check でテスト worktree を作成)

# AC-8: ~/.tmux.conf に CLAUDE_SKIP_HEAVY_HOOKS=1 が設定されていること
grep "CLAUDE_SKIP_HEAVY_HOOKS" ~/.tmux.conf
```

---

## 成果物

| 成果物         | 配置先                                     | 形式     |
| -------------- | ------------------------------------------ | -------- |
| 実装結果記録   | `outputs/phase-5/implementation-result.md` | Markdown |
| GREEN 確認記録 | `outputs/phase-5/green-confirmation.md`    | Markdown |

---

## 完了条件

- [ ] FIX-001-A: `.gitattributes` の EVALS.json が merge=ours になっていること
- [ ] FIX-001-B: `.github/workflows/ci.yml` に paths-ignore と merge_group: が追加されていること
- [ ] FIX-001-C: `post-merge-index-regenerate.sh` / `install-git-hooks.sh` が作成され、`session-init.sh` が修正されていること
- [ ] FIX-001-D: 全スキルの `SKILL-changelog.md` が存在し、`SKILL.md` から変更履歴が削除されていること
- [ ] FIX-001-E: `_gwt_ensure_post_merge_hook()` が `73-git-worktree.zsh` に追加され、`gwt()` から呼び出されていること
- [ ] FIX-001-F: `~/.tmux.conf` の bind B pane 1 に `CLAUDE_SKIP_HEAVY_HOOKS=1` が設定されていること
- [ ] 動作確認（ステップ7）が全て PASS であること

---

## 次 Phase

**Phase 6: テスト拡充** — 6 サブタスク（FIX-001-A〜F）の動作確認シナリオ追加・エッジケースの検証。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
