# Phase 11 - スクリーンショット撮影計画

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 11 スクリーンショット撮影計画（narrative）。

---

## CAPTURE_BLOCKED 理由

本 Phase 11 は worktree 環境（`task-20260406-201859-wt-9`）で実行している。
worktree 環境では Electron デスクトップアプリを起動できないため、スクリーンショット撮影が不可能。

具体的な blockerは以下の通り:

1. `pnpm --filter @repo/desktop preview` が Electron バイナリを要求するが、worktree 環境では Electron プロセスを正常起動できない
2. Playwright の Electron 統合（`electron.launch()`）が worktree 環境では動作しない
3. スクリーンショット撮影スクリプト（`capture-screenshots.js`）は上記 Electron 起動に依存している

---

## 代替 Evidence

CAPTURE_BLOCKED の代替として、以下のユニットテスト結果を evidence として採用する。

### 主要証跡ソース

| 証跡                                                                                         | 内容                              | 状態       |
| -------------------------------------------------------------------------------------------- | --------------------------------- | ---------- |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | TC-APPR-06〜18（11件）vitest PASS | PASS 19/19 |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | TC-APPR-01〜05（8件）vitest PASS  | PASS 19/19 |

### Visual TC との対応

| Visual TC   | 対応するユニットテスト | カバー内容                                             |
| ----------- | ---------------------- | ------------------------------------------------------ |
| TC-11-UI-01 | TC-APPR-07, 08         | IPC 受信 → pendingApproval セット → ApprovalSheet 表示 |
| TC-11-UI-02 | TC-APPR-09, 16         | handleApprove → pendingApproval リセット               |
| TC-11-UI-03 | TC-APPR-17             | handleReject → pendingApproval リセット                |
| TC-11-UI-04 | TC-APPR-08             | ApprovalSheet レンダリング（disclosure 含む）          |

---

## 将来の撮影手順

worktree 制約が解消された環境（または main ブランチ上）では以下で撮影可能:

```bash
# Step 1: デスクトップアプリ起動
pnpm --filter @repo/desktop preview

# Step 2: スクリーンショット撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/ut-sdk-07-approval-request-surface-001 \
  --plan outputs/phase-11/screenshot-plan.json

# 出力先: outputs/phase-11/screenshots/
# - TC-11-UI-01-approval-request.png
# - TC-11-UI-02-after-approve.png
# - TC-11-UI-03-after-reject.png
# - TC-11-UI-04-with-disclosure.png
```

---

## 未タスク記録

本 blocker は `docs/30-workflows/unassigned-task/ut-sdk-07-approval-request-surface-001-phase11-screenshot.md` に記録済み。

---

_作成日: 2026-04-06_
_Phase 11 手動テスト検証_
