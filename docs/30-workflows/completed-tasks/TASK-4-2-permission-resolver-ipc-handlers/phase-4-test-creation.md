# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 4                                         |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。IPC Handler、React Hook、UIコンポーネントのテストを作成する。

## 実行タスク

### Task 4-1: IPC Handlerテスト作成

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/permission-handlers.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, BrowserWindow } from "electron";
import { registerPermissionHandlers } from "../permission-handlers";
import type { PermissionResolver } from "../../services/skill/PermissionResolver";

// モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

describe("permission-handlers", () => {
  describe("registerPermissionHandlers", () => {
    let mockWindow: BrowserWindow;
    let mockResolver: PermissionResolver;

    beforeEach(() => {
      mockWindow = {
        webContents: { send: vi.fn() },
      } as unknown as BrowserWindow;
      mockResolver = {
        resolveRequest: vi.fn(),
        waitForResponse: vi.fn(),
        cancelRequest: vi.fn(),
        cancelAll: vi.fn(),
        pendingCount: 0,
      } as unknown as PermissionResolver;
    });

    it("should register skill:permission-response handler", () => {
      registerPermissionHandlers(mockWindow, mockResolver);
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "skill:permission-response",
        expect.any(Function),
      );
    });

    it("should call resolveRequest when response is received", async () => {
      registerPermissionHandlers(mockWindow, mockResolver);

      const handler = (ipcMain.handle as any).mock.calls[0][1];
      const mockEvent = { sender: mockWindow.webContents };
      const response = { requestId: "test-id", approved: true };

      await handler(mockEvent, response);

      expect(mockResolver.resolveRequest).toHaveBeenCalledWith(response);
    });

    it("should validate sender", async () => {
      // sender検証のテスト
    });
  });
});
```

### Task 4-2: Preload APIテスト作成

**テストファイル**: `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcRenderer } from "electron";

vi.mock("electron", () => ({
  ipcRenderer: {
    on: vi.fn(),
    removeListener: vi.fn(),
    invoke: vi.fn(),
  },
}));

describe("skillAPI permission methods", () => {
  describe("onPermissionRequest", () => {
    it("should register listener for skill:permission-request", () => {
      const callback = vi.fn();
      // skillAPI.onPermissionRequest(callback);
      expect(ipcRenderer.on).toHaveBeenCalledWith(
        "skill:permission-request",
        expect.any(Function),
      );
    });

    it("should return unsubscribe function", () => {
      const callback = vi.fn();
      // const unsubscribe = skillAPI.onPermissionRequest(callback);
      // unsubscribe();
      expect(ipcRenderer.removeListener).toHaveBeenCalled();
    });

    it("should call callback when request is received", () => {
      const callback = vi.fn();
      const request = { requestId: "test-id", toolName: "test-tool", args: {} };
      // Test implementation
    });
  });

  describe("sendPermissionResponse", () => {
    it("should invoke skill:permission-response channel", async () => {
      const response = { requestId: "test-id", approved: true };
      // await skillAPI.sendPermissionResponse(response);
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        "skill:permission-response",
        response,
      );
    });
  });
});
```

### Task 4-3: usePermissionDialog Hookテスト作成

**テストファイル**: `apps/desktop/src/renderer/hooks/__tests__/usePermissionDialog.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePermissionDialog } from "../usePermissionDialog";

// window.skillAPI モック
const mockSkillAPI = {
  onPermissionRequest: vi.fn(),
  sendPermissionResponse: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("skillAPI", mockSkillAPI);
  mockSkillAPI.onPermissionRequest.mockReturnValue(() => {});
  mockSkillAPI.sendPermissionResponse.mockResolvedValue({ success: true });
});

describe("usePermissionDialog", () => {
  it("should initialize with null pendingRequest and closed state", () => {
    const { result } = renderHook(() => usePermissionDialog());

    expect(result.current.pendingRequest).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it("should subscribe to permission requests on mount", () => {
    renderHook(() => usePermissionDialog());

    expect(mockSkillAPI.onPermissionRequest).toHaveBeenCalled();
  });

  it("should unsubscribe on unmount", () => {
    const unsubscribe = vi.fn();
    mockSkillAPI.onPermissionRequest.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => usePermissionDialog());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should open dialog when request is received", async () => {
    const { result } = renderHook(() => usePermissionDialog());

    const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
    const request = { requestId: "test-id", toolName: "test-tool", args: {} };

    act(() => {
      callback(request);
    });

    expect(result.current.pendingRequest).toEqual(request);
    expect(result.current.isOpen).toBe(true);
  });

  it("should send approved response and close dialog", async () => {
    const { result } = renderHook(() => usePermissionDialog());

    const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
    const request = { requestId: "test-id", toolName: "test-tool", args: {} };

    act(() => {
      callback(request);
    });

    await act(async () => {
      await result.current.respond(true);
    });

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
      requestId: "test-id",
      approved: true,
      rememberChoice: undefined,
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.pendingRequest).toBeNull();
  });

  it("should send denied response when close is called", async () => {
    const { result } = renderHook(() => usePermissionDialog());

    const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
    const request = { requestId: "test-id", toolName: "test-tool", args: {} };

    act(() => {
      callback(request);
    });

    await act(async () => {
      await result.current.close();
    });

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
      requestId: "test-id",
      approved: false,
      rememberChoice: undefined,
    });
  });
});
```

### Task 4-4: PermissionDialogコンポーネントテスト作成

**テストファイル**: `apps/desktop/src/renderer/components/Permission/__tests__/PermissionDialog.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PermissionDialog } from '../PermissionDialog';

