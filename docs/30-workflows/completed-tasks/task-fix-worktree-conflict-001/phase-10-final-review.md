# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 10                             |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

AC-1〜AC-8 の最終充足確認と、実装全体の整合性レビューを行い、Phase 11 への進行可否を判定する。

---

## 実行タスク

- **タスク1**: AC-1〜AC-8 の最終確認（全基準の充足チェック）
- **タスク2**: 実装全体の整合性確認（6 サブタスク間の矛盾がないか）
- **タスク3**: MINOR 指摘の解消確認（Phase 3 の MINOR 追跡テーブルを参照）
- **タスク4**: Phase 11 進行可否の判定（PASS / MAJOR）
- **タスク5**: 最終レビュー結果の記録

---

## AC 最終確認

```bash
echo "=== AC 最終確認 ==="

# AC-1: LOGS.md merge=union
grep "LOGS.md.*union" .gitattributes && echo "AC-1: PASS" || echo "AC-1: FAIL"

# AC-2: EVALS.json merge=ours + JSON 有効性 + 状態値消失の検知
grep "EVALS.*ours" .gitattributes && echo "AC-2a: PASS" || echo "AC-2a: FAIL"
EVALS_FAIL=0
for f in .claude/skills/*/EVALS.json .agents/skills/*/EVALS.json; do
  [ -f "$f" ] && jq . "$f" > /dev/null 2>&1 || EVALS_FAIL=1
done
[ "$EVALS_FAIL" -eq 0 ] && echo "AC-2b: PASS" || echo "AC-2b: FAIL"

# AC-3: CI paths-ignore
grep -q "\.claude/\*\*" .github/workflows/ci.yml && echo "AC-3: PASS" || echo "AC-3: FAIL"

# AC-4: post-merge フックによる復元
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
[ -f "$HOOK_PATH" ] && [ -x "$HOOK_PATH" ] && echo "AC-4: PASS" || echo "AC-4: FAIL"

# AC-5: SKILL-changelog.md merge=union
grep "SKILL-changelog.*union" .gitattributes && echo "AC-5: PASS" || echo "AC-5: FAIL"

# AC-6: 全スキルに SKILL-changelog.md が存在
MISSING=0
for skill in .claude/skills/*/; do
  [ -f "${skill}SKILL-changelog.md" ] || MISSING=1
done
[ "$MISSING" -eq 0 ] && echo "AC-6: PASS" || echo "AC-6: FAIL"

# AC-7: gwt() で新規 worktree 作成後 post-merge フックが実行可能
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
[ -f "$HOOK_PATH" ] && [ -x "$HOOK_PATH" ] && echo "AC-7: PASS" || echo "AC-7: FAIL"

# AC-8: tmux に heavy hook skip が設定
grep -q "CLAUDE_SKIP_HEAVY_HOOKS=1" ~/.tmux.conf && echo "AC-8: PASS" || echo "AC-8: FAIL"
```

---

## 整合性確認観点

| 観点                                | 確認内容                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| FIX-001-A と FIX-001-D の整合       | EVALS.json は merge=ours、SKILL-changelog.md は merge=union で、保存方針が衝突しないこと |
| FIX-001-C と session-init.sh の整合 | session-init.sh の自動インストールチェックが正しく動作し、復元経路が失われないこと       |
| FIX-001-B と merge_group: の整合    | paths-ignore と merge_group: が共存していること                                          |
| FIX-001-E と FIX-001-C の整合       | worktree 作成後に post-merge hook が自動配置されること                                   |
| FIX-001-F と tmux 設定の整合        | bind B の実行時に heavy hook skip が付与されること                                       |
| .gitattributes 全体の一貫性         | コメントが整理され、意図が読み取れること                                                 |

---

## 判定基準

| 判定  | 条件                                       | 対応               |
| ----- | ------------------------------------------ | ------------------ |
| PASS  | AC-1〜AC-8 が全て充足、整合性問題なし      | Phase 11 へ進む    |
| MAJOR | AC が 1 つでも未充足、または整合性問題あり | Phase 5 に戻り修正 |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| AC 充足確認記録  | `outputs/phase-10/ac-verification.md`     | Markdown |

---

## 完了条件

- [ ] AC-1〜AC-8 の全基準が充足されていること
- [ ] 6 サブタスク間の整合性に問題がないこと
- [ ] Phase 3 の MINOR 指摘が全て解消されていること
- [ ] 総合判定が PASS であること

---

## 次 Phase

**Phase 11: 手動テスト** — ローカル環境での実際の git 操作による動作確認。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
