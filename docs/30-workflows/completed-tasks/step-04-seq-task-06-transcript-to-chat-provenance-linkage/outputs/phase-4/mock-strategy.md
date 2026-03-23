# Phase 4: モック戦略

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 概要

Transcript -> Chat Provenance Linkage のテストにおけるモック境界を定義する。
Store / IPC / Service の3レイヤーでモック責務を分離し、各テストが単一の関心事だけを検証できるようにする。

---

## 1. モック境界の定義

```
[ Renderer (React Component) ]
         |
         | useTranscriptShare Hook
         |
[ workspaceSlice (Zustand Store) ]  <-- ここをモック境界A
         |
         | IPC Bridge (Preload)
         |
[ conversationAPI (IPC) ]            <-- ここをモック境界B
         |
         | Service Layer
         |
[ useWorkspaceChatController ]       <-- ここをモック境界C
```

### 境界A: Store Mock（workspaceSlice）

- **目的**: コンポーネント・Hookのレンダリングテストで実際のZustand Storeを差し替える
- **モック対象**: `workspaceSlice` の `transcriptProvenance` 関連アクション
- **方法**: `vi.mock("@/renderer/store/workspaceSlice")` でSliceを差し替え

```typescript
// mock-strategy の実装例（ユニットテスト用）
const mockSetTranscriptProvenance = vi.fn();
const mockClearTranscriptProvenance = vi.fn();

vi.mock("@/renderer/store/workspaceSlice", () => ({
  useSetTranscriptProvenance: () => mockSetTranscriptProvenance,
  useClearTranscriptProvenance: () => mockClearTranscriptProvenance,
  useTranscriptProvenanceForMessage: () => undefined,
}));
```

- **注意**: P31（Zustand合成Hook無限ループ）を避けるため、個別セレクタ形式（`useSetTranscriptProvenance`等）でモックすること
- **注意**: P48（useShallow未適用）を避けるため、モックセレクタは配列・オブジェクトを返さないこと（プリミティブか関数のみ）

### 境界B: IPC Mock（conversationAPI）

- **目的**: RendererからMainへのIPC呼び出しを差し替え、実際のElectronプロセスなしでテストする
- **モック対象**: `window.electronAPI.conversationAPI`（またはPreload経由のIPC）
- **方法**: `vi.stubGlobal` でwindowオブジェクトをスタブ化

```typescript
// mock-strategy の実装例（インテグレーションテスト用）
const mockConversationAPI = {
  appendTranscriptProvenance: vi.fn().mockResolvedValue({ success: true }),
  getMessages: vi.fn().mockResolvedValue({ success: true, data: [] }),
};

beforeEach(() => {
  vi.stubGlobal("electronAPI", {
    conversationAPI: mockConversationAPI,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
```

- **注意**: P60（IPC応答形式不一致）を避けるため、モックの戻り値は `{ success: boolean, data?: T, error?: { code: string, message: string } }` の統一形式で定義すること

### 境界C: Service Mock（useWorkspaceChatController）

- **目的**: チャット送信・メッセージ追加のサービス層を差し替える
- **モック対象**: `useWorkspaceChatController` Hook
- **方法**: `vi.mock("@/renderer/hooks/useWorkspaceChatController")`

```typescript
// mock-strategy の実装例
const mockAttachProvenance = vi.fn();
const mockSubmitMessage = vi.fn();

vi.mock("@/renderer/hooks/useWorkspaceChatController", () => ({
  useWorkspaceChatController: () => ({
    attachProvenance: mockAttachProvenance,
    submitMessage: mockSubmitMessage,
  }),
}));
```

- **禁止**: `useWorkspaceChatController` のモックに auto-send 動作を含めないこと（禁止事項の検証が無効化される）

---

## 2. テスト種別ごとのモック適用範囲

| テスト種別            | 境界A（Store） | 境界B（IPC） | 境界C（Service） | 備考                      |
| --------------------- | -------------- | ------------ | ---------------- | ------------------------- |
| ユニット（Component） | モック         | モック       | モック           | 完全分離                  |
| ユニット（Hook）      | モック         | モック       | 実装             | Hookの動作のみ検証        |
| インテグレーション    | 実装           | モック       | 実装             | Store-Component結合を検証 |
| 手動テスト（V-M）     | 実装           | 実装         | 実装             | モックなし                |

