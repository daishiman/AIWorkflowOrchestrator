# Phase 2: 設計 — スキルエディター機能

## メタ情報

| 項目      | 内容                                                    |
| --------- | ------------------------------------------------------- |
| タスクID  | TASK-9A                                                 |
| Phase     | 2                                                       |
| タスク名  | スキルエディター機能（SKILL.md・サブリソースのGUI編集） |
| 作成日    | 2026-02-26                                              |
| 依存Phase | Phase 1（要件定義）                                     |

## 目的

Phase 1 で定義した9つの機能要件（FR-1〜FR-9）と5つの非機能要件（NFR-1〜NFR-5）に対するアーキテクチャ設計を行う。TASK-9A-B で実装済みの IPC チャンネル・Preload API を Renderer コンポーネントから利用する設計を策定し、Zustand Store の拡張、コンポーネント階層、データフロー、状態遷移を定義する。

## 実行タスク

- Task 1: コンポーネント階層設計 — SkillEditor / FileTree / CodeEditor / BackupPanel の構成と責務を定義する
- Task 2: 状態管理設計 — skillSlice の拡張（ファイル編集状態）と個別セレクタを定義する
- Task 3: データフロー設計 — Renderer → Preload API → Main → SkillFileManager のデータ流れを定義する
- Task 4: FileTree コンポーネント設計 — ツリー構造のデータモデルと操作を定義する
- Task 5: CodeEditor コンポーネント設計 — エディタの表示・編集・保存のインタラクションを定義する
- Task 6: BackupPanel コンポーネント設計 — バックアップ一覧・復元の UI 設計を定義する
- Task 7: 未保存変更管理設計 — 変更検知、警告ダイアログ、ナビゲーションガードを定義する
- Task 8: アーキテクチャ層別設計 — Electron 3プロセスモデルの各層における設計を整理する

---

### Task 1: コンポーネント階層設計

#### コンポーネントツリー

```
SkillEditor (organisms)
├── FileTreePanel
│   ├── FileTree (tree structure)
│   │   ├── FileTreeNode (directory)
│   │   │   └── FileTreeNode (file, recursive)
│   │   └── FileTreeNode (file)
│   └── FileTreeActions (新規ファイル作成ボタン)
├── EditorPanel
│   ├── EditorToolbar (保存ボタン、ファイルパス表示、読み取り専用表示)
│   ├── CodeEditor (テキストエディタ本体)
│   └── EditorStatusBar (行数、変更状態)
├── BackupPanel (折りたたみ可能パネル)
│   ├── BackupList (バックアップ一覧)
│   │   └── BackupItem (個別バックアップ行)
│   └── BackupActions (復元ボタン)
└── UnsavedChangesDialog (モーダルダイアログ)
```

#### コンポーネント責務テーブル

| コンポーネント       | 責務                                            | Props                                            | 分類      |
| -------------------- | ----------------------------------------------- | ------------------------------------------------ | --------- |
| SkillEditor          | 全体レイアウト、状態の統合、パネル間連携        | `skillName: string`, `isReadOnly: boolean`       | organisms |
| FileTreePanel        | ファイルツリーパネルのレイアウト                | `skillName`, `isReadOnly`, `onFileSelect`        | molecules |
| FileTree             | ツリー構造の描画、展開/折りたたみ、ファイル選択 | `nodes: FileTreeNode[]`, `onSelect`, `onAction`  | molecules |
| FileTreeNode         | 個別ノードの描画（再帰）                        | `node`, `depth`, `isSelected`, `hasUnsaved`      | atoms     |
| FileTreeActions      | 新規ファイル作成ボタン                          | `isReadOnly`, `onCreate`                         | atoms     |
| EditorPanel          | エディタパネルのレイアウト                      | `file`, `isReadOnly`, `onSave`, `onChange`       | molecules |
| EditorToolbar        | ツールバー（保存ボタン、パス表示）              | `filePath`, `isReadOnly`, `hasUnsaved`, `onSave` | molecules |
| CodeEditor           | テキストエディタ本体（textarea ベース）         | `content`, `isReadOnly`, `onChange`              | molecules |
| EditorStatusBar      | ステータスバー（行数、変更状態）                | `lineCount`, `hasUnsaved`                        | atoms     |
| BackupPanel          | バックアップ一覧パネル（折りたたみ可能）        | `skillName`, `isReadOnly`, `onRestore`           | molecules |
| BackupList           | バックアップ一覧テーブル                        | `backups: BackupInfo[]`, `onRestore`             | molecules |
| BackupItem           | 個別バックアップ行                              | `backup: BackupInfo`, `isReadOnly`, `onRestore`  | atoms     |
| UnsavedChangesDialog | 未保存変更の警告ダイアログ                      | `isOpen`, `onSave`, `onDiscard`, `onCancel`      | molecules |

