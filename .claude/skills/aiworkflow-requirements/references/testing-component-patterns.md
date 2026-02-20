# コンポーネントテストパターン

> **バージョン**: 1.5.0
> **更新日**: 2026-02-19
> **関連タスク**: TASK-8B, TASK-7D, UT-STORE-HOOKS-TEST-REFACTOR-001, TASK-FIX-11-1-SDK-TEST-ENABLEMENT, TASK-9A-C

---

## 概要

UIコンポーネントの単体・統合テストにおける標準パターン集。
Vitest + React Testing Library + happy-dom環境を前提とする。

**対象**: `apps/desktop/src/renderer/components/` 配下のReactコンポーネント

---

## 1. Storeモッキングパターン

### パターン1: 直接返却（シンプルな状態）

```typescript
let currentStoreState = { skills: [], selectedSkillName: null };

vi.mock("../../../store", () => ({
  useSkillStore: () => currentStoreState,
}));

beforeEach(() => {
  currentStoreState = { skills: mockSkills, selectedSkillName: null };
});
```

**使用場面**: 読み取り専用の状態、全状態を一括取得するコンポーネント

### パターン2: セレクタ関数モッキング（Zustandスタイル）

```typescript
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      pendingPermission: mockPendingPermission,
      respondToSkillPermission: mockRespondToSkillPermission,
    };
    return selector(state);
  }),
}));
```

**使用場面**: Zustandのセレクタパターン使用時、部分的な状態更新

### パターン3: 静的モック＋ミューテーション

```typescript
let mockPendingPermission: SkillPermissionRequest | null = null;
const mockRespondToSkillPermission = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(() => ({
    pendingPermission: mockPendingPermission,
    respondToSkillPermission: mockRespondToSkillPermission,
  })),
}));

beforeEach(() => {
  mockPendingPermission = { executionId: "exec-001", toolName: "Bash" };
  vi.clearAllMocks();
});
```

**使用場面**: テストごとに状態を変更、アクション関数のモック

### 選択基準

| パターン  | 状態変更頻度 | セレクタ使用 | 推奨コンポーネント        |
| --------- | ------------ | ------------ | ------------------------- |
| パターン1 | 低           | なし         | 表示専用コンポーネント    |
| パターン2 | 中           | あり         | Zustand接続コンポーネント |
| パターン3 | 高           | なし/あり    | ダイアログ・フォーム      |

---

## 2. テストデータファクトリ

### 基本構造

```typescript
// factories/skillMetadata.factory.ts
export function createSkillMetadata(
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata {
  return {
    name: "test-skill",
    description: "Test skill description",
    allowedTools: ["Bash", "Read"],
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    ...overrides,
  };
}

// 境界値バリアント
export const emptySkillMetadata = createSkillMetadata({
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
});

export const fullSkillMetadata = createSkillMetadata({
  agents: [{ filename: "agent1.md", relativePath: "agents/", size: 1024 }],
  references: [
    { filename: "ref1.md", relativePath: "references/", size: 2048 },
  ],
  // ... 全リソース
});
```

### メッセージファクトリ

```typescript
export function createAssistantMessage(
  text: string,
  isPartial = false,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    type: "assistant",
    content: { type: "text", text },
    timestamp,
    isPartial,
  };
}

export function createToolUseMessage(
  toolName: string,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    type: "tool_use",
    content: { type: "tool_use", name: toolName, id: `tool-${timestamp}` },
    timestamp,
  };
}
```

---

## 3. アクセシビリティテスト

### ダイアログ検証

```typescript
describe("アクセシビリティ", () => {
  it("ダイアログロールと属性が正しい", () => {
    render(<PermissionDialog />);
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  it("フォーカストラップが機能する", async () => {
    render(<PermissionDialog />);
    const dialog = screen.getByRole("dialog");
    const buttons = dialog.querySelectorAll("button");

    // 最後の要素でTabを押すと最初に戻る
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(buttons[0]);
  });
});
```

### コンボボックス検証

