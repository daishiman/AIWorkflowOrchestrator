# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 13                                           |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 12                                     |
| 後続Phase  | 完了                                         |
| 作成日     | 2026-04-13                                   |
| ステータス | blocked                                      |

## ⚠️ 重要: PR作成はユーザーの明示承認後のみ実施

**このPhaseはユーザーが明示的に「PR を作成してください」と指示するまで実行しない。**

```
❌ 自動実行禁止
✅ ユーザーの明示承認後のみ実施
```

## 目的

Phase 1〜12 の成果物をベースに、適切な PR を作成し CI を確認する。
GitHub Issue #2007 との連携も含む。

## PR 作成前チェック

```bash
# 1. ローカルの変更を確認
git status
git diff --stat

# 2. lint/typecheck の最終確認
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck

# 3. テスト最終確認
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx

# 4. コミット（--no-verify は絶対禁止）
git add -p
git commit -m "test(renderer): TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 SkillLifecyclePanel エラーメッセージ UI 表示 E2E 確認"
```

## PR 本文テンプレート

```markdown
## 概要

TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: SkillLifecyclePanel エラーメッセージ UI 表示 E2E 確認

Fixes #2007

## 変更内容

- `SkillLifecyclePanel.test.tsx` に UT-01〜UT-11 のテストを追加
- `onWorkflowStateChanged → setWorkflowError → currentSurfaceError → data-testid="skill-lifecycle-error"` の経路を Vitest で検証
- 必要に応じて `SkillLifecyclePanel.tsx` のエラー表示配線を修正

## テスト結果

- UT-01〜UT-11: 全 PASS
- lint: PASS
- typecheck: PASS

## 関連 Issue

- Closes #2007
- 親タスク: TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 の follow-up
```

## CI 確認

```bash
# PR 作成後に CI 状態を確認
gh pr view --json statusCheckRollup
```

## GitHub Issue クローズ

PR マージ後、または PR 本文の `Closes #2007` によって自動クローズされる。
手動クローズする場合:

```bash
gh issue close 2007 --comment \
  "TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 完了: エラーメッセージの UI 表示を Vitest テストで確認しました。"
```

**注意**: Issue は現在 CLOSED 状態のため、コメント追加のみで対応する。

## 参照資料

| 参照資料               | パス                                                     | 説明            |
| ---------------------- | -------------------------------------------------------- | --------------- |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| 仕様更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| Task Spec 適合チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

## 成果物

Phase 13 の成果物は PR の URL と CI 結果のみ。
`artifacts.json` の Phase 13 ステータスを `completed` に更新する。

## 完了条件

- [ ] ユーザーの明示承認を得た
- [ ] lint/typecheck/test が全て PASS している
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] GitHub Issue #2007 との連携が記録されている
- [ ] `--no-verify` を使用していない（絶対禁止）

## タスク100%実行確認【必須】

- [ ] ユーザーの明示承認を確認した
- [ ] PR URL が記録されている
- [ ] CI 結果が記録されている
- [ ] 実行記録を残した

---

_PR作成は task-specification-creator SKILL.md の「PR作成に関する注意」に従い、_
_ユーザーの明示的な許可を得てから実行すること。_