#### レイアウト設計

```
┌──────────────────────────────────────────────────┐
│  SkillEditor                                      │
├──────────────┬───────────────────────────────────┤
│  FileTree    │  EditorPanel                       │
│  Panel       │  ┌─────────────────────────────┐  │
│  (250px)     │  │ EditorToolbar               │  │
│              │  ├─────────────────────────────┤  │
│  - SKILL.md  │  │                             │  │
│  - agents/   │  │ CodeEditor                  │  │
│    - *.md    │  │ (textarea)                  │  │
│  - refs/     │  │                             │  │
│    - *.md    │  ├─────────────────────────────┤  │
│              │  │ EditorStatusBar             │  │
│  [+ 新規]    │  └─────────────────────────────┘  │
├──────────────┴───────────────────────────────────┤
│  BackupPanel (折りたたみ可能)                     │
│  [▶ バックアップ履歴 (3)]                         │
└──────────────────────────────────────────────────┘
```

- FileTreePanel の幅: 250px（固定）、リサイズ不可（初期バージョン）
- EditorPanel: 残りの幅を占有（flex-grow: 1）
- BackupPanel: 下部に配置、折りたたみ時は1行のヘッダーのみ表示

---

### Task 2: 状態管理設計

#### skillSlice 拡張

`apps/desktop/src/renderer/store/slices/skillSlice.ts` に以下の状態とアクションを追加する。

##### 追加する状態フィールド

```typescript
// === Skill Editor State (TASK-9A) ===

/** 現在選択中のスキル名 */
editorSelectedSkill: string | null;

/** 現在選択中のファイルの相対パス */
editorSelectedFile: string | null;

/** エディタ内の現在の内容（編集中テキスト） */
editorContent: string;

/** サーバーから読み込んだ元のファイル内容（未保存検出用） */
editorOriginalContent: string;

/** ファイルごとの未保存フラグ（キー: relativePath） */
editorUnsavedFiles: Record<string, boolean>;

/** ファイルツリーのノード一覧 */
editorFileTree: FileTreeNodeData[];

/** エディタのローディング状態 */
editorIsLoading: boolean;

/** エディタのエラーメッセージ */
editorError: string | null;

/** 選択中スキルが読み取り専用かどうか */
editorIsReadOnly: boolean;
```

##### 追加するアクション

```typescript
// === Skill Editor Actions (TASK-9A) ===

/** スキルを選択してファイルツリーをロードする */
editorSelectSkill: (skillName: string, isReadOnly: boolean) => Promise<void>;

/** ファイルを選択して内容をロードする */
editorSelectFile: (relativePath: string) => Promise<void>;

/** エディタ内容を更新する（ローカル状態のみ） */
editorUpdateContent: (content: string) => void;

/** ファイルを保存する */
editorSaveFile: () => Promise<void>;

/** 新規ファイルを作成する */
editorCreateFile: (relativePath: string, content: string) => Promise<void>;

/** ファイルを削除する */
editorDeleteFile: (relativePath: string) => Promise<void>;

/** バックアップから復元する */
editorRestoreBackup: (backupPath: string) => Promise<void>;

/** エディタ状態をリセットする */
editorReset: () => void;
```