```typescript
it("コンボボックスのARIA属性が正しい", () => {
  render(<SkillSelector />);
  const trigger = screen.getByRole("combobox");

  expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveAttribute("aria-controls");
});

it("選択状態でaria-activedescendantが更新される", async () => {
  const user = userEvent.setup();
  render(<SkillSelector />);

  await user.click(screen.getByRole("combobox"));
  await user.keyboard("{ArrowDown}");

  expect(screen.getByRole("combobox"))
    .toHaveAttribute("aria-activedescendant", "skill-option-0");
});
```

---

## 4. キーボードナビゲーション

### 必須テストマトリクス

| キー         | テスト内容     | 検証項目                              |
| ------------ | -------------- | ------------------------------------- |
| ArrowUp/Down | オプション移動 | フォーカス位置、aria-activedescendant |
| Enter        | 選択確定       | 選択値、ダイアログ閉じ                |
| Escape       | キャンセル     | ダイアログ閉じ、フォーカス復帰        |
| Tab          | 順方向トラップ | 最後→最初の循環                       |
| Shift+Tab    | 逆方向トラップ | 最初→最後の循環                       |
| Home/End     | 境界移動       | 最初/最後の要素                       |

### 実装例

```typescript
describe("キーボードナビゲーション", () => {
  it("ArrowDownでリストを開く", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("Escapeでリストを閉じる", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
```

---

## 5. 非同期テスト

### waitForパターン

```typescript
it("インポート成功後にダイアログが閉じる", async () => {
  const onClose = vi.fn();
  render(<SkillImportDialog onClose={onClose} />);

  await user.click(screen.getByRole("button", { name: /インポート/ }));

  await waitFor(() => {
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

### エラーハンドリング

```typescript
it("インポート失敗時はダイアログが開いたまま", async () => {
  mockImportSkill.mockRejectedValue(new Error("import failed"));
  const onClose = vi.fn();

  render(<SkillImportDialog onClose={onClose} />);
  await user.click(screen.getByRole("button", { name: /インポート/ }));

  await waitFor(() => {
    expect(mockImportSkill).toHaveBeenCalled();
  });

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
});
```

---

## 6. テスト構成

### describe階層

```typescript
describe("ComponentName", () => {
  describe("表示制御", () => {
    it("TC-001: 初期状態で正しく表示される", () => {});
    it("TC-002: データなし時にプレースホルダーを表示", () => {});
  });

  describe("ユーザーインタラクション", () => {
    it("TC-101: ボタンクリックでアクションが実行される", () => {});
    it("TC-102: 入力変更が状態に反映される", () => {});
  });

  describe("アクセシビリティ", () => {
    it("TC-201: ARIA属性が正しく設定されている", () => {});
    it("TC-202: キーボード操作が可能", () => {});
  });

  describe("エッジケース", () => {
    it("TC-301: 空データで正しく処理される", () => {});
    it("TC-302: 長い文字列が切り詰められる", () => {});
  });
});
```

### 命名規則

- **TC-{カテゴリコード}{番号}**: テストケースID
- カテゴリ: 0xx=表示、1xx=操作、2xx=a11y、3xx=エッジ
- **FR-XX / NFR-XX**: 要件トレーサビリティ参照

---

## 7. userEvent vs fireEvent

### userEvent推奨（デフォルト）

```typescript
const user = userEvent.setup();
await user.click(button); // 実際のクリック動作
await user.type(input, "text"); // 文字入力
await user.keyboard("{Enter}"); // キー操作
```

### fireEvent使用ケース

```typescript
// 直接DOMイベント（userEventで再現困難）
fireEvent.keyDown(document, { key: "Escape" });

