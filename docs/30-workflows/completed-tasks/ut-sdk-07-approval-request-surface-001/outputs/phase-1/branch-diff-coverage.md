# ブランチ差分カバレッジ - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

---

## 変更対象ブランチ差分

このタスクで変更が必要なファイルと、変更が不要なファイルを確認する。

### 変更必要ファイル

| ファイルパス                                                         | 変更理由                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | `SkillCreatorAPI` interface に `onApprovalRequest` 欠落 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | approval request の消費・UI 表示が未接続                |

### 変更不要ファイル（確認済み）

| ファイルパス                                    | 確認内容                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`          | `ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` 登録済み（line 777） |
| `packages/shared/src/ipc/channels.ts`           | `APPROVAL_CHANNELS` 定義済み                                     |
| `apps/desktop/src/main/ipc/approvalHandlers.ts` | Main Process 側 push 実装済み・変更不要                          |
| `apps/desktop/src/preload/index.ts`             | `onApprovalRequest` 参照実装存在・変更不要                       |

### 新規作成ファイル（テスト）

| ファイルパス                                                                                 | 説明                       |
| -------------------------------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | TC-APPR-01〜10 Unit テスト |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | TC-APPR-06〜10 Unit テスト |

---

## 差分影響範囲

- **型エラーリスク**: `SkillCreatorRuntimeApi` 型（SkillLifecyclePanel.tsx 内 local alias）に `onApprovalRequest` を追加する必要がある
- **payload 型の drift リスク**: local alias と実 IPC payload の shape が乖離しないように確認
- **二重表示リスク**: `SkillLifecyclePanel.tsx` に既存 approval UI がないことを確認済み → `pendingApproval` state を新規追加
