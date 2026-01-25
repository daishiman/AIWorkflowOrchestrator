# 状態管理設計書

## メタ情報

| 項目   | 内容                   |
| ------ | ---------------------- |
| Phase  | 2                      |
| タスク | 状態管理設計           |
| 作成日 | 2026-01-24             |
| 機能名 | workspace-chat-edit-ui |

---

## 1. 状態管理アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                        UI Components Layer                           │
│  FileContextBadge, ApplyControls, FileContextDropZone,               │
│  DiffPreview, DiffEditor, EditCommandInput                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Hooks Layer                                  │
│  useFileContext, useDiffApply                                        │
│  - ビジネスロジックのカプセル化                                       │
│  - コンポーネントとストアの橋渡し                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Zustand Store Layer                            │
│  chatEditSlice                                                       │
│  - グローバル状態の一元管理                                           │
│  - 不変性を保った状態更新                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. chatEditSlice 状態定義

### 2.1 状態インターフェース

```typescript
interface ChatEditState {
  /** 添付ファイル一覧 */
  fileContexts: FileContext[];

  /** アクティブなコンテキストID */
  activeContextId: string | null;

  /** 生成結果一覧 */
  generatedResults: GeneratedResult[];

  /** 現在表示中の結果ID */
  currentResultId: string | null;

  /** ローディング中 */
  isLoading: boolean;

  /** 差分プレビュー表示中 */
  isDiffPreviewOpen: boolean;

  /** エラーメッセージ */
  error: string | null;

  /** 警告メッセージ */
  warning: string | null;

  /** ドラッグ中 */
  isDragging: boolean;
}
```

### 2.2 初期状態

```typescript
const initialChatEditState: ChatEditState = {
  fileContexts: [],
  activeContextId: null,
  generatedResults: [],
  currentResultId: null,
  isLoading: false,
  isDiffPreviewOpen: false,
  error: null,
  warning: null,
  isDragging: false,
};
```

---

## 3. アクション定義

### 3.1 アクションインターフェース

```typescript
interface ChatEditActions {
  // ファイルコンテキスト管理
  addFileContext: (context: Omit<FileContext, "id" | "addedAt">) => void;
  removeFileContext: (id: string) => void;
  clearAllContexts: () => void;
  setActiveContext: (id: string | null) => void;

  // 生成結果管理
  setGeneratedResult: (result: GeneratedResult) => void;
  approveResult: (resultId: string) => Promise<ApplyResult>;
  rejectResult: (resultId: string) => void;
  clearResults: () => void;

  // プレビュー管理
  openDiffPreview: (resultId: string) => void;
  closeDiffPreview: () => void;

  // UI状態管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  setDragging: (dragging: boolean) => void;

  // リセット
  reset: () => void;
}
```

### 3.2 アクション実装パターン

