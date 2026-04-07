# 統合テスト計画 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 4

---

## IPC 疎通テスト計画

### シナリオ: Main Process → Preload → Renderer の end-to-end

| ステップ | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 1        | Main Process が `mainWindow.webContents.send(APPROVAL_REQUEST, payload)` を送信        |
| 2        | Preload の `safeOn` listener が受信し callback を呼び出す                              |
| 3        | Renderer の `onApprovalRequest` callback が `pendingApproval` state を更新             |
| 4        | `ApprovalSheet` が表示される                                                           |
| 5        | ユーザーが approve → `respondToApproval(sessionId, operationId, 'approve')` が呼ばれる |

### 自動テストカバレッジ

Unit テスト（TC-APPR-01〜10）で以下をカバー：

- Preload 層の `safeOn` 呼び出し
- Renderer 層の callback 受信・UI 表示
- approve/reject → respondToApproval 接続
- cleanup（アンマウント時の unsubscribe）

### 手動テスト（Phase 11）

Electron アプリを起動して実地確認：

- `pnpm --filter @repo/desktop dev`
- Main Process から `approval:request` を送信
- `SkillLifecyclePanel` に approve/reject ボタンが表示されることを確認
