# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 7                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

受け入れ基準 AC-1〜AC-8 の充足状況を確認し、全基準が達成されていることを記録する。
本タスクはシェルスクリプト・設定ファイル変更のため、コードカバレッジツールではなく
AC 対応マトリクスで充足状況を確認する。

---

## 実行タスク

- **タスク1**: AC-1〜AC-8 の充足状況チェック
- **タスク2**: 未達成 AC の特定（あれば Phase 5 に戻る）
- **タスク3**: カバレッジレポートの作成

---

## AC 充足確認マトリクス

| AC番号 | 基準                                                                | 検証コマンド                                                                   | 充足状況 |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| AC-1   | LOGS.md 並列マージでコンフリクトなし                                | `grep "LOGS.md" .gitattributes`                                                | 要確認   |
| AC-2   | EVALS.json が merge=ours で JSON 破損せず、状態値の消失も検知できる | `grep "EVALS.*ours" .gitattributes` + `jq .`                                   | 要確認   |
| AC-3   | `.claude/**` 変更 PR が CI スキップ                                 | `grep "paths-ignore" .github/workflows/ci.yml`                                 | 要確認   |
| AC-4   | indexes/\*.json がマージ後に自動再生成され、消えた情報が復元される  | `HOOK_PATH=$(git rev-parse --git-path hooks/post-merge); test -x "$HOOK_PATH"` | 要確認   |
| AC-5   | SKILL-changelog.md がコンフリクトなし                               | `grep "SKILL-changelog.*union" .gitattributes`                                 | 要確認   |
| AC-6   | 全スキルに SKILL-changelog.md が存在                                | `ls .claude/skills/*/SKILL-changelog.md`                                       | 要確認   |
| AC-7   | `gwt` で新規 worktree 作成後に hook が入る                          | `HOOK_PATH=$(git rev-parse --git-path hooks/post-merge); test -x "$HOOK_PATH"` | 要確認   |
| AC-8   | `CLAUDE_SKIP_HEAVY_HOOKS=1` が付与される                            | `grep "CLAUDE_SKIP_HEAVY_HOOKS" ~/.tmux.conf`                                  | 要確認   |

---

## 実行手順

```bash
# AC-1: LOGS.md merge=union 確認
grep "LOGS.md.*union" .gitattributes && echo "AC-1: PASS" || echo "AC-1: FAIL"

# AC-2: EVALS.json merge=ours 確認 + JSON 有効性
grep "EVALS.*ours" .gitattributes && echo "AC-2a: PASS" || echo "AC-2a: FAIL"
for f in .claude/skills/*/EVALS.json .agents/skills/*/EVALS.json; do
  [ -f "$f" ] && jq . "$f" > /dev/null 2>&1 && echo "AC-2b PASS: $f" || echo "AC-2b FAIL: $f"
done

# AC-3: CI paths-ignore 確認
grep -q "\.claude/\*\*" .github/workflows/ci.yml && echo "AC-3: PASS" || echo "AC-3: FAIL"

# AC-4: post-merge フック実行可能確認
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
test -x "$HOOK_PATH" && echo "AC-4: PASS" || echo "AC-4: FAIL"

# AC-5: SKILL-changelog.md merge=union 確認
grep "SKILL-changelog.*union" .gitattributes && echo "AC-5: PASS" || echo "AC-5: FAIL"

# AC-6: 全スキルの SKILL-changelog.md 存在確認
MISSING=0
for skill in .claude/skills/*/; do
  [ -f "${skill}SKILL-changelog.md" ] || { echo "MISSING: ${skill}SKILL-changelog.md"; MISSING=1; }
done
[ "$MISSING" -eq 0 ] && echo "AC-6: PASS" || echo "AC-6: FAIL"

# AC-7: post-merge hook が worktree に入って実行可能であることを確認
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
test -x "$HOOK_PATH" && echo "AC-7: PASS" || echo "AC-7: FAIL"

# AC-8: tmux 側に heavy hook skip が付与されていることを確認
grep -q "CLAUDE_SKIP_HEAVY_HOOKS=1" ~/.tmux.conf && echo "AC-8: PASS" || echo "AC-8: FAIL"
```

---

## 成果物

| 成果物             | 配置先                               | 形式     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Markdown |

---

## 完了条件

- [ ] AC-1〜AC-8 の全基準が充足されていること
- [ ] 未達成 AC がある場合は Phase 5 に戻り修正済みであること
- [ ] `outputs/phase-7/coverage-report.md` に充足状況が記録されていること

---

## 次 Phase

**Phase 8: リファクタリング** — 実装コードの品質改善・重複排除・可読性向上を行う。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
