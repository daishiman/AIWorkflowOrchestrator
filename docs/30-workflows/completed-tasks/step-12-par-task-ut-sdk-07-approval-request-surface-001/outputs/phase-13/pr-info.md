# Phase 13 成果物: PR 情報

## ステータス: **BLOCKED（ユーザー承認待ち）**

PR の作成はユーザーの明示的な承認後に実行します。

---

## PR 作成コマンド（承認後に実行）

```bash
# 1. ブランチ確認
git branch --show-current
# 期待値: task-20260406-184233-wt-4 またはフィーチャーブランチ

# 2. 変更をステージング
git add \
  apps/desktop/electron.vite.config.ts \
  apps/desktop/package.json \
  apps/desktop/scripts/capture-ut-sdk-07-approval-request-surface-phase11.mjs \
  apps/desktop/src/main/ipc/approvalHandlers.ts \
  apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts \
  apps/desktop/src/preload/skill-creator-api.ts \
  apps/desktop/src/preload/types.ts \
  apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ApprovalRequestPanel.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx \
  apps/desktop/src/renderer/phase11-approval-request-surface.html \
  apps/desktop/src/renderer/phase11-approval-request-surface.tsx \
  docs/30-workflows/step-12-par-task-ut-sdk-07-approval-request-surface-001 \
  docs/30-workflows/unassigned-task/task-ut-sdk-07-approval-request-surface-001.md \
  packages/shared/src/types/index.ts \
  packages/shared/src/types/skillCreator.ts \
  .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md \
  .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md

# 3. コミット
git commit -m "feat(ui): UT-SDK-07 Skill Creator に approval:request 確認 UI を追加"

# 4. PR 作成
gh pr create \
  --title "feat(ui): UT-SDK-07 Skill Creator に approval:request 確認 UI を追加" \
  --body "..." \
  --base main
```

---

## PR 詳細情報

| 項目          | 値                                                                     |
| ------------- | ---------------------------------------------------------------------- |
| タイトル      | `feat(ui): UT-SDK-07 Skill Creator に approval:request 確認 UI を追加` |
| base ブランチ | `main`                                                                 |
| 関連 Issue    | #1694                                                                  |
| テスト        | 25/25 PASS                                                             |
| 型チェック    | 0 errors                                                               |

## PR ボディ

```markdown
## Summary

- `approval:request` IPC イベントを受信する preload `onApprovalRequest` リスナーを追加
- 承認リクエスト確認 UI `ApprovalRequestPanel` を新規作成（pending/resolving/expired 状態、TTL カウントダウン）
- `SkillLifecyclePanel` に統合し、approve/reject が `respondToApproval()` へ接続
- `ApprovalRequestPayload` を shared 正本へ移管し、preload / renderer / main の型を統一
- Phase 11 の visual evidence を Playwright ハーネスで保存

## Changes

- `apps/desktop/src/preload/skill-creator-api.ts`: `ApprovalRequestPayload` 型・`onApprovalRequest` 追加
- `apps/desktop/src/preload/types.ts`: `ExecutionAPI.onApprovalRequest` を shared 型へ同期
- `apps/desktop/src/main/ipc/approvalHandlers.ts`: `pushApprovalRequest` の引数型を shared に統一
- `packages/shared/src/types/skillCreator.ts` / `packages/shared/src/types/index.ts`: `ApprovalRequestPayload` canonical export を追加
- `apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx`: 新規作成
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`: approval 統合
- `apps/desktop/src/renderer/phase11-approval-request-surface.*`: Phase 11 screenshot harness を追加
- `apps/desktop/electron.vite.config.ts` / `apps/desktop/package.json`: screenshot harness の build entry と script を追加
- `apps/desktop/scripts/capture-ut-sdk-07-approval-request-surface-phase11.mjs`: 6 状態の screenshot を自動保存
- テスト 3 ファイル新規追加（25 tests）

## Test plan

- [ ] `pnpm --filter @repo/desktop test` → 25/25 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` → 0 errors
- [ ] `pnpm --filter @repo/desktop screenshot:ut-sdk-07-approval-request-surface` → 6 枚の screenshot capture
- [ ] Electron アプリ起動後、Main から `pushApprovalRequest` を発火して UI 表示を確認
- [ ] 承認ボタン・拒否ボタンの動作確認
- [ ] TTL 300s 後の expired 状態確認

Closes #1694

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

---

## 注意事項

- ワークツリーブランチ（`task-20260406-184233-wt-4`）からの PR となります
- PR 作成前に `pnpm --filter @repo/desktop test` の最終確認を推奨します

## 完了確認

- [x] PR コマンドを準備
- [x] PR 詳細情報を記録
- [x] ユーザー承認待ちステータスを明記
- [x] 本Phase内の全タスクを100%実行完了