##### FileTreeNodeData 型定義

```typescript
/** ファイルツリーノードのデータ型 */
export interface FileTreeNodeData {
  /** ファイル名（表示用） */
  name: string;
  /** スキルディレクトリからの相対パス */
  relativePath: string;
  /** ディレクトリかファイルか */
  type: "directory" | "file";
  /** 子ノード（ディレクトリの場合のみ） */
  children?: FileTreeNodeData[];
}
```

##### 個別セレクタ（P31 対策）

```typescript
// === Skill Editor Selectors (TASK-9A) ===

/** 現在選択中のスキル名を取得する */
export const useEditorSelectedSkill = (): string | null =>
  useAppStore((s) => s.editorSelectedSkill);

/** 現在選択中のファイルパスを取得する */
export const useEditorSelectedFile = (): string | null =>
  useAppStore((s) => s.editorSelectedFile);

/** エディタ内容を取得する */
export const useEditorContent = (): string =>
  useAppStore((s) => s.editorContent);

/** 未保存状態を取得する（現在選択中ファイル） */
export const useEditorHasUnsaved = (): boolean =>
  useAppStore((s) =>
    s.editorSelectedFile
      ? (s.editorUnsavedFiles[s.editorSelectedFile] ?? false)
      : false,
  );

/** 全ファイルの未保存マップを取得する */
export const useEditorUnsavedFiles = (): Record<string, boolean> =>
  useAppStore((s) => s.editorUnsavedFiles);

/** ファイルツリーノードを取得する */
export const useEditorFileTree = (): FileTreeNodeData[] =>
  useAppStore((s) => s.editorFileTree);

/** エディタのローディング状態を取得する */
export const useEditorIsLoading = (): boolean =>
  useAppStore((s) => s.editorIsLoading);

/** エディタのエラーメッセージを取得する */
export const useEditorError = (): string | null =>
  useAppStore((s) => s.editorError);

/** 読み取り専用状態を取得する */
export const useEditorIsReadOnly = (): boolean =>
  useAppStore((s) => s.editorIsReadOnly);

/** アクション: スキル選択 */
export const useEditorSelectSkill = () =>
  useAppStore((s) => s.editorSelectSkill);

/** アクション: ファイル選択 */
export const useEditorSelectFile = () => useAppStore((s) => s.editorSelectFile);

/** アクション: 内容更新 */
export const useEditorUpdateContent = () =>
  useAppStore((s) => s.editorUpdateContent);

/** アクション: ファイル保存 */
export const useEditorSaveFile = () => useAppStore((s) => s.editorSaveFile);

/** アクション: ファイル作成 */
export const useEditorCreateFile = () => useAppStore((s) => s.editorCreateFile);

/** アクション: ファイル削除 */
export const useEditorDeleteFile = () => useAppStore((s) => s.editorDeleteFile);

/** アクション: バックアップ復元 */
export const useEditorRestoreBackup = () =>
  useAppStore((s) => s.editorRestoreBackup);

/** アクション: エディタリセット */
export const useEditorReset = () => useAppStore((s) => s.editorReset);
```

---

### Task 3: データフロー設計

#### ファイル読み込みフロー

```
1. ユーザーがファイルツリーでファイルをクリック
2. SkillEditor が editorSelectFile(relativePath) を呼び出し
3. skillSlice が editorIsLoading = true に設定
4. skillSlice が window.electronAPI.skill.readFile(skillName, relativePath) を呼び出し
5. Preload API が safeInvokeUnwrap(IPC_CHANNELS.SKILL_FILE_READ, ...) を実行
6. Main Process ハンドラーが SkillFileManager.readFile() に委譲
7. 結果が Renderer に返却される
8. skillSlice が editorContent / editorOriginalContent を更新、editorIsLoading = false
```

#### ファイル保存フロー

