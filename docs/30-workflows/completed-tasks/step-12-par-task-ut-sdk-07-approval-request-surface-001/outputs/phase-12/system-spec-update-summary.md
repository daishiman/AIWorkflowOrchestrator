# Phase 12 成果物: システム仕様更新サマリー

## 更新日: 2026-04-06

## 追加されたシステム仕様

### 1. Preload API 拡張

**対象**: `SkillCreatorAPI` インターフェース（`skill-creator-api.ts`）

| 追加項目                 | 型                         | 説明                                          |
| ------------------------ | -------------------------- | --------------------------------------------- |
| `onApprovalRequest`      | `(callback) => () => void` | Main→Renderer の承認リクエスト受信リスナー    |
| `ApprovalRequestPayload` | shared export / alias      | 承認リクエストのペイロード型（正本は shared） |

`ApprovalRequestPayload` フィールド:

| フィールド      | 型       | 必須 | 説明                           |
| --------------- | -------- | ---- | ------------------------------ |
| `sessionId`     | `string` | ✓    | セッション識別子               |
| `operationId`   | `string` | ✓    | 操作識別子（単一利用トークン） |
| `operationType` | `string` | ✓    | 操作種別（例: `file_write`）   |
| `description`   | `string` | ✓    | 操作の説明文                   |
| `destination`   | `string` | -    | 操作対象先（省略可）           |

### 2. UI コンポーネント追加

**対象**: `ApprovalRequestPanel.tsx`（新規）

| Props       | 型                               | 説明                       |
| ----------- | -------------------------------- | -------------------------- |
| `request`   | `ApprovalRequestPayload \| null` | null の場合は非表示        |
| `onApprove` | `() => void`                     | 承認ボタン押下コールバック |
| `onReject`  | `() => void`                     | 拒否ボタン押下コールバック |

UI 状態機械:

```
null → (非表示)
pending → 承認/拒否ボタン有効
resolving → 承認/拒否ボタン無効（二重送信防止）
expired → 承認/拒否ボタン無効 + 期限切れメッセージ
```

TTL: `APPROVAL_TTL_MS = 300_000`（300秒。`ApprovalGate.ts` の TTL と同値）

### 3. SkillLifecyclePanel 仕様追加

**対象**: `SkillLifecyclePanel.tsx`（変更）

| 追加仕様                      | 内容                                                    |
| ----------------------------- | ------------------------------------------------------- |
| approval state                | `approvalRequest: ApprovalRequestPayload \| null`       |
| onApprovalRequest 登録        | `useEffect` でリスナー登録、cleanup 付き                |
| respondToApproval 呼び出し    | approve: `action="approve"`, reject: `action="reject"`  |
| ApprovalRequestPanel 表示条件 | `approvalRequest !== null` のとき表示                   |
| 失敗時の挙動                  | `success:false` なら `localError` を表示して panel 維持 |

## 変更なし（スコープ外）

| 項目                            | 理由                              |
| ------------------------------- | --------------------------------- |
| `IPC_CHANNELS.APPROVAL_REQUEST` | 既存定義を使用                    |
| `ALLOWED_ON_CHANNELS` への登録  | 既存登録済み（行777）             |
| `respondToApproval` 実装        | 既実装、変更なし                  |
| `approvalHandlers.ts`           | ロジック変更なし、shared 型を使用 |
| `ApprovalGate.ts`               | 変更なし                          |

## 完了確認

- [x] Preload API 仕様更新を記述
- [x] UI コンポーネント仕様を記述
- [x] SkillLifecyclePanel 仕様追加を記述
- [x] スコープ外項目を明記
- [x] 本Phase内の全タスクを100%実行完了
