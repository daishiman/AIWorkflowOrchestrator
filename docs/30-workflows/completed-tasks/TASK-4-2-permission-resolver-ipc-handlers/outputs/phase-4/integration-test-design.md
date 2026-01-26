# Phase 4: 統合テスト設計書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 4                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. 統合テスト概要

### 1.1 テスト目的

権限確認フロー全体の統合動作を検証する:

1. Main Process → Preload → Renderer の順方向通信
2. Renderer → Preload → Main Process の逆方向通信
3. エンドツーエンドでの権限確認・応答フロー

### 1.2 テスト範囲

```
┌─────────────────────────────────────────────────────────────────┐
│                      統合テスト範囲                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Main Process  │───▶│   Preload API   │───▶│  Renderer   │ │
│  │                 │◀───│                 │◀───│             │ │
│  │ PermissionResolver                                         │ │
│  │ permission-handlers                                        │ │
│  │ sendPermissionRequest                                      │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. テストシナリオ

### 2.1 正常系シナリオ

#### SC-001: 権限許可フロー

```
前提条件:
  - PermissionResolverがセットアップ済み
  - IPCハンドラが登録済み
  - Rendererがリクエストを購読済み

シナリオ:
  1. SkillExecutorがwaitForResponse()を呼び出す
  2. PermissionResolverがリクエストを保持
  3. sendPermissionRequest()でRendererに送信
  4. Rendererでダイアログ表示
  5. ユーザーが「許可」をクリック
  6. sendPermissionResponse()でMain Processに応答
  7. PermissionResolver.resolveRequest()で解決
  8. waitForResponse()のPromiseがapproved=trueで解決

期待結果:
  - Promiseがapproved=trueで解決
  - 副作用なし
```

#### SC-002: 権限拒否フロー

```
前提条件:
  - SC-001と同様

シナリオ:
  1-6. SC-001と同様
  5'. ユーザーが「拒否」をクリック
  7-8. SC-001と同様

期待結果:
  - Promiseがapproved=falseで解決
```

### 2.2 異常系シナリオ

#### SC-003: タイムアウト

```
前提条件:
  - timeout=5000ms設定
  - ユーザーが応答しない

シナリオ:
  1. waitForResponse({timeout: 5000})を呼び出す
  2. リクエストがRendererに送信される
  3. 5000ms経過
  4. タイムアウト処理が発動

期待結果:
  - TimeoutError("Permission request timed out")
  - リクエストがクリーンアップされる
```

#### SC-004: AbortSignalキャンセル

```
前提条件:
  - AbortControllerが設定済み

シナリオ:
  1. const controller = new AbortController()
  2. waitForResponse({signal: controller.signal})
  3. controller.abort()

期待結果:
  - AbortError発生
  - リクエストがクリーンアップされる
```

#### SC-005: ウィンドウ破棄

```
前提条件:
  - ダイアログ表示中

シナリオ:
  1. リクエストがRendererに送信される
  2. ウィンドウが閉じられる
  3. sendPermissionRequest()が呼ばれる

期待結果:
  - 送信がスキップされる（エラーなし）
  - ログに警告が出力される
```

### 2.3 複数リクエストシナリオ

#### SC-006: 連続リクエスト

```
前提条件:
  - キューが空

シナリオ:
  1. Request A が送信される
  2. Request B が送信される
  3. Request C が送信される
  4. ユーザーが A を許可
  5. ユーザーが B を拒否
  6. ユーザーが C を許可

期待結果:
  - A: approved=true
  - B: approved=false
  - C: approved=true
  - FIFO順序で処理
```

---

## 3. データフロー検証

### 3.1 リクエストデータフロー

```typescript
// Main Process
const request: SkillPermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: { command: "ls -la" },
  reason: "ディレクトリ内容を確認",
};

// →→→ IPC: skill:permission-request →→→

// Preload (変換なし、透過的に転送)
// request がそのまま Renderer に渡される

// →→→ window.skillAPI.onPermissionRequest →→→

// Renderer
// usePermissionDialog が request を受信
// PermissionDialog に request を表示
```

### 3.2 レスポンスデータフロー

```typescript
// Renderer
const response: SkillPermissionResponse = {
  requestId: "req-456",
  approved: true,
  rememberChoice: false,
};

