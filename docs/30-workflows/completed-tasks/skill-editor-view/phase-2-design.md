# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 作成日     | 2026-03-01                    |
| 前提 Phase | Phase 1: 要件定義             |
| 後続 Phase | Phase 3: 設計レビュー         |

## 目的

Phase 1 で定義した機能要件・非機能要件に基づき、SkillEditorView のコンポーネント設計・状態管理設計・IPC 連携設計・レスポンシブデザイン設計・アクセシビリティ設計を行う。

## 背景

SkillEditorView は左ペインのファイルツリーと右ペインのコードエディターで構成される 2 ペインレイアウトであり、7 つの IPC チャネルを通じてバックエンド（SkillFileManager）と連携する。Atomic Design 原則に従いコンポーネントを分割し、3 つのカスタム Hooks で状態管理を行う。

## 実行タスク

- **タスク 1**: コンポーネント設計（Atomic Design に従った分割、Props 設計、コンポーネント間データフロー）
- **タスク 2**: 状態管理設計（useSkillEditor, useFileTree, useUnsavedWarning の状態フロー）
- **タスク 3**: IPC 連携設計（7 チャネルの呼び出しフロー、エラーハンドリング戦略）
- **タスク 4**: レスポンシブデザイン設計（3 段階ブレークポイント、モバイルドロワー）
- **タスク 5**: アクセシビリティ設計（ARIA 属性、キーボード操作、フォーカス管理）

## 参照資料