```typescript
const createChatEditSlice: StateCreator<ChatEditSlice> = (set, get) => ({
  ...initialChatEditState,

  addFileContext: (context) =>
    set((state) => {
      // バリデーション
      if (state.fileContexts.length >= MAX_FILE_CONTEXTS) {
        return {
          ...state,
          error: `添付ファイル数の上限（${MAX_FILE_CONTEXTS}）に達しました`,
        };
      }

      // 重複チェック
      const isDuplicate = state.fileContexts.some(
        (fc) => fc.filePath === context.filePath,
      );
      if (isDuplicate) {
        return {
          ...state,
          warning: "このファイルは既に添付されています",
        };
      }

      const newContext: FileContext = {
        ...context,
        id: generateId(),
        addedAt: new Date().toISOString(),
      };

      return {
        ...state,
        fileContexts: [...state.fileContexts, newContext],
        activeContextId: newContext.id,
        error: null,
        warning: null,
      };
    }),

  removeFileContext: (id) =>
    set((state) => {
      const index = state.fileContexts.findIndex((fc) => fc.id === id);
      if (index === -1) return state;

      const newContexts = state.fileContexts.filter((fc) => fc.id !== id);

      // アクティブコンテキストの調整
      let newActiveId = state.activeContextId;
      if (state.activeContextId === id) {
        // 削除されたコンテキストがアクティブだった場合、前後のコンテキストに移動
        if (newContexts.length > 0) {
          const newIndex = Math.min(index, newContexts.length - 1);
          newActiveId = newContexts[newIndex].id;
        } else {
          newActiveId = null;
        }
      }

      return {
        ...state,
        fileContexts: newContexts,
        activeContextId: newActiveId,
      };
    }),

  approveResult: async (resultId) => {
    const state = get();
    const result = state.generatedResults.find((r) => r.id === resultId);

    if (!result) {
      throw new Error("結果が見つかりません");
    }

    set({ isLoading: true, error: null });

    try {
      // IPCでファイル書き込み
      const writeResult = await window.chatEditAPI.writeFile(
        result.filePath,
        result.generatedContent,
      );

      if (!writeResult.success) {
        throw new Error(writeResult.error);
      }

      // 状態更新
      set((state) => ({
        ...state,
        generatedResults: state.generatedResults.map((r) =>
          r.id === resultId ? { ...r, status: "approved" as const } : r,
        ),
        isLoading: false,
        isDiffPreviewOpen: false,
        currentResultId: null,
      }));

      return { success: true, filePath: result.filePath };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "ファイルの書き込みに失敗しました";

      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  rejectResult: (resultId) =>
    set((state) => ({
      ...state,
      generatedResults: state.generatedResults.map((r) =>
        r.id === resultId ? { ...r, status: "rejected" as const } : r,
      ),
      isDiffPreviewOpen: false,
      currentResultId: null,
    })),
});
```

---

## 4. コンポーネント-状態マッピング

### 4.1 参照する状態

| コンポーネント      | 参照する状態                                         |
| ------------------- | ---------------------------------------------------- |
| FileContextBadge    | fileContexts, activeContextId                        |
| ApplyControls       | isLoading, error                                     |
| FileContextDropZone | isDragging, fileContexts, error, warning             |
| DiffPreview         | currentResultId, isDiffPreviewOpen, generatedResults |
| DiffEditor          | なし（Props経由）                                    |
| EditCommandInput    | なし（ローカル状態のみ）                             |

### 4.2 呼び出すアクション

| コンポーネント      | 呼び出すアクション                    |
| ------------------- | ------------------------------------- |
| FileContextBadge    | removeFileContext, setActiveContext   |
| ApplyControls       | approveResult, rejectResult           |
| FileContextDropZone | setDragging, addFileContext, setError |
| DiffPreview         | closeDiffPreview                      |
| DiffEditor          | なし                                  |
| EditCommandInput    | なし（Props経由でonSubmitを呼び出し） |

---

## 5. Hooks設計

### 5.1 useFileContext

```typescript
interface UseFileContextReturn {
  // 状態
  fileContexts: FileContext[];
  activeContextId: string | null;
  isDragging: boolean;
  error: string | null;
  warning: string | null;
  canAddContext: boolean;
  totalContextSize: number;

  // アクション
  attachFile: (filePath: string, selection?: TextSelection) => Promise<void>;
  addFileContext: (context: Omit<FileContext, "id" | "addedAt">) => void;
  removeFileContext: (id: string) => void;
  clearAllContexts: () => void;
  setActiveContext: (id: string | null) => void;
  setDragging: (dragging: boolean) => void;
  clearError: () => void;
}

export const useFileContext = (): UseFileContextReturn => {
  const {
    fileContexts,
    activeContextId,
    isDragging,
    error,
    warning,
    addFileContext,
    removeFileContext,
    clearAllContexts,
    setActiveContext,
    setDragging,
    setError,
  } = useChatEditStore();

  const canAddContext = fileContexts.length < MAX_FILE_CONTEXTS;

  const totalContextSize = useMemo(
    () => fileContexts.reduce((acc, fc) => acc + (fc.content?.length ?? 0), 0),
    [fileContexts],
  );

  const attachFile = useCallback(
    async (filePath: string, selection?: TextSelection) => {
      try {
        // IPCでファイル読み込み
        const result = await window.chatEditAPI.readFile(filePath);

        if (!result.success) {
          setError(result.error);
          return;
        }

        // サイズチェック
        if (result.content.length > MAX_FILE_SIZE) {
          setError(
            `ファイルサイズが${MAX_FILE_SIZE / 1024 / 1024}MBを超えています`,
          );
          return;
        }

        addFileContext({
          filePath,
          fileName: extractFileName(filePath),
          content: result.content,
          language: detectLanguage(filePath),
          selection,
        });
      } catch (error) {
        setError("ファイルの読み込みに失敗しました");
      }
    },
    [addFileContext, setError],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    fileContexts,
    activeContextId,
    isDragging,
    error,
    warning,
    canAddContext,
    totalContextSize,
    attachFile,
    addFileContext,
    removeFileContext,
    clearAllContexts,
    setActiveContext,
    setDragging,
    clearError,
  };
};
```

