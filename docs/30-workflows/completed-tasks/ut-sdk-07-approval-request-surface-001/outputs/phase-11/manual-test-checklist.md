# Phase 11 - 手動テストチェックリスト

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 11 手動テストチェックリスト。
Visual TC は worktree 環境制約により CAPTURE_BLOCKED。NonVisual TC はユニットテスト代替 PASS。

---

## Visual テストケース（TC-11-UI-01〜04）

> **環境制約**: worktree 環境では Electron アプリ起動不可。スクリーンショット撮影 CAPTURE_BLOCKED。

| テストケース | 機能                    | 期待結果                                                            | 結果            | 備考              |
| ------------ | ----------------------- | ------------------------------------------------------------------- | --------------- | ----------------- |
| TC-11-UI-01  | 承認要求ダイアログ表示  | AI が操作を要求した際に ApprovalSheet が画面中央に表示される        | CAPTURE_BLOCKED | worktree 環境制約 |
| TC-11-UI-02  | 承認後の画面状態        | 「承認」ボタン押下後 ApprovalSheet が消え、ワークフローが継続される | CAPTURE_BLOCKED | worktree 環境制約 |
| TC-11-UI-03  | 拒否後の画面状態        | 「拒否」ボタン押下後 ApprovalSheet が消え、ワークフローが停止される | CAPTURE_BLOCKED | worktree 環境制約 |
| TC-11-UI-04  | Disclosure 情報付き表示 | disclosure 情報が ApprovalSheet 内に表示される                      | CAPTURE_BLOCKED | worktree 環境制約 |

---

## NonVisual テストケース（NV-11-01〜03）

> **代替 evidence**: TC-APPR-06〜18（vitest 19/19 PASS）をユニットテスト代替として使用。

| テストケース | 機能               | 期待結果                                                        | 結果       | 代替証跡                    |
| ------------ | ------------------ | --------------------------------------------------------------- | ---------- | --------------------------- |
| NV-11-01     | IPC 疎通確認       | `onApprovalRequest` が IPC イベントを受信してコールバックを呼ぶ | PASS(unit) | TC-APPR-07 代替             |
| NV-11-02     | cleanup 確認       | コンポーネントアンマウント時に購読が解除される                  | PASS(unit) | TC-APPR-10 代替             |
| NV-11-03     | セッション継続確認 | approval 完了後も購読が継続されワークフロー実行が継続する       | PASS       | TC-APPR-15 購読継続確認済み |

---

## チェックリスト判定

| 分類      | 件数 | PASS | CAPTURE_BLOCKED | FAIL |
| --------- | ---- | ---- | --------------- | ---- |
| Visual    | 4    | 0    | 4               | 0    |
| NonVisual | 3    | 3    | 0               | 0    |
| **合計**  | 7    | 3    | 4               | 0    |

---

## CAPTURE_BLOCKED 対応

CAPTURE_BLOCKED（TC-11-UI-01〜04）は `docs/30-workflows/unassigned-task/ut-sdk-07-approval-request-surface-001-phase11-screenshot.md` に未タスクとして記録済み。

実環境での撮影手順:

```bash
pnpm --filter @repo/desktop preview
# その後、Playwright capture script を実行
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/ut-sdk-07-approval-request-surface-001 \
  --plan outputs/phase-11/screenshot-plan.json
```

---

_作成日: 2026-04-06_
_Phase 11 手動テスト検証_
