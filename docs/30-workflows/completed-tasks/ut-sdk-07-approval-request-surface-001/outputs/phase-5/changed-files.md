# 変更ファイル一覧 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 5

---

## 修正ファイル

| ファイルパス                                                         | 変更種別 | 変更概要                                                                        |
| -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | 修正     | `SkillCreatorAPI` interface + `skillCreatorAPI` 実装に `onApprovalRequest` 追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 修正     | `onApprovalRequest` 購読・`ApprovalSheet` 再利用・approve/reject・cleanup       |

## 新規ファイル（テスト）

| ファイルパス                                                                                 | 変更種別 | 変更概要                   |
| -------------------------------------------------------------------------------------------- | -------- | -------------------------- |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | 新規     | TC-APPR-01〜05 Unit テスト |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | 新規     | TC-APPR-06〜10 Unit テスト |

## 変更なし（確認済み）

| ファイルパス                                    | 理由                           |
| ----------------------------------------------- | ------------------------------ |
| `apps/desktop/src/preload/channels.ts`          | `ALLOWED_ON_CHANNELS` 登録済み |
| `packages/shared/src/ipc/channels.ts`           | `APPROVAL_CHANNELS` 定義済み   |
| `apps/desktop/src/main/ipc/approvalHandlers.ts` | Main 側変更不要                |
| `apps/desktop/src/preload/index.ts`             | 参照実装・変更不要             |
