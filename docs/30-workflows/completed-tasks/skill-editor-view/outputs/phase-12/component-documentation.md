# SkillEditorView コンポーネントドキュメント

## コンポーネント一覧

### SkillEditorView（organism）

ルートビューコンポーネント。2ペインレイアウト（FileTree + Editor）を構成する。

```typescript
interface SkillEditorViewProps {
  skillName: string;
  isReadOnly?: boolean; // default: false
  onClose: () => void;
}
```

| 内部状態管理 | フック              | 用途                      |
| ------------ | ------------------- | ------------------------- |
| ファイル編集 | `useSkillEditor`    | content, hasChanges, save |
| ツリー表示   | `useFileTree`       | fileTree, selectedFile    |
| 未保存警告   | `useUnsavedWarning` | dialog制御                |
| 保存中フラグ | `useState`          | isSaving                  |

---

### FileTreePanel（molecule）

左ペインのファイルツリー。幅240px固定。内部で `expandedDirs` を管理する非制御コンポーネント。

```typescript
interface FileTreePanelProps {
  fileTree: SkillFileTreeNode[];
  selectedFile: string;
  unsavedFiles: Set<string>;
  onSelectFile: (path: string) => void;
}
```

- ARIA: `role="tree"`
- 空ツリー: 「ファイルがありません」メッセージ表示

---

### FileTreeNode（atom）

ファイルツリーの各ノード。ディレクトリノードは子要素を再帰的にレンダリング。

```typescript
interface FileTreeNodeProps {
  node: SkillFileTreeNode;
  depth: number;
  isSelected: boolean;
  unsavedFiles?: Set<string>;
  expandedDirs?: Set<string>;
  onSelect: (path: string) => void;
  onToggleExpand?: (path: string) => void;
}
```

- ARIA: `role="treeitem"`, `aria-selected`, `aria-expanded`
- アイコン: File / Folder / FolderOpen（lucide-react）
- 未保存マーカー: `unsavedFiles` Set に含まれるファイルにドット表示
- インデント: `depth * 16px`

---

### EditorToolBar（molecule）

エディター上部のツールバー。保存・バックアップ・閉じるボタンを配置。

```typescript
interface EditorToolBarProps {
  selectedFile: string;
  hasChanges: boolean;
  isSaving: boolean;
  isReadOnly: boolean;
  onSave: () => void;
  onClose: () => void;
  onOpenBackups: () => void;
}
```

- ARIA: `role="toolbar"`, `aria-label="エディターツールバー"`
- 保存ボタン: `disabled` = `!hasChanges || isSaving || isReadOnly`
- 保存中: Loader2（animate-spin）アイコン表示
- ファイル名: 選択ファイルのパス + 未保存時 `●` マーカー

---

### EditorPanel（molecule）

右ペインのエディター。textarea + EditorStatusBar を含む。

```typescript
interface EditorPanelProps {
  content: string;
  language: string;
  isLoading: boolean;
  isReadOnly: boolean;
  onChange: (value: string) => void;
}
```

- ローディング中: スピナー表示
- 空コンテンツ: 「ファイルを選択してください」メッセージ
- 読み取り専用: textarea の `readOnly` 属性で制御

---

### EditorStatusBar（atom）

エディター下部のステータスバー。行数・文字数・言語を表示。

```typescript
interface EditorStatusBarProps {
  lineCount: number;
  charCount: number;
  language: string;
}
```

- 言語名: `capitalizeLanguage()` で先頭大文字変換

---

### UnsavedChangesDialog（organism）

未保存変更時の確認ダイアログ。3つの選択肢を提供。

```typescript
interface UnsavedChangesDialogProps {
  isOpen: boolean;
  fileName: string;
  onSaveAndContinue: () => void;
  onDiscardAndContinue: () => void;
  onCancel: () => void;
}
```

- ARIA: `role="alertdialog"`, `aria-modal="true"`, `aria-label="未保存の変更"`
- Escape キー: `onCancel` を呼び出し
- オーバーレイクリック: `onCancel` を呼び出し
- ボタン: 「保存せず続行」「キャンセル」「保存して続行」

---

### BackupMenu（molecule）

バックアップ一覧を表示し、復元操作を提供。

```typescript
interface BackupMenuProps {
  backups: BackupEntry[];
  isLoading: boolean;
  onRestore: (backupPath: string) => void;
}
```

- ARIA: `role="menu"`
- 各項目: `role="menuitem"`
- 日付表示: 日本語フォーマット（`toLocaleDateString('ja-JP')`）
- ローディング中: 読み込みメッセージ表示
- 空リスト: 空メッセージ表示

## カスタムフック

### useSkillEditor

```typescript
function useSkillEditor(
  skillName: string,
  isReadOnly: boolean,
): {
  content: string;
  isLoading: boolean;
  hasChanges: boolean;
  error: string;
  currentPath: string;
  language: string;
  loadFile: (path: string) => Promise<void>;
  saveFile: () => Promise<void>;
  updateContent: (value: string) => void;
};
```

### useFileTree

```typescript
function useFileTree(skillName: string): {
  fileTree: SkillFileTreeNode[];
  selectedFile: string;
  error: string;
  selectFile: (path: string) => void;
  refreshTree: () => Promise<void>;
  createFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
};
```

### useUnsavedWarning

```typescript
function useUnsavedWarning(
  hasChanges: boolean,
  onSave: () => Promise<void>,
): {
  isDialogOpen: boolean;
  pendingPath: string | null;
  requestNavigation: (path: string) => boolean;
  confirmSave: () => Promise<void>;
  confirmDiscard: () => void;
  cancelNavigation: () => void;
};
```
