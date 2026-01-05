# 検索パネルレンダリング不具合 - 設計書

**ドキュメントID**: T-01-1-design
**作成日**: 2024-12-24
**ステータス**: Draft
**作成者**: ui-designer

---

## 1. 状態管理設計

### 1.1 currentFilePathの取得元

**結論**: `currentFilePath`は**workspaceSlice**から取得される。

```typescript
// workspaceSlice.ts
interface WorkspaceState {
  currentWorkspace: string | null;
  openFiles: string[];
  activeFile: string | null; // ← これがcurrentFilePathの実体
  isLoading: boolean;
  error: string | null;
}
```

**取得方法**:

```typescript
// EditorView/index.tsx
const activeFile = useWorkspaceStore((state) => state.activeFile);

// UnifiedSearchPanel.tsx / FileSearchPanel.tsx
const { activeFile } = useWorkspaceStore();
```

### 1.2 currentFilePath（activeFile）の更新タイミング

| 更新トリガー                       | 呼び出されるアクション                           | 更新元        |
| ---------------------------------- | ------------------------------------------------ | ------------- |
| ファイルツリーでファイルをクリック | `setActiveFile(filePath)`                        | FileTree      |
| タブをクリック                     | `setActiveFile(filePath)`                        | FileTabs      |
| ファイルを閉じる                   | `closeFile(filePath)` → 次のファイルへ切替       | FileTabs      |
| 新規ファイル作成                   | `openFile(filePath)` → `setActiveFile(filePath)` | FileTree/Menu |

**workspaceSlice アクション定義**:

```typescript
setActiveFile: (filePath: string | null) => {
  set({ activeFile: filePath });
},

closeFile: (filePath: string) => {
  const { openFiles, activeFile } = get();
  const newOpenFiles = openFiles.filter((f) => f !== filePath);
  set({
    openFiles: newOpenFiles,
    activeFile:
      activeFile === filePath
        ? newOpenFiles[newOpenFiles.length - 1] || null
        : activeFile,
  });
},
```

### 1.3 modeの切り替えロジック

**searchSlice**で管理される`mode`は、検索パネル内のタブ切り替えを制御する。

```typescript
// searchSlice.ts
type SearchMode = 'global' | 'file';

interface SearchState {
  mode: SearchMode;
  isOpen: boolean;
  // ...
}

setMode: (mode: SearchMode) => {
  set({ mode });
},
```

**切り替えUI**: UnifiedSearchPanel内のタブ

- 「Global Search」タブ → `setMode('global')`
- 「File Search」タブ → `setMode('file')`

---

## 2. レンダリング条件設計

### 2.1 現状のレンダリング条件

#### UnifiedSearchPanel

**表示条件**: `isOpen === true`

```typescript
// EditorView/index.tsx
const { isOpen } = useSearchStore();

return (
  <div>
    {isOpen && <UnifiedSearchPanel />}
    {/* ... */}
  </div>
);
```

**問題点**: `isOpen`のみで判定しており、`activeFile`の存在を考慮していない。

#### FileSearchPanel（UnifiedSearchPanel内）

**現状の表示条件**:

```typescript
// UnifiedSearchPanel.tsx
{
  mode === 'file' && <FileSearchPanel />;
}
```

**FileSearchPanel内部の条件**:

```typescript
// FileSearchPanel.tsx
const { activeFile } = useWorkspaceStore();

if (!activeFile) {
  return (
    <div className="p-4 text-muted-foreground">
      ファイルを選択してください
    </div>
  );
}

return (
  // 検索UI
);
```

### 2.2 問題の根本原因

**仮説1が確定**: `isOpen`と`activeFile`の同期が取れていない。

**発生シナリオ**:

1. ユーザーがCmd+Fを押下
2. `searchSlice.isOpen`が`true`になる
3. UnifiedSearchPanelがレンダリングされる
4. **この時点で`workspaceSlice.activeFile`がnullの可能性がある**
5. FileSearchPanelは「ファイルを選択してください」を表示

**なぜactiveFileがnullになるのか**:

- アプリ起動直後（ファイル未選択）
- 全てのタブを閉じた後
- ファイル読み込み中（非同期処理中）

### 2.3 条件判定の優先順位（現状）

```
1. isOpen === true → UnifiedSearchPanelをレンダリング
2. mode === 'file' → FileSearchPanelをレンダリング
3. activeFile !== null → 検索UIを表示
4. activeFile === null → プレースホルダーを表示
```

---

## 3. 状態フロー図

