# アーキテクチャ設計書 - TASK-UI-05A-SKILL-EDITOR-VIEW

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 作成日     | 2026-03-02                    |
| 前提 Phase | Phase 1: 要件定義             |
| 後続 Phase | Phase 3: 設計レビュー         |

---

## 1. コンポーネント設計（Atomic Design）

### 1.1 レベル分類

| レベル    | コンポーネント                                        | 責務                                       |
| --------- | ----------------------------------------------------- | ------------------------------------------ |
| atoms     | FileTreeNode, EditorStatusBar                         | 最小単位の UI 表示要素                     |
| molecules | FileTreePanel, EditorPanel, EditorToolBar, BackupMenu | 複数 atoms を組み合わせた機能単位          |
| organisms | SkillEditorView, UnsavedChangesDialog                 | 複数 molecules を統合したビュー/ダイアログ |

### 1.2 コンポーネントツリー構造

```
apps/desktop/src/renderer/views/SkillEditorView/
├── index.tsx                          (SkillEditorView - organisms)
├── components/
│   ├── FileTreePanel/
│   │   ├── FileTreePanel.tsx          (molecules)
│   │   └── FileTreeNode.tsx           (atoms)
│   ├── EditorPanel/
│   │   ├── EditorPanel.tsx            (molecules)
│   │   └── EditorStatusBar.tsx        (atoms)
│   ├── EditorToolBar.tsx              (molecules)
│   ├── UnsavedChangesDialog.tsx       (organisms)
│   └── BackupMenu.tsx                 (molecules)
└── hooks/
    ├── useSkillEditor.ts
    ├── useFileTree.ts
    └── useUnsavedWarning.ts
```

### 1.3 コンポーネント概要

| コンポーネント       | レベル    | 責務                                                                                                                                                      |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SkillEditorView      | organisms | 左ペイン（FileTreePanel）と右ペイン（EditorPanel + ToolBar）を統合するルートコンポーネント。3 つの Hooks を管理し、Props 経由で子コンポーネントへ配布する |
| FileTreePanel        | molecules | FileTreeNode を再帰的にレンダリングし、ファイル選択・展開/折りたたみの UI を提供する。レスポンシブ対応でドロワー表示に切り替わる                          |
| FileTreeNode         | atoms     | 単一のツリーノード（ファイルまたはディレクトリ）を表示する。アイコン・ハイライト・未保存インジケーターを含む                                              |
| EditorPanel          | molecules | textarea ベースのコードエディターと EditorStatusBar を組み合わせた編集パネル。行番号表示、等幅フォント、読み取り専用モードを提供する                      |
| EditorStatusBar      | atoms     | エディター下部に行数・文字数・ファイル拡張子を表示するステータスバー                                                                                      |
| EditorToolBar        | molecules | 「保存」「閉じる」ボタンと BackupMenu を配置するツールバー。読み取り専用モードや未保存変更状態に応じてボタンの活性/非活性を制御する                       |
| BackupMenu           | molecules | バックアップ一覧をドロップダウン形式で表示し、復元操作を実行する。復元前に確認ダイアログを表示する                                                        |
| UnsavedChangesDialog | organisms | 未保存変更がある状態でのナビゲーション時に表示されるモーダルダイアログ。「保存して切り替え」「保存せず切り替え」「キャンセル」の 3 選択肢を提供する       |

---

## 2. Props インターフェース定義

### 2.1 SkillEditorView（organisms）

```typescript
/**
 * SkillEditorView のルート Props
 *
 * SkillCenterView の詳細パネルから遷移時に渡される。
 * skillName: 編集対象のスキル名（例: "task-specification-creator"）
 * isReadOnly: ~/.claude/skills/ 配下のスキルは true
 * onClose: エディターを閉じてスキルセンターに戻るコールバック
 */
interface SkillEditorViewProps {
  /** 編集対象のスキル名 */
  skillName: string;
  /** 読み取り専用モード（~/.claude/skills/ 配下のスキルの場合 true） */
  isReadOnly: boolean;
  /** エディターを閉じるコールバック（スキルセンターに戻る） */
  onClose: () => void;
}
```

