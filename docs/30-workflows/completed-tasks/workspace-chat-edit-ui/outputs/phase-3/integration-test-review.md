# 統合テスト観点レビュー

## メタ情報

| 項目   | 内容                   |
| ------ | ---------------------- |
| Phase  | 3                      |
| タスク | 統合テスト観点レビュー |
| 作成日 | 2026-01-24             |
| 機能名 | workspace-chat-edit-ui |

---

## 1. コンポーネント間連携のテスト可能性

### 1.1 コンポーネント-Hooks連携

| コンポーネント      | 依存Hook       | テスト分離可能性         | 判定 |
| ------------------- | -------------- | ------------------------ | ---- |
| FileContextBadge    | useFileContext | ✅ Hookモック可能        | ✅   |
| ApplyControls       | useDiffApply   | ✅ Hookモック可能        | ✅   |
| FileContextDropZone | useFileContext | ✅ Hookモック可能        | ✅   |
| DiffPreview         | useDiffApply   | ✅ Hookモック可能        | ✅   |
| DiffEditor          | なし           | ✅ Props経由でテスト可能 | ✅   |
| EditCommandInput    | なし           | ✅ Props経由でテスト可能 | ✅   |

### 1.2 テスト分離パターン

```typescript
// Hookのモック例
vi.mock("@/hooks/useFileContext", () => ({
  useFileContext: () => ({
    fileContexts: mockFileContexts,
    isDragging: false,
    error: null,
    attachFile: vi.fn(),
    removeFileContext: vi.fn(),
    setDragging: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// コンポーネント単体テスト
describe("FileContextBadge", () => {
  it("should render file name", () => {
    render(<FileContextBadge context={mockContext} />);
    expect(screen.getByText("file.ts")).toBeInTheDocument();
  });
});
```

| 確認項目        | 対応状況                         | 判定 |
| --------------- | -------------------------------- | ---- |
| Hookモック戦略  | ✅ vi.mockで分離可能             | ✅   |
| Props経由テスト | ✅ 全コンポーネントPropsで制御可 | ✅   |
| 状態注入        | ✅ モックで任意の状態設定可能    | ✅   |

---

## 2. Hooks統合テストシナリオ

### 2.1 useFileContext統合テスト

| シナリオ         | テスト内容                           | 設計からの導出 |
| ---------------- | ------------------------------------ | -------------- |
| ファイル添付成功 | attachFile → fileContexts更新        | ✅ 導出可能    |
| ファイル添付失敗 | attachFile → error設定               | ✅ 導出可能    |
| ファイル削除     | removeFileContext → fileContexts更新 | ✅ 導出可能    |
| 上限到達         | addFileContext → error設定           | ✅ 導出可能    |
| 重複ファイル     | addFileContext → warning設定         | ✅ 導出可能    |
| ドラッグ状態管理 | setDragging → isDragging更新         | ✅ 導出可能    |

```typescript
describe("useFileContext integration", () => {
  it("should add file context and update state", async () => {
    // モックIPC
    vi.mocked(window.chatEditAPI.readFile).mockResolvedValue({
      success: true,
      content: "const x = 1;",
    });

    const { result } = renderHook(() => useFileContext());

    await act(async () => {
      await result.current.attachFile("/path/to/file.ts");
    });

    expect(result.current.fileContexts).toHaveLength(1);
    expect(result.current.fileContexts[0].fileName).toBe("file.ts");
  });

  it("should set error when file read fails", async () => {
    vi.mocked(window.chatEditAPI.readFile).mockResolvedValue({
      success: false,
      error: "ファイルが見つかりません",
    });

    const { result } = renderHook(() => useFileContext());

    await act(async () => {
      await result.current.attachFile("/nonexistent.ts");
    });

    expect(result.current.error).toBe("ファイルが見つかりません");
  });
});
```

### 2.2 useDiffApply統合テスト

