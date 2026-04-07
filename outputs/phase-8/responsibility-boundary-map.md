# Phase 8: 責務境界マップ

## UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 8

## レイヤー構成

```
Main Process (Electron)
  └── ApprovalHandler（main/handlers/approval-handler.ts）
        │ ipcRenderer.send("approval:request", payload)
        ▼
Preload Layer
  └── skill-creator-api.ts
        │ onApprovalRequest: (callback) => safeOn("approval:request", callback)
        │   ← IPC チャンネルのホワイトリスト制御
        │   ← listener ラッパーによる event object 隠蔽
        ▼
Renderer Layer
  └── SkillLifecyclePanel.tsx
        │ useEffect: skillCreatorApi.onApprovalRequest(payload => setPendingApproval(payload))
        │   ← pendingApproval state（コンポーネント内部に閉じている）
        │
        ├── handleApprove()
        │     └── respondToApproval(sessionId, operationId, "approve")
        │     └── setPendingApproval(null)
        │
        ├── handleReject()
        │     └── respondToApproval(sessionId, operationId, "reject")
        │     └── setPendingApproval(null)
        │
        └── {pendingApproval ? <ApprovalSheet ... /> : null}
              └── ApprovalSheet（execution/ApprovalSheet）
                    ├── data-testid="approval-sheet"
                    ├── data-testid="approval-approve"
                    └── data-testid="approval-reject"
```

## 責務境界の確認

| レイヤー            | 責務                                            | 境界違反 |
| ------------------- | ----------------------------------------------- | -------- |
| Main Process        | approval:request イベントを push する           | なし     |
| Preload             | チャンネルホワイトリスト制御・listener ラッパー | なし     |
| SkillLifecyclePanel | 購読・状態管理・ハンドラ定義                    | なし     |
| ApprovalSheet       | UI 表示のみ（ロジックなし）                     | なし     |

## pendingApproval state の閉じ込め確認

- `pendingApproval` は `SkillLifecyclePanel` の `useState` として定義
- props として下位コンポーネントに渡されない（ApprovalSheet は payload を個別 props で受け取る）
- context/store に露出していない
- グローバル変数としてエクスポートされていない

**結論**: 責務境界は適切に閉じており、漏れなし。