### 3.1 正常フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                         正常フロー                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [ファイルツリー]         [workspaceSlice]        [EditorView]  │
│        │                        │                      │       │
│        │  クリック              │                      │       │
│        ├───────────────────────►│                      │       │
│        │                        │  setActiveFile(path) │       │
│        │                        ├─────────────────────►│       │
│        │                        │                      │       │
│        │                        │  activeFile = path   │       │
│        │                        │◄─────────────────────┤       │
│        │                        │                      │       │
│  [ユーザー]              [searchSlice]                 │       │
│        │                        │                      │       │
│        │  Cmd+F                 │                      │       │
│        ├───────────────────────►│                      │       │
│        │                        │  setIsOpen(true)     │       │
│        │                        ├─────────────────────►│       │
│        │                        │                      │       │
│        │                        │  isOpen = true       │       │
│        │                        │  activeFile = path ✓ │       │
│        │                        │                      │       │
│        │                 [UnifiedSearchPanel]          │       │
│        │                        │                      │       │
│        │                        │  レンダリング        │       │
│        │                        ├─────────────────────►│       │
│        │                        │                      │       │
│        │                 [FileSearchPanel]             │       │
│        │                        │                      │       │
│        │                        │  activeFile あり     │       │
│        │                        │  → 検索UI表示 ✓      │       │
│        │                        │                      │       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 問題発生フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                       問題発生フロー                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [アプリ起動]            [workspaceSlice]        [EditorView]   │
│        │                        │                      │       │
│        │  初期化                │                      │       │
│        ├───────────────────────►│                      │       │
│        │                        │  activeFile = null   │       │
│        │                        │◄─────────────────────┤       │
│        │                        │                      │       │
│  [ユーザー]              [searchSlice]                 │       │
│        │                        │                      │       │
│        │  Cmd+F（ファイル未選択）│                      │       │
│        ├───────────────────────►│                      │       │
│        │                        │  setIsOpen(true)     │       │
│        │                        ├─────────────────────►│       │
│        │                        │                      │       │
│        │                        │  isOpen = true       │       │
│        │                        │  activeFile = null ✗ │       │
│        │                        │                      │       │
│        │                 [UnifiedSearchPanel]          │       │
│        │                        │                      │       │
│        │                        │  レンダリング        │       │
│        │                        ├─────────────────────►│       │
│        │                        │                      │       │
│        │                 [FileSearchPanel]             │       │
│        │                        │                      │       │
│        │                        │  activeFile = null   │       │
│        │                        │  → プレースホルダー ✗│       │
│        │                        │                      │       │
│  ※ ユーザーは検索UIを期待しているが、                          │
│    「ファイルを選択してください」が表示される                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 状態の同期ポイント

| ポイント         | 関係するSlice                | 同期の必要性         |
| ---------------- | ---------------------------- | -------------------- |
| ファイル選択時   | workspaceSlice               | activeFileが更新     |
| 検索パネル開閉時 | searchSlice                  | isOpenが更新         |
| モード切替時     | searchSlice                  | modeが更新           |
| **問題点**       | workspaceSlice ↔ searchSlice | **同期されていない** |

### 3.4 非同期処理の有無

**workspaceSlice**:

- `loadWorkspace`: 非同期（ファイル一覧取得）
- `openFile`: 非同期（ファイル内容取得の可能性）
- `setActiveFile`: **同期**

**searchSlice**:

- `setIsOpen`: **同期**
- `setMode`: **同期**
- `search`: 非同期（検索処理）

**結論**: `setActiveFile`と`setIsOpen`は共に同期処理だが、呼び出し順序の保証がない。

---

## 4. 修正方針

### 4.1 根本原因の特定

要件定義書の3つの仮説を検証した結果:

| 仮説                                | 検証結果                                        | 判定         |
| ----------------------------------- | ----------------------------------------------- | ------------ |
| H-001: isOpenとactiveFileの同期不足 | searchSliceはactiveFileを参照していない         | **確定**     |
| H-002: 条件分岐の順序不正           | 条件は正しいが、activeFile=null時の挙動が不適切 | 部分的に該当 |
| H-003: mode切替時の副作用           | mode切替自体には問題なし                        | 該当しない   |

**根本原因**: `activeFile`が`null`の状態で検索パネルを開いた場合の挙動が未定義。

### 4.2 修正案の比較

#### 案A: 検索パネルを開く前にactiveFileを検証

**概要**: Cmd+F押下時、`activeFile`がnullならGlobal Searchモードで開く。

```typescript
// searchSlice.ts
openSearchPanel: () => {
  const activeFile = useWorkspaceStore.getState().activeFile;
  set({
    isOpen: true,
    mode: activeFile ? 'file' : 'global',
  });
},
```