// →→→ window.skillAPI.sendPermissionResponse →→→

// Preload
// ipcRenderer.invoke("skill:permission-response", response)

// →→→ IPC: skill:permission-response →→→

// Main Process
// permissionResolver.resolveRequest(response)
// waitForResponse() Promise が resolve
```

---

## 4. モック構成

### 4.1 Main Processモック

```typescript
// Electronモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// BrowserWindowモック
const mockWindow = {
  webContents: {
    send: vi.fn(),
  },
  isDestroyed: vi.fn().mockReturnValue(false),
};
```

### 4.2 Preloadモック（Renderer側）

```typescript
// window.skillAPIモック
const mockSkillAPI = {
  onPermissionRequest: vi.fn((callback) => {
    // リスナー登録をシミュレート
    listeners.push(callback);
    return () => {
      // クリーンアップ
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }),
  sendPermissionResponse: vi.fn().mockResolvedValue({ success: true }),
};

vi.stubGlobal("skillAPI", mockSkillAPI);
```

### 4.3 PermissionResolverモック

```typescript
const mockResolver = {
  waitForResponse: vi.fn(),
  resolveRequest: vi.fn(),
  cancelRequest: vi.fn(),
  cancelAll: vi.fn(),
  pendingCount: 0,
};
```

---

## 5. テスト実装パターン

### 5.1 IPC通信テストパターン

```typescript
describe("IPC Communication", () => {
  it("should send request via IPC channel", () => {
    // Arrange
    const request = createMockRequest();

    // Act
    sendPermissionRequest(mockWindow, request);

    // Assert
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "skill:permission-request",
      request,
    );
  });
});
```

### 5.2 非同期フローテストパターン

```typescript
describe("Async Flow", () => {
  it("should resolve when response is received", async () => {
    // Arrange
    const request = createMockRequest();
    const responsePromise = permissionResolver.waitForResponse(request);

    // Act
    permissionResolver.resolveRequest({
      requestId: request.requestId,
      approved: true,
    });

    // Assert
    await expect(responsePromise).resolves.toEqual({
      requestId: request.requestId,
      approved: true,
    });
  });
});
```

### 5.3 タイムアウトテストパターン

```typescript
describe("Timeout", () => {
  it("should reject with timeout error", async () => {
    // Arrange
    vi.useFakeTimers();
    const request = createMockRequest();

    // Act
    const promise = permissionResolver.waitForResponse(request, {
      timeout: 5000,
    });
    vi.advanceTimersByTime(5000);

    // Assert
    await expect(promise).rejects.toThrow("Permission request timed out");
    vi.useRealTimers();
  });
});
```

---

## 6. 検証チェックリスト

### 6.1 通信検証

| #   | 検証項目                | テスト |
| --- | ----------------------- | ------ |
| 1   | Main → Renderer IPC送信 | PI-001 |
| 2   | Renderer → Main IPC応答 | PI-002 |
| 3   | チャンネル名の正確性    | PA-001 |
| 4   | データ型の一致性        | PA-003 |

### 6.2 状態管理検証

| #   | 検証項目               | テスト |
| --- | ---------------------- | ------ |
| 1   | 初期状態               | HD-001 |
| 2   | リクエスト受信後の状態 | HD-006 |
| 3   | 応答後の状態           | HD-009 |
| 4   | キュー管理             | HD-007 |

### 6.3 エラーハンドリング検証

| #   | 検証項目       | テスト |
| --- | -------------- | ------ |
| 1   | タイムアウト   | PI-004 |
| 2   | キャンセル     | PI-005 |
| 3   | 不正sender     | PH-004 |
| 4   | ウィンドウ破棄 | PH-007 |

---

## 7. 完了チェックリスト

- [x] 全シナリオがテストケースにマッピングされている
- [x] データフロー検証が設計されている
- [x] モック構成が定義されている
- [x] テスト実装パターンが提示されている
- [x] 検証チェックリストが作成されている
- [x] **本Phase内の統合テスト設計タスクを100%実行完了**
