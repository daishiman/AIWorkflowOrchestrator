# Phase 4: テスト作成

## メタ情報

| 項目          | 値                                                                                   |
| ------------- | ------------------------------------------------------------------------------------ |
| Phase番号     | 4                                                                                    |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                             |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                 |
| 作成日        | 2026-03-20                                                                           |
| 前Phase成果物 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-3-design-review.md` |

## 目的

Phase 2で確定した設計に基づき、テストファーストでテストコードを先行作成する。`mapLLMErrorToStreamingError` の純粋関数テスト、`StreamingErrorDisplay` コンポーネントのレンダリングテスト、`useWorkspaceChatController` のエラーハンドリングテストを作成する。

## 実行タスク

### Task 1: テストファイル配置の調査

実装開始前に既存テストファイルのインポートパターンを確認する（P63対策）。

```bash
# 既存テストのインポートパスパターンを確認
grep -n "^import" \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useWorkspaceChatController.test.ts \
  2>/dev/null || \
grep -rn "^import" \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/ \
  --include="*.test.*" | head -20

# テスト環境設定（vitest.config）確認
cat apps/desktop/vitest.config.ts | head -30

# happy-dom / jsdom 環境確認（P39対策: userEvent禁止判断）
grep -n "environment" apps/desktop/vitest.config.ts
```

### Task 2: mapLLMErrorToStreamingError 単体テスト

**テストファイル**: `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/mapLLMErrorToStreamingError.test.ts`

#### テストケース一覧

| ID   | エラーコード                             | 期待: action | 期待: retryable | 期待: hint |
| ---- | ---------------------------------------- | ------------ | --------------- | ---------- |
| T-01 | `API_KEY_MISSING`                        | `"SETTINGS"` | `false`         | なし       |
| T-02 | `MODEL_NOT_FOUND`                        | `"SETTINGS"` | `false`         | なし       |
| T-03 | `NETWORK_ERROR`                          | `"RETRY"`    | `true`          | なし       |
| T-04 | `TIMEOUT`                                | `"RETRY"`    | `true`          | なし       |
| T-05 | `RATE_LIMIT`                             | `"RETRY"`    | `true`          | 文字列あり |
| T-06 | `VALIDATION_ERROR`                       | `null`       | `false`         | なし       |
| T-07 | `UNKNOWN_CODE`                           | `null`       | `false`         | なし       |
| T-08 | エラーオブジェクトに`code`フィールドなし | `null`       | `false`         | なし       |

```typescript
// apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/mapLLMErrorToStreamingError.test.ts
import { describe, it, expect } from "vitest";
import { mapLLMErrorToStreamingError } from "../mapLLMErrorToStreamingError";

describe("mapLLMErrorToStreamingError", () => {
  describe("T-01: API_KEY_MISSING", () => {
    it("action=SETTINGS, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "API_KEY_MISSING",
        message: "API key not found",
      });
      expect(result.action).toBe("SETTINGS");
      expect(result.retryable).toBe(false);
      expect(result.hint).toBeUndefined();
    });
  });

  describe("T-02: MODEL_NOT_FOUND", () => {
    it("action=SETTINGS, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "MODEL_NOT_FOUND",
        message: "Model not found",
      });
      expect(result.action).toBe("SETTINGS");
      expect(result.retryable).toBe(false);
    });
  });

  describe("T-03: NETWORK_ERROR", () => {
    it("action=RETRY, retryable=true を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "NETWORK_ERROR",
        message: "Connection failed",
      });
      expect(result.action).toBe("RETRY");
      expect(result.retryable).toBe(true);
      expect(result.hint).toBeUndefined();
    });
  });

  describe("T-04: TIMEOUT", () => {
    it("action=RETRY, retryable=true を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "TIMEOUT",
        message: "Request timed out",
      });
      expect(result.action).toBe("RETRY");
      expect(result.retryable).toBe(true);
    });
  });

  describe("T-05: RATE_LIMIT", () => {
    it("action=RETRY, retryable=true, hint文字列あり を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "RATE_LIMIT",
        message: "Too many requests",
      });
      expect(result.action).toBe("RETRY");
      expect(result.retryable).toBe(true);
      expect(typeof result.hint).toBe("string");
      expect(result.hint!.length).toBeGreaterThan(0);
    });
  });

  describe("T-06: VALIDATION_ERROR", () => {
    it("action=null, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      });
      expect(result.action).toBeNull();
      expect(result.retryable).toBe(false);
    });
  });

  describe("T-07: 未知のエラーコード", () => {
    it("action=null, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "UNKNOWN_CODE",
        message: "Something went wrong",
      });
      expect(result.action).toBeNull();
      expect(result.retryable).toBe(false);
    });
  });

  describe("T-08: codeフィールドなし", () => {
    it("action=null, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        message: "No code field",
      } as any);
      expect(result.action).toBeNull();
      expect(result.retryable).toBe(false);
    });
  });

  describe("共通: codeフィールドが常に返る", () => {
    it("すべてのケースでcode文字列が返る", () => {
      const codes = [
        "API_KEY_MISSING",
        "NETWORK_ERROR",
        "RATE_LIMIT",
        "VALIDATION_ERROR",
        "UNKNOWN",
      ];
      for (const code of codes) {
        const result = mapLLMErrorToStreamingError({ code, message: "test" });
        expect(typeof result.code).toBe("string");
        expect(typeof result.message).toBe("string");
      }
    });
  });
});
```

### Task 3: StreamingErrorDisplay コンポーネントテスト

**テストファイル**: `apps/desktop/src/renderer/views/WorkspaceView/components/__tests__/StreamingErrorDisplay.test.tsx`

#### テストケース一覧

| ID   | 内容                                               |
| ---- | -------------------------------------------------- |
| C-01 | エラーメッセージが表示される                       |
| C-02 | `action="SETTINGS"` 時に設定ボタンが表示される     |
| C-03 | `action="RETRY"` 時に再試行ボタンが表示される      |
| C-04 | `action=null` 時にアクションボタンが表示されない   |
| C-05 | `hint` がある時にヒントテキストが表示される        |
| C-06 | dismissボタンクリックで `onDismiss` が呼ばれる     |
| C-07 | 設定ボタンクリックで `onOpenSettings` が呼ばれる   |
| C-08 | 再試行ボタンクリックで `onRetry` が呼ばれる        |
| C-09 | `isRetrying=true` 時に再試行ボタンがdisabledになる |
| C-10 | `role="alert"` が付与されている                    |

```typescript
// apps/desktop/src/renderer/views/WorkspaceView/components/__tests__/StreamingErrorDisplay.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StreamingErrorDisplay } from "../StreamingErrorDisplay";
import type { StreamingErrorState } from "../../types";