| シナリオ       | テスト内容                                  | 設計からの導出 |
| -------------- | ------------------------------------------- | -------------- |
| 差分適用成功   | applyResult → ファイル書き込み → status更新 | ✅ 導出可能    |
| 差分適用失敗   | applyResult → error設定                     | ✅ 導出可能    |
| 差分却下       | rejectResult → status更新                   | ✅ 導出可能    |
| プレビュー開閉 | openDiffPreview/closeDiffPreview → 状態更新 | ✅ 導出可能    |

```typescript
describe("useDiffApply integration", () => {
  it("should apply result and write file", async () => {
    vi.mocked(window.chatEditAPI.writeFile).mockResolvedValue({
      success: true,
    });

    // 事前に結果を設定
    useChatEditStore.getState().setGeneratedResult(mockResult);

    const { result } = renderHook(() => useDiffApply());

    await act(async () => {
      await result.current.applyResult(mockResult.id);
    });

    expect(window.chatEditAPI.writeFile).toHaveBeenCalledWith(
      mockResult.filePath,
      mockResult.generatedContent,
    );

    const state = useChatEditStore.getState();
    expect(
      state.generatedResults.find((r) => r.id === mockResult.id)?.status,
    ).toBe("approved");
  });
});
```

---

## 3. コンポーネント統合テストシナリオ

### 3.1 FileContextDropZone + FileContextBadge統合

| シナリオ              | テスト内容                            | 設計からの導出 |
| --------------------- | ------------------------------------- | -------------- |
| ドロップ→バッジ表示   | ファイルドロップ → バッジレンダリング | ✅ 導出可能    |
| バッジ削除→リスト更新 | 削除クリック → バッジ消失             | ✅ 導出可能    |
| 複数ファイルドロップ  | 複数ファイル → 複数バッジ表示         | ✅ 導出可能    |

```typescript
describe("FileContextDropZone + FileContextBadge integration", () => {
  it("should render badge after file drop", async () => {
    render(
      <FileContextDropZone>
        {fileContexts.map((ctx) => (
          <FileContextBadge key={ctx.id} context={ctx} />
        ))}
      </FileContextDropZone>,
    );

    // ファイルドロップをシミュレート
    const dropZone = screen.getByRole("region");
    const file = new File(["content"], "test.ts", { type: "text/plain" });

    await fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText("test.ts")).toBeInTheDocument();
    });
  });
});
```

### 3.2 DiffPreview + DiffEditor + ApplyControls統合

| シナリオ            | テスト内容                             | 設計からの導出 |
| ------------------- | -------------------------------------- | -------------- |
| プレビュー表示      | 結果選択 → DiffEditor表示              | ✅ 導出可能    |
| 適用クリック→閉じる | 適用ボタン → ファイル書き込み → 閉じる | ✅ 導出可能    |
| 却下クリック→閉じる | 却下ボタン → プレビュー閉じる          | ✅ 導出可能    |
| Escapeキー→閉じる   | Escape押下 → プレビュー閉じる          | ✅ 導出可能    |

```typescript
describe("DiffPreview + ApplyControls integration", () => {
  it("should close preview after apply", async () => {
    const onClose = vi.fn();
    const onApplied = vi.fn();

    vi.mocked(window.chatEditAPI.writeFile).mockResolvedValue({
      success: true,
    });

    render(
      <DiffPreview result={mockResult} onClose={onClose} onApplied={onApplied} />,
    );

    const applyButton = screen.getByRole("button", { name: "変更を適用" });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(onApplied).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
```

---

## 4. モック戦略の妥当性

### 4.1 外部依存のモック

| 依存対象           | モック方法                      | 妥当性  | 判定 |
| ------------------ | ------------------------------- | ------- | ---- |
| Monaco Editor      | vi.mock('@monaco-editor/react') | ✅ 適切 | ✅   |
| window.chatEditAPI | vi.stubGlobal                   | ✅ 適切 | ✅   |
| useFileContext     | vi.mock                         | ✅ 適切 | ✅   |
| useDiffApply       | vi.mock                         | ✅ 適切 | ✅   |
| Zustand Store      | createTestStore                 | ✅ 適切 | ✅   |

### 4.2 Monaco Editorモック詳細