**メリット**:

- ユーザーは常に意味のある検索UIを見る
- 既存のレンダリングロジックを変更不要

**デメリット**:

- searchSliceがworkspaceSliceに依存する（結合度上昇）
- ファイル選択後にmodeを手動で切り替える必要あり

#### 案B: FileSearchPanelでGlobal Searchへの自動フォールバック

**概要**: FileSearchPanelで`activeFile`がnullの場合、Global Searchへ自動切替。

```typescript
// FileSearchPanel.tsx
const { activeFile } = useWorkspaceStore();
const { setMode } = useSearchStore();

useEffect(() => {
  if (!activeFile) {
    setMode("global");
  }
}, [activeFile, setMode]);
```

**メリット**:

- ユーザー体験がシームレス
- 状態の整合性が自動的に保たれる

**デメリット**:

- 暗黙的な挙動（ユーザーが意図しないmode切替）
- useEffectによる副作用が複雑化

#### 案C: UnifiedSearchPanelで条件付きレンダリング

**概要**: UnifiedSearchPanelレベルで`activeFile`を検証し、適切なパネルを表示。

```typescript
// UnifiedSearchPanel.tsx
const { activeFile } = useWorkspaceStore();
const { mode, setMode } = useSearchStore();

// activeFileがnullの場合、File Searchタブを無効化
const effectiveMode = activeFile ? mode : 'global';

// タブUIでFile Searchを disabled に
<Tab disabled={!activeFile}>File Search</Tab>
```

**メリット**:

- UIレベルで明確なフィードバック
- ユーザーが状況を理解しやすい

**デメリット**:

- タブUIの変更が必要
- 一時的にタブが無効化される

#### 案D: 警告付きプレースホルダーの改善（最小変更）

**概要**: 現状のプレースホルダーを改善し、ユーザーを誘導。

```typescript
// FileSearchPanel.tsx
if (!activeFile) {
  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <FileIcon className="w-12 h-12 text-muted-foreground" />
      <p className="text-muted-foreground">
        ファイル内検索を使用するには、まずファイルを開いてください。
      </p>
      <Button variant="outline" onClick={() => setMode('global')}>
        グローバル検索を使用
      </Button>
    </div>
  );
}
```

**メリット**:

- 変更範囲が最小
- ユーザーに明確な代替手段を提示

**デメリット**:

- 根本的な解決ではない
- ユーザーが追加のクリックを必要とする

### 4.3 推奨案

**推奨**: 案A + 案Dの組み合わせ

**理由**:

1. **案A**により、検索パネルを開く時点で適切なmodeが設定される
2. **案D**により、何らかの理由でactiveFileがnullになった場合のフォールバックが提供される
3. 結合度の上昇は許容範囲（searchSlice → workspaceSliceの一方向依存）
4. ユーザー体験が改善される

**実装優先度**:

1. 案A（必須）: 検索パネルを開く時のmode自動設定
2. 案D（推奨）: プレースホルダーの改善

---

## 5. 影響範囲の詳細

### 5.1 変更が必要なファイル

| ファイル               | 変更内容                               | 優先度 |
| ---------------------- | -------------------------------------- | ------ |
| `searchSlice.ts`       | `openSearchPanel`アクションの追加/修正 | 高     |
| `FileSearchPanel.tsx`  | プレースホルダーUI改善                 | 中     |
| `EditorView/index.tsx` | `setIsOpen`を`openSearchPanel`に変更   | 高     |

### 5.2 変更箇所の詳細

#### searchSlice.ts

**現状**:

```typescript
setIsOpen: (isOpen: boolean) => {
  set({ isOpen });
},
```

**変更後**:

```typescript
openSearchPanel: () => {
  const activeFile = useWorkspaceStore.getState().activeFile;
  set({
    isOpen: true,
    mode: activeFile ? 'file' : 'global',
  });
},

closeSearchPanel: () => {
  set({ isOpen: false });
},
```

#### EditorView/index.tsx

**現状**:

```typescript
const handleSearch = useCallback(() => {
  setIsOpen(true);
}, [setIsOpen]);
```

**変更後**:

```typescript
const { openSearchPanel, closeSearchPanel } = useSearchStore();

const handleSearch = useCallback(() => {
  openSearchPanel();
}, [openSearchPanel]);
```

#### FileSearchPanel.tsx

**現状**:

```typescript
if (!activeFile) {
  return (
    <div className="p-4 text-muted-foreground">ファイルを選択してください</div>
  );
}
```

**変更後**:

