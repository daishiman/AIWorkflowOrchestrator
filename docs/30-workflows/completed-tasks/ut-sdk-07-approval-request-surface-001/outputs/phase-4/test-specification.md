# テスト仕様書 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 4

---

## テストファイル

| ファイル                                                                                     | 対象                                | TC数                                |
| -------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------- |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | `skillCreatorAPI.onApprovalRequest` | 6 (TC-APPR-01〜05 + channel 値確認) |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | `SkillLifecyclePanel` approval UI   | 5 (TC-APPR-06〜10)                  |

---

## TC一覧と手順詳細

### TC-APPR-01: onApprovalRequest メソッド存在確認

- **対象**: `skillCreatorAPI.onApprovalRequest`
- **手順**: `typeof skillCreatorAPI.onApprovalRequest` を確認
- **期待**: `'function'`

### TC-APPR-02: 正しいチャンネルで購読する

- **対象**: `skillCreatorAPI.onApprovalRequest`
- **手順**: `onApprovalRequest(callback)` 呼び出し後、`ipcRenderer.on` の呼び出し引数を確認
- **期待**: `ipcRenderer.on` が `'approval:request'` チャンネルで呼ばれる

### TC-APPR-03: コールバックが payload を受け取る

- **対象**: `skillCreatorAPI.onApprovalRequest`
- **手順**: listener を取得し手動 emit する
- **期待**: callback が `{ operationType, description, destination?, sessionId, operationId }` を受け取る

### TC-APPR-04: アンサブスクライブ関数を返す

- **対象**: `onApprovalRequest` の戻り値
- **手順**: `const unsubscribe = onApprovalRequest(callback)` を実行
- **期待**: `typeof unsubscribe === 'function'`

### TC-APPR-05: アンサブスクライブ後に removeListener が呼ばれる

- **対象**: `onApprovalRequest` の unsubscribe 動作
- **手順**: `unsubscribe()` 呼び出し後、`ipcRenderer.removeListener` の呼び出しを確認
- **期待**: `ipcRenderer.removeListener` が `'approval:request'` で呼ばれる

### TC-APPR-06: SkillLifecyclePanel が onApprovalRequest を購読する

- **対象**: `SkillLifecyclePanel` マウント時
- **手順**: `window.skillCreatorAPI.onApprovalRequest` を mock してレンダリング
- **期待**: `onApprovalRequest` が 1 回呼ばれる

### TC-APPR-07: approval request 受信時に UI が表示される

- **対象**: `SkillLifecyclePanel` approval UI
- **手順**: callback を trigger して payload を渡す
- **期待**: `data-testid="approval-sheet"` が DOM に表示される

### TC-APPR-08: approve ボタンで respondToApproval(approve) が呼ばれる

- **手順**: approve ボタンをクリック
- **期待**: `respondToApproval(sessionId, operationId, 'approve')` が呼ばれる

### TC-APPR-09: reject ボタンで respondToApproval(reject) が呼ばれる

- **手順**: reject ボタンをクリック
- **期待**: `respondToApproval(sessionId, operationId, 'reject')` が呼ばれる

### TC-APPR-10: アンマウント時に unsubscribe が呼ばれる

- **手順**: `unmount()` 実行
- **期待**: `onApprovalRequest` が返した unsubscribe 関数が 1 回呼ばれる

---

## private method テスト方針

**採用方針**: 方針B（public interface 経由）

- `ipcRenderer.on` を mock して `safeOn` 呼び出しを間接確認
- public interface 経由のテストとして整合
