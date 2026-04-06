# Phase 13: PR 作成

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| Phase        | 13                                                                  |
| 名称         | PR 作成                                                             |
| タスクID     | TASK-P0-09                                                          |
| ステータス   | blocked                                                             |
| 依存         | Phase 12 完了 + **ユーザーの明示的な承認**                          |
| 完了条件     | PR が作成され CI が全 PASS し、completed-tasks へ移動済みであること |
| ブロック理由 | user approval 未取得のため                                          |

---

## 重要

> **PR 作成はユーザーの明示的な承認後のみ実施する。**
> 本 Phase は Claude Code が自律的に実行してはならない。
> ユーザーが「PR を作成してください」と明示的に指示した時点で実行を開始する。

---

## 目的

Phase 1〜12 の成果物を整理し、承認後に `/ai:diff-to-pr` で PR を作成する。
PR 作成後は CI を確認し、タスクディレクトリの completed-tasks 移動まで閉じる。

---

## 実行タスク

### T-13-1: ローカル確認

PR 作成前にローカル品質を確認する。

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --run

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# governance テストのみ確認
pnpm --filter @repo/desktop test -- \
  --grep "governance|SkillCreatorPermission|SkillCreatorHooks|SkillCreatorAudit" \
  --run
```

**完了条件**:

- [ ] 全テストが PASS している
- [ ] typecheck / lint がエラーなし
- [ ] `outputs/phase-13/local-check-result.md` に結果を記録している

---

### T-13-2: 変更サマリーと承認確認

```bash
# 変更ファイルの確認
git status
git diff --stat

# ブランチ名の確認（命名規則: feat/TASK-P0-09-xxx）
git branch --show-current
```

**サマリーに含める内容**:

- 変更対象ファイルと差分の要点
- `plan / execute / verify / improve` の責務境界
- `SkillCreatorPermissionPolicy` / `SkillCreatorHooksFactory` / `SkillCreatorAuditSink` / `RuntimeSkillCreatorFacade` の役割
- 追加テストと current facts の反映状況
- `TASK-P0-09-U1` が carry-forward であること

**完了条件**:

- [ ] 変更サマリーが作成されている
- [ ] ユーザーの明示的な承認を得るまでは PR 作成へ進めていない

---

### T-13-3: PR の作成

`/ai:diff-to-pr` を第一選択にする。使えない場合のみ git / gh CLI へフォールバックする。

```bash
/ai:diff-to-pr
```

**フォールバック**:

```bash
git add .
git commit -m "feat(governance): TASK-P0-09 SDK permission / hooks / audit ガバナンス基盤実装"
gh pr create
```

**PR 作成時に記録する内容**:

- 変更内容の要約
- PR 本文の `## その他` に `outputs/phase-12/implementation-guide.md` の反映元パスと要点（Part 1 / Part 2）を記載する
- `outputs/phase-12/implementation-guide.md` の全文を PR コメントとして投稿する
- `plan / execute / verify / improve` の安全境界
- 追加テストと current facts の対応
- `TASK-P0-09-U1` が carry-forward であること
- PR URL と review 準備状況
- `Closes #1894`

**完了条件**:

- [ ] PR が作成されている
- [ ] `outputs/phase-13/pr-info.md` に PR 情報が記録されている
- [ ] `/ai:diff-to-pr` を優先し、使えない場合のみフォールバックしている

---

### T-13-4: CI 確認

```bash
# CI の確認
gh pr checks --watch
```

**完了条件**:

- [ ] CI が全 PASS している（または FAIL の場合は原因を特定して修正）
- [ ] `outputs/phase-13/pr-info.md` に CI 結果が反映されている

---

### T-13-5: タスク完了処理

PR と CI が完了した後、タスクディレクトリを completed-tasks へ移動する。

```bash
mv docs/30-workflows/task-p0-09-sdk-permission-hooks-governance/ docs/30-workflows/completed-tasks/
```

**完了条件**:

- [ ] タスクディレクトリが completed-tasks へ移動されている
- [ ] `outputs/phase-13/pr-creation-result.md` を変更がある場合に記録できる状態である

---

## 参照資料

- `phase-12-documentation.md`
- `phase-10-final-review.md`
- `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`

---

## 成果物

| 成果物名         | パス                                     | 必須 |
| ---------------- | ---------------------------------------- | ---- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ✅   |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | ✅   |
| PR情報           | `outputs/phase-13/pr-info.md`            | ✅   |

---

## 完了条件チェックリスト

- [ ] **ユーザーの明示的な承認を得てから実行している**
- [ ] `blocked` のまま実行せず、承認前に PR 作成へ進めていない
- [ ] 全テストが PASS している（PR 作成直前確認）
- [ ] typecheck / lint がエラーなし
- [ ] 変更サマリーが作成されている
- [ ] PR が作成されている
- [ ] PR 本文に変更内容・テスト結果・関連 Issue が記載されている
- [ ] `Closes #1894` が PR 本文に含まれている
- [ ] CI が全 PASS している
- [ ] `outputs/phase-13/` に `local-check-result.md` / `change-summary.md` / `pr-info.md` が記録されている
- [ ] タスクディレクトリが completed-tasks へ移動されている