// パフォーマンス最適化（大量操作）
fireEvent.change(input, { target: { value: "text" } });
```

---

## 8. テストファイル分離パターン（TASK-FIX-4-2）

> **実装完了**: 2026-02-07（TASK-FIX-4-2）

複雑なサービスクラスのテストは、責務ごとにファイルを分離することで可読性と保守性を向上させる。

### ファイル分類

| ファイル種別 | 命名規則 | テスト内容 |
|-------------|----------|-----------|
| 永続化テスト | `*.persistence.test.ts` | ストア保存・復元、再起動シミュレーション、データ整合性 |
| エラーテスト | `*.error.test.ts` | 異常系、例外処理、フォールバック動作、エラーメッセージ |
| 境界値テスト | `*.boundary.test.ts` | null、空配列、最大長、Unicode、特殊文字 |
| 基本テスト | `*.test.ts` | 正常系、基本的なCRUD操作 |

### 利点

| 利点 | 詳細 |
|------|------|
| 責務の明確化 | 各ファイルが単一の観点に集中 |
| 可読性向上 | テストケースを探しやすい |
| 並列実行 | Vitestでファイル単位の並列実行が容易 |
| 選択的実行 | 特定カテゴリのテストのみ実行可能 |
| チーム分担 | 異なるメンバーが異なるファイルを担当可能 |

### 実行コマンド例

| コマンド | 実行対象 |
|----------|----------|
| `vitest SkillImportManager.test.ts` | 基本テストのみ |
| `vitest SkillImportManager.persistence.test.ts` | 永続化テストのみ |
| `vitest SkillImportManager.*.test.ts` | 全カテゴリ |
| `vitest --grep "boundary"` | 全ファイルの境界値テスト |

### 適用基準

| 条件 | 推奨 |
|------|------|
| テストケースが50件以上 | 分離を強く推奨 |
| テストケースが20-50件 | 分離を検討 |
| テストケースが20件未満 | 単一ファイルで十分 |

### 実装例

SkillImportManagerのテストファイル構成:

| ファイル | ケース数 | 内容 |
|----------|----------|------|
| `SkillImportManager.test.ts` | 基本 | インポート・削除・リスト取得 |
| `SkillImportManager.persistence.test.ts` | 永続化 | ストア保存・復元・アプリ再起動 |
| `SkillImportManager.error.test.ts` | エラー | 無効な値・型エラー・フォールバック |
| `SkillImportManager.boundary.test.ts` | 境界値 | 空配列・大量データ・Unicode |

---

## 9. Zustand Store Hooks テストパターン

> **実装完了**: 2026-02-12（UT-STORE-HOOKS-TEST-REFACTOR-001）

### 概要

個別セレクタHook（`useAvailableSkillsMetadata()`, `useFetchSkills()` 等）のテストには `@testing-library/react` の `renderHook` を使用する。Store全体のモックではなく、実際の `useAppStore` 統合ストアを用いて個別セレクタの動作を検証する。

### 基本パターン

#### パターン1: 状態セレクタテスト

初期値の検証に使用する。Store生成直後の状態を確認する。

```typescript
const { result } = renderHook(() => useAvailableSkillsMetadata());
expect(result.current).toEqual([]);
```

#### パターン2: 状態変更テスト

`useAppStore.setState()` で状態を変更し、セレクタの戻り値が追従することを検証する。

```typescript
const { result } = renderHook(() => useAvailableSkillsMetadata());
act(() => {
  useAppStore.setState({ availableSkillsMetadata: mockData });
});
expect(result.current).toEqual(mockData);
```

#### パターン3: 非同期アクションテスト

`act()` で非同期アクションをラップし、副作用完了後の状態を検証する。

```typescript
const { result } = renderHook(() => ({
  fetchSkills: useFetchSkills(),
  skills: useAvailableSkillsMetadata(),
}));
await act(async () => {
  await result.current.fetchSkills();
});
expect(result.current.skills).toEqual(expected);
```

#### パターン4: 関数参照安定性テスト

Zustandアクション関数の参照が `rerender()` 後も同一であることを `toBe()` で検証する。

```typescript
const { result, rerender } = renderHook(() => useFetchSkills());
const firstRef = result.current;
rerender();
expect(result.current).toBe(firstRef);
```

#### パターン5: 無限ループ防止テスト（P31対策）

`useEffect` 内でアクション関数を依存配列に含めても無限ループが発生しないことを、レンダー回数が5未満であることで検証する。

```typescript
const renderCount = { current: 0 };
renderHook(() => {
  renderCount.current++;
  const action = useFetchSkills();
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) { initRef.current = true; }
  }, [action]);
});
await act(async () => {
  await new Promise(r => setTimeout(r, 100));
});
expect(renderCount.current).toBeLessThan(5);
```

#### パターン6: 再レンダー最適化テスト

無関係なState変更後に個別セレクタの戻り値が参照同一であることを `toBe()` で検証する。

```typescript
const { result } = renderHook(() => useFetchSkills());
const firstRef = result.current;
act(() => {
  useAppStore.setState({ unrelatedField: "changed" });
});
expect(result.current).toBe(firstRef);
```

### テスト環境要件

| 要件 | 設定値 |
|---|---|
| テスト環境ディレクティブ | `@vitest-environment happy-dom` |
| localStorage | `Object.defineProperty(window, 'localStorage', {...})` でポリフィル |
| electronAPI | `window.electronAPI` を `Object.defineProperty` で完全モック設定 |
| electronAPIモック範囲 | `authMode`（`getAuthMode`, `setAuthMode`）、`llm`（`getProviders`, `setLLM`, `getLLM`）、`skill`（`getSkills`, `rescanSkills`, `importSkill`, `removeSkill`, `executeSkill`, `abortExecution`, `respondToPermission`, `onStream`, `onComplete`, `onError`, `onPermissionRequest`） |
| ストア | `useAppStore` 統合ストア使用（モック不要） |
| beforeEach | `vi.clearAllMocks()` + electronAPI設定 + `resetStore()` |
| afterEach | `cleanup()` + `vi.restoreAllMocks()` |

#### electronAPI モック実装例

テスト環境で `window.electronAPI` を完全にモックするためのヘルパー関数:

```typescript
function createMockElectronAPI() {
  return {
    authMode: {
      get: vi.fn().mockResolvedValue({ success: true, data: { mode: "subscription" } }),
      set: vi.fn().mockResolvedValue({ success: true }),
      status: vi.fn().mockResolvedValue({ success: true, data: null }),
      validate: vi.fn().mockResolvedValue({ success: true, data: { isValid: true } }),
      onModeChanged: vi.fn(),
    },
    llm: {
      getProviders: vi.fn().mockResolvedValue([]),
      checkHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
    },
    skill: {
      list: vi.fn().mockResolvedValue([]),
      getImported: vi.fn().mockResolvedValue([]),
      import: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue(undefined),
      rescan: vi.fn().mockResolvedValue([]),
      execute: vi.fn().mockResolvedValue({ executionId: "test-exec-id" }),
      abort: vi.fn().mockResolvedValue(undefined),
      onStream: vi.fn().mockReturnValue(() => {}),
      onComplete: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
      getExecutionStatus: vi.fn().mockResolvedValue(null),
    },
  };
}
```

> **注意**: authMode + llm + skill の3セクション全体をモックする必要がある。skill セクションのみのモックでは、useAppStore 統合ストアの初期化時にエラーが発生する。

### 選択基準

| テスト対象 | 推奨パターン | 理由 |
|---|---|---|
| 状態セレクタ（プリミティブ値） | パターン1 + パターン2 | 初期値と変更後の値を検証 |
| 状態セレクタ（配列・オブジェクト） | パターン1 + パターン2 + パターン6 | 加えて参照安定性を検証 |
| アクションセレクタ（同期） | パターン2 + パターン4 | 状態変更と参照安定性を検証 |
| アクションセレクタ（非同期） | パターン3 + パターン4 + パターン5 | 非同期完了、参照安定性、無限ループ防止を検証 |
| 派生セレクタ | パターン1 + パターン2 | 計算結果の正確性を検証 |

### テスト実績

| テストファイル | テスト数 | パターン | 関連タスク |
|---|---|---|---|
| `authModeSlice.selectors.test.ts` | 70+ | renderHook | UT-STORE-HOOKS-REFACTOR-001 |
| `llmSlice.selectors.test.ts` | 60+ | renderHook | UT-STORE-HOOKS-REFACTOR-001 |
| `agentSlice.selectors.test.ts` | 114 | renderHook | UT-STORE-HOOKS-TEST-REFACTOR-001（移行完了） |

**関連タスク**: UT-STORE-HOOKS-TEST-REFACTOR-001, UT-STORE-HOOKS-REFACTOR-001

---

## 10. Main Process SDKテスト有効化パターン（TASK-FIX-11-1-SDK-TEST-ENABLEMENT）

> **実装完了**: 2026-02-13（TASK-FIX-11-1-SDK-TEST-ENABLEMENT）

### 概要

`apps/desktop/src/main/slide/__tests__/` 配下のSDK統合テストで、TODOプレースホルダーを実テスト化する際の標準パターン。

### パターン1: `mockRejectedValueOnce` による1回限りエラー注入

```typescript
mockCreate.mockRejectedValueOnce(new Error("Invalid API key"));
const result = await executor.execute("html", projectPath);
expect(result.success).toBe(false);
```

`mockRejectedValue` の恒久変更を避け、後続テストへの状態リーク（P9）を防止する。

### パターン2: `beforeEach` でモックのデフォルト動作を再設定

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  mockCreate.mockReset();
  mockCreate.mockResolvedValue(defaultResponse);
});
```