### 2.2 FileTreePanel（molecules）

```typescript
/**
 * ファイルツリーパネルの Props
 *
 * SkillEditorView から nodes（ツリーデータ）、selectedPath（選択中パス）、
 * unsavedPaths（未保存パス Set）を受け取り、ファイル選択や操作イベントを
 * 親に伝播する。
 */
interface FileTreePanelProps {
  /** ファイルツリーのルートノード配列 */
  nodes: FileNode[];
  /** 現在選択中のファイルパス（null: 未選択） */
  selectedPath: string | null;
  /** 未保存変更があるファイルパスの Set */
  unsavedPaths: Set<string>;
  /** ファイル選択時のコールバック */
  onSelectFile: (path: string) => void;
  /** 読み取り専用モード（true: ファイル作成・削除ボタン非表示） */
  isReadOnly: boolean;
  /** ファイル作成コールバック（読み取り専用モードでは undefined） */
  onCreateFile?: (parentPath: string, fileName: string) => void;
  /** ファイル削除コールバック（読み取り専用モードでは undefined） */
  onDeleteFile?: (path: string) => void;
  /** ツリー読み込み中フラグ */
  isLoading: boolean;
  /** エラーメッセージ（null: エラーなし） */
  error: string | null;
  /** 展開中のディレクトリパスの Set */
  expandedPaths: Set<string>;
  /** ディレクトリ展開/折りたたみトグルコールバック */
  onToggleExpand: (path: string) => void;
}
```

### 2.3 FileTreeNode（atoms）

```typescript
/**
 * ファイルツリーの単一ノード Props
 *
 * 再帰的にレンダリングされ、ファイルまたはディレクトリを表示する。
 * depth でインデント幅を計算する（depth * 16px）。
 */
interface FileTreeNodeProps {
  /** ノードデータ（名前、パス、種別、子ノード） */
  node: FileNode;
  /** ツリーの深さ（ルート = 0）。インデント計算に使用（depth * 16px） */
  depth: number;
  /** このノードが選択中かどうか */
  isSelected: boolean;
  /** このノードに未保存変更があるかどうか */
  hasUnsavedChanges: boolean;
  /** ファイル/ディレクトリ選択コールバック */
  onSelect: (path: string) => void;
  /** 展開中のディレクトリパスの Set */
  expandedPaths: Set<string>;
  /** ディレクトリ展開/折りたたみトグルコールバック */
  onToggleExpand: (path: string) => void;
  /** 読み取り専用モード */
  isReadOnly: boolean;
  /** ファイル作成コールバック（読み取り専用モードでは undefined） */
  onCreateFile?: (parentPath: string, fileName: string) => void;
  /** ファイル削除コールバック（読み取り専用モードでは undefined） */
  onDeleteFile?: (path: string) => void;
}
```

### 2.4 EditorPanel（molecules）

```typescript
/**
 * エディターパネルの Props
 *
 * textarea ベースのコードエディターを表示する。
 * 行番号は content から改行数を計算して左側に表示する。
 */
interface EditorPanelProps {
  /** エディターに表示するファイル内容 */
  content: string;
  /** 現在開いているファイルのパス（null: ファイル未選択） */
  filePath: string | null;
  /** 読み取り専用モード（true: textarea を readonly にする） */
  isReadOnly: boolean;
  /** ファイル読み込み中フラグ（true: ローディングスピナー表示） */
  isLoading: boolean;
  /** ファイル内容変更コールバック */
  onChange: (content: string) => void;
  /** エラーメッセージ（null: エラーなし） */
  error: string | null;
}
```

### 2.5 EditorStatusBar（atoms）

```typescript
/**
 * エディターステータスバーの Props
 *
 * エディター下部に表示し、現在のファイル情報を提供する。
 */
interface EditorStatusBarProps {
  /** 行数（content.split("\n").length で計算） */
  lineCount: number;
  /** 文字数（content.length で計算） */
  charCount: number;
  /** ファイル拡張子（例: "md", "ts", "json"。未選択時は空文字列） */
  fileExtension: string;
  /** 保存中フラグ（true: "保存中..." 表示） */
  isSaving: boolean;
}
```

