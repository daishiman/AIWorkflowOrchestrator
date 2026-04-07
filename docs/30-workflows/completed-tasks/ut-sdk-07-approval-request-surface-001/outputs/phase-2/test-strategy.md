# テスト戦略 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 2

---

## テスト種別と対象

| テスト種別  | 対象                      | 戦略                                                   | ファイル                                          |
| ----------- | ------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| Unit        | `skill-creator-api.ts`    | `ipcRenderer` を mock して `safeOn` 呼び出しを間接確認 | `__tests__/skill-creator-api.approval.test.ts`    |
| Unit        | `SkillLifecyclePanel.tsx` | `onApprovalRequest` 接続・UI 表示・cleanup             | `__tests__/SkillLifecyclePanel.approval.test.tsx` |
| Integration | Preload → Renderer 疎通   | IPC push → callback 呼び出し                           | -                                                 |

---

## private method テスト方針

`safeOn` は `skill-creator-api.ts` 内の private 関数。

**採用方針: 方針B**（public interface 経由）

- `skillCreatorAPI.onApprovalRequest(callback)` を呼び出す
- `ipcRenderer.on` が `'approval:request'` チャンネルで呼ばれることを確認
- IPC イベントを emit して callback が呼ばれることを確認

---

## mock 設計

### `electron` mock（`skill-creator-api.test.ts`）

```typescript
vi.mock("electron", () => ({
  ipcRenderer: {
    on: vi.fn(),
    removeListener: vi.fn(),
    invoke: vi.fn(),
  },
}));
```

### `window.skillCreatorAPI` mock（`SkillLifecyclePanel.test.tsx`）

```typescript
const mockOnApprovalRequest = vi.fn();
const mockRespondToApproval = vi.fn();
Object.defineProperty(window, "skillCreatorAPI", {
  value: {
    onApprovalRequest: mockOnApprovalRequest,
    respondToApproval: mockRespondToApproval,
    // ...その他必要なメソッド
  },
  writable: true,
});
```

---

## テストケース一覧（Phase 4 で実装）

### TC-APPR-01〜05: skill-creator-api.ts Unit テスト

| TC         | 観点                                                      |
| ---------- | --------------------------------------------------------- |
| TC-APPR-01 | `typeof skillCreatorAPI.onApprovalRequest === 'function'` |
| TC-APPR-02 | `ipcRenderer.on` が `'approval:request'` で呼ばれる       |
| TC-APPR-03 | callback が payload を受け取って呼ばれる                  |
| TC-APPR-04 | 戻り値が function（unsubscribe）                          |
| TC-APPR-05 | unsubscribe 後に `ipcRenderer.removeListener` が呼ばれる  |

### TC-APPR-06〜10: SkillLifecyclePanel.tsx Unit テスト

| TC         | 観点                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| TC-APPR-06 | レンダリング時に `onApprovalRequest` が呼ばれる                         |
| TC-APPR-07 | callback trigger で approval-sheet が表示される                         |
| TC-APPR-08 | approve ボタンで `respondToApproval(sessionId, operationId, 'approve')` |
| TC-APPR-09 | reject ボタンで `respondToApproval(sessionId, operationId, 'reject')`   |
| TC-APPR-10 | アンマウント時に unsubscribe が呼ばれる                                 |