`vi.clearAllMocks()` は呼び出し履歴しか消さないため、`mockReset` + デフォルト実装再設定を併用する。

### パターン3: Fake Timersでタイムアウトを決定論的に検証

```typescript
const queryPromise = agentAPI.query({
  prompt: "Test prompt",
  options: { timeout: 30000 },
});

await Promise.all([
  vi.advanceTimersByTimeAsync(31000),
  expect(queryPromise).rejects.toThrow("Request timeout"),
]);
```

`Promise.all` で「タイマー進行」と「reject検証」を同時に待つことで、テストハングを回避する。

### パターン4: モジュール全体モック時のタイムアウト検証

`vi.mock("../agent-client")` でモジュールを差し替えるテストでは、内部タイマー処理ではなく `mockAgentAPI.query.mockRejectedValueOnce(new Error("Request timeout"))` でエラーを直接シミュレートする。

### 適用ファイル

| ファイル | 主な適用パターン |
| --- | --- |
| `apps/desktop/src/main/slide/__tests__/agent-client.test.ts` | パターン1, 2, 3 |
| `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | パターン1, 2, 3 |
| `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts` | パターン1, 2, 4 |

---

## 11. SkillEditor テストパターン（TASK-9A-C spec_created）

> **ステータス**: 仕様書作成済み（実装未着手）
> TASK-9A-C のテスト実装時に適用する標準パターンを定義する。

### textareaテスト

textarea要素の値変更テストでは `fireEvent.change` を使用する（P39: happy-dom環境でのuserEvent非互換対策）。

| テスト対象 | イベント | パターン |
|-----------|----------|---------|
| テキスト入力 | `fireEvent.change(textarea, { target: { value: 'new content' } })` | 値の直接設定 |
| Tab挿入 | `fireEvent.keyDown(textarea, { key: 'Tab' })` | preventDefault確認 + スペース挿入 |
| 読み取り専用 | `render(<SkillCodeEditor isReadOnly={true} />)` | textarea の `readOnly` 属性確認 |

### IPC mockパターン

`window.electronAPI.skill.readFile` / `writeFile` をモックし、IPC通信結果をシミュレートする。

| モック対象 | 設定例 | 用途 |
|-----------|--------|------|
| `readFile` | `vi.fn().mockResolvedValue('file content')` | ファイル読み込み成功 |
| `readFile`（エラー） | `vi.fn().mockRejectedValue(new Error('ENOENT'))` | ファイル未存在 |
| `writeFile` | `vi.fn().mockResolvedValue(undefined)` | ファイル保存成功 |
| `writeFile`（エラー） | `vi.fn().mockRejectedValue(new Error('EACCES'))` | 権限エラー |

### ファイルツリーテスト

`role="treeitem"` セレクタでツリーノードを検証する。

| テスト対象 | セレクタ | 検証内容 |
|-----------|---------|---------|
| ツリー全体 | `screen.getByRole('tree')` | ツリー構造の存在確認 |
| ファイルノード | `screen.getAllByRole('treeitem')` | ノード数・テキスト内容 |
| ファイル選択 | `fireEvent.click(screen.getByRole('treeitem', { name: 'SKILL.md' }))` | 選択状態 + readFile呼び出し |

### キーボードショートカットテスト

`fireEvent.keyDown` でキーボードショートカットの動作を検証する。

| ショートカット | テストコード | 検証内容 |
|---------------|-------------|---------|
| Cmd+S（保存） | `fireEvent.keyDown(document, { key: 's', metaKey: true })` | writeFile 呼び出し |
| Escape（閉じる） | `fireEvent.keyDown(document, { key: 'Escape' })` | onClose コールバック |
| Tab（スペース挿入） | `fireEvent.keyDown(textarea, { key: 'Tab' })` | 2スペース挿入 |

### 非同期テスト

IPC呼び出しの完了を待機するには `await act(async () => {...})` パターンを使用する（P39準拠）。

| パターン | 用途 | 注意点 |
|---------|------|--------|
| `await act(async () => { fireEvent.click(el) })` | IPC呼び出しトリガー後の状態更新待機 | happy-dom環境必須 |
| `await waitFor(() => { expect(mockReadFile).toHaveBeenCalled() })` | IPC呼び出し完了確認 | タイムアウト設定に注意 |
| `await act(async () => { fireEvent.keyDown(document, { key: 's', metaKey: true }) })` | 保存ショートカット後の状態更新 | hasChanges フラグ確認 |

### テスト環境要件

| 要件 | 設定値 |
|------|--------|
| テスト環境 | `@vitest-environment happy-dom` |
| イベント発火 | `fireEvent`（`userEvent` 使用禁止、P39） |
| 実行ディレクトリ | `apps/desktop/` 配下（P40対策） |
| IPC mock | `window.electronAPI.skill.readFile` / `writeFile` を `vi.fn()` でモック |

**関連タスク**: TASK-9A-C（spec_created）

---

## 参照

- **テストフィクスチャ**: [testing-fixtures.md](testing-fixtures.md)
- **品質要件**: [quality-requirements.md](quality-requirements.md)
- **UIコンポーネント仕様**: [ui-ux-components.md](ui-ux-components.md)
- **状態管理パターン Store Hooksテスト実装ガイド**: [arch-state-management.md](arch-state-management.md#store-hooks-テスト実装ガイド)

---

## 関連未タスク

| タスクID                  | タスク名                           | 優先度 | 発見元    | 概要                                                             |
| ------------------------- | ---------------------------------- | ------ | --------- | ---------------------------------------------------------------- |
| TASK-IMP-VITEST-UTILS-001 | Vitestテスト共通ユーティリティ整備 | 中     | TASK-9A-A | ESModuleモッキング回避パターン・一時ディレクトリヘルパーの共通化 |

> **配置先**: `docs/30-workflows/unassigned-task/task-vitest-test-utilities-improvement.md`

---

## 変更履歴

| Version | Date       | Changes                                                            |
| ------- | ---------- | ------------------------------------------------------------------ |
| 1.5.0   | 2026-02-19 | TASK-9A-C: SkillEditorテストパターン追加（textareaテスト、IPC mockパターン、ファイルツリーテスト、キーボードショートカットテスト、非同期テスト）。spec_created（実装未着手）を明記 |
| 1.4.0   | 2026-02-13 | TASK-FIX-11-1-SDK-TEST-ENABLEMENT: Main Process SDKテスト有効化パターンを追加（mockRejectedValueOnce、beforeEach再設定、Fake Timersタイムアウト検証、モジュールモック時の直接エラー注入） |
| 1.3.0   | 2026-02-12 | UT-STORE-HOOKS-TEST-REFACTOR-001: Zustand Store Hooksテストパターンセクション追加（renderHook 6パターン、テスト環境要件、選択基準、テスト実績） |
| 1.2.0   | 2026-02-07 | TASK-FIX-4-2: テストファイル分離パターンセクション追加（永続化・エラー・境界値テスト分離） |
| 1.1.0   | 2026-02-03 | TASK-9A-A: 関連未タスクセクション追加（TASK-IMP-VITEST-UTILS-001） |
| 1.0.0   | 2026-02-02 | TASK-8Bパターンから初版作成（280テスト知見統合）                   |