### 2.6 EditorToolBar（molecules）

```typescript
/**
 * エディターツールバーの Props
 *
 * エディター上部に配置し、保存・閉じる・バックアップボタンを表示する。
 */
interface EditorToolBarProps {
  /** 保存ボタン押下コールバック */
  onSave: () => void;
  /** 閉じるボタン押下コールバック（未保存警告経由で onClose を呼び出す） */
  onClose: () => void;
  /** 保存ボタン非活性条件: !hasUnsavedChanges || isReadOnly || isSaving */
  isSaveDisabled: boolean;
  /** 読み取り専用モード（true: 保存ボタンにツールチップ「読み取り専用ファイルです」） */
  isReadOnly: boolean;
  /** スキル名（BackupMenu に渡す） */
  skillName: string;
  /** バックアップ復元コールバック */
  onRestore: (backupPath: string) => void;
  /** 保存中フラグ */
  isSaving: boolean;
}
```

### 2.7 BackupMenu（molecules）

```typescript
/**
 * バックアップメニューの Props
 *
 * ドロップダウン形式でバックアップ一覧を表示し、復元操作を実行する。
 */
interface BackupMenuProps {
  /** 対象スキル名 */
  skillName: string;
  /** バックアップ復元コールバック（復元対象の backupPath を渡す） */
  onRestore: (backupPath: string) => void;
  /** 読み取り専用モード（true: 復元ボタン非活性） */
  isReadOnly: boolean;
}
```

### 2.8 UnsavedChangesDialog（organisms）

```typescript
/**
 * 未保存変更警告ダイアログの Props
 *
 * 未保存変更がある状態でのナビゲーション/クローズ時に表示する。
 * role="alertdialog" でアクセシビリティ対応。
 */
interface UnsavedChangesDialogProps {
  /** ダイアログ表示フラグ */
  isOpen: boolean;
  /** 未保存変更があるファイル名（ダイアログメッセージに使用） */
  fileName: string;
  /** 「保存して切り替え」ボタンコールバック */
  onSaveAndSwitch: () => void;
  /** 「保存せず切り替え」ボタンコールバック */
  onDiscardAndSwitch: () => void;
  /** 「キャンセル」ボタンコールバック */
  onCancel: () => void;
}
```

---

## 3. 状態管理設計

### 3.1 useSkillEditor Hook

#### インターフェース

```typescript
interface UseSkillEditorReturn {
  /** 現在のエディター内容 */
  content: string;
  /** 初期読み込み時のファイル内容（未保存変更検出の基準値） */
  originalContent: string;
  /** エディター内容を更新する関数 */
  setContent: (content: string) => void;
  /** ファイルを保存する関数（skill:writeFile IPC 呼び出し） */
  save: () => Promise<void>;
  /** ファイル読み込み中フラグ */
  isLoading: boolean;
  /** ファイル保存中フラグ */
  isSaving: boolean;
  /** エラーメッセージ（null: エラーなし） */
  error: string | null;
  /** 指定パスのファイルを読み込む関数（skill:readFile IPC 呼び出し） */
  loadFile: (relativePath: string) => Promise<void>;
}
```

#### 引数

```typescript
function useSkillEditor(
  skillName: string,
  isReadOnly: boolean,
): UseSkillEditorReturn;
```

#### 状態遷移図

```
[初期状態]
  content = ""
  originalContent = ""
  isLoading = false
  isSaving = false
  error = null

[ファイル読み込み]
  loadFile(path) 呼び出し
    │
    ├─→ isLoading = true, error = null
    │
    ├─→ skill:readFile IPC 呼び出し
    │     │
    │     ├─ 成功 → content = data
    │     │         originalContent = data
    │     │         isLoading = false
    │     │
    │     └─ 失敗 → error = errorMessage
    │               isLoading = false
    │               content = ""
    │               originalContent = ""

[ファイル編集]
  setContent(newContent) 呼び出し
    │
    └─→ content = newContent
        （originalContent は変更しない）
        （hasUnsavedChanges = content !== originalContent）

[ファイル保存]
  save() 呼び出し
    │
    ├─→ isReadOnly = true の場合 → 何もしない（早期リターン）
    │
    ├─→ isSaving = true, error = null
    │
    ├─→ skill:writeFile IPC 呼び出し
    │     │
    │     ├─ 成功 → originalContent = content
    │     │         isSaving = false
    │     │         （hasUnsavedChanges = false になる）
    │     │
    │     └─ 失敗 → error = errorMessage
    │               isSaving = false
```