---

## 3. 共通モックファクトリ

テスト間でモックの構造が乖離しないよう、共通ファクトリを定義する。

### `createMockTranscriptProvenance`

```typescript
// __tests__/factories/transcriptProvenance.factory.ts

import type { TranscriptProvenance } from "@/shared/types/transcriptProvenance";

export function createMockTranscriptProvenance(
  overrides: Partial<TranscriptProvenance> = {},
): TranscriptProvenance {
  return {
    sourceType: "range",
    sharedAt: "2026-03-22T00:00:00.000Z",
    sessionTitle: "テストセッション",
    originalContent: "テストコンテンツ",
    messageRange: { startLine: 1, endLine: 10 },
    ...overrides,
  };
}

export function createMockLastOutputProvenance(): TranscriptProvenance {
  return createMockTranscriptProvenance({
    sourceType: "last-output",
    messageRange: undefined,
  });
}

export function createMockSessionProvenance(): TranscriptProvenance {
  return createMockTranscriptProvenance({
    sourceType: "session",
    messageRange: undefined,
    sessionTitle: "テストセッション全体",
  });
}
```

### `createMockWorkspaceChatMessage`

```typescript
// __tests__/factories/workspaceChatMessage.factory.ts

import type { WorkspaceChatMessage } from "@/shared/types/workspaceChat";
import { createMockTranscriptProvenance } from "./transcriptProvenance.factory";

export function createMockWorkspaceChatMessage(
  overrides: Partial<WorkspaceChatMessage> = {},
): WorkspaceChatMessage {
  return {
    id: "msg-001",
    content: "テストメッセージ",
    role: "user",
    timestamp: "2026-03-22T00:00:00.000Z",
    transcriptProvenance: undefined, // デフォルトは未設定
    ...overrides,
  };
}

export function createMockMessageWithProvenance(): WorkspaceChatMessage {
  return createMockWorkspaceChatMessage({
    transcriptProvenance: createMockTranscriptProvenance(),
  });
}
```

---

## 4. 環境設定の注意事項（P39 / P40）

### P39: happy-dom環境での `userEvent` 禁止

全テストファイルにおいて `@testing-library/user-event` の `userEvent.setup()` は使用禁止。
代わりに `fireEvent` を使用すること。

```typescript
// 禁止 (happy-dom環境でSymbolエラーが発生する)
const user = userEvent.setup();
await user.click(provenanceChip);

// 許可
fireEvent.click(provenanceChip);

// 非同期ハンドラを含む場合
await act(async () => {
  fireEvent.click(provenanceChip);
});
```

### P40: モノレポ実行ディレクトリ

テストは必ず `apps/desktop` ディレクトリから実行すること。
プロジェクトルートからの実行は `vitest.config.ts` の設定（`environment: "happy-dom"`, `setupFiles`, `resolve.alias`）が適用されないため禁止。

```bash
# 許可
cd apps/desktop && pnpm vitest run src/__tests__/

# 禁止（プロジェクトルートから）
pnpm vitest run apps/desktop/src/__tests__/
```

---

## 5. `beforeEach` / `afterEach` テンプレート

テスト間のモック状態リークを防ぐため、以下のパターンを全テストファイルに適用する（P9対策）。

```typescript
describe("ExampleTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Store mock のリセット
    mockSetTranscriptProvenance.mockReset();
    mockClearTranscriptProvenance.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup(); // @testing-library/react の cleanup
  });
});
```

---

## 6. 禁止事項のモック検証

auto-send / hidden parsing / 自動要約 の禁止事項をテストで担保する方法。

```typescript
// V-C5: shareSelectedRange が auto-send を実行しないことの検証
it("[V-C5] shareSelectedRange does NOT auto-send to chat", async () => {
  const { result } = renderHook(() => useTranscriptShare());

  await act(async () => {
    result.current.shareSelectedRange({
      content: "選択テキスト",
      startLine: 1,
      endLine: 5,
    });
  });

  // auto-send が呼ばれていないことを確認
  expect(mockSubmitMessage).not.toHaveBeenCalled();
  // ProvenanceがStoreにセットされていることは確認
  expect(mockSetTranscriptProvenance).toHaveBeenCalledOnce();
});
```