### 5.2 useDiffApply

```typescript
interface UseDiffApplyReturn {
  // 状態
  currentResult: GeneratedResult | null;
  isDiffPreviewOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // アクション
  calculateDiff: (original: string, generated: string) => DiffHunk[];
  applyResult: (resultId: string) => Promise<ApplyResult>;
  rejectResult: (resultId: string) => void;
  openDiffPreview: (resultId: string) => void;
  closeDiffPreview: () => void;
}

export const useDiffApply = (): UseDiffApplyReturn => {
  const {
    generatedResults,
    currentResultId,
    isDiffPreviewOpen,
    isLoading,
    error,
    approveResult,
    rejectResult,
    openDiffPreview: storeOpenDiffPreview,
    closeDiffPreview: storeCloseDiffPreview,
  } = useChatEditStore();

  const currentResult = useMemo(
    () => generatedResults.find((r) => r.id === currentResultId) ?? null,
    [generatedResults, currentResultId],
  );

  const calculateDiff = useCallback(
    (original: string, generated: string): DiffHunk[] => {
      // LCSアルゴリズムベースの差分計算
      const originalLines = original.split("\n");
      const generatedLines = generated.split("\n");

      return generateDiffHunks(originalLines, generatedLines);
    },
    [],
  );

  const openDiffPreview = useCallback(
    (resultId: string) => {
      storeOpenDiffPreview(resultId);
    },
    [storeOpenDiffPreview],
  );

  const closeDiffPreview = useCallback(() => {
    storeCloseDiffPreview();
  }, [storeCloseDiffPreview]);

  return {
    currentResult,
    isDiffPreviewOpen,
    isLoading,
    error,
    calculateDiff,
    applyResult: approveResult,
    rejectResult,
    openDiffPreview,
    closeDiffPreview,
  };
};
```

---

## 6. 状態更新フロー

### 6.1 ファイル添付フロー

```
1. FileContextDropZone: ファイルドロップ
   ↓
2. useFileContext.attachFile(filePath)
   ↓
3. IPC: window.chatEditAPI.readFile(filePath)
   ↓ [非同期]
4. バリデーション（サイズ、数）
   ↓
5. chatEditSlice.addFileContext(context)
   ↓
6. Zustand Store更新: fileContexts.push(newContext)
   ↓
7. React再レンダリング
   ↓
8. FileContextBadge: 新しいバッジ表示
```

### 6.2 差分適用フロー

```
1. ApplyControls: 適用ボタンクリック
   ↓
2. useDiffApply.applyResult(resultId)
   ↓
3. chatEditSlice.approveResult(resultId)
   ↓
4. Zustand Store更新: isLoading = true
   ↓
5. IPC: window.chatEditAPI.writeFile(filePath, content)
   ↓ [非同期]
6. 成功/失敗判定
   ├── 成功: result.status = 'approved', isLoading = false
   └── 失敗: error = errorMessage, isLoading = false
   ↓
7. React再レンダリング
   ↓
8. DiffPreview: 閉じる / エラー表示
```

---

## 7. 楽観的更新

### 7.1 楽観的更新が必要なケース