```
1. ユーザーが Cmd+S または保存ボタンをクリック
2. SkillEditor が editorSaveFile() を呼び出し
3. skillSlice が window.electronAPI.skill.writeFile(skillName, relativePath, content) を呼び出し
4. Main Process ハンドラーが SkillFileManager.writeFile() に委譲（バックアップ自動作成）
5. SKILL.md の場合: ハンドラーが skillService.rescanSkill() を呼び出し
6. 結果が Renderer に返却される
7. skillSlice が editorOriginalContent = editorContent に更新（未保存フラグ解除）
8. 成功トーストを表示
```

#### ファイル削除フロー

```
1. ユーザーがファイルツリーのコンテキストメニューから「削除」を選択
2. 確認ダイアログを表示（「削除」「キャンセル」）
3. ユーザーが「削除」を選択
4. SkillEditor が editorDeleteFile(relativePath) を呼び出し
5. skillSlice が window.electronAPI.skill.deleteFile(skillName, relativePath) を呼び出し
6. Main Process ハンドラーが SkillFileManager.deleteFile() に委譲（バックアップ自動作成）
7. 結果が Renderer に返却される
8. skillSlice がファイルツリーを再取得し、削除ファイルが選択中の場合は選択解除
```

#### Preload API 呼び出しパターン

Renderer コンポーネントから Preload API を呼び出すパターン:

```typescript
// TASK-9A-B で追加された Preload API メソッドを使用する
// window.electronAPI.skill に6つのファイル操作メソッドが追加済み

// 読み込み
const content = await window.electronAPI.skill.readFile(
  skillName,
  relativePath,
);

// 書き込み
await window.electronAPI.skill.writeFile(skillName, relativePath, content);

// 作成
await window.electronAPI.skill.createFile(skillName, relativePath, content);

// 削除
await window.electronAPI.skill.deleteFile(skillName, relativePath);

// バックアップ一覧
const backups = await window.electronAPI.skill.listBackups(skillName);

// バックアップ復元
await window.electronAPI.skill.restoreBackup(skillName, backupPath);
```

---

### Task 4: FileTree コンポーネント設計

#### ファイルツリーデータの構築

SkillFileManager は `readFile` で個別ファイルを読むが、ファイル一覧を取得する直接的な IPC チャンネルは TASK-9A-B のスコープに含まれていない。ファイルツリーの構築方法:

**方式: スキルメタデータからの再構築**

スキルの `files` プロパティ（SkillFileManager がスキャン時に収集するファイル一覧）を利用する。既存の `skill:list` / `skill:getImported` IPC でスキルメタデータを取得し、`files` フィールドからツリー構造を構築する。

```typescript
/**
 * フラットなファイルパス配列からツリー構造を構築する
 *
 * @param files - ファイルパス配列（例: ["SKILL.md", "agents/main.md", "references/api.md"]）
 * @returns ツリーノード配列
 */
function buildFileTree(files: string[]): FileTreeNodeData[] {
  // 1. パスをスラッシュで分割
  // 2. ディレクトリノードを中間に挿入
  // 3. アルファベット順ソート（ディレクトリ優先）
  // 4. SKILL.md を先頭に固定
}
```

**ファイル一覧取得に IPC 追加が必要な場合**: `skill:listFiles` チャンネルの追加を未タスクとして記録する。ただし初期バージョンでは既存のスキルメタデータから構築する。

#### ツリーの WAI-ARIA 構造

```html
<ul role="tree" aria-label="スキルファイル一覧">
  <li role="treeitem" aria-expanded="true" aria-selected="false">
    <!-- ディレクトリノード -->
    <span>agents/</span>
    <ul role="group">
      <li role="treeitem" aria-selected="true">
        <!-- ファイルノード -->
        <span>main.md</span>
      </li>
    </ul>
  </li>
</ul>
```

#### キーボードナビゲーション

| キー  | 動作                                     |
| ----- | ---------------------------------------- |
| ↑     | 前のノードにフォーカス移動               |
| ↓     | 次のノードにフォーカス移動               |
| →     | ディレクトリを展開、またはファイルに移動 |
| ←     | ディレクトリを折りたたみ、または親に移動 |
| Enter | ファイルを選択（エディタに内容をロード） |
| Home  | ツリーの先頭にフォーカス移動             |
| End   | ツリーの末尾にフォーカス移動             |