| 参照資料              | パス                                                                                                     | 内容                           |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 成果物        | `outputs/phase-1/`                                                                                       | 機能要件・非機能要件・スコープ |
| タスク定義書          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-031a-ui-05a-skill-editor-view.md` | コンポーネント構成・Props 定義 |
| UI/UX 設計原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                           | Apple HIG 準拠の UI 設計原則   |
| UI コンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                | コンポーネントアーキテクチャ   |
| 状態管理設計          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                             | Zustand/P31 対策               |
| IPC セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                             | 4 層防御構造                   |
| UI コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                  | TASK-9A 実装済みコンポーネント |
| Agent IPC 仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                     | skill:\* IPC 契約              |
| 抽出元リソースマップ  | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                         | 必要仕様の抽出起点             |
| 抽出元クイック参照    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                      | IPC/品質基準の早見表           |
| 抽出マトリクス        | `docs/30-workflows/skill-editor-view/aiworkflow-requirements-extraction-matrix.md`                       | Phase別抽出適用の確認          |

## 実行手順

### タスク 1: コンポーネント設計

1. Atomic Design レベル分類を確定する

   | レベル    | コンポーネント                                        |
   | --------- | ----------------------------------------------------- |
   | atoms     | FileTreeNode, EditorStatusBar                         |
   | molecules | FileTreePanel, EditorPanel, EditorToolBar, BackupMenu |
   | organisms | SkillEditorView, UnsavedChangesDialog                 |

2. 各コンポーネントの Props インターフェースを定義する

   ```typescript
   // SkillEditorView（organisms）
   interface SkillEditorViewProps {
     skillName: string;
     isReadOnly: boolean;
     onClose: () => void;
   }

   // FileTreePanel（molecules）
   interface FileTreePanelProps {
     nodes: FileNode[];
     selectedPath: string | null;
     unsavedPaths: Set<string>;
     onSelectFile: (path: string) => void;
     isReadOnly: boolean;
     onCreateFile?: (parentPath: string, fileName: string) => void;
     onDeleteFile?: (path: string) => void;
   }

   // FileTreeNode（atoms）
   interface FileTreeNodeProps {
     node: FileNode;
     depth: number;
     isSelected: boolean;
     hasUnsavedChanges: boolean;
     onSelect: (path: string) => void;
     expandedPaths: Set<string>;
     onToggleExpand: (path: string) => void;
   }

   // EditorPanel（molecules）
   interface EditorPanelProps {
     content: string;
     filePath: string | null;
     isReadOnly: boolean;
     isLoading: boolean;
     onChange: (content: string) => void;
   }

   // EditorStatusBar（atoms）
   interface EditorStatusBarProps {
     lineCount: number;
     charCount: number;
     fileExtension: string;
   }

   // EditorToolBar（molecules）
   interface EditorToolBarProps {
     onSave: () => void;
     onClose: () => void;
     isSaveDisabled: boolean;
     isReadOnly: boolean;
     skillName: string;
   }

   // BackupMenu（molecules）
   interface BackupMenuProps {
     skillName: string;
     onRestore: (backupPath: string) => void;
   }

   // UnsavedChangesDialog（organisms）
   interface UnsavedChangesDialogProps {
     isOpen: boolean;
     fileName: string;
     onSaveAndSwitch: () => void;
     onDiscardAndSwitch: () => void;
     onCancel: () => void;
   }
   ```

3. コンポーネント間データフロー図を作成する

   ```
   SkillEditorView
   ├── useSkillEditor(skillName, isReadOnly)
   │   ├── content, setContent
   │   ├── save(), isLoading
   │   └── error
   ├── useFileTree(skillName)
   │   ├── nodes, selectedPath
   │   ├── selectFile(), expandedPaths
   │   └── toggleExpand()
   ├── useUnsavedWarning(content, originalContent)
   │   ├── hasUnsavedChanges, unsavedPaths
   │   └── showWarning, confirmNavigation()
   │
   ├── FileTreePanel
   │   ├── nodes ← useFileTree
   │   ├── selectedPath ← useFileTree
   │   ├── unsavedPaths ← useUnsavedWarning
   │   ├── onSelectFile → useFileTree.selectFile
   │   └── FileTreeNode（再帰レンダリング）
   │
   ├── EditorToolBar
   │   ├── onSave → useSkillEditor.save
   │   ├── onClose → props.onClose（警告経由）
   │   ├── isSaveDisabled ← !hasUnsavedChanges || isReadOnly
   │   └── BackupMenu
   │
   ├── EditorPanel
   │   ├── content ← useSkillEditor.content
   │   ├── onChange → useSkillEditor.setContent
   │   ├── isReadOnly ← props.isReadOnly
   │   └── EditorStatusBar
   │
   └── UnsavedChangesDialog
       ├── isOpen ← useUnsavedWarning.showWarning
       └── onSaveAndSwitch / onDiscardAndSwitch / onCancel
   ```

### タスク 2: 状態管理設計

1. **useSkillEditor** Hook の状態フロー

   ```typescript
   interface UseSkillEditorReturn {
     content: string;
     originalContent: string;
     setContent: (content: string) => void;
     save: () => Promise<void>;
     isLoading: boolean;
     isSaving: boolean;
     error: string | null;
     loadFile: (relativePath: string) => Promise<void>;
   }
   ```

   状態遷移:

   ```
   初期化 → loadFile(path) → isLoading=true
   → skill:readFile 成功 → content=data, originalContent=data, isLoading=false
   → skill:readFile 失敗 → error=message, isLoading=false

   編集 → setContent(newContent)
   → content=newContent（originalContent は変更しない）

   保存 → save() → isSaving=true
   → skill:writeFile 成功 → originalContent=content, isSaving=false
   → skill:writeFile 失敗 → error=message, isSaving=false
   ```

2. **useFileTree** Hook の状態フロー

   ```typescript
   interface UseFileTreeReturn {
     nodes: FileNode[];
     selectedPath: string | null;
     expandedPaths: Set<string>;
     isLoading: boolean;
     error: string | null;
     selectFile: (path: string) => void;
     toggleExpand: (path: string) => void;
     refreshTree: () => Promise<void>;
     createFile: (parentPath: string, fileName: string) => Promise<void>;
     deleteFile: (path: string) => Promise<void>;
   }

   interface FileNode {
     name: string;
     path: string;
     type: "file" | "directory";
     children?: FileNode[];
   }
   ```

   状態遷移:

   ```
   初期化 → refreshTree() → isLoading=true
   → skill:getFileTree(skillName) IPC 呼び出し
   → ファイルツリー構築成功 → nodes=treeData, isLoading=false
   → ファイルツリー構築失敗 → error=message, isLoading=false

   ファイル選択 → selectFile(path)
   → selectedPath=path
   → useSkillEditor.loadFile(path) をトリガー

   展開/折りたたみ → toggleExpand(path)
   → expandedPaths の追加/削除

   ファイル操作後 → refreshTree() でツリー再構築
   ```

3. **useUnsavedWarning** Hook の状態フロー

   ```typescript
   interface UseUnsavedWarningReturn {
     hasUnsavedChanges: boolean;
     unsavedPaths: Set<string>;
     isWarningOpen: boolean;
     pendingAction: (() => void) | null;
     requestNavigation: (action: () => void) => void;
     confirmSaveAndProceed: () => Promise<void>;
     confirmDiscardAndProceed: () => void;
     cancelNavigation: () => void;
   }
   ```

   状態遷移:

   ```
   未保存変更検出: content !== originalContent → hasUnsavedChanges=true

   ナビゲーション要求 → requestNavigation(action)
   ├─ hasUnsavedChanges=false → action() を直接実行
   └─ hasUnsavedChanges=true → isWarningOpen=true, pendingAction=action

   ダイアログ操作:
   ├─ confirmSaveAndProceed → save() → pendingAction() → isWarningOpen=false
   ├─ confirmDiscardAndProceed → pendingAction() → isWarningOpen=false
   └─ cancelNavigation → isWarningOpen=false, pendingAction=null
   ```

### タスク 3: IPC 連携設計

1. IPC 呼び出しフロー

   ```
   Renderer（SkillEditorView）
     → Preload（skill-api.ts / safeInvoke）
       → Main Process（skill-handlers.ts）
         → SkillFileManager
           → ファイルシステム
   ```

2. エラーハンドリング戦略

   | エラー種別           | 処理                                                                       |
   | -------------------- | -------------------------------------------------------------------------- |
   | バリデーションエラー | エディター上部にインラインエラーメッセージを表示する                       |
   | ファイル不存在       | 「ファイルが見つかりません」エラーダイアログを表示し、ツリーを再構築する   |
   | 権限エラー           | 「このファイルは編集できません」トースト通知を表示する                     |
   | IPC 通信エラー       | 「通信エラーが発生しました。再試行してください」エラーダイアログを表示する |
   | パストラバーサル     | リクエスト送信前にクライアント側でパスを正規化・検証する                   |

3. IPC チャネルと Preload API のマッピング

   ```typescript
   // Preload API（window.electronAPI.skill 配下）
   interface SkillPreloadAPI {
     readFile: (
       skillName: string,
       relativePath: string,
     ) => Promise<{ content: string }>;
     writeFile: (
       skillName: string,
       relativePath: string,
       content: string,
     ) => Promise<{ success: boolean }>;
     createFile: (
       skillName: string,
       relativePath: string,
       content: string,
     ) => Promise<{ success: boolean }>;
     deleteFile: (
       skillName: string,
       relativePath: string,
     ) => Promise<{ success: boolean }>;
     listBackups: (skillName: string) => Promise<{ backups: BackupEntry[] }>;
     restoreBackup: (
       skillName: string,
       backupPath: string,
     ) => Promise<{ success: boolean }>;
     getFileTree: (skillName: string) => Promise<{ tree: FileNode[] }>;
   }

   interface BackupEntry {
     path: string;
     timestamp: string;
     size: number;
   }
   ```

### タスク 4: レスポンシブデザイン設計

1. ブレークポイント設計

   | ブレークポイント | FileTreePanel                         | EditorPanel | ToolBar 配置         |
   | ---------------- | ------------------------------------- | ----------- | -------------------- |
   | >= 1024px        | 左 240px 固定、常時表示               | flex-1      | 上部水平バー         |
   | 768px〜1023px    | 左 200px 固定、常時表示               | flex-1      | 上部水平バー         |
   | < 768px          | ドロワー（左からスライドイン、280px） | フル幅      | 上部（アイコンのみ） |

2. ドロワー動作仕様
   - ハンバーガーメニューボタン（左上）でドロワーを開閉する
   - ドロワー背面にオーバーレイ（rgba(0,0,0,0.3)）を表示する
   - ファイル選択時にドロワーを自動的に閉じる
   - アニメーション: スライドイン/アウト 200ms ease-out

3. CSS 実装方針

   ```
   レイアウト: flex を使用した 2 ペイン構成
   ブレークポイント: Tailwind の md: (768px) と lg: (1024px) を使用
   ドロワー: 固定ポジション + transform による CSS アニメーション
   ```

### タスク 5: アクセシビリティ設計

1. ARIA 属性設計

   | コンポーネント       | ARIA 属性                                                                    |
   | -------------------- | ---------------------------------------------------------------------------- |
   | FileTreePanel        | `role="tree"`, `aria-label="ファイルツリー"`                                 |
   | FileTreeNode         | `role="treeitem"`, `aria-expanded`, `aria-selected`, `aria-level`            |
   | EditorPanel          | `role="textbox"`, `aria-label="ファイルエディター"`, `aria-multiline="true"` |
   | EditorToolBar        | `role="toolbar"`, `aria-label="エディターツールバー"`                        |
   | BackupMenu           | `role="menu"`, `aria-label="バックアップメニュー"`                           |
   | UnsavedChangesDialog | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`                 |