### 3.2 useFileTree Hook

#### インターフェース

```typescript
interface UseFileTreeReturn {
  /** ファイルツリーのルートノード配列 */
  nodes: FileNode[];
  /** 現在選択中のファイルパス（null: 未選択） */
  selectedPath: string | null;
  /** 展開中のディレクトリパスの Set */
  expandedPaths: Set<string>;
  /** ツリー読み込み中フラグ */
  isLoading: boolean;
  /** エラーメッセージ（null: エラーなし） */
  error: string | null;
  /** ファイルを選択する関数 */
  selectFile: (path: string) => void;
  /** ディレクトリの展開/折りたたみをトグルする関数 */
  toggleExpand: (path: string) => void;
  /** ファイルツリーを再読み込みする関数 */
  refreshTree: () => Promise<void>;
  /** 新規ファイルを作成する関数（skill:createFile IPC 呼び出し） */
  createFile: (parentPath: string, fileName: string) => Promise<void>;
  /** ファイルを削除する関数（skill:deleteFile IPC 呼び出し） */
  deleteFile: (path: string) => Promise<void>;
}

interface FileNode {
  /** ファイル/ディレクトリ名 */
  name: string;
  /** スキルディレクトリからの相対パス */
  path: string;
  /** ノード種別 */
  type: "file" | "directory";
  /** 子ノード（ディレクトリの場合のみ） */
  children?: FileNode[];
}
```

#### 引数

```typescript
function useFileTree(skillName: string): UseFileTreeReturn;
```

#### 状態遷移図

```
[初期状態]
  nodes = []
  selectedPath = null
  expandedPaths = new Set()
  isLoading = false
  error = null

[ツリー読み込み]
  refreshTree() 呼び出し（マウント時に自動実行）
    │
    ├─→ isLoading = true, error = null
    │
    ├─→ skill:getFileTree(skillName) IPC 呼び出し
    │     │
    │     ├─ 成功 → nodes = treeData
    │     │         isLoading = false
    │     │         （expandedPaths はルートディレクトリを自動展開）
    │     │
    │     └─ 失敗 → error = errorMessage
    │               isLoading = false
    │               nodes = []

[ファイル選択]
  selectFile(path) 呼び出し
    │
    └─→ selectedPath = path
        （useSkillEditor.loadFile(path) のトリガーは SkillEditorView 側で管理）

[展開/折りたたみ]
  toggleExpand(path) 呼び出し
    │
    ├─ expandedPaths.has(path) = true
    │   └─→ expandedPaths から path を削除
    │
    └─ expandedPaths.has(path) = false
        └─→ expandedPaths に path を追加

[ファイル作成]
  createFile(parentPath, fileName) 呼び出し
    │
    ├─→ skill:createFile IPC 呼び出し
    │     │
    │     ├─ 成功 → refreshTree() でツリー再構築
    │     │         selectFile(parentPath/fileName) で新ファイル選択
    │     │
    │     └─ 失敗 → error = errorMessage

[ファイル削除]
  deleteFile(path) 呼び出し
    │
    ├─→ skill:deleteFile IPC 呼び出し
    │     │
    │     ├─ 成功 → refreshTree() でツリー再構築
    │     │         selectedPath が削除対象の場合 → selectedPath = null
    │     │
    │     └─ 失敗 → error = errorMessage
```

### 3.3 useUnsavedWarning Hook

#### インターフェース

