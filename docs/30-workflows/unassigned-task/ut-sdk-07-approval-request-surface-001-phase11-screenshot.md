# 未タスク: UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 11 スクリーンショット撮影

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスク ID    | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001-PHASE11-SCREENSHOT |
| Issue        | daishiman/AIWorkflowOrchestrator#1981                     |
| 発生元タスク | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001                    |
| 発生フェーズ | Phase 11（手動テスト検証）                                |
| 発生日       | 2026-04-06                                                |
| 優先度       | 低                                                        |
| 種別         | 環境制約 / CAPTURE_BLOCKED                                |

---

## 内容

### 問題

worktree 環境（`task-20260406-201859-wt-9`）では Electron アプリを起動できないため、
Phase 11 の Visual テストケース（TC-11-UI-01〜04）のスクリーンショット撮影が実施できなかった。

### CAPTURE_BLOCKED の詳細

- `pnpm --filter @repo/desktop preview` が Electron バイナリを要求するが、worktree 環境では起動不可
- Playwright の `electron.launch()` も同様に動作しない
- スクリーンショット撮影スクリプト（`capture-screenshots.js`）は上記 Electron 起動に依存

### 影響範囲

| テストケース | 状態            | 内容                        |
| ------------ | --------------- | --------------------------- |
| TC-11-UI-01  | CAPTURE_BLOCKED | 承認要求ダイアログ表示確認  |
| TC-11-UI-02  | CAPTURE_BLOCKED | 承認後の画面状態確認        |
| TC-11-UI-03  | CAPTURE_BLOCKED | 拒否後の画面状態確認        |
| TC-11-UI-04  | CAPTURE_BLOCKED | Disclosure 情報付き表示確認 |

---

## 代替 Evidence（実施済み）

ユニットテスト（TC-APPR-06〜18、vitest 19/19 PASS）により動作は確認済み:

| ユニットテスト | 対応する Visual TC | カバー内容                               |
| -------------- | ------------------ | ---------------------------------------- |
| TC-APPR-07, 08 | TC-11-UI-01        | IPC 受信 → ApprovalSheet 表示            |
| TC-APPR-09, 16 | TC-11-UI-02        | handleApprove → pendingApproval リセット |
| TC-APPR-17     | TC-11-UI-03        | handleReject → pendingApproval リセット  |
| TC-APPR-08     | TC-11-UI-04        | ApprovalSheet レンダリング               |

---

## 再実施手順

環境制約が解消された際の実施手順:

```bash
# Step 1: 実環境（非 worktree または main ブランチ）でデスクトップアプリ起動
pnpm --filter @repo/desktop preview

# Step 2: スクリーンショット撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/ut-sdk-07-approval-request-surface-001 \
  --plan outputs/phase-11/screenshot-plan.json

# 出力先
# outputs/phase-11/screenshots/TC-11-UI-01-approval-request.png
# outputs/phase-11/screenshots/TC-11-UI-02-after-approve.png
# outputs/phase-11/screenshots/TC-11-UI-03-after-reject.png
# outputs/phase-11/screenshots/TC-11-UI-04-with-disclosure.png
```

---

## 苦戦箇所

| 苦戦内容                                     | 再発条件                                       | 予防策                                              |
| -------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| worktree 環境で Electron 起動不可            | worktree ブランチで Phase 11 を実施した場合    | Phase 11 着手前に Electron 起動可否を事前確認する   |
| CAPTURE_BLOCKED 対応の判断基準が不明確だった | スクリーンショット要求 task の Phase 11 実施時 | ガイドライン（ダミー PNG 禁止・未タスク記録）を参照 |

---

_登録日: 2026-04-06_
_発生元: UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 11_