2. キーボード操作設計

   | キー              | コンテキスト     | 動作                                      |
   | ----------------- | ---------------- | ----------------------------------------- |
   | Tab               | 全体             | ファイルツリー → ツールバー → エディター  |
   | ArrowUp/ArrowDown | ファイルツリー内 | ツリーアイテム間の移動                    |
   | ArrowRight        | ファイルツリー内 | ディレクトリの展開 / 子要素への移動       |
   | ArrowLeft         | ファイルツリー内 | ディレクトリの折りたたみ / 親要素への移動 |
   | Enter             | ファイルツリー内 | ファイル選択（エディターに読み込み）      |
   | Cmd+S / Ctrl+S    | エディター内     | ファイル保存                              |
   | Escape            | ダイアログ内     | ダイアログを閉じる（キャンセル）          |

3. フォーカス管理
   - SkillEditorView マウント時にファイルツリーの最初のノードにフォーカスを設定する
   - ダイアログ表示時にフォーカスをダイアログ内の最初のボタンに移動する
   - ダイアログ閉じ時にフォーカスをトリガー元の要素に戻す
   - ファイル選択時にエディターにフォーカスを移動する

---

## 統合テスト連携

| 連携項目           | 検証内容                                                                          |
| ------------------ | --------------------------------------------------------------------------------- |
| コンポーネント結合 | SkillEditorView 内の FileTreePanel → EditorPanel 間のデータフローが正常に動作する |
| 状態同期           | useSkillEditor・useFileTree・useUnsavedWarning の 3 Hook 間の状態同期が正しい     |
| IPC モック         | 7 つの IPC チャネルのモック呼び出しが Props と一致する引数で実行される            |
| レスポンシブ       | 3 段階ブレークポイントでレイアウトが正しく切り替わる                              |