```typescript
interface UseUnsavedWarningReturn {
  /** 未保存変更があるかどうか（content !== originalContent） */
  hasUnsavedChanges: boolean;
  /** 未保存変更があるファイルパスの Set */
  unsavedPaths: Set<string>;
  /** 警告ダイアログ表示フラグ */
  isWarningOpen: boolean;
  /** 保留中のアクション（ダイアログ確認後に実行する関数） */
  pendingAction: (() => void) | null;
  /** ナビゲーション/クローズを要求する関数（未保存変更がある場合はダイアログ表示） */
  requestNavigation: (action: () => void) => void;
  /** 「保存して実行」コールバック */
  confirmSaveAndProceed: () => Promise<void>;
  /** 「保存せず実行」コールバック */
  confirmDiscardAndProceed: () => void;
  /** 「キャンセル」コールバック */
  cancelNavigation: () => void;
}
```

#### 引数

```typescript
function useUnsavedWarning(
  content: string,
  originalContent: string,
  selectedPath: string | null,
  save: () => Promise<void>,
): UseUnsavedWarningReturn;
```

#### 状態遷移図

```
[初期状態]
  hasUnsavedChanges = false    （content === originalContent）
  unsavedPaths = new Set()
  isWarningOpen = false
  pendingAction = null

[未保存変更検出]
  content が変更される
    │
    ├─ content !== originalContent
    │   └─→ hasUnsavedChanges = true
    │       unsavedPaths に selectedPath を追加
    │
    └─ content === originalContent
        └─→ hasUnsavedChanges = false
            unsavedPaths から selectedPath を削除

[ナビゲーション要求]
  requestNavigation(action) 呼び出し
    │
    ├─ hasUnsavedChanges = false
    │   └─→ action() を直接実行（ダイアログなし）
    │
    └─ hasUnsavedChanges = true
        └─→ isWarningOpen = true
            pendingAction = action

[ダイアログ操作]
  ├─ confirmSaveAndProceed()
  │   └─→ save() を実行
  │       → 成功: pendingAction() を実行
  │               isWarningOpen = false
  │               pendingAction = null
  │       → 失敗: isWarningOpen = false（エラーは useSkillEditor.error に設定）
  │
  ├─ confirmDiscardAndProceed()
  │   └─→ pendingAction() を実行
  │       isWarningOpen = false
  │       pendingAction = null
  │       unsavedPaths から現在の selectedPath を削除
  │
  └─ cancelNavigation()
      └─→ isWarningOpen = false
          pendingAction = null
```

---

## 4. データフロー図

### 4.1 全体データフロー

```
┌──────────────────────────────────────────────────────────────────┐
│                       SkillEditorView                           │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐        │
│  │ useFileTree  │  │useSkillEditor│  │useUnsavedWarning │        │
│  │              │  │              │  │                  │        │
│  │ nodes ───────┼──┼─────────────┼──┼→ FileTreePanel   │        │
│  │ selectedPath ┼──┼→ loadFile() │  │                  │        │
│  │ expandedPaths│  │ content ────┼──┼→ EditorPanel     │        │
│  │              │  │ save() ─────┼──┼→ EditorToolBar   │        │
│  │              │  │             │  │ hasUnsavedChanges │        │
│  │              │  │originalContent──┼→ unsavedPaths    │        │
│  └─────────────┘  └─────────────┘  └──────────────────┘        │
│         │                │                   │                   │
│         ▼                ▼                   ▼                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              Preload Bridge (skill-api.ts)           │       │
│  │  safeInvoke / safeInvokeUnwrap                       │       │
│  └──────────────────────────────────────────────────────┘       │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │ IPC (ipcRenderer.invoke)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Main Process                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │          skillFileHandlers.ts                         │       │
│  │  validateIpcSender → バリデーション → SkillFileManager │       │
│  └──────────────────────────────────────────────────────┘       │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              SkillFileManager                         │       │
│  │  readFile / writeFile / createFile / deleteFile       │       │
│  │  listBackups / restoreBackup / listSkillFiles         │       │
│  └──────────────────────────────────────────────────────┘       │
│                          │                                       │
│                          ▼                                       │
│                    File System                                   │
│  ~/.aiworkflow/skills/ (編集可能)                                │
│  ~/.claude/skills/     (読み取り専用)                            │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 ファイル選択→表示フロー

```
1. ユーザーが FileTreeNode をクリック
2. FileTreeNode.onSelect(path) → FileTreePanel.onSelectFile(path)
3. SkillEditorView が requestNavigation() で未保存チェック
   ├─ 未保存変更なし → selectFile(path) + loadFile(path) を実行
   └─ 未保存変更あり → UnsavedChangesDialog を表示
      ├─ 「保存して切り替え」→ save() → selectFile(path) + loadFile(path)
      ├─ 「保存せず切り替え」→ selectFile(path) + loadFile(path)
      └─ 「キャンセル」→ 操作中止
