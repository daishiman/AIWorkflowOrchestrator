# Phase 1 成果物: 要件定義書

## P50チェック結果

### 調査実施日: 2026-04-06

### 調査ファイルと結果

| ファイル                                                             | 調査内容                     | 結果                                                                                                 |
| -------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`                               | APPROVAL_REQUEST 定数の確認  | **確認済み** – 行412: `APPROVAL_REQUEST: APPROVAL_CHANNELS.APPROVAL_REQUEST`                         |
| `apps/desktop/src/preload/channels.ts`                               | ALLOWED_ON_CHANNELS への登録 | **確認済み** – 行777: `IPC_CHANNELS.APPROVAL_REQUEST` がリスト済み                                   |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | respondToApproval の実装     | **実装済み** – 行663-673: `(sessionId, operationId, action)` で `APPROVAL_RESPOND` チャネルを invoke |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | onApprovalRequest の有無     | **未実装** – interface にも実装にも存在しない                                                        |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | approval 受信コードの有無    | **未実装** – approval:request イベントを受信するコードなし                                           |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`                      | Main 側 approval handler     | **実装済み** – pushApprovalRequest / registerApprovalHandlers 実装済み                               |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts`             | TTL・ApprovalRequest 型      | **実装済み** – TTL 300s、single-use 制約あり                                                         |

### P50 判定: **未実装（想定どおり）**

- `onApprovalRequest` が preload になく、approval UI も存在しない
- Phase 2 で設計を新規策定して進行

---

## approval:request push ペイロード仕様

`approvalHandlers.ts` の `pushApprovalRequest` が送信するペイロード:

```typescript
interface ApprovalRequestPayload {
  sessionId: string;
  operationId: string;
  operationType: string;
  description: string;
  destination?: string;
}
```

## respondToApproval 既実装の型シグネチャ

```typescript
respondToApproval: (
  sessionId: string,
  operationId: string,
  action: "approve" | "reject",
) => Promise<IpcResult<unknown>>;
```

## TTL 仕様

| 項目         | 値                                                    |
| ------------ | ----------------------------------------------------- |
| TTL          | 300 秒                                                |
| 単一使用     | あり（使用後 token 無効化）                           |
| 期限切れ動作 | entry 削除 → `{ approved: false, reason: "expired" }` |

---

## 受入条件（確定）

| AC   | 条件                                                         | 検証方法                    |
| ---- | ------------------------------------------------------------ | --------------------------- |
| AC-1 | `approval:request` onEvent が preload に登録されている       | コードレビュー / UT         |
| AC-2 | Renderer に approval 確認 UI が表示される                    | 手動テスト / screenshot     |
| AC-3 | approve/reject 操作が `respondToApproval()` と接続されている | UT / 統合テスト             |
| AC-4 | AC-4 enforcement の手動テスト screenshot あり                | Phase 11 スクリーンショット |

---

## スコープ境界（確定）

### 含む

- `approval:request` onEvent listener の preload 追加（`skill-creator-api.ts`）
- `SkillCreatorAPI` interface への `onApprovalRequest` 追加
- approval 確認 UI コンポーネントの実装（`ApprovalRequestPanel.tsx` 新規作成）
- `SkillLifecyclePanel.tsx` への approval 受信・表示・respondToApproval 接続
- TTL expired 時の警告表示とボタン無効化

### 含まない

- approval TTL 値の変更（`ApprovalGate.ts` は変更しない）
- Main 側の `approvalHandlers.ts` 変更（既に実装済み）
- 新規 IPC チャンネルの追加（既存 `APPROVAL_REQUEST` を使用）
- `packages/shared` の `ApprovalRequest` 型追加（ペイロード型は preload 内で定義）

---

## システム仕様との整合確認

- IPC 4層: `APPROVAL_REQUEST` は channels.ts・ALLOWED_ON_CHANNELS に既登録。preload 受信 listener の追加のみ必要
- セキュリティ: approval なしに危険操作が通過しないよう、UI が approve/reject を選択するまで respondToApproval を呼ばない設計
- TTL: 300s 超過で expired 状態に遷移し、ボタン無効化

---

## 完了確認

- [x] P50チェックで全対象ファイルの現状を確認した
- [x] `APPROVAL_REQUEST` channel 定数が確認できた
- [x] `respondToApproval()` が実装済みであることを確認した
- [x] `onApprovalRequest` が未実装であることを確認した
- [x] TTL 仕様（300s、single-use）を把握した
- [x] AC-1〜AC-4 が検証可能な形で確定している
- [x] 含む / 含まないが明確に確定している
- [x] 本Phase内の全タスクを100%実行完了
