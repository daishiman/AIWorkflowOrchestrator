# Phase 2: 設計

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 2                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

4 core サブタスク（FIX-001-A〜D）と 2 dependent サブタスク（FIX-001-E〜F）の詳細設計を確定する。
変更内容・実装方針・影響範囲・採用/不採用の設計判断を記録し、Phase 3 レビューのインプットを作成する。

---

## 実行タスク

- **タスク1**: FIX-001-A の設計（EVALS.json merge=ours 変更）
- **タスク2**: FIX-001-B の設計（CI paths-ignore / merge_group: 追加）
- **タスク3**: FIX-001-C の設計（post-merge フックスクリプト設計）
- **タスク4**: FIX-001-D の設計（SKILL.md 分割設計）
- **タスク5**: 設計判断記録・採用/不採用理由の文書化
- **タスク6**: FIX-001-E の設計（gwt() post-merge フック自動インストール）
- **タスク7**: FIX-001-F の設計（B レイアウト重いフックスキップ）

---

## 参照資料

| 資料名                | パス                                                               | 説明                       |
| --------------------- | ------------------------------------------------------------------ | -------------------------- |
| Phase 1 受け入れ基準  | `outputs/phase-1/acceptance-criteria.md`                           | AC-1〜AC-8                 |
| Phase 1 スコープ定義  | `outputs/phase-1/scope-definition.md`                              | 変更ファイル一覧           |
| 現在の .gitattributes | `.gitattributes`                                                   | 既設定の確認               |
| CI ワークフロー       | `.github/workflows/ci.yml`                                         | FIX-001-B 設計対象         |
| session-init.sh       | `.claude/hooks/session-init.sh`                                    | FIX-001-C の追加箇所       |
| generate-index.js     | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` | FIX-001-C の再生成コマンド |
| 全スキル SKILL.md     | `.claude/skills/*/SKILL.md`                                        | FIX-001-D 分割対象         |

---

## 実行手順

### ステップ1: FIX-001-A 設計（EVALS.json merge 戦略修正）

**問題**:
EVALS.json は `current_level`、`total_usage_count`、`last_evaluation_date` の状態値を JSON 形式で保持する。
`merge=union` はテキストの行単位でのユニオンマージを行うため、JSON のキー行が重複し無効な JSON になるリスクがある。

**変更内容**（`.gitattributes`）:

```diff
- .claude/skills/*/EVALS.json       merge=union
- .agents/skills/*/EVALS.json       merge=union
+ .claude/skills/*/EVALS.json       merge=ours
+ .agents/skills/*/EVALS.json       merge=ours
```

**設計判断**:

| アプローチ                   | 結論       | 理由                                                                                        |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| merge=ours（現ブランチ優先） | **採用**   | JSON 破損を確実に防ぎ、最後にマージした側の値を保持する。採用後は検証と復元経路を必須化する |
| merge=union                  | 不採用     | JSON の行単位マージで重複キーが発生し無効 JSON になる                                       |
| merge=theirs                 | 不採用     | 現ブランチの評価データが消えるリスクがある                                                  |
| JSONL 移行                   | スコープ外 | 有効な長期解決策だが本タスクの範囲を超える                                                  |

**後方互換性**: `merge=ours` はコンフリクト発生時にのみ機能し、通常の fast-forward マージには影響しない。

---

### ステップ2: FIX-001-B 設計（CI 設定更新）

**問題**:
`.claude/**` や `.agents/**` のみを変更した PR でも CI が全件実行される。
30 分 × 直列マージ待ちが開発速度を著しく低下させている。

**変更内容**（`.github/workflows/ci.yml`）:

既存の `paths-ignore` セクションに以下を追加:

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - ".claude/**"
      - ".agents/**"
      - "*.md"
      - "docs/**"
  pull_request:
    branches: [main]
    paths-ignore:
      - ".claude/**"
      - ".agents/**"
      - "*.md"
      - "docs/**"
  merge_group: # GitHub Merge Queue 対応
```

**設計判断**:

| 項目                               | 決定                       | 理由                                                |
| ---------------------------------- | -------------------------- | --------------------------------------------------- |
| paths-ignore 対象                  | `.claude/**`、`.agents/**` | スキルファイルはアプリコードに影響しない            |
| merge_group: トリガー追加          | 採用                       | GitHub Merge Queue 使用時に CI が実行されるよう保証 |
| `*.md` / `docs/**` の paths-ignore | 採用                       | ドキュメントのみ変更でも CI スキップが望ましい      |

**注意**: `paths-ignore` はプッシュ/PR トリガーに対してのみ有効。`merge_group:` を追加することで Merge Queue 経由のマージでは CI が必ず実行される。

**CI 設定ファイルの現状確認**:

```bash
# 現在の ci.yml の on: セクションを確認
head -40 .github/workflows/ci.yml

# paths-ignore が既に設定されているか確認
grep -n "paths-ignore\|merge_group" .github/workflows/ci.yml
```

---

### ステップ3: FIX-001-C 設計（post-merge インデックス再生成フック）

**問題**:
`indexes/*.json` を `merge=ours` にすると、マージされた側（merge したブランチ）のインデックス更新内容が消える。
post-merge フックで自動再生成しないと、マージ後のインデックスが古くなる。

**設計: `.claude/hooks/post-merge-index-regenerate.sh`**

```bash
#!/usr/bin/env bash
# post-merge フック: indexes/*.json の自動再生成
# インストール先: git rev-parse --git-path hooks/post-merge

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT="$REPO_ROOT/.claude/skills/aiworkflow-requirements/scripts/generate-index.js"

# スクリプトが存在する場合のみ実行（オプショナル）
if [ -f "$SCRIPT" ]; then
  echo "[post-merge] indexes/*.json を再生成中..."
  node "$SCRIPT" --quiet
  echo "[post-merge] 再生成完了"
fi
```

**設計: `.claude/scripts/install-git-hooks.sh`**

```bash
#!/usr/bin/env bash
# git フックインストーラー（冪等）
# 使い方: bash .claude/scripts/install-git-hooks.sh

SOURCE_DIR="$(git rev-parse --show-toplevel)/.claude/hooks"
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
HOOK_DIR="$(dirname "$HOOK_PATH")"

install_hook() {
  local hook_name="$1"
  local source="$SOURCE_DIR/$hook_name"
  local dest="$HOOK_DIR/$hook_name"

  if [ ! -f "$source" ]; then return; fi

  cp "$source" "$dest"
  chmod +x "$dest"
  echo "[hooks] $hook_name をインストールしました"
}

install_hook "post-merge-index-regenerate"
# git rev-parse --git-path hooks/post-merge として配置
cp "$SOURCE_DIR/post-merge-index-regenerate.sh" "$HOOK_PATH"
chmod +x "$HOOK_PATH"
echo "[hooks] post-merge フックのインストール完了"
```

**設計: `session-init.sh` への追加**

`session-init.sh` の末尾付近に以下のチェックを追加:

```bash
# post-merge フックの自動インストールチェック
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge 2>/dev/null)"
INSTALL_SCRIPT="$(git rev-parse --show-toplevel 2>/dev/null)/.claude/scripts/install-git-hooks.sh"

if [ ! -f "$HOOK_PATH" ] && [ -f "$INSTALL_SCRIPT" ]; then
  echo "[session-init] post-merge フックを自動インストールします..."
  bash "$INSTALL_SCRIPT"
fi
```

**設計判断**:

| 項目                   | 決定                               | 理由                                   |
| ---------------------- | ---------------------------------- | -------------------------------------- |
| フック実行方式         | post-merge シェルスクリプト        | git 標準フック。追加ツール不要         |
| フックの冪等性         | インストーラーで `cp + chmod` のみ | 2 回実行しても副作用なし               |
| スクリプト不在時の動作 | `[ -f "$SCRIPT" ]` で存在チェック  | スクリプトがなくてもフックが壊れない   |
| 自動インストール       | session-init.sh でチェック         | Claude Code セッション開始時に自動適用 |

**保存・復元境界**:

| 種別        | 保存方針 | 復元/保全の責務                                |
| ----------- | -------- | ---------------------------------------------- |
| 追記型ログ  | union    | そのまま残す                                   |
| 再生成物    | ours     | post-merge フックで復元する                    |
| 状態値 JSON | ours     | JSON 有効性チェックと follow-up の移行先を保つ |
| 静的仕様    | 分離     | 変更履歴を changelog に退避する                |

---

### ステップ4: FIX-001-D 設計（SKILL.md 構造分割）

**問題**:
`SKILL.md` に静的仕様（name, description, triggers, anchors, allowed-tools）と変更履歴が混在しており、変更履歴部分が並列ブランチのコンフリクト候補になっている。

**分割方針**:

| ファイル             | 内容                           | merge 戦略             |
| -------------------- | ------------------------------ | ---------------------- |
| `SKILL.md`           | 静的コア仕様（変更頻度が低い） | デフォルト（設定なし） |
| `SKILL-changelog.md` | 追記型変更履歴のみ             | merge=union            |

**SKILL-changelog.md のフォーマット**:

```markdown
# {スキル名} - 変更履歴

## v{バージョン} - {日付}

### 変更内容

- {変更点 1}
- {変更点 2}
```

**`.gitattributes` への追加**:

```
.claude/skills/*/SKILL-changelog.md  merge=union
.agents/skills/*/SKILL-changelog.md  merge=union
```

**対象スキル確認コマンド**:

```bash
# 対象スキル数の確認
ls .claude/skills/ | wc -l
ls .agents/skills/ | wc -l

# SKILL.md に変更履歴セクションが存在するか確認
grep -rln "変更履歴\|## Changelog\|## History" .claude/skills/*/SKILL.md .agents/skills/*/SKILL.md
```

**設計判断**:

| 項目                      | 決定                   | 理由                         |
| ------------------------- | ---------------------- | ---------------------------- |
| 分割単位                  | 変更履歴セクション全体 | 最小変更で効果が高い         |
| SKILL-changelog.md の形式 | Markdown（追記型）     | merge=union が有効に機能する |
| SKILL.md への参照リンク   | 追加しない             | 仕様書の簡潔さを維持         |

---

### ステップ5: FIX-001-E 設計（gwt() post-merge フック自動インストール）

**問題**:
`gwt()` で新規 worktree を作成しても `git rev-parse --git-path hooks/post-merge` で解決される post-merge フックが自動インストールされない。
FIX-001-C で作成する `install-git-hooks.sh` があっても、新規 worktree には自動適用されない。

**前提条件**: FIX-001-C が完了していること（`post-merge-index-regenerate.sh` と `install-git-hooks.sh` が存在すること）

**変更ファイル**: `~/.config/zsh/conf.d/73-git-worktree.zsh`

**設計: `_gwt_ensure_post_merge_hook()` 関数の追加**

```zsh
# post-merge フックを worktree に自動インストールする（冪等）
_gwt_ensure_post_merge_hook() {
  local repo_root="$1"
  local hook_file="$(git -C "$repo_root" rev-parse --git-path hooks/post-merge)"
  local hook_script="${repo_root}/.claude/hooks/post-merge-index-regenerate.sh"

  # ソーススクリプトが存在しない場合はスキップ（オプショナル）
  [ -f "$hook_script" ] || return 0
  # 既にインストール済みの場合はスキップ（冪等）
  [ ! -f "$hook_file" ] || return 0

  cp "$hook_script" "$hook_file"
  chmod +x "$hook_file"
  echo "🔧 post-mergeフックをインストールしました（indexes再生成用）"
}
```

**`gwt()` 関数への組み込み位置**:

`git worktree add` が成功した直後（worktree ディレクトリが確定した時点）に呼び出す。

```zsh
# git worktree add 成功後に実行
_gwt_ensure_post_merge_hook "$worktree_path"
```

**設計判断**:

| 項目                         | 決定                                   | 理由                                |
| ---------------------------- | -------------------------------------- | ----------------------------------- |
| 呼び出し位置                 | `git worktree add` 成功直後            | worktree ディレクトリが確定している |
| フック不在時の動作           | `[ -f "$hook_script" ] \|\| return 0`  | FIX-001-C 未完了でも壊れない        |
| 既インストール済みの扱い     | `[ ! -f "$hook_file" ] \|\| return 0`  | 冪等（2回実行しても副作用なし）     |
| `gwt-layout-init()` への適用 | `gwt()` 内で対応するため自動適用される | 追加変更不要                        |

---

### ステップ6: FIX-001-F 設計（B レイアウト重いフックスキップ）

**問題**:
`~/.tmux.conf` の bind B で `gwt-layout-init` を実行すると、Claude Code の重いフック（型チェック・テスト）が実行され、レイアウト初期化が遅延する。
`CLAUDE_SKIP_HEAVY_HOOKS=1` を設定することで、Claude Code セッション起動時に型チェックとテストフックをスキップできる。

**前提条件**: FIX-001-C が完了していること

**変更ファイル**: `~/.tmux.conf`

**変更内容**: bind B の pane 1 の `send-keys` に `CLAUDE_SKIP_HEAVY_HOOKS=1` を付与する。

**変更前（概念）**:

```tmux
send-keys -t "$session:0.1" "gwt-layout-init 'タスク名'" Enter
```

**変更後（概念）**:

```tmux
send-keys -t "$session:0.1" "CLAUDE_SKIP_HEAVY_HOOKS=1 gwt-layout-init 'タスク名'" Enter
```

**設計判断**:

| 項目                        | 決定                                             | 理由                                               |
| --------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| 適用範囲                    | bind B の pane 1（NeoVim + gwt-layout-init）のみ | 他のペインや通常コマンドには影響しない             |
| 環境変数の設定方式          | コマンドプレフィックス形式                       | シェル設定を変更せず、このコマンド実行時のみ有効   |
| `CLAUDE_SKIP_HEAVY_HOOKS=1` | 型チェック・テストフックをスキップ               | `.claude/hooks/` の各フックが参照する既存の変数    |
| pane 2-5 への適用           | 不要                                             | Claude Code / Codex は独立したセッションとして起動 |

---

## 設計判断サマリー

| サブタスク | 設計選択                                                       | 採用理由                                 |
| ---------- | -------------------------------------------------------------- | ---------------------------------------- |
| FIX-001-A  | EVALS.json: merge=ours                                         | JSON 破損を確実に防ぐ                    |
| FIX-001-B  | paths-ignore + merge_group:                                    | CI スキップ + Merge Queue 保証           |
| FIX-001-C  | post-merge シェルスクリプト + session-init.sh 自動インストール | シンプル・冪等・既存フックと整合         |
| FIX-001-D  | SKILL-changelog.md に変更履歴を切り出し + merge=union          | 最小変更で並列マージ問題を解消           |
| FIX-001-E  | `_gwt_ensure_post_merge_hook()` を gwt() 内で呼び出し          | 新規 worktree に post-merge を自動適用   |
| FIX-001-F  | bind B の pane 1 に `CLAUDE_SKIP_HEAVY_HOOKS=1` を付与         | レイアウト初期化中の重いフック実行を抑制 |

---

## サブタスク管理

| ID     | タスク名       | ステータス |
| ------ | -------------- | ---------- |
| T-02-1 | FIX-001-A 設計 | 未実施     |
| T-02-2 | FIX-001-B 設計 | 未実施     |
| T-02-3 | FIX-001-C 設計 | 未実施     |
| T-02-4 | FIX-001-D 設計 | 未実施     |
| T-02-5 | 設計判断記録   | 未実施     |
| T-02-6 | FIX-001-E 設計 | 未実施     |
| T-02-7 | FIX-001-F 設計 | 未実施     |

---

## 成果物

| 成果物                  | 配置先                                  | 形式            |
| ----------------------- | --------------------------------------- | --------------- |
| 設計決定記録            | `outputs/phase-2/design-decisions.md`   | Markdown        |
| 6 サブタスク詳細設計    | `outputs/phase-2/subtask-design.md`     | Markdown        |
| .gitattributes 変更差分 | `outputs/phase-2/gitattributes-diff.md` | Markdown (diff) |

---

## 完了条件

- [ ] FIX-001-A〜F の設計が全て確定していること
- [ ] 各サブタスクの採用/不採用の設計判断が記録されていること
- [ ] CI の paths-ignore 追加内容と merge_group: トリガーの追加内容が確定していること
- [ ] post-merge フックスクリプトの設計（疑似コード）が `outputs/phase-2/subtask-design.md` に記録されていること
- [ ] SKILL.md 分割のフォーマット（SKILL-changelog.md のテンプレート）が確定していること
- [ ] `_gwt_ensure_post_merge_hook()` の設計（疑似コード・呼び出し位置）が確定していること
- [ ] bind B の `CLAUDE_SKIP_HEAVY_HOOKS=1` 付与方針が確定していること

---

## タスク 100% 実行確認【必須】

- [ ] T-02-1: FIX-001-A 設計を `outputs/phase-2/design-decisions.md` に記録済み
- [ ] T-02-2: FIX-001-B 設計（CI 変更内容）を記録済み
- [ ] T-02-3: FIX-001-C 設計（フックスクリプト疑似コード）を `outputs/phase-2/subtask-design.md` に記録済み
- [ ] T-02-4: FIX-001-D 設計（SKILL-changelog.md テンプレート）を記録済み
- [ ] T-02-5: 設計判断サマリーを `outputs/phase-2/design-decisions.md` に記録済み
- [ ] T-02-6: FIX-001-E 設計（`_gwt_ensure_post_merge_hook()` 疑似コード・呼び出し位置）を記録済み
- [ ] T-02-7: FIX-001-F 設計（bind B `CLAUDE_SKIP_HEAVY_HOOKS=1` 変更内容）を記録済み

---

## 次 Phase

**Phase 3: 設計レビューゲート** — 4 core サブタスク（FIX-001-A〜D）の設計整合性・後方互換性・リスクをレビューし、PASS / MINOR / MAJOR を判定する。

**ゲート条件**: Phase 1-2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