---

### Task 5: CodeEditor コンポーネント設計

#### エディタ実装方式

**方式: textarea ベース（初期バージョン）**

初期バージョンでは `<textarea>` 要素をベースにしたシンプルなエディタを実装する。CodeMirror / Monaco Editor 等のリッチエディタは将来バージョンで検討する。

```typescript
interface CodeEditorProps {
  /** エディタに表示するコンテンツ */
  content: string;
  /** 読み取り専用モード */
  isReadOnly: boolean;
  /** 内容変更時のコールバック */
  onChange: (newContent: string) => void;
}
```

#### スタイリング設計

```css
/* CodeEditor textarea のスタイリング */
.code-editor-textarea {
  /* monospace フォント */
  font-family: "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;

  /* 全領域を占有 */
  width: 100%;
  height: 100%;
  resize: none;

  /* Apple HIG 準拠のスペーシング */
  padding: 16px; /* 8px grid × 2 */

  /* 読み取り専用時のスタイル */
  &[readonly] {
    background-color: var(--bg-secondary);
    cursor: default;
  }
}
```

#### キーボードショートカット

| ショートカット     | 動作                  | 条件                   |
| ------------------ | --------------------- | ---------------------- |
| `Cmd+S` / `Ctrl+S` | ファイル保存          | 読み取り専用でない場合 |
| `Cmd+Z` / `Ctrl+Z` | 元に戻す              | ブラウザネイティブ     |
| `Cmd+Shift+Z`      | やり直し              | ブラウザネイティブ     |
| `Tab`              | タブ挿入（2スペース） | エディタにフォーカス中 |

#### 保存ショートカットの実装

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (!isReadOnly && hasUnsaved) {
        editorSaveFile();
      }
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isReadOnly, hasUnsaved, editorSaveFile]);
```

---

### Task 6: BackupPanel コンポーネント設計

#### バックアップ一覧の取得

```typescript
/** BackupPanel の Props */
interface BackupPanelProps {
  skillName: string;
  isReadOnly: boolean;
  onRestore: (backupPath: string) => Promise<void>;
}
```

バックアップ一覧は `window.electronAPI.skill.listBackups(skillName)` で取得する。取得タイミング:

- BackupPanel の展開時（初回のみ）
- ファイル保存・削除・復元操作の完了後

#### バックアップ一覧テーブル

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ バックアップ履歴 (3)                                       │
├──────────────────┬────────────┬───────────┬─────────────────┤
│ ファイル         │ 種別       │ 日時      │ 操作            │
├──────────────────┼────────────┼───────────┼─────────────────┤
│ SKILL.md         │ 📦 backup  │ 13:45     │ [復元]          │
│ agents/main.md   │ 🗑️ deleted │ 12:30     │ [復元]          │
│ SKILL.md         │ 📦 backup  │ 11:15     │ [復元]          │
└──────────────────┴────────────┴───────────┴─────────────────┘
```

#### 復元フロー

```
1. ユーザーがバックアップ行の「復元」ボタンをクリック
2. 確認ダイアログを表示: 「{filename} をバックアップ({日時})から復元しますか？現在のファイルは上書きされます。」
3. ユーザーが「復元」を選択
4. window.electronAPI.skill.restoreBackup(skillName, backupPath) を呼び出し
5. 成功: ファイルツリーとエディタ内容をリフレッシュ、トースト表示
6. 失敗: エラートースト表示
```

---

### Task 7: 未保存変更管理設計

#### 変更検知ロジック

```typescript
/**
 * エディタ内容が変更されたかを判定する
 * editorContent と editorOriginalContent の文字列比較
 */
const hasUnsaved = editorContent !== editorOriginalContent;
```

`editorUpdateContent` アクション内で自動的に `editorUnsavedFiles` を更新する:

