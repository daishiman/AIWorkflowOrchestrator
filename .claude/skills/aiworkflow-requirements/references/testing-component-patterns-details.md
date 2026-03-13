# コンポーネントテストパターン / detail specification

> 親仕様書: [testing-component-patterns.md](testing-component-patterns.md)
> 役割: detail specification

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
| electronAPIモック範囲 | `authMode`（`get`, `set`, `status`, `validate`, `onModeChanged`）、`llm`（`getProviders`, `setLLM`, `getLLM`）、`skill`（`getSkills`, `rescanSkills`, `importSkill`, `removeSkill`, `executeSkill`, `abortExecution`, `respondToPermission`, `onStream`, `onComplete`, `onError`, `onPermissionRequest`） |
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
      status: vi.fn().mockResolvedValue({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          hasCredentials: true,
          message: "Claude Code CLI の認証情報を使用できます",
          lastCheckedAt: Date.now(),
        },
      }),
      validate: vi.fn().mockResolvedValue({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          hasCredentials: true,
          message: "Claude Code CLI の認証情報を使用できます",
          lastCheckedAt: Date.now(),
        },
      }),
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

## 9.1 AuthMode 契約テストパターン（TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001）

auth-mode 契約テストでは shared transport DTO を正本とし、Main / Preload / Renderer / Phase 11 harness の4層で同じ shape を検証する。

### テスト観点

| レイヤー | テスト対象 | 固定する契約 |
| --- | --- | --- |
| Main IPC | `authModeHandlers.test.ts`, `authModeHandlers.error.test.ts` | `get/status/validate` の `IPCResponse<T>`、`changed` event payload、`auth-mode/invalid-sender` |
| Preload | `authModeApi.contract.test.ts`, `channels.test.ts` | `authMode.get/set/status/validate/onModeChanged` の公開 shape |
| Renderer Store | `authModeSlice*.test.ts`, `infinite-loop-prevention.test.tsx` | `AuthModeStatus` fallback、`validate(request?)`、selector 安定性 |
| View | `SettingsView.test.tsx`, `AuthModeSelector.test.tsx` | `message/errorCode/guidance` 表示、選択 UI、disabled 状態 |

### `window.electronAPI.authMode` モック規約

| API | 返却値 / payload |
| --- | --- |
| `get` | `Promise.resolve({ success: true, data: { mode: "subscription" } })` |
| `set` | `Promise.resolve({ success: true })` |
| `status` | `Promise.resolve({ success: true, data: { mode: "subscription", isValid: true, hasCredentials: true, message: "...", lastCheckedAt: 0 } })` |
| `validate` | `Promise.resolve({ success: true, data: AuthModeStatus })` |
| `onModeChanged` | `vi.fn().mockImplementation((cb) => unsubscribe)` |

**注意**: `getAuthMode` / `setAuthMode` の旧命名モックは使用しない。公開 API 名は `get`, `set`, `status`, `validate`, `onModeChanged` に固定する。

### Renderer テストの実装パターン

| パターン | 目的 |
| --- | --- |
| `renderHook(() => useValidateAuthMode())` | `validate(request?)` の optional request 契約を検証する |
| `renderHook(() => useInitializeAuthMode())` + `rerender()` | `initializeAuthMode` 参照安定性を検証する |
| `window.electronAPI.authMode.onModeChanged` のコールバック直接発火 | `event.mode` / `event.status` が store に反映されることを検証する |
| `response?.success` を返す失敗ケース | `AuthModeStatus` fallback が UI で描画可能な shape を維持することを確認する |

### Phase 11 視覚検証用 harness

| 項目 | 内容 |
| --- | --- |
| 目的 | App 全体初期化ノイズを避け、`SettingsView` 単体で auth-mode 表示契約を視覚確認する |
| 実装 | `apps/desktop/src/renderer/phase11-auth-mode.html`, `phase11-auth-mode.tsx` |
| 撮影スクリプト | `apps/desktop/scripts/capture-auth-mode-contract-alignment-phase11.mjs` |
| 検証対象 | 初期表示、API Key 未設定、subscription 未設定、mode 変更、復帰の 5 ケース |

### テスト実績

| コマンド / 対象 | 結果 |
| --- | --- |
| AuthMode 関連 10 test files | PASS（252 tests） |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001` | PASS（5/5） |

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

## 11. SkillEditor テストパターン（TASK-9A completed）

> **ステータス**: 実装完了（2026-02-26）
> TASK-9A-skill-editor で実装・検証した標準パターンを定義する。

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

**関連タスク**: TASK-9A（completed）

---

## 12. テーマ横断テストヘルパー（TASK-UI-00-TOKENS）

`tokens.css` の複数テーマ（`kanagawa-dragon` / `light` / `dark`）を同一テストで検証する場合は、`renderWithTheme` / `renderWithAllThemes` を使用する。

### 推奨ヘルパー

| ヘルパー | 用途 | 備考 |
| --- | --- | --- |
| `renderWithTheme(ui, { theme })` | 単一テーマの検証 | `data-theme` を都度設定 |
| `renderWithAllThemes(ui)` | 3テーマ横断の検証 | 回帰テストの網羅性向上 |

### 実装パターン

```typescript
const { light, dark, "kanagawa-dragon": dragon } = renderWithAllThemes(
  <StatusIndicator status="success" />,
);

expect(light.getByRole("status")).toBeInTheDocument();
expect(dark.getByRole("status")).toBeInTheDocument();
expect(dragon.getByRole("status")).toBeInTheDocument();
```

### 注意点

- `afterEach` で `document.documentElement.removeAttribute("data-theme")` を実行する
- `fireEvent` ベース（P39）を維持し、`userEvent` は導入しない
- テーマ追加時はヘルパー定数を更新し、関連テストを同時更新する

---