4. loadFile(path) が skill:readFile IPC を呼び出し
5. content と originalContent が更新される
6. EditorPanel に content が反映される
7. EditorStatusBar に行数・文字数・拡張子が反映される
```

### 4.3 ファイル保存フロー

```
1. ユーザーが「保存」ボタンをクリック または Cmd+S / Ctrl+S
2. EditorToolBar.onSave() → useSkillEditor.save()
3. save() が skill:writeFile IPC を呼び出し
   ├─ 成功 → originalContent = content
   │         hasUnsavedChanges = false
   │         トースト通知「保存しました」（2 秒間）
   └─ 失敗 → error にメッセージ設定
             エラーダイアログ表示
```

---

## 5. レスポンシブデザイン設計

### 5.1 ブレークポイント設計

| ブレークポイント | FileTreePanel                            | EditorPanel          | ToolBar              | CSS クラス           |
| ---------------- | ---------------------------------------- | -------------------- | -------------------- | -------------------- |
| >= 1024px        | 左 240px 固定、常時表示                  | flex-1（残り幅全体） | 上部水平バー         | `lg:` プレフィックス |
| 768px 〜 1023px  | 左 200px 固定、常時表示                  | flex-1（残り幅全体） | 上部水平バー         | `md:` プレフィックス |
| < 768px          | ドロワー（左からスライドイン、幅 280px） | フル幅（100%）       | 上部（アイコンのみ） | デフォルト           |

### 5.2 ドロワー動作仕様

| 項目           | 仕様                                                         |
| -------------- | ------------------------------------------------------------ |
| トリガー       | 左上のハンバーガーメニューボタン（3 本線アイコン、24x24px）  |
| 表示方向       | 画面左端からスライドイン                                     |
| 幅             | 280px                                                        |
| オーバーレイ   | ドロワー背面に半透明オーバーレイ（rgba(0,0,0,0.3)）を表示    |
| 閉じるトリガー | オーバーレイクリック / ファイル選択 / Escape キー            |
| アニメーション | スライドイン: transform: translateX(-100%) → translateX(0)   |
|                | スライドアウト: transform: translateX(0) → translateX(-100%) |
|                | duration: 200ms, timing: ease-out                            |
| 自動閉じ       | ファイル選択時にドロワーを自動的に閉じる                     |
| z-index        | オーバーレイ: 40, ドロワー: 50                               |

### 5.3 CSS 実装方針

```
レイアウト構成:
- ルート: flex flex-row（横並び 2 ペイン）
- FileTreePanel: w-[240px] lg:w-[240px] md:w-[200px]（モバイルは fixed ポジション）
- EditorPanel: flex-1 min-w-0（残り幅）
- ToolBar: w-full（パネル上部に固定）

ブレークポイント切り替え:
- Tailwind の md: (768px) と lg: (1024px) レスポンシブプレフィックスを使用
- モバイル判定: useMediaQuery("(max-width: 767px)") または CSS のみで対応