---

## 成果物

| 成果物                 | パス                                     | 内容                                       |
| ---------------------- | ---------------------------------------- | ------------------------------------------ |
| architecture-design.md | `outputs/phase-2/architecture-design.md` | コンポーネント設計・状態管理設計・IPC 設計 |
| api-specification.md   | `outputs/phase-2/api-specification.md`   | IPC API 仕様・Preload API マッピング       |

## 完了条件

- [ ] 8 コンポーネントの Props インターフェースが TypeScript 型定義として記述されている
- [ ] Atomic Design レベル（atoms/molecules/organisms）分類が確定している
- [ ] コンポーネント間データフロー図が作成されている
- [ ] useSkillEditor, useFileTree, useUnsavedWarning の状態遷移が定義されている
- [ ] 7 つの IPC チャネルの呼び出しフロー・エラーハンドリング戦略が定義されている
- [ ] Preload API マッピング（SkillPreloadAPI）が定義されている
- [ ] 3 段階ブレークポイントのレイアウト設計が完了している
- [ ] ドロワー動作仕様が定義されている（開閉方法、アニメーション、自動閉じ条件）
- [ ] ARIA 属性設計が 6 コンポーネント分定義されている
- [ ] キーボード操作設計が 7 キー分定義されている
- [ ] フォーカス管理方針が定義されている（初期フォーカス、ダイアログフォーカストラップ、フォーカス復帰）
- [ ] 曖昧語チェック（条件・数値・対象パスが明記されている）を満たしている

## Phase 末端アクション

1. `artifacts.json` の Phase 2 ステータスを `completed` に更新
2. Phase 2 成果物パスを `artifacts` 配列に追加
3. `index.md` の Phase 2 ステータスを `completed` に更新

## 次の Phase

Phase 3: 設計レビュー → [phase-3-design-review.md](phase-3-design-review.md)
