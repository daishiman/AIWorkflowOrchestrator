# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 13                                       |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | **blocked**（ユーザー明示承認待ち）      |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.25h                                    |

## 重要

**このPhaseはユーザーの明示的な承認後にのみ実行する。**
Phase 12 完了後、自動的に Phase 13 に進まないこと。

## 実行タスク

1. ユーザーの明示承認を確認する
2. ブランチと差分を確認する
3. PR を作成する
4. PR URL を記録する

## 参照資料

| 参照資料                  | パス                                                     | 用途            |
| ------------------------- | -------------------------------------------------------- | --------------- |
| Phase 12 仕様準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | PR 作成前の確認 |
| Phase 12 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | PR 本文の元資料 |
| Phase 12 変更履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更範囲確認    |
| GitHub Issue              | `#1839`                                                  | 関連 Issue      |

## 目的

Phase 1〜12 の全成果物を含む PR を作成し、レビュー・マージ可能な状態にする。

## 前提条件

- [ ] Phase 12 の全 Task（1〜6）が完了している
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成済みである
- [ ] ユーザーが「PR を作成してください」と明示的に指示した

## 成果物

| 成果物  | パス                                       | 説明             |
| ------- | ------------------------------------------ | ---------------- |
| PR 作成 | `Phase 13 blocked（ユーザー明示承認待ち）` | 承認後にのみ実施 |

## 実行手順

### ステップ 1: ブランチ確認

```bash
git status
git branch
```

### ステップ 2: コミット状況確認

```bash
git log --oneline -10
git diff main...HEAD --stat
```

### ステップ 3: PR作成

```bash
gh pr create \
  --title "fix(desktop): TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 — before-quit guard 実装・検証・文書化 (#1839)" \
  --body "$(cat <<'EOF'
## Summary

- `beforeQuitGuard.ts` の実装を検証（TASK-NOTIFICATION-SERVICE-001 で実装済み）
- `RuntimeSkillCreatorFacade.notification.test.ts` の activeExecutionCount 動作テスト確認（TC-F-04〜TC-F-08）
- `beforeQuitGuard.test.ts` に TC-B-04・TC-B-05 を追加（app.exit / console.warn の検証）
- 未タスク文書のチェックボックスを全て更新
- `app.exit(0)` による即時終了の設計判断を実装ガイドに明記

## Test plan

- [ ] TC-B-01〜TC-B-05: before-quit guard の外部動作
- [ ] TC-F-04〜TC-F-08: activeExecutionCount の増減動作
- [ ] MT-01〜MT-04: 手動テスト（ダイアログ表示・キャンセル・中断終了・通常終了）
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` エラーなし

## Related

- Closes #1839
- Parent: TASK-FIX-EXECUTE-PLAN-FF-001

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

## 完了条件

- [ ] PR が作成されている
- [ ] PR の URL をユーザーに報告した
- [ ] CI が PASS していることを確認（または PASS 待ち）

## タスク 100% 実行確認【必須】

- [ ] PR URL を確認した
- [ ] Issue #1839 が PR に紐付いていることを確認した