describe('PermissionDialog', () => {
  const defaultProps = {
    request: {
      requestId: 'test-id',
      executionId: 'exec-id',
      toolName: 'test-tool',
      args: { key: 'value' },
      reason: 'Test reason',
    },
    isOpen: true,
    onAllow: vi.fn(),
    onDeny: vi.fn(),
  };

  it('should not render when isOpen is false', () => {
    render(<PermissionDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when isOpen is true', () => {
    render(<PermissionDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display tool name', () => {
    render(<PermissionDialog {...defaultProps} />);

    expect(screen.getByText('test-tool')).toBeInTheDocument();
  });

  it('should display reason when provided', () => {
    render(<PermissionDialog {...defaultProps} />);

    expect(screen.getByText('Test reason')).toBeInTheDocument();
  });

  it('should call onAllow when allow button is clicked', () => {
    render(<PermissionDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /許可/i }));

    expect(defaultProps.onAllow).toHaveBeenCalled();
  });

  it('should call onDeny when deny button is clicked', () => {
    render(<PermissionDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /拒否/i }));

    expect(defaultProps.onDeny).toHaveBeenCalled();
  });

  it('should have accessible dialog attributes', () => {
    render(<PermissionDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('should trap focus within dialog', () => {
    // フォーカストラップのテスト
  });

  it('should close on Escape key', () => {
    render(<PermissionDialog {...defaultProps} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(defaultProps.onDeny).toHaveBeenCalled();
  });
});
```

### Task 4-5: 統合テストシナリオ作成

**テストファイル**: `apps/desktop/src/__tests__/permission-integration.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";

describe("Permission IPC Integration", () => {
  describe("TC-42-001: 権限確認リクエスト送信", () => {
    it("should send request to Renderer via IPC", () => {
      // Main → Renderer IPC送信テスト
    });
  });

  describe("TC-42-003: allow判断", () => {
    it("should resolve waitForResponse with approved=true", () => {
      // allow応答で解決するテスト
    });
  });

  describe("TC-42-004: deny判断", () => {
    it("should resolve waitForResponse with approved=false", () => {
      // deny応答で解決するテスト
    });
  });

  describe("TC-42-005: タイムアウト", () => {
    it("should reject with timeout error", () => {
      // タイムアウトテスト
    });
  });

  describe("TC-42-006: 複数リクエストの同時処理", () => {
    it("should handle multiple requests in order", () => {
      // キュー処理テスト
    });
  });

  describe("TC-42-007: AbortSignalキャンセル", () => {
    it("should cancel request when signal is aborted", () => {
      // キャンセルテスト
    });
  });
});
```

## 参照資料

| 資料名       | パス                                                                        | 説明          |
| ------------ | --------------------------------------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`                                | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`                                    | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`                                   | Phase 3成果物 |
| 既存テスト   | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | 参照          |

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                             | テストファイル                   |
| ------------------ | ------------------------------------ | -------------------------------- |
| IPC送信テスト      | Main → Renderer リクエスト送信       | `permission-handlers.test.ts`    |
| IPC受信テスト      | Renderer → Main レスポンス受信       | `permission-handlers.test.ts`    |
| UIイベントテスト   | ユーザー操作→IPC呼び出し             | `PermissionDialog.test.tsx`      |
| 状態管理テスト     | Hook状態遷移の検証                   | `usePermissionDialog.test.ts`    |
| エラーハンドリング | タイムアウト・キャンセル・エラー処理 | `permission-integration.test.ts` |

## 成果物

| 成果物             | パス                                         | 説明               |
| ------------------ | -------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/**/__tests__/*.test.ts`    | 実際のテストコード |

## 完了条件

- [ ] IPC Handlerテストが作成されている
- [ ] Preload APIテストが作成されている
- [ ] usePermissionDialog Hookテストが作成されている
- [ ] PermissionDialogコンポーネントテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
