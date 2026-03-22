# Phase 4: モック戦略 - Mock Strategy

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 4                                                  |
| 作成日   | 2026-03-22                                         |

## 1. レイヤー別モック境界

### Store 層

| mock 対象             | mock 方法                                       | 注意点                |
| --------------------- | ----------------------------------------------- | --------------------- |
| useSelectedProviderId | `vi.mock("@/renderer/store")` + mockReturnValue | P31: 個別セレクタ使用 |
| useSelectedModelId    | `vi.mock("@/renderer/store")` + mockReturnValue | P31: 個別セレクタ使用 |
| useAppStore           | 直接 mock 不可（個別セレクタ経由）              | 合成 Hook mock 禁止   |

### IPC / Preload 層

| mock 対象          | mock 方法                          | 注意点              |
| ------------------ | ---------------------------------- | ------------------- |
| window.electronAPI | `vi.stubGlobal("window", { ... })` | P40: happy-dom 制約 |
| RuntimePolicy DTO  | テスト内で直接生成                 | shape 一致を確認    |

### Guidance 層（新規）

| mock 対象                      | mock 方法                         | 注意点                 |
| ------------------------------ | --------------------------------- | ---------------------- |
| useBlockedGuidance             | `vi.mock("./useBlockedGuidance")` | 純関数のため mock 容易 |
| createGuidanceActionDispatcher | handler を vi.fn() で注入         | side effect 検証       |
| BLOCKED_GUIDANCE_MAP           | import して直接参照（mock 不要）  | 定数のため             |

## 2. テスト環境制約

| 制約             | 対策                                             | 関連 Pitfall |
| ---------------- | ------------------------------------------------ | ------------ |
| happy-dom        | fireEvent を使用、userEvent 禁止                 | P39          |
| 実行ディレクトリ | `cd apps/desktop && pnpm vitest run src/...`     | P40          |
| 非同期ハンドラ   | `await act(async () => { fireEvent.click(el) })` | P39          |

## 3. テストデータ戦略

```typescript
// テスト用ヘルパー
const createMockBlockedReason = (reason: BlockedReason): BlockedReason =>
  reason;

const createMockGuidanceConfig = (
  overrides?: Partial<GuidanceConfig>,
): GuidanceConfig => ({
  message: "テストメッセージ",
  variant: "blocked",
  primaryAction: { type: "navigate-settings", label: "設定を見る" },
  secondaryAction: { type: "open-terminal", label: "terminal を開く" },
  ...overrides,
});
```
