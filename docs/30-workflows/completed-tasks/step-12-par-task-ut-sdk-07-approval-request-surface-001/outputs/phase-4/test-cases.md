# Phase 4 成果物: テストケース一覧

## テストファイル配置計画

| テストファイル                                                                               | テスト対象                          | 優先度 |
| -------------------------------------------------------------------------------------------- | ----------------------------------- | ------ |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | onApprovalRequest listener          | 高     |
| `apps/desktop/src/renderer/components/skill/__tests__/ApprovalRequestPanel.test.tsx`         | ApprovalRequestPanel コンポーネント | 高     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | approval 受信フロー統合             | 高     |

---

## TC-001〜TC-003: preload listener テスト

### TC-001: approval:request イベント受信で callback を呼び出す

- **ファイル**: `skill-creator-api.approval.test.ts`
- **対象**: `skillCreatorAPI.onApprovalRequest`
- **前提条件**: `ipcRenderer.on` をモック済み
- **期待結果**: `APPROVAL_REQUEST` チャネルで ipcRenderer.on が登録され、イベント発火時に callback が payload と共に呼ばれる

### TC-002: cleanup 関数が listener を解除する

- **ファイル**: `skill-creator-api.approval.test.ts`
- **対象**: `skillCreatorAPI.onApprovalRequest` の戻り値（cleanup 関数）
- **前提条件**: listener 登録後に cleanup() を呼び出す
- **期待結果**: `ipcRenderer.removeListener` が `APPROVAL_REQUEST` チャネルで呼ばれる

### TC-003: ApprovalRequestPayload のフィールドが正しく渡される

- **ファイル**: `skill-creator-api.approval.test.ts`
- **対象**: callback の引数型
- **前提条件**: `{ sessionId, operationId, operationType, description, destination }` を含む payload
- **期待結果**: callback が全フィールドを含む payload オブジェクトを受け取る

---

## TC-004〜TC-007: ApprovalRequestPanel 状態テスト

### TC-004: pending 状態でツール名・説明が表示される

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: pending 状態の描画
- **前提条件**: `request` に `{ operationType, description }` を渡す
- **期待結果**: operationType と description が画面に表示される

### TC-005: pending 状態で承認・拒否ボタンが有効

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: ボタンの enabled 状態
- **前提条件**: pending 状態（期限内）
- **期待結果**: 承認ボタン・拒否ボタンが disabled=false

### TC-006: expired 状態で承認・拒否ボタンが無効化される

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: expired 状態のボタン
- **前提条件**: TTL を過ぎた状態（vi.useFakeTimers で時間を進める）
- **期待結果**: 承認ボタン・拒否ボタンが disabled=true、期限切れメッセージが表示される

### TC-007: null request の場合は何も表示しない

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: null 状態の描画
- **前提条件**: `request={null}`
- **期待結果**: コンポーネントが何も描画しない（null return）

---

## TC-008〜TC-011: approve/reject 操作テスト

### TC-008: 承認ボタンクリックで onApprove(sessionId, operationId) が呼ばれる

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: 承認ボタンの onClick ハンドラ
- **前提条件**: `onApprove` をモック関数として渡す
- **期待結果**: `onApprove` が `sessionId` と `operationId` を引数として呼ばれる

### TC-009: 拒否ボタンクリックで onReject(sessionId, operationId) が呼ばれる

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: 拒否ボタンの onClick ハンドラ
- **前提条件**: `onReject` をモック関数として渡す
- **期待結果**: `onReject` が `sessionId` と `operationId` を引数として呼ばれる

### TC-010: resolving 中はボタンが無効化される（二重送信防止）

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: resolving 状態のボタン
- **前提条件**: onApprove が Promise を返し、解決前の状態
- **期待結果**: resolving 中は承認・拒否ボタンが disabled=true

### TC-011: destination がある場合は送信先を表示する

- **ファイル**: `ApprovalRequestPanel.test.tsx`
- **対象**: destination フィールドの表示
- **前提条件**: `request.destination` に値がある
- **期待結果**: 送信先テキストが表示される

---

## TC-012〜TC-015: SkillLifecyclePanel 統合テスト

### TC-012: onApprovalRequest イベント受信時に ApprovalRequestPanel が表示される

- **ファイル**: `SkillLifecyclePanel.approval.test.tsx`
- **対象**: onApprovalRequest → UI 表示フロー
- **前提条件**: `skillCreatorAPI.onApprovalRequest` をモックし、コールバックを手動発火
- **期待結果**: `ApprovalRequestPanel` が render され、data-testid が見つかる

### TC-013: approve 操作で respondToApproval("approve") が呼ばれる

- **ファイル**: `SkillLifecyclePanel.approval.test.tsx`
- **対象**: 承認ボタン → respondToApproval 接続
- **前提条件**: approval request が表示された状態で承認ボタンをクリック
- **期待結果**: `respondToApproval(sessionId, operationId, "approve")` が呼ばれる

### TC-014: reject 操作で respondToApproval("reject") が呼ばれる

- **ファイル**: `SkillLifecyclePanel.approval.test.tsx`
- **対象**: 拒否ボタン → respondToApproval 接続
- **前提条件**: approval request が表示された状態で拒否ボタンをクリック
- **期待結果**: `respondToApproval(sessionId, operationId, "reject")` が呼ばれる

### TC-015: approval 解決後に ApprovalRequestPanel が非表示になる

- **ファイル**: `SkillLifecyclePanel.approval.test.tsx`
- **対象**: 解決後の UI 状態
- **前提条件**: 承認または拒否操作完了後
- **期待結果**: ApprovalRequestPanel が画面から消える

---

## 実装フェーズ分類

| TC             | 実装Phase           |
| -------------- | ------------------- |
| TC-001〜TC-003 | Phase 4（先行作成） |
| TC-004〜TC-011 | Phase 4（先行作成） |
| TC-012〜TC-015 | Phase 4（先行作成） |

## 完了確認

- [x] preload listener テストケースが設計されている（TC-001〜TC-003）
- [x] ApprovalRequestPanel コンポーネントテストケースが設計されている（TC-004〜TC-011）
- [x] SkillLifecyclePanel 統合テストケースが設計されている（TC-012〜TC-015）
- [x] テストファイルの配置計画が確定している
- [x] 本Phase内の全タスクを100%実行完了