ドロワー実装:
- position: fixed, top: 0, left: 0, height: 100vh
- transform + transition による CSS アニメーション
- backdrop: position: fixed, inset: 0, bg-black/30
```

---

## 6. アクセシビリティ設計

### 6.1 ARIA 属性設計

| コンポーネント               | ARIA 属性                                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FileTreePanel                | `role="tree"`, `aria-label="ファイルツリー"`, `tabIndex={0}`                                                                                              |
| FileTreeNode（ディレクトリ） | `role="treeitem"`, `aria-expanded={isExpanded}`, `aria-selected={isSelected}`, `aria-level={depth + 1}`, `aria-label="{name} フォルダ"`                   |
| FileTreeNode（ファイル）     | `role="treeitem"`, `aria-selected={isSelected}`, `aria-level={depth + 1}`, `aria-label="{name}"`                                                          |
| EditorPanel                  | textarea に `role="textbox"`, `aria-label="ファイルエディター"`, `aria-multiline="true"`, `aria-readonly={isReadOnly}`                                    |
| EditorToolBar                | `role="toolbar"`, `aria-label="エディターツールバー"`, `aria-orientation="horizontal"`                                                                    |
| BackupMenu                   | トリガーボタン: `aria-haspopup="menu"`, `aria-expanded={isOpen}`. メニュー: `role="menu"`, `aria-label="バックアップメニュー"`. 各項目: `role="menuitem"` |
| UnsavedChangesDialog         | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby="unsaved-dialog-title"`, `aria-describedby="unsaved-dialog-description"`                      |

### 6.2 キーボード操作設計

| キー           | コンテキスト     | 動作                                                                              | 対応 FR/NFR |
| -------------- | ---------------- | --------------------------------------------------------------------------------- | ----------- |
| Tab            | 全体             | フォーカス移動: ファイルツリー → ツールバー → エディター                          | NFR-3       |
| ArrowUp        | ファイルツリー内 | 前のツリーアイテムにフォーカス移動                                                | NFR-4       |
| ArrowDown      | ファイルツリー内 | 次のツリーアイテムにフォーカス移動                                                | NFR-4       |
| ArrowRight     | ファイルツリー内 | ディレクトリ: 折りたたみ状態 → 展開。展開済み → 最初の子要素にフォーカス移動      | NFR-4       |
| ArrowLeft      | ファイルツリー内 | ディレクトリ: 展開状態 → 折りたたみ。ファイル/折りたたみ済み → 親要素にフォーカス | NFR-4       |
| Enter          | ファイルツリー内 | ファイル: エディターに読み込み。ディレクトリ: 展開/折りたたみトグル               | FR-1-4      |
| Cmd+S / Ctrl+S | エディター内     | ファイル保存（isReadOnly = false の場合のみ）                                     | FR-3-1      |
| Escape         | ダイアログ内     | ダイアログを閉じる（キャンセル動作）                                              | FR-4-2      |

### 6.3 フォーカス管理方針

| イベント                    | フォーカス先                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------- |
| SkillEditorView マウント時  | ファイルツリーの最初の treeitem にフォーカスを設定する                             |
| ファイル選択時              | エディター（textarea）にフォーカスを移動する                                       |
| UnsavedChangesDialog 表示時 | ダイアログ内の「保存して切り替え」ボタン（最初のアクション）にフォーカスを移動する |
| UnsavedChangesDialog 閉じ時 | フォーカスをトリガー元の要素（ファイルツリーノードまたは閉じるボタン）に戻す       |
| BackupMenu 表示時           | メニューの最初の menuitem にフォーカスを移動する                                   |
| BackupMenu 閉じ時           | バックアップボタン（トリガー元）にフォーカスを戻す                                 |
| エラーダイアログ表示時      | ダイアログの「OK」ボタンにフォーカスを移動する                                     |
| モバイルドロワー表示時      | ドロワー内のファイルツリーの最初の treeitem にフォーカスを移動する                 |
| モバイルドロワー閉じ時      | ハンバーガーメニューボタンにフォーカスを戻す                                       |

### 6.4 フォーカストラップ

UnsavedChangesDialog は `aria-modal="true"` のモーダルダイアログであるため、フォーカストラップを実装する。

```
フォーカストラップ対象要素:
1. 「保存して切り替え」ボタン
2. 「保存せず切り替え」ボタン
3. 「キャンセル」ボタン

Tab キーで 1 → 2 → 3 → 1 の順にループする。
Shift+Tab キーで 3 → 2 → 1 → 3 の順にループする。
```

---

## 7. エラーハンドリング設計

### 7.1 エラー種別と表示方法