| 操作                     | 楽観的更新 | ロールバック条件       |
| ------------------------ | ---------- | ---------------------- |
| ファイルコンテキスト追加 | ✅ 対象    | ファイル読み込み失敗時 |
| ファイルコンテキスト削除 | ✅ 対象    | なし（即時反映）       |
| 差分適用                 | ❌ 非対象  | ファイル書き込み失敗時 |
| 差分却下                 | ✅ 対象    | なし（即時反映）       |
| ドラッグ状態変更         | ✅ 対象    | なし（即時反映）       |

### 7.2 ロールバック実装

```typescript
// ファイルコンテキスト追加の楽観的更新とロールバック
const attachFile = useCallback(
  async (filePath: string) => {
    // 楽観的更新用の仮ID
    const tempId = `temp-${Date.now()}`;

    // 楽観的に追加
    addFileContext({
      id: tempId,
      filePath,
      fileName: extractFileName(filePath),
      content: "", // プレースホルダー
      language: detectLanguage(filePath),
      isLoading: true, // ローディング状態を表示
    });

    try {
      const result = await window.chatEditAPI.readFile(filePath);

      if (!result.success) {
        // ロールバック
        removeFileContext(tempId);
        setError(result.error);
        return;
      }

      // 実際のデータで更新
      updateFileContext(tempId, {
        content: result.content,
        isLoading: false,
      });
    } catch (error) {
      // ロールバック
      removeFileContext(tempId);
      setError("ファイルの読み込みに失敗しました");
    }
  },
  [addFileContext, removeFileContext, updateFileContext, setError],
);
```

---

## 8. セレクター設計

### 8.1 メモ化セレクター

```typescript
// 派生状態のセレクター
export const selectCanAddContext = (state: ChatEditState): boolean =>
  state.fileContexts.length < MAX_FILE_CONTEXTS;

export const selectTotalContextSize = (state: ChatEditState): number =>
  state.fileContexts.reduce((acc, fc) => acc + (fc.content?.length ?? 0), 0);

export const selectCurrentResult = (
  state: ChatEditState,
): GeneratedResult | null =>
  state.generatedResults.find((r) => r.id === state.currentResultId) ?? null;

export const selectPendingResults = (state: ChatEditState): GeneratedResult[] =>
  state.generatedResults.filter((r) => r.status === "pending");

export const selectApprovedResults = (
  state: ChatEditState,
): GeneratedResult[] =>
  state.generatedResults.filter((r) => r.status === "approved");
```

### 8.2 使用方法

```typescript
// コンポーネント内での使用
const canAddContext = useChatEditStore(selectCanAddContext);
const totalSize = useChatEditStore(selectTotalContextSize);
const currentResult = useChatEditStore(selectCurrentResult);
```

---

## 9. テスト戦略

### 9.1 ストアテスト

```typescript
describe("chatEditSlice", () => {
  beforeEach(() => {
    // ストアをリセット
    useChatEditStore.getState().reset();
  });

  describe("addFileContext", () => {
    it("should add file context to the list", () => {
      const { addFileContext } = useChatEditStore.getState();

      addFileContext({
        filePath: "/path/to/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
      });

      const { fileContexts } = useChatEditStore.getState();
      expect(fileContexts).toHaveLength(1);
      expect(fileContexts[0].fileName).toBe("file.ts");
    });

    it("should return error when max contexts reached", () => {
      const { addFileContext } = useChatEditStore.getState();

      // MAX_FILE_CONTEXTS個追加
      for (let i = 0; i < MAX_FILE_CONTEXTS; i++) {
        addFileContext({
          filePath: `/path/to/file${i}.ts`,
          fileName: `file${i}.ts`,
          content: "",
          language: "typescript",
        });
      }

      // 上限超過
      addFileContext({
        filePath: "/path/to/overflow.ts",
        fileName: "overflow.ts",
        content: "",
        language: "typescript",
      });

      const { error, fileContexts } = useChatEditStore.getState();
      expect(fileContexts).toHaveLength(MAX_FILE_CONTEXTS);
      expect(error).toContain("上限");
    });
  });
});
```

---

## 作成日時

- 作成: 2026-01-24
- 作成者: Claude Code