const baseError: StreamingErrorState = {
  code: "NETWORK_ERROR",
  message: "ネットワークエラーが発生しました。",
  retryable: true,
  action: "RETRY",
};

const mockProps = {
  error: baseError,
  onDismiss: vi.fn(),
  onRetry: vi.fn().mockResolvedValue(undefined),
  onOpenSettings: vi.fn(),
};

describe("StreamingErrorDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("C-01: エラーメッセージが表示される", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    expect(screen.getByText(baseError.message)).toBeInTheDocument();
  });

  it("C-02: action=SETTINGS 時に設定ボタンが表示される", () => {
    const settingsError: StreamingErrorState = {
      ...baseError,
      code: "API_KEY_MISSING",
      action: "SETTINGS",
      retryable: false,
    };
    render(<StreamingErrorDisplay {...mockProps} error={settingsError} />);
    expect(screen.getByRole("button", { name: /設定|settings/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /再試行|retry/i })).toBeNull();
  });

  it("C-03: action=RETRY 時に再試行ボタンが表示される", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    expect(screen.getByRole("button", { name: /再試行|retry/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /設定|settings/i })).toBeNull();
  });

  it("C-04: action=null 時にアクションボタンが表示されない", () => {
    const noActionError: StreamingErrorState = {
      ...baseError,
      action: null,
      retryable: false,
    };
    render(<StreamingErrorDisplay {...mockProps} error={noActionError} />);
    expect(screen.queryByRole("button", { name: /再試行|retry/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /設定|settings/i })).toBeNull();
  });

  it("C-05: hint がある時にヒントテキストが表示される", () => {
    const hintError: StreamingErrorState = {
      ...baseError,
      code: "RATE_LIMIT",
      hint: "しばらく待ってから再試行してください。",
    };
    render(<StreamingErrorDisplay {...mockProps} error={hintError} />);
    expect(screen.getByText("しばらく待ってから再試行してください。")).toBeInTheDocument();
  });

  it("C-06: dismissボタンクリックで onDismiss が呼ばれる", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    const dismissBtn = screen.getByRole("button", { name: /閉じる|close|dismiss/i });
    fireEvent.click(dismissBtn);
    expect(mockProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("C-07: 設定ボタンクリックで onOpenSettings が呼ばれる", () => {
    const settingsError: StreamingErrorState = {
      ...baseError,
      code: "API_KEY_MISSING",
      action: "SETTINGS",
      retryable: false,
    };
    render(<StreamingErrorDisplay {...mockProps} error={settingsError} />);
    const settingsBtn = screen.getByRole("button", { name: /設定|settings/i });
    fireEvent.click(settingsBtn);
    expect(mockProps.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("C-08: 再試行ボタンクリックで onRetry が呼ばれる", async () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    const retryBtn = screen.getByRole("button", { name: /再試行|retry/i });
    await act(async () => {
      fireEvent.click(retryBtn);
    });
    expect(mockProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it("C-09: isRetrying=true 時に再試行ボタンがdisabledになる", () => {
    render(<StreamingErrorDisplay {...mockProps} isRetrying={true} />);
    const retryBtn = screen.getByRole("button", { name: /再試行中|retrying/i });
    expect(retryBtn).toBeDisabled();
  });

  it("C-10: role=alert が付与されている", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
```

### Task 4: useWorkspaceChatController エラーハンドリングテスト

**テストファイル**: `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useWorkspaceChatController.streamingError.test.ts`

既存テストファイルのインポートパターンを先に確認してから（P63対策）、テストを作成する。

#### テストケース一覧

| ID   | 内容                                                                   |
| ---- | ---------------------------------------------------------------------- |
| H-01 | `onStreamError` コールバックが呼ばれると `streamingError` が設定される |
| H-02 | `dismissStreamingError` 呼び出しで `streamingError` が null になる     |
| H-03 | `onStreamError` 後に `isStreaming === false` になる                    |
| H-04 | `onStreamError` 後に `isSending === false` になる                      |
| H-05 | `onStreamError` 後に `streamContent === ""` になる                     |
| H-06 | `retryLastMessage` はリトライ可能エラー時のみ実行される                |
| H-07 | `retryLastMessage` は `lastUserMessageRef` がnullの時は何もしない      |
| H-08 | `sendMessage` 後に `lastUserMessageRef` が最後のメッセージを保持する   |

```typescript
// テスト内容の概要（実装はTask 1の調査結果に基づいてインポートパスを確定する）

describe("useWorkspaceChatController - streamingError", () => {
  // H-01: onStreamError → streamingError が設定される
  // H-02: dismissStreamingError → streamingError = null
  // H-03〜H-05: エラー後の状態リセット確認
  // H-06〜H-08: retryLastMessage の条件分岐
});
```

### Task 5: テストカバレッジ目標

| ファイル                                | Line目標 | Branch目標 |
| --------------------------------------- | -------- | ---------- |
| `mapLLMErrorToStreamingError.ts`        | 90%      | 80%        |
| `StreamingErrorDisplay.tsx`             | 85%      | 70%        |
| `useWorkspaceChatController.ts`（差分） | 80%      | 70%        |

## 参照資料

| ドキュメント       | パス                                                                                | 参照目的                     |
| ------------------ | ----------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義書 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md` | 受入基準 AC-1〜AC-6          |
| Phase 2 設計書     | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-2-design.md`       | 型定義・マッピング設計       |
| P39 happy-dom      | `.claude/rules/06-known-pitfalls.md`                                                | userEvent禁止・fireEvent使用 |
| P63 インポートパス | `.claude/rules/06-known-pitfalls.md`                                                | 既存テストパターン参照必須   |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                  | カバレッジ基準               |

## 実行手順

1. **Task 1**: 既存テストファイルのインポートパターンを調査する（P63対策）
2. **Task 2**: `mapLLMErrorToStreamingError` の単体テストファイルを作成する
3. **Task 3**: `StreamingErrorDisplay` のコンポーネントテストファイルを作成する
4. **Task 4**: `useWorkspaceChatController` のエラーハンドリングテストを作成する（既存テストとのマージ方針を確認する）
5. テストを実行し、未実装箇所に対する失敗または不足を確認する
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView
   ```

## 統合テスト連携

- `mapLLMErrorToStreamingError.test.ts` が pure mapping を固定する。
- `StreamingErrorDisplay.test.tsx` が button / hint / a11y surface を固定する。
- `useWorkspaceChatController.runtime.test.ts` が hook の retry / dismiss / state reset を固定する。
- `WorkspaceChatPanel.runtime.test.tsx` が panel-to-input の統合境界を固定する。

## 成果物

| 成果物                                  | パス                                                                                                       | 形式       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| mapLLMErrorToStreamingError テスト      | `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/mapLLMErrorToStreamingError.test.ts`        | TypeScript |
| StreamingErrorDisplay テスト            | `apps/desktop/src/renderer/views/WorkspaceView/components/__tests__/StreamingErrorDisplay.test.tsx`        | TypeScript |
| useWorkspaceChatController エラーテスト | `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useWorkspaceChatController.runtime.test.ts` | TypeScript |
| Phase 4 仕様書（本ファイル）            | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-4-test-creation.md`                       | Markdown   |

## 完了条件

- [ ] Task 1: 既存テストのインポートパターンを調査済み（P63対策）
- [ ] Task 2: `mapLLMErrorToStreamingError` テスト T-01〜T-08 を作成済み
- [ ] Task 3: `StreamingErrorDisplay` テスト C-01〜C-10 を作成済み
- [ ] Task 4: `useWorkspaceChatController` エラーテスト H-01〜H-08 を作成済み
- [ ] テストを実行して Red であることを確認済み（実装前であるため）
- [ ] P39準拠: `fireEvent` を使用し `userEvent` を使用していない
- [ ] P63準拠: 既存テストのインポートパスを参照済み

## 次Phase

Phase 5: 実装 (`phase-5-implementation.md`)
