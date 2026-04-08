# Phase 13: PR 作成

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 13                             |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

ローカル品質チェックを実施し、変更サマリーを作成した上で GitHub に PR を作成する。
**このフェーズはユーザーの明示的な指示があるまで実行しない（blocked）。**

---

## 実行タスク

- **タスク1**: ローカル最終チェック（lint・typecheck・test）
- **タスク2**: 変更サマリーの作成
- **タスク3**: コミット・プッシュ
- **タスク4**: PR 作成（`gh pr create`）
- **タスク5**: PR 準備完了レポートの作成

---

## 実行手順

### ステップ1: ローカル最終チェック

```bash
# lint
pnpm lint

# typecheck（TypeScript 変更なしのため高速に完了する見込み）
pnpm --filter @repo/desktop typecheck

# テスト（シェルスクリプト・設定変更のため既存テストへの影響なし見込み）
pnpm --filter @repo/desktop test --run 2>&1 | tail -20

# shellcheck
shellcheck .claude/hooks/post-merge-index-regenerate.sh
shellcheck .claude/scripts/install-git-hooks.sh
```

### ステップ2: 変更サマリーの作成

```bash
# 変更ファイル一覧
git diff --name-only main...HEAD

# コミット履歴
git log main...HEAD --oneline
```

`outputs/phase-13/change-summary.md` に以下を記録:

- 変更ファイル一覧（カテゴリ別）
- 6 サブタスク（FIX-001-A〜F）の概要
- AC-1〜AC-8 の充足状況

### ステップ3: コミット・プッシュ

```bash
# 未コミットの変更があればコミット
git add .gitattributes .github/workflows/ci.yml \
  .claude/hooks/post-merge-index-regenerate.sh \
  .claude/scripts/install-git-hooks.sh \
  .claude/hooks/session-init.sh \
  .claude/skills/*/SKILL.md \
  .claude/skills/*/SKILL-changelog.md \
  .agents/skills/*/SKILL.md \
  .agents/skills/*/SKILL-changelog.md

git commit -m "fix(worktree): 並列ワークツリー .claude/.agents コンフリクト解消

- EVALS.json を merge=union から merge=ours に変更（JSON 破損防止）
- CI の paths-ignore に .claude/** / .agents/** を追加（スキルファイル変更でCI スキップ）
- merge_group: トリガーを追加（GitHub Merge Queue 対応）
- post-merge フックで indexes/*.json を自動再生成し、消えた情報を復元
- SKILL.md から変更履歴を SKILL-changelog.md に分離（merge=union 設定）
- gwt() で post-merge フックを自動インストール
- tmux B レイアウトで heavy hook をスキップ

Resolves: TASK-FIX-WORKTREE-CONFLICT-001"

git push origin HEAD
```

### ステップ4: PR 作成

```bash
gh pr create \
  --title "fix(worktree): 並列ワークツリー .claude/.agents コンフリクト解消 [TASK-FIX-WORKTREE-CONFLICT-001]" \
  --body "$(cat <<'EOF'
## 概要

50〜60本の並列 worktree ブランチが `.claude/skills/` と `.agents/skills/` 配下のファイルを更新する際のマージコンフリクトを解消する。

## 変更内容

### FIX-001-A: EVALS.json merge 戦略修正
- `.gitattributes`: `EVALS.json merge=union` → `merge=ours` に変更
- 理由: JSON の重複キー発生を防止

### FIX-001-B: CI 設定更新
- `.github/workflows/ci.yml`: `paths-ignore` に `.claude/**` / `.agents/**` を追加
- `merge_group:` トリガーを追加（GitHub Merge Queue 対応）
- 効果: スキルファイルのみ変更の PR はCI をスキップして即マージ可能

### FIX-001-C: post-merge インデックス再生成フック
- `.claude/hooks/post-merge-index-regenerate.sh` を新規作成
- `.claude/scripts/install-git-hooks.sh` を新規作成（冪等インストーラー）
- `session-init.sh` にフック自動インストールチェックを追加

### FIX-001-D: SKILL.md 構造分割
- 各スキルの `SKILL.md` から変更履歴セクションを切り出し `SKILL-changelog.md` に分離
- `.gitattributes` に `SKILL-changelog.md merge=union` を追加

### FIX-001-E: gwt() post-merge フック自動インストール
- `~/.config/zsh/conf.d/73-git-worktree.zsh` に `_gwt_ensure_post_merge_hook()` を追加
- worktree 作成成功直後に post-merge hook を自動配置

### FIX-001-F: B レイアウト重いフックスキップ
- `~/.tmux.conf` の bind B に `CLAUDE_SKIP_HEAVY_HOOKS=1` を付与
- `gwt-layout-init` の初期化時に重いフックを抑制

## 受け入れ基準

- [x] AC-1: LOGS.md 並列マージでコンフリクトなし（merge=union 設定済み）
- [x] AC-2: EVALS.json 並列マージで JSON 破損せず、状態値の消失も検知
- [x] AC-3: `.claude/**` のみ変更 PR は CI スキップ
- [x] AC-4: indexes/*.json がマージ後に自動再生成され、消えた情報が復元される
- [x] AC-5: SKILL-changelog.md がコンフリクトなしにマージ可能
- [x] AC-6: 全スキルに SKILL-changelog.md が存在
- [x] AC-7: gwt() で新規 worktree 作成後に post-merge フックが自動インストールされる
- [x] AC-8: B レイアウト起動時に `CLAUDE_SKIP_HEAVY_HOOKS=1` が付与される

## テスト

ローカルでの手動 git マージテストにより全 AC を確認済み（Phase 11 参照）。

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | Markdown |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | Markdown |
| PR 情報              | `outputs/phase-13/pr-info.md`            | Markdown |
| PR 準備完了レポート  | `outputs/phase-13/pr-ready-report.md`    | Markdown |

---

## 完了条件

- [ ] ローカル lint・typecheck・test が全て PASS であること
- [ ] コミットメッセージが規約に従っていること
- [ ] PR が作成され URL が `outputs/phase-13/pr-info.md` に記録されていること
- [ ] PR の本文に 6 サブタスクの概要と AC 充足状況が記載されていること

---

## blocked 解除条件

このフェーズはユーザーが「PR を作成してください」と明示的に指示した場合のみ実行する。
それまでは Phase 12 完了時点で待機する。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
