# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 4                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. テスト概要

### 1.1 テスト目的

PermissionResolver IPC Handlers機能の以下の観点を検証する:

1. **IPC通信**: Main ↔ Renderer間の権限確認リクエスト/レスポンス通信
2. **状態管理**: React Hookによるリクエストキューと表示状態の管理
3. **UIコンポーネント**: PermissionDialogの表示・操作・アクセシビリティ
4. **統合動作**: エンドツーエンドでの権限確認フロー

### 1.2 テスト戦略

| レイヤー  | テスト種別           | ツール                          |
| --------- | -------------------- | ------------------------------- |
| Main      | ユニットテスト       | Vitest + electron mock          |
| Preload   | ユニットテスト       | Vitest + ipcRenderer mock       |
| Hook      | ユニットテスト       | Vitest + @testing-library/react |
| Component | コンポーネントテスト | Vitest + @testing-library/react |
| 統合      | 統合テスト           | Vitest                          |

---

## 2. テストファイル構成

| テストファイル                                                                        | テスト対象       | テスト数（予定） |
| ------------------------------------------------------------------------------------- | ---------------- | ---------------- |
| `apps/desktop/src/main/ipc/__tests__/permission-handlers.test.ts`                     | IPC Handler      | 8                |
| `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`                     | Preload API      | 6                |
| `apps/desktop/src/renderer/hooks/__tests__/usePermissionDialog.test.ts`               | React Hook       | 10               |
| `apps/desktop/src/renderer/components/Permission/__tests__/PermissionDialog.test.tsx` | UIコンポーネント | 12               |
| `apps/desktop/src/__tests__/permission-integration.test.ts`                           | 統合テスト       | 8                |
| **合計**                                                                              |                  | **44**           |

---

## 3. テストカバレッジ目標

### 3.1 ユニットテスト

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 90%  |
| Branch Coverage   | 80%  |
| Function Coverage | 100% |

### 3.2 統合テスト

| 指標               | 目標 |
| ------------------ | ---- |
| IPC通信経路        | 100% |
| ユーザー操作パス   | 100% |
| エラーハンドリング | 80%+ |

---

## 4. モック戦略

### 4.1 Electronモック

```typescript
// Main Process
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// Preload
vi.mock("electron", () => ({
  ipcRenderer: {
    on: vi.fn(),
    removeListener: vi.fn(),
    invoke: vi.fn(),
  },
}));
```

### 4.2 PermissionResolverモック

```typescript
const mockResolver: PermissionResolver = {
  waitForResponse: vi.fn(),
  resolveRequest: vi.fn(),
  cancelRequest: vi.fn(),
  cancelAll: vi.fn(),
  pendingCount: 0,
};
```

### 4.3 window.skillAPIモック

```typescript
const mockSkillAPI = {
  onPermissionRequest: vi.fn(),
  sendPermissionResponse: vi.fn(),
  // 既存API
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
};
```

---

## 5. 境界値テストケース

### 5.1 キュー管理

| ケース              | 入力                    | 期待結果         |
| ------------------- | ----------------------- | ---------------- |
| 空キュー            | リクエスト1件           | 即座に表示       |
| 1件キュー           | リクエスト追加          | キュー末尾に追加 |
| 満杯キュー（100件） | リクエスト追加          | キュー末尾に追加 |
| 連続応答            | 高速で許可/拒否繰り返し | 順次処理される   |

### 5.2 タイムアウト

| ケース           | 入力          | 期待結果           |
| ---------------- | ------------- | ------------------ |
| タイムアウト直前 | timeout - 1ms | 正常応答           |
| タイムアウト     | timeout超過   | TimeoutError       |
| タイムアウト0    | timeout = 0   | 即座にTimeoutError |

### 5.3 入力検証

| ケース         | 入力                  | 期待結果               |
| -------------- | --------------------- | ---------------------- |
| 空requestId    | requestId: ""         | バリデーションエラー   |
| 空toolName     | toolName: ""          | 表示可能（UI確認）     |
| 巨大args       | args: 10KB JSON       | 表示可能（スクロール） |
| 特殊文字reason | reason: "<script>..." | エスケープして表示     |

---

## 6. 完了チェックリスト

- [x] IPC Handlerテストが作成されている
- [x] Preload APIテストが作成されている
- [x] usePermissionDialog Hookテストが作成されている
- [x] PermissionDialogコンポーネントテストが作成されている
- [x] 統合テストシナリオが全カテゴリで定義されている
- [x] テストカバレッジ目標が設定されている
- [x] 境界値テストが含まれている
- [x] **本Phase内のテスト仕様策定タスクを100%実行完了**