| エラー種別             | 発生源           | 表示方法                                                         | リカバリー                              |
| ---------------------- | ---------------- | ---------------------------------------------------------------- | --------------------------------------- |
| バリデーションエラー   | IPC ハンドラ     | エディター上部にインラインエラーメッセージ（赤色帯）             | ユーザーが入力を修正して再試行          |
| ファイル不存在エラー   | SkillFileManager | エラーダイアログ「ファイルが見つかりません」                     | ファイルツリーを refreshTree() で再構築 |
| 読み取り専用エラー     | SkillFileManager | トースト通知「このファイルは編集できません」（3 秒間表示）       | 操作不可（UI 上でも保存ボタン非活性）   |
| パストラバーサルエラー | SkillFileManager | エラーダイアログ「不正なファイルパスです」                       | 操作を拒否（ツリー再構築）              |
| ファイル重複エラー     | SkillFileManager | エラーダイアログ「同名のファイルが既に存在します」               | ファイル名を変更して再試行              |
| IPC 通信エラー         | Preload Bridge   | エラーダイアログ「通信エラーが発生しました。再試行してください」 | 「再試行」ボタンで操作を再実行          |
| スキル未検出エラー     | SkillFileManager | エラーダイアログ「スキルが見つかりません」+ onClose 呼び出し     | スキルセンターに戻る                    |

### 7.2 エラー表示の優先順位

```
1. モーダルダイアログ（致命的エラー: スキル未検出、IPC 通信エラー）
2. インラインエラー（編集関連エラー: バリデーション、ファイル不存在）
3. トースト通知（軽微な通知: 読み取り専用、保存成功）
```

---

## 8. パフォーマンス設計

### 8.1 パフォーマンス目標

| 操作                   | 目標時間 | 実装方針                                                |
| ---------------------- | -------- | ------------------------------------------------------- |
| ファイルツリー初期表示 | 500ms    | skill:getFileTree の単一 IPC 呼び出しでツリー全体を取得 |
| ファイル読み込み       | 300ms    | skill:readFile の単一 IPC 呼び出しで内容を取得          |
| ファイル保存           | 1s       | skill:writeFile の単一 IPC 呼び出しで保存               |
| ファイルツリー再構築   | 500ms    | refreshTree() でツリー全体を再取得（差分更新なし）      |

### 8.2 大量ノード対策（NFR-9）

ファイルツリーのノード数が 200 以上の場合の対策方針:

```
Phase 1（本タスクスコープ）:
- ルートレベルのディレクトリのみ初期展開する
- 深い階層は展開操作時に初めて子ノードをレンダリングする
- React.memo でノードコンポーネントをメモ化し、不要な再レンダリングを防止する

Phase 2（将来タスク、スコープ外）:
- 仮想スクロール（react-window / react-virtuoso）の導入
- 遅延読み込み（展開時に子ノードを IPC で取得）
```

---

## 9. 依存タスク・技術スタック

### 9.1 依存タスク

| タスク ID                 | 内容                            | 状態   | 依存方向             |
| ------------------------- | ------------------------------- | ------ | -------------------- |
| TASK-UI-00                | Atoms コンポーネント            | 完了   | 使用（Badge 等）     |
| TASK-UI-01                | Navigation / ルーティング       | 完了   | 使用                 |
| TASK-UI-02                | SettingsView                    | 完了   | 参照（設計パターン） |
| TASK-UI-05                | SkillCenterView                 | 完了   | 遷移元               |
| TASK-9A                   | SkillFileManager + IPC ハンドラ | 完了   | バックエンド依存     |
| UT-UI-05A-GETFILETREE-001 | skill:getFileTree IPC           | 未着手 | 前提タスク           |

### 9.2 使用ライブラリ

| ライブラリ   | 用途                                                                         | バージョン |
| ------------ | ---------------------------------------------------------------------------- | ---------- |
| React        | UI コンポーネント                                                            | 19.x       |
| lucide-react | ファイルアイコン（FileText, FileCode, Folder, ChevronRight, ChevronDown 等） | 0.x        |
| Tailwind CSS | スタイリング（レスポンシブ、色、スペーシング）                               | 4.x        |