```typescript
editorUpdateContent: (content: string) => {
  set((state) => {
    const selectedFile = state.editorSelectedFile;
    if (!selectedFile) return state;

    const hasChanged = content !== state.editorOriginalContent;
    return {
      ...state,
      editorContent: content,
      editorUnsavedFiles: {
        ...state.editorUnsavedFiles,
        [selectedFile]: hasChanged,
      },
    };
  });
},
```

#### ナビゲーションガード

ファイル切替時の未保存チェック:

```typescript
/**
 * ファイル選択前に未保存チェックを行う
 *
 * @returns true: 遷移を許可, false: 遷移をキャンセル
 */
async function handleFileSelect(relativePath: string): Promise<void> {
  const currentFile = useEditorSelectedFile();
  const hasUnsaved = useEditorHasUnsaved();

  if (hasUnsaved) {
    // UnsavedChangesDialog を表示
    const result = await showUnsavedChangesDialog();

    switch (result) {
      case "save":
        await editorSaveFile();
        break;
      case "discard":
        // 変更を破棄して遷移
        break;
      case "cancel":
        return; // 遷移をキャンセル
    }
  }

  await editorSelectFile(relativePath);
}
```

#### UnsavedChangesDialog 設計

```typescript
interface UnsavedChangesDialogProps {
  isOpen: boolean;
  fileName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}
```

ダイアログのテキスト:

- タイトル: 「未保存の変更があります」
- メッセージ: 「{fileName} に未保存の変更があります。保存しますか？」
- ボタン: 「保存」（プライマリ）、「保存せずに続行」（セカンダリ）、「キャンセル」（テキスト）

---

### Task 8: アーキテクチャ層別設計

#### Renderer 層（本タスクのメインスコープ）

| 項目                 | 設計内容                                                                     |
| -------------------- | ---------------------------------------------------------------------------- |
| コンポーネント構成   | SkillEditor / FileTree / CodeEditor / BackupPanel（Atomic Design organisms） |
| 状態管理             | Zustand skillSlice 拡張 + 個別セレクタ（P31 対策）                           |
| IPC 呼び出し         | TASK-9A-B の Preload API 6メソッドを使用                                     |
| イベントハンドリング | キーボードショートカット（Cmd+S）、ツリーナビゲーション（WAI-ARIA）          |
| エラー処理           | IPC 呼び出しの失敗をキャッチし、エラー状態を Store に保持、トースト表示      |

#### Preload 層（変更なし — TASK-9A-B 完了済み）

| 項目             | 内容                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| skill-api.ts     | readFile / writeFile / createFile / deleteFile / listBackups / restoreBackup が追加済み |
| channels.ts      | SKILL_FILE_READ〜SKILL_FILE_RESTORE_BACKUP の6定数が追加済み                            |
| safeInvokeUnwrap | 全メソッドで safeInvokeUnwrap パターンを使用済み                                        |

#### Main Process 層（変更なし — TASK-9A-A/B 完了済み）

| 項目                 | 内容                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| skillFileHandlers.ts | 6つの ipcMain.handle() ハンドラーが追加済み                                             |
| SkillFileManager     | readFile / writeFile / createFile / deleteFile / listBackups / restoreBackup が実装済み |
| セキュリティ         | validateIpcSender / validatePath / sanitizeErrorMessage が適用済み                      |

#### テスト環境の注意事項

| 対策項目     | 内容                                                                          | 対応 Pitfall |
| ------------ | ----------------------------------------------------------------------------- | ------------ |
| happy-dom    | コンポーネントテストでは `fireEvent` を使用し、`userEvent` を使用しない       | P39          |
| Store テスト | 個別セレクタをテストし、合成 Hook の依存配列問題を回避する                    | P31          |
| CSS 変数     | variantStyles を Record 定数でエクスポートし、テスト側でインポートする        | P47          |
| テスト実行   | `cd apps/desktop && pnpm vitest run` で実行し、モノレポルートからは実行しない | P40          |

---

## 参照資料