```typescript
if (!activeFile) {
  return (
    <div className="p-4 flex flex-col items-center gap-4 text-center">
      <Search className="w-12 h-12 text-muted-foreground" />
      <div>
        <p className="text-muted-foreground mb-2">
          ファイル内検索を使用するには、まずファイルを開いてください。
        </p>
        <Button variant="outline" size="sm" onClick={() => setMode('global')}>
          グローバル検索を使用
        </Button>
      </div>
    </div>
  );
}
```

### 5.3 変更が不要なファイル

| ファイル                 | 理由                           | 確認方法   |
| ------------------------ | ------------------------------ | ---------- |
| `UnifiedSearchPanel.tsx` | mode切替ロジックに変更なし     | 手動確認   |
| `workspaceSlice.ts`      | activeFile管理に変更なし       | 手動確認   |
| `FileTabs.tsx`           | タブ操作ロジックに変更なし     | 自動テスト |
| `FileTree.tsx`           | ファイル選択ロジックに変更なし | 自動テスト |

---

## 6. テスト計画

### 6.1 単体テスト

```typescript
describe("searchSlice", () => {
  describe("openSearchPanel", () => {
    it('activeFileがある場合、mode="file"で開く', () => {
      // Arrange
      useWorkspaceStore.setState({ activeFile: "/path/to/file.ts" });

      // Act
      useSearchStore.getState().openSearchPanel();

      // Assert
      expect(useSearchStore.getState().isOpen).toBe(true);
      expect(useSearchStore.getState().mode).toBe("file");
    });

    it('activeFileがnullの場合、mode="global"で開く', () => {
      // Arrange
      useWorkspaceStore.setState({ activeFile: null });

      // Act
      useSearchStore.getState().openSearchPanel();

      // Assert
      expect(useSearchStore.getState().isOpen).toBe(true);
      expect(useSearchStore.getState().mode).toBe("global");
    });
  });
});
```

### 6.2 統合テスト

```typescript
describe('FileSearchPanel', () => {
  it('activeFileがnullの場合、グローバル検索ボタンを表示', async () => {
    render(<FileSearchPanel />);

    expect(screen.getByText('グローバル検索を使用')).toBeInTheDocument();
  });

  it('グローバル検索ボタンをクリックするとmode="global"に切り替わる', async () => {
    render(<FileSearchPanel />);

    await userEvent.click(screen.getByText('グローバル検索を使用'));

    expect(useSearchStore.getState().mode).toBe('global');
  });
});
```

### 6.3 E2Eテスト

```typescript
test("ファイル未選択時にCmd+Fを押すとグローバル検索が開く", async ({
  page,
}) => {
  // アプリ起動後、ファイルを選択しない状態で
  await page.keyboard.press("Meta+f");

  // グローバル検索パネルが表示される
  await expect(page.getByTestId("global-search-panel")).toBeVisible();
});
```

---

## 7. リスク評価

| リスク                                | 影響度 | 発生確率 | 対策                 |
| ------------------------------------- | ------ | -------- | -------------------- |
| searchSliceとworkspaceSliceの循環依存 | 高     | 低       | 一方向依存のみ許可   |
| mode自動切替によるユーザー混乱        | 中     | 中       | UIで現在のmodeを明示 |
| 既存テストの破壊                      | 中     | 中       | テスト修正を含める   |

---

## 8. 完了条件チェックリスト

- [x] `currentFilePath`（`activeFile`）の取得元と更新経路が明記されている
- [x] FileSearchPanelの表示条件が明記されている
- [x] 影響範囲（SearchPanel/EditorView）が明確
- [x] 状態フロー図が作成されている
- [x] 修正方針が複数案比較されている
- [x] 推奨案とその理由が明記されている

---

## 9. 次のステップ

1. **T-02-1**: 設計レビュー（本設計書のレビュー）
2. **T-03-1**: テスト作成（TDD: Red）
3. **T-04-1**: 実装（TDD: Green）
4. **T-05-1**: リファクタリング（TDD: Refactor）

---

## 付録: 参照ファイル一覧

| ファイル           | パス                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| 要件定義書         | `docs/30-workflows/search-panel-rendering-bug/task-step00-requirements.md`          |
| UnifiedSearchPanel | `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx` |
| FileSearchPanel    | `apps/desktop/src/renderer/components/organisms/SearchPanel/FileSearchPanel.tsx`    |
| searchSlice        | `apps/desktop/src/renderer/store/slices/searchSlice.ts`                             |
| workspaceSlice     | `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`                          |
| EditorView         | `apps/desktop/src/renderer/views/EditorView/index.tsx`                              |