```typescript
// Monaco Editorのモック（設計書から）
vi.mock("@monaco-editor/react", () => ({
  DiffEditor: vi.fn(({ original, modified, language, onMount }) => {
    React.useEffect(() => {
      onMount?.({
        layout: vi.fn(),
        dispose: vi.fn(),
      });
    }, [onMount]);

    return (
      <div data-testid="mock-monaco-diff-editor">
        <div data-testid="original">{original}</div>
        <div data-testid="modified">{modified}</div>
        <div data-testid="language">{language}</div>
      </div>
    );
  }),
}));
```

| 確認項目        | モック対応                 | 判定 |
| --------------- | -------------------------- | ---- |
| onMount呼び出し | ✅ useEffectでシミュレート | ✅   |
| エディタAPI模倣 | ✅ layout/disposeモック    | ✅   |
| Props確認可能   | ✅ data-testidで値確認     | ✅   |

### 4.3 IPC APIモック詳細

```typescript
// IPC APIモック設定
const mockChatEditAPI = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  openFileDialog: vi.fn(),
};

beforeAll(() => {
  vi.stubGlobal("chatEditAPI", mockChatEditAPI);
});

afterEach(() => {
  vi.clearAllMocks();
});
```

| 確認項目       | モック対応                    | 判定 |
| -------------- | ----------------------------- | ---- |
| readFile       | ✅ 成功/失敗両方設定可能      | ✅   |
| writeFile      | ✅ 成功/失敗両方設定可能      | ✅   |
| openFileDialog | ✅ ファイル選択シミュレート可 | ✅   |

---

## 5. 統合テストカバレッジ目標

### 5.1 カバレッジ目標

| 指標     | 目標値 | 達成可能性評価          |
| -------- | ------ | ----------------------- |
| Line     | 80%    | ✅ 主要パスをカバー可能 |
| Branch   | 60%    | ✅ 条件分岐をカバー可能 |
| Function | 80%    | ✅ 全関数をテスト可能   |

### 5.2 優先テスト対象

| 優先度 | 対象                     | 理由               |
| ------ | ------------------------ | ------------------ |
| 高     | ファイル添付フロー       | メイン機能         |
| 高     | 差分適用フロー           | クリティカルパス   |
| 高     | エラーハンドリング       | ユーザー体験に直結 |
| 中     | キーボードナビゲーション | アクセシビリティ   |
| 中     | レスポンシブ対応         | マルチデバイス対応 |
| 低     | アニメーション・遷移     | 視覚的改善         |

---

## 6. テストユーティリティ設計

### 6.1 テストヘルパー

```typescript
// テスト用ストア作成
const createTestStore = (initialState?: Partial<ChatEditState>) => {
  return create<ChatEditSlice>()((set, get) => ({
    ...initialChatEditState,
    ...initialState,
    // アクション実装...
  }));
};

// テスト用ラッパー
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StoreProvider store={createTestStore()}>{children}</StoreProvider>
);

// カスタムレンダー
const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: TestWrapper, ...options });
```

### 6.2 アクセシビリティテストヘルパー

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

const expectNoA11yViolations = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};
```

---

## 7. レビュー結果サマリー

### 7.1 統合テスト観点評価

| 評価項目                 | 結果 |
| ------------------------ | ---- |
| コンポーネント-Hooks分離 | ✅   |
| 統合テストシナリオ導出   | ✅   |
| モック戦略妥当性         | ✅   |
| カバレッジ目標達成可能性 | ✅   |

### 7.2 指摘事項

**指摘なし** - 設計から統合テストシナリオが適切に導出可能です。

---

## 8. 判定

**判定: PASS**

理由:

- 各コンポーネントがHooksと独立してテスト可能
- コンポーネント統合テストのシナリオが設計から導出可能
- 外部依存（Monaco Editor等）のモック戦略が妥当
- カバレッジ目標（Line 80%, Branch 60%, Function 80%）が達成可能な設計

---

## 作成日時

- 作成: 2026-01-24
- 作成者: Claude Code
