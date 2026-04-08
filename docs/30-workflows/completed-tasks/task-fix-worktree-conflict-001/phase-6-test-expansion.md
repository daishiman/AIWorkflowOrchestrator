# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 6                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

Phase 5 の実装で GREEN になった基本シナリオに加え、エッジケース・境界条件・異常系のシナリオを追加検証し、動作の頑健性を確認する。

---

## 実行タスク

- **タスク1**: FIX-001-A エッジケース検証（EVALS.json が空・破損している場合）
- **タスク2**: FIX-001-B エッジケース検証（複数の CI ワークフローが存在する場合）
- **タスク3**: FIX-001-C エッジケース検証（node が存在しない環境でのフック動作）
- **タスク4**: FIX-001-D エッジケース検証（変更履歴が複数セクションにまたがる場合）
- **タスク5**: 追加シナリオのテストマトリクスへの追記

---

## 追加検証シナリオ

| TC番号  | 対象      | シナリオ（エッジケース）                     | 期待結果                                                        |
| ------- | --------- | -------------------------------------------- | --------------------------------------------------------------- |
| TC-A-03 | FIX-001-A | EVALS.json が空ファイルの場合のマージ        | merge=ours でも JSON が壊れず、空ファイル状態が意図通り扱われる |
| TC-A-04 | FIX-001-A | 3ブランチが同時にマージされる場合            | 最後にマージした値が保持され、消失分は follow-up で検知できる   |
| TC-C-04 | FIX-001-C | node コマンドが PATH にない環境              | フックがエラーを出さず正常終了する                              |
| TC-C-05 | FIX-001-C | .git ディレクトリが worktree の場合          | git rev-parse が正しく toplevel を返す                          |
| TC-D-04 | FIX-001-D | SKILL.md に変更履歴が複数セクションある場合  | 全セクションが SKILL-changelog.md に移動される                  |
| TC-D-05 | FIX-001-D | agents/skills にスキルがない場合             | エラーなく正常終了する                                          |
| TC-E-01 | FIX-001-E | gwt() で新規 worktree 作成後に hook を再適用 | worktree-safe hook が冪等に配置される                           |
| TC-E-02 | FIX-001-E | 既存の worktree-safe hook がある場合         | 上書きせず副作用なく終了する                                    |
| TC-F-01 | FIX-001-F | bind B の pane 1 で gwt-layout-init を起動   | `CLAUDE_SKIP_HEAVY_HOOKS=1` が付与されている                    |

---

## 実行手順

### FIX-001-C エッジケース: node 不在時の動作

```bash
# node を一時的に無効化してフックをテスト
PATH_BACKUP="$PATH"
export PATH="/usr/bin:/bin"  # node を除外
bash .claude/hooks/post-merge-index-regenerate.sh
echo "終了コード: $?"  # 0 であること
export PATH="$PATH_BACKUP"
```

### FIX-001-C エッジケース: worktree での動作

```bash
# worktree を作成してフックをテスト
git worktree add /tmp/test-worktree feat/test-branch
cd /tmp/test-worktree
bash .claude/scripts/install-git-hooks.sh
ls .git  # worktree の場合 .git はファイル（ポインタ）
cd -
git worktree remove /tmp/test-worktree
```

### FIX-001-E エッジケース: worktree hook 冪等性

```bash
# gwt() 相当の worktree 作成後に hook が既にある場合の再適用を確認
HOOK_FILE="$(git rev-parse --git-path hooks/post-merge)"
test -x "$HOOK_FILE" && cp "$HOOK_FILE" /tmp/post-merge.backup
bash .claude/scripts/install-git-hooks.sh
test -x "$HOOK_FILE" && echo "PASS: hook executable"
cmp -s /tmp/post-merge.backup "$HOOK_FILE" && echo "PASS: idempotent" || echo "INFO: hook content may differ by environment"
```

### FIX-001-F エッジケース: tmux skip フラグ

```bash
# tmux bind B の起動コマンドに heavy hook skip が含まれることを確認
grep -n "CLAUDE_SKIP_HEAVY_HOOKS=1" ~/.tmux.conf
```

---

## 成果物

| 成果物         | 配置先                                     | 形式     |
| -------------- | ------------------------------------------ | -------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | Markdown |

---

## 完了条件

- [ ] 追加 TC-A-03〜04、TC-C-04〜05、TC-D-04〜05、TC-E-01〜02、TC-F-01 の検証シナリオが定義・実行されていること
- [ ] 全追加シナリオの結果が `outputs/phase-6/test-expansion-result.md` に記録されていること
- [ ] 失敗したシナリオがある場合は Phase 5 に戻り修正していること

---

## 次 Phase

**Phase 7: カバレッジ確認** — 受け入れ基準 AC-1〜AC-8 の充足状況を確認する。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
