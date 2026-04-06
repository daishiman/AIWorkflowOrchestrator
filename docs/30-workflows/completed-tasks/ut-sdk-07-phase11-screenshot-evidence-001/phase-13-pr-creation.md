# Phase 13: PR作成 - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| Phase名    | PR作成                                    |
| 前提Phase  | Phase 12（ドキュメント更新）              |
| 後続Phase  | なし                                      |
| ステータス | blocked                                   |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001 |

---

## 重要: ユーザー承認必須

**このPhaseはユーザーの明示的な承認を得てから実行すること。**

自動実行禁止。以下のアクションはユーザーが「PR を作成してください」と明示的に指示した場合のみ実行する:

- `git add`
- `git commit`
- `git push`
- `gh pr create`

---

## 目的

Phase 12 までの全成果物をコミットし、PR を作成してレビューに出す。

---

## 実行タスク（ユーザー承認後のみ）

### タスク1: コミット前チェック

```bash
# 変更ファイル一覧確認
git status

# 差分確認
git diff --stat

# 型チェック（コード変更はないが念のため）
pnpm typecheck

# lint チェック
pnpm lint
```

---

### タスク2: コミット

```bash
git add \
  docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/ \
  docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/ \
  docs/30-workflows/unassigned-task/task-ut-sdk-07-phase11-screenshot-evidence-001.md

git commit -m "$(cat <<'EOF'
docs(qa): UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001 Phase 11 screenshot evidence 取得

- terminal_handoff HandoffGuidance 表示 screenshot 取得
- disclosure summary 表示 screenshot 取得（data-testid 確認）
- integrated_api 成功後 screenshot 取得（対照）
- manual-test-result.md に evidence 追記
- Phase 1〜13 タスク仕様書一式作成

Closes #1695

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### タスク3: PR 作成

```bash
gh pr create \
  --title "docs(qa): UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001 Phase 11 screenshot evidence 取得" \
  --body "$(cat <<'EOF'
## 概要

TASK-SDK-07 Phase 11 で未取得のまま閉じた UI evidence を取得し、governance bundle UI の evidence chain を完成させる。

## 変更内容

- `terminal_handoff` 状態の HandoffGuidance 表示 screenshot 取得
- disclosure summary（`data-testid="skill-lifecycle-disclosure-summary"`）表示 screenshot 取得
- `integrated_api` 成功後の screenshot 取得（対照用）
- TASK-SDK-07 Phase 11 `manual-test-result.md` への evidence 追記
- `ut-sdk-07-phase11-screenshot-evidence-001/` タスク仕様書一式（Phase 1〜13）

## 関連 Issue

Closes #1695

## チェックリスト

- [ ] AC-1〜AC-6 が全て充足されている
- [ ] 3 枚の screenshot が `screenshots/` に配置されている
- [ ] `manual-test-result.md` に evidence が追記されている
- [ ] `unassigned-task/task-ut-sdk-07-phase11-screenshot-evidence-001.md` のステータスが完了になっている

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 成果物/実行手順

- ユーザーの明示的な承認を得た後にのみ、Phase 13 の実行タスクを解放する
- 承認前は `git add` / `git commit` / `git push` / `gh pr create` を実行しない
- 実行時は Phase 12 までの成果物と Issue #1695 の関連付けを確認する

---

## 参照資料

| 参照資料        | パス                                                                                                 | 内容                |
| --------------- | ---------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 12 成果物 | `outputs/phase-12/`                                                                                  | documentation 一式  |
| Phase 11 成果物 | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/` | screenshot evidence |

## 成果物

| 成果物   | パス                                       | 内容               |
| -------- | ------------------------------------------ | ------------------ |
| PR草案   | `outputs/phase-13/pr-draft.md`             | PR本文草案         |
| 変更一覧 | `outputs/phase-13/change-summary.md`       | 変更ファイルと要点 |
| 検証一覧 | `outputs/phase-13/verification-summary.md` | テスト・証跡要約   |

## 実行手順

- ユーザー承認後に phase 12 outputs と phase 11 evidence を最終確認する
- `git add` / `git commit` / `gh pr create` を実行する

---

## 完了条件

- [ ] ユーザーの明示的な承認を得た
- [ ] コミット前チェックが全て PASS した
- [ ] コミットが作成された
- [ ] PR が作成された
- [ ] Issue #1695 が PR にリンクされている

## タスク100%実行確認【必須】

PR URL をユーザーに報告し、Phase 13 が完了したことを記録すること。
