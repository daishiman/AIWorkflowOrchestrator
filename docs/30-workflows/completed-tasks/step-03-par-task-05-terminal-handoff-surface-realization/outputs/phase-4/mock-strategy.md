# Phase 4 成果物: モック戦略

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 4                                                 |
| 成果物種別 | モック戦略                                        |
| 作成日     | 2026-03-22                                        |
| 依存成果物 | phase-4/test-matrix.md                            |

---

## 1. Store モック

### 1.1 agentSlice.clearHandoffGuidance()

**対象テスト**: UT-B-4 (dismiss ボタンクリック)、IT-A-4

**モック定義**:

```typescript
const mockClearHandoffGuidance = vi.fn();

vi.mock("@/renderer/store/agentSlice", () => ({
  useClearHandoffGuidance: () => mockClearHandoffGuidance,
}));

// beforeEach でリセット
beforeEach(() => {
  mockClearHandoffGuidance.mockClear();
});
```

**検証方法**:

```typescript
// dismiss クリック後に clearHandoffGuidance が 1 回呼ばれること
expect(mockClearHandoffGuidance).toHaveBeenCalledTimes(1);
```

**注意事項**:

- `useClearHandoffGuidance()` は個別セレクタパターン (P31 対策) であること
- 合成 Store Hook (`useAgentStore()`) の戻り値を依存配列に含めないこと (P31 準拠)

---

## 2. IPC モック

### 2.1 chatEditHandlers レスポンス

**対象テスト**: IT-A-1〜4

**モック定義**:

```typescript
// IPC ハンドラのモック（Main Process 側）
const mockChatEditHandler = vi.fn();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel, handler) => {
      if (channel === IPC_CHANNELS.CHAT_EDIT_SEND) {
        mockChatEditHandler.mockImplementation(handler);
      }
    }),
    removeHandler: vi.fn(),
  },
}));
```

**各シナリオのレスポンス設定**:

```typescript
// IT-A-1: guidance あり
mockChatEditHandler.mockResolvedValue({
  success: true,
  data: {
    guidance: {
      terminalCommand: "claude docs generate",
      contextSummary: "command=edit files=foo.ts",
      reason: "LLM 到達不可",
    },
  },
});

// IT-A-4: guidance なし
mockChatEditHandler.mockResolvedValue({
  success: true,
  data: { guidance: null },
});
```

**P60 対策**: IPC レスポンス形式は `{ success: boolean, data?: T, error?: { code: string, message: string } }` の wrapper 形式に統一すること。フラットな `{ code: "..." }` 形式は使用しない。

---

## 3. Service モック

### 3.1 IRuntimePolicyResolver.resolve()

**対象テスト**: IT-B-1〜4、UT-C-1〜4

**モック定義**:

```typescript
import type { IRuntimePolicyResolver } from "@/main/services/runtime/IRuntimePolicyResolver";

const mockRuntimePolicyResolver: IRuntimePolicyResolver = {
  resolve: vi.fn(),
};

// guidance-only パス
mockRuntimePolicyResolver.resolve.mockResolvedValue({
  capability: "guidance-only",
  guidance: "API key を設定してください",
});

// terminal-handoff パス
mockRuntimePolicyResolver.resolve.mockResolvedValue({
  capability: "terminal-handoff",
  reason: "LLM 到達不可",
});

// integrated-api パス
mockRuntimePolicyResolver.resolve.mockResolvedValue({
  capability: "integrated-api",
  provider: "anthropic",
});
```

**DIP 準拠 (P61 対策)**: `DefaultRuntimePolicyResolver`（具象クラス）ではなく `IRuntimePolicyResolver`（インターフェース）を引数型として使用すること。

### 3.2 TerminalHandoffBuilder.buildForSurface()

**対象テスト**: IT-A-1, IT-B-2

**モック定義**:

```typescript
import type { TerminalHandoffBuilder } from "@/main/services/runtime/TerminalHandoffBuilder";

const mockTerminalHandoffBuilder: Pick<
  TerminalHandoffBuilder,
  "buildForSurface"
> = {
  buildForSurface: vi.fn(),
};

// 正常系
mockTerminalHandoffBuilder.buildForSurface.mockReturnValue({
  terminalCommand: "claude docs generate",
  contextSummary: "surface=agent skill=my-skill",
  reason: "LLM 到達不可",
} satisfies HandoffGuidance);

// 異常系（例外）
mockTerminalHandoffBuilder.buildForSurface.mockImplementation(() => {
  throw new Error("buildForSurface failed");
});
```

---

## 4. Navigator モック

### 4.1 navigator.clipboard.writeText (copy ボタンテスト用)

**対象テスト**: UT-B-3

**モック定義**:

```typescript
// setupTests.ts または beforeEach ブロック
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

// テスト内
const mockWriteText = vi.mocked(navigator.clipboard.writeText);

// 検証
expect(mockWriteText).toHaveBeenCalledWith("claude docs generate");
```

---

## 5. P39 準拠: fireEvent vs userEvent 使い分けルール

| 環境                              | 使用するツール | 理由                                                     |
| --------------------------------- | -------------- | -------------------------------------------------------- |
| happy-dom (デスクトップ Renderer) | `fireEvent`    | `userEvent.setup()` は Symbol 操作エラーが発生する (P39) |
| jsdom                             | `userEvent`    | フルイベントシミュレーションが可能                       |

**適用パターン**:

```typescript
// P39 準拠: happy-dom 環境での正しいパターン

// 同期クリック
fireEvent.click(copyButton);

// 非同期ハンドラ（クリップボード書き込み等）
await act(async () => {
  fireEvent.click(copyButton);
});

// 禁止パターン（happy-dom では使用不可）
// const user = userEvent.setup();
// await user.click(copyButton);
```

---

## 6. モックリセット方針

**全テストファイル共通の beforeEach**:

```typescript
beforeEach(() => {
  // vi.fn() モックをリセット（テスト間リーク防止 - P9 対策）
  vi.clearAllMocks();

  // Store モックを初期状態に戻す
  mockClearHandoffGuidance.mockClear();

  // IPC モックをリセット
  mockChatEditHandler.mockReset();

  // clipboard モックをリセット
  vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);
});
```

**注意 (P9 対策)**: モジュールスコープの変数がテスト間で共有されないよう、`beforeEach` でリセットを徹底すること。

---

## 7. モック対象ファイルの import パス参照

**P63 対策**: テスト作成時は以下のコマンドで既存テストの import パスを参照してからテストを記述すること。

```bash
# 既存テストの import パターンを確認
grep -n "^import" apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.test.tsx

# shared types の import パターンを確認
grep -n "^import" packages/shared/src/types/handoff.test.ts
```

対象パッケージのディレクトリから Vitest を実行すること (P40 対策):

```bash
# Renderer コンポーネントテスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/TerminalHandoffCard

# shared パッケージテスト
cd packages/shared && pnpm vitest run src/types/handoff
```
