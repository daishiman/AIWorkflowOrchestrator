# aiworkflow 仕様抽出結果 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

---

## 対象カテゴリ: IPC / Interface / Renderer / Preload

### IPC チャンネル確認

- **`APPROVAL_REQUEST` チャンネル**: `packages/shared/src/ipc/channels.ts` の `APPROVAL_CHANNELS.APPROVAL_REQUEST` として定義
- **`ALLOWED_ON_CHANNELS` 登録**: `apps/desktop/src/preload/channels.ts` line 777 に `IPC_CHANNELS.APPROVAL_REQUEST` が登録済み
- **変更不要**: channels.ts への追加は一切不要

### Interface 確認

- `SkillCreatorAPI` interface: `apps/desktop/src/preload/skill-creator-api.ts` 内に定義
- `getDisclosureInfo` (line 364) / `respondToApproval` (line 351) が既存メソッドとして存在
- `onApprovalRequest` は **欠落**（要追加）

### Renderer 確認

- `SkillLifecyclePanel.tsx` には `getSkillCreatorApi()` ヘルパーが存在（line 360〜371）
- `window.electronAPI?.skillCreator` と `window.skillCreatorAPI` の両方を吸収するパターンが実装済み
- `disclosureInfo` state が既存（line 490〜494）→ `ApprovalSheet` の disclosure props に流用可能
- `ApprovalSheet` コンポーネントは `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx` に存在
  - `operationType: "dangerous_operation" | "external_send"` の union 型
  - `onApprove` / `onReject` の callback を受け取る
  - `data-testid="approval-sheet"`, `data-testid="approval-approve"`, `data-testid="approval-reject"` が設定済み

### Preload 確認

- `safeOn` 関数: `skill-creator-api.ts` 内に private 実装済み（line 405〜423）
- `onWorkflowStateChanged` / `onAdapterStatusChanged` / `onOutputReady` が既存の `safeOn` 使用例として参照可能

---

## 追加確認事項: `normalizeApprovalOperationType` が必要

`ApprovalSheet.operationType` は `"dangerous_operation" | "external_send"` の union型。
IPC payload の `operationType: string` をこの union に変換する関数が必要。

```typescript
function normalizeApprovalOperationType(
  raw: string,
): "dangerous_operation" | "external_send" {
  if (raw === "external_send") return "external_send";
  return "dangerous_operation";
}
```

この関数は `SkillLifecyclePanel.tsx` 内に局所化する。

---

## 抽出漏れチェック結果

| カテゴリ                                | 確認 | 備考                                |
| --------------------------------------- | ---- | ----------------------------------- |
| IPC チャンネル定義                      | ✅   | APPROVAL_REQUEST 登録済み           |
| interface 欠落確認                      | ✅   | onApprovalRequest 欠落確認          |
| Renderer 消費先                         | ✅   | SkillLifecyclePanel + ApprovalSheet |
| Preload safeOn 実装                     | ✅   | 既存パターン確認済み                |
| payload shape                           | ✅   | local alias で閉じる方針確定        |
| `normalizeApprovalOperationType` 必要性 | ✅   | Phase 5 で実装                      |
