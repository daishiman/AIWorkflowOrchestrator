# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 6                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

Phase 5 の実装に対し、fail path・エッジケース・revokeAll() 拡充テストを追加する。
テストカバレッジ目標（Line 80%+、Branch 60%+、Function 80%+）を達成する。

## 実行タスク

- sender 検証、destroyed window、無効 sessionId の fail path を追加する
- revokeAll() の多重呼び出し、未存在セッション、abort/done 両経路を確認する
- push 通知の未購読時・購読解除時・payload 妥当性を確認する
- テスト拡充後にカバレッジ差分を採取し、Phase 7 の判定材料を揃える

### 1. fail path テスト追加

#### 1.1 approvalHandlers の fail path

```typescript
describe("approvalHandlers - fail paths", () => {
  it("should reject requests from unauthorized sender", () => {
    // event.sender !== mainWindow.webContents の場合
    // { success: false, error: { code: 'UNAUTHORIZED' } } を返すこと
  });

  it("should reject empty sessionId", () => {
    // sessionId が空文字の場合
    // { success: false, error: { code: 'VALIDATION_ERROR' } } を返すこと
  });

  it("should reject invalid action", () => {
    // action が 'approve'/'reject' 以外の場合
    // VALIDATION_ERROR を返すこと
  });
});
```

#### 1.2 Preload execution API の fail path

```typescript
describe("execution API - fail paths", () => {
  it("should handle IPC timeout gracefully", () => {
    // safeInvoke のタイムアウト時に適切なエラーを返すこと
  });

  it("should handle IPC error response", () => {
    // Main Process からエラーレスポンスが返った場合の処理
  });
});
```

### 2. revokeAll() エッジケーステスト

```typescript
describe("revokeAll - edge cases", () => {
  it("should handle revokeAll with non-existent sessionId gracefully", () => {
    // 存在しない sessionId を渡してもエラーにならないこと
  });

  it("should revoke all tokens for the given sessionId", () => {
    // 複数トークンが存在する場合、全て無効化されること
  });

  it("should not revoke tokens for other sessions", () => {
    // 他セッションのトークンは影響を受けないこと
  });
});
```

### 3. Push 通知の拡充テスト

```typescript
describe("push notification - expanded", () => {
  it("should retry push when webContents is loading", async () => {
    // webContents がロード中の場合のハンドリング
  });

  it("should include all required fields in push payload", () => {
    // payload に operationType, description, destination, sessionId, operationId が含まれること
  });
});
```

### 4. テスト実行とカバレッジ確認

```bash
pnpm --filter @repo/desktop test -- --coverage \
  apps/desktop/src/main/ipc/__tests__/ \
  apps/desktop/src/preload/__tests__/
```

## 参照資料

| 参照資料             | パス                                        |
| -------------------- | ------------------------------------------- |
| Phase 4 テスト計画   | `outputs/phase-4/test-plan.md`              |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md` |

## 統合テスト連携【必須】

| 判定項目          | 基準    | 結果（実行時に記録） |
| ----------------- | ------- | -------------------- |
| 全テスト Green    | 全 pass | -                    |
| Line Coverage     | 80%+    | -                    |
| Branch Coverage   | 60%+    | -                    |
| Function Coverage | 80%+    | -                    |

## 成果物

| 成果物         | パス                                | 説明                 |
| -------------- | ----------------------------------- | -------------------- |
| テスト拡充記録 | `outputs/phase-6/test-expansion.md` | 追加テスト一覧と結果 |

## 完了条件

- [ ] fail path テストが追加されている（unauthorized, validation error）
- [ ] revokeAll() エッジケーステストが追加されている（3テスト以上）
- [ ] Push 通知拡充テストが追加されている（2テスト以上）
- [ ] 全テストが Green
- [ ] テストカバレッジが目標値を達成している
- [ ] `outputs/phase-6/test-expansion.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