| 参照資料               | パス                                                                                        | 内容                    |
| ---------------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件定義       | `docs/30-workflows/TASK-9A-skill-editor/phase-1-requirements.md`                            | FR/NFR/AC 定義          |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 契約ドリフト防止    |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI、Setter Injection 等 |
| セキュリティAPI仕様    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | IPC通信セキュリティ     |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構成            |
| TASK-9A-B Phase 2 設計 | `docs/30-workflows/completed-tasks/TASK-9A-B-ipc-file-handlers/phase-2-design.md`           | IPC 設計（Preload API） |
| 既存 skillSlice        | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                                      | 既存状態管理パターン    |
| 既存 Preload API       | `apps/desktop/src/preload/skill-api.ts`                                                     | 6メソッド追加済み       |
| セキュリティルール     | `.claude/rules/04-electron-security.md`                                                     | セキュリティ設計原則    |
| 状態管理ルール         | `.claude/rules/03-state-management.md`                                                      | Zustand 設計原則        |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P31, P39, P40, P42, P47 |

---

## 統合テスト連携

| テスト種別           | 検証内容                                                                               |
| -------------------- | -------------------------------------------------------------------------------------- |
| コンポーネントテスト | FileTree のツリー描画・選択、CodeEditor の表示・編集、BackupPanel の一覧・復元         |
| 状態管理テスト       | skillSlice の editorSelectFile / editorSaveFile / editorUpdateContent が正しく動作する |
| 個別セレクタテスト   | useEditorSelectedFile / useEditorHasUnsaved 等が正しい値を返す                         |
| キーボードテスト     | Cmd+S でファイル保存、↑↓←→ でツリーナビゲーション                                      |
| ダイアログテスト     | 未保存変更ダイアログの3つの選択肢が正しく動作する                                      |
| 読み取り専用テスト   | isReadOnly=true でエディタ・作成・削除・復元が無効化される                             |
| 回帰テスト           | 既存のスキル一覧・インポート・削除が壊れていない                                       |

---

## 多角的チェック観点

| 観点               | チェック内容                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| コンポーネント分離 | SkillEditor 内の各コンポーネントが単一責務を守っている                                                   |
| Props 設計         | 必要最小限の Props で、型が明確に定義されている                                                          |
| 状態設計           | Zustand Store / useState の使い分けが 03-state-management.md に準拠している                              |
| Pitfall 対策       | P31（個別セレクタ）、P39（fireEvent）、P40（テスト実行ディレクトリ）、P47（CSS変数）の対策が含まれている |
| データフロー       | Renderer → Preload → Main の一方向依存が維持されている                                                   |

---

## 成果物

| 成果物               | パス                                                       |
| -------------------- | ---------------------------------------------------------- |
| 設計書（本ファイル） | `docs/30-workflows/TASK-9A-skill-editor/phase-2-design.md` |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                   |
| IPC API 仕様         | `outputs/phase-2/api-specification.md`                     |

---

## 完了条件

- [ ] コンポーネント階層が定義され、各コンポーネントの責務・Props が明確である
- [ ] skillSlice の拡張（状態フィールド・アクション・セレクタ）が設計されている
- [ ] FileTreeNodeData 型が定義されている
- [ ] データフロー（読み込み・保存・削除）が図示されている
- [ ] FileTree の WAI-ARIA 構造とキーボードナビゲーションが設計されている
- [ ] CodeEditor のスタイリングとキーボードショートカットが定義されている
- [ ] BackupPanel の UI レイアウトと復元フローが定義されている
- [ ] 未保存変更管理（変更検知・ナビゲーションガード・ダイアログ）が設計されている
- [ ] アーキテクチャ層別設計で各層の変更有無が明示されている
- [ ] テスト環境の注意事項（P31, P39, P40, P47）が設計に含まれている
- [ ] 個別セレクタパターンが全アクション・状態に対して定義されている

---

## 次のPhase

→ Phase 3: 設計レビューゲート（`phase-3-design-review.md`）
