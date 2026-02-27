# TASK-UI-05A-SKILL-EDITOR-VIEW: ツールエディター

## 1. メタ情報

| 項目         | 値                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| タスク ID    | TASK-UI-05A-SKILL-EDITOR-VIEW                                                                                  |
| ステータス   | 未着手                                                                                                         |
| 依存タスク   | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-02（ナビコア）, TASK-UI-05（スキルセンター） |
| バックエンド | TASK-9A（SkillFileManager + IPC）                                                                              |
| 複雑度       | medium                                                                                                         |
| 対象ビュー   | SkillEditorView（新規作成）                                                                                    |
| 関連スライス | `agentSlice`（既存利用）                                                                                       |
| 設計哲学     | 「ファイルを選んで、すぐ編集」-- IDE ライクなシンプル編集体験                                                  |

## 2. 目的

インポート済みツールの SKILL.md およびサブリソース（agents/, references/ 等）を GUI で編集できるエディタービューを提供する。左ペインにファイルツリー、右ペインにコードエディターを配置し、直感的なファイル操作とバックアップ機能を統合する。

### 対象ディレクトリと権限

| パス                    | 操作             | 説明                          |
| ----------------------- | ---------------- | ----------------------------- |
| `~/.aiworkflow/skills/` | 読み書き可能     | アプリ独自ツール（編集可能）  |
| `~/.claude/skills/`     | **読み取り専用** | Claude CLI ツール（編集不可） |

> `~/.claude/skills/` 配下のツールは読み取り専用として表示し、編集操作を無効化する。

## 3. 画面構成図（ASCII）

### デスクトップレイアウト（>= 1024px）

```
+------------------------------------------------------------------+
| ToolBar                                                           |
| [← 戻る]  SKILL.md            [未保存] [保存] [バックアップ ▼]   |
+------------------------------------------------------------------+
| FileTreePanel (240px) | EditorPanel (flex-1)                      |
| +-------------------+ | +--------------------------------------+ |
| | 📦 my-skill       | | |                                      | |
| | ├── SKILL.md    * | | | # My Skill                           | |
| | ├── agents/       | | |                                      | |
| | │   ├── main.md   | | | This skill helps you...              | |
| | │   └── helper.md | | |                                      | |
| | ├── references/   | | | ## Capabilities                      | |
| | │   └── guide.md  | | | - Code review                        | |
| | ├── scripts/      | | | - Test generation                    | |
| | │   └── setup.sh  | | |                                      | |
| | └── assets/       | | |                                      | |
| +-------------------+ | +--------------------------------------+ |
+------------------------------------------------------------------+
```

### モバイルレイアウト（< 768px）

```
+------------------------------------------+
| [☰] SKILL.md     [未保存] [保存]        |
+------------------------------------------+
| (FileTree をドロワーで表示)               |
| +--------------------------------------+ |
| | # My Skill                           | |
| |                                      | |
| | This skill helps you...              | |
| +--------------------------------------+ |
+------------------------------------------+
```

## 4. コンポーネント構成ツリー

```
SkillEditorView/
├── index.tsx                              # メインレイアウト（左右分割）
├── components/
│   ├── FileTreePanel/
│   │   ├── FileTreePanel.tsx             # ファイルツリーパネル（幅 240px）
│   │   └── FileTreeNode.tsx             # 再帰ツリーノード（lucide-react アイコン）
│   ├── EditorPanel/
│   │   ├── EditorPanel.tsx              # コードエディター + ステータスバー
│   │   └── EditorStatusBar.tsx          # 行数・文字数・言語表示
│   ├── EditorToolBar.tsx                 # 保存・閉じる・バックアップ操作
│   ├── UnsavedChangesDialog.tsx          # 未保存変更警告ダイアログ
│   └── BackupMenu.tsx                    # バックアップ一覧・復元メニュー
└── hooks/
    ├── useSkillEditor.ts                 # ファイル読み書き・保存ロジック
    ├── useFileTree.ts                    # ファイルツリー構築・選択管理
    └── useUnsavedWarning.ts             # 未保存変更検出・警告ロジック
```

### Atomic Design 分類

| レベル    | コンポーネント                                        |
| --------- | ----------------------------------------------------- |
| atoms     | FileTreeNode, EditorStatusBar                         |
| molecules | FileTreePanel, EditorPanel, EditorToolBar, BackupMenu |
| organisms | SkillEditorView, UnsavedChangesDialog                 |

### アイコン統一（lucide-react）

| 用途              | アイコン名   | 備考                    |
| ----------------- | ------------ | ----------------------- |
| フォルダ（開）    | `FolderOpen` | 展開状態                |
| フォルダ（閉）    | `Folder`     | 折りたたみ状態          |
| ファイル          | `File`       | デフォルトファイル      |
| Markdown ファイル | `FileText`   | .md 拡張子              |
| TypeScript        | `FileCode`   | .ts/.tsx 拡張子         |
| JSON              | `Braces`     | .json 拡張子            |
| Shell スクリプト  | `Terminal`   | .sh/.bash 拡張子        |
| 未保存マーカー    | `Circle`     | 8px、accent カラー      |
| 読み取り専用      | `Lock`       | Claude CLI スキル表示時 |

## 5. Props・インターフェース定義

### SkillEditorView

```typescript
interface SkillEditorViewProps {
  skillName: string;
  isReadOnly: boolean; // ~/.claude/skills/ の場合 true
  onClose: () => void;
}
```

### FileTreePanel

```typescript
interface FileTreePanelProps {
  skillName: string;
  fileTree: FileNode[];
  selectedFile: string;
  unsavedFiles: Set<string>;
  onSelectFile: (path: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}
```

### EditorPanel

```typescript
interface EditorPanelProps {
  content: string;
  language: string;
  isLoading: boolean;
  isReadOnly: boolean;
  onChange: (value: string) => void;
}
```

### EditorToolBar

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

## 6. インタラクション仕様

### 6.1 ファイル選択

| トリガー                     | アクション                                            |
| ---------------------------- | ----------------------------------------------------- |
| ファイルノードクリック       | 右ペインにファイル内容を読み込んで表示                |
| フォルダノードクリック       | フォルダの展開/折りたたみをトグル                     |
| 未保存ファイルから別ファイル | `UnsavedChangesDialog` を表示（保存/破棄/キャンセル） |

### 6.2 保存操作

| トリガー           | アクション                                             |
| ------------------ | ------------------------------------------------------ |
| 保存ボタンクリック | `skill:writeFile` IPC 呼び出し（バックアップ自動作成） |
| `Cmd+S` / `Ctrl+S` | 同上（キーボードショートカット）                       |
| 保存成功           | 「保存しました」Toast 表示 + 未保存マーカー消去        |
| 保存失敗           | エラー Toast 表示                                      |

### 6.3 未保存変更警告

```
ファイル変更 → 別ファイル選択 or 閉じるボタン
  → UnsavedChangesDialog 表示
    [保存して移動] → 保存実行 → ファイル切替
    [保存せず移動] → 変更破棄 → ファイル切替
    [キャンセル]   → 現在のファイルに留まる
```

### 6.4 バックアップ・復元

```
[バックアップ ▼] クリック → BackupMenu ドロップダウン表示
  → バックアップ一覧（タイムスタンプ付き）
  → 項目クリック → 確認ダイアログ → 復元実行
```

### 6.5 マイクロインタラクション

| 対象                 | トリガー | アニメーション                                       | 時間           |
| -------------------- | -------- | ---------------------------------------------------- | -------------- |
| FileTreeNode         | hover    | 背景色 `var(--bg-hover)`                             | 100ms          |
| FileTreeNode         | active   | 背景色 `var(--bg-active)`                            | 即時           |
| FileTreeNode（選択） | 選択中   | 背景色 `var(--color-accent-subtle)` + 左ボーダー 2px | 200ms ease-out |
| 保存ボタン           | hover    | `scale(1.02)`                                        | 200ms ease-out |
| 保存ボタン           | active   | `scale(0.97)`                                        | 100ms ease-out |
| 未保存マーカー       | 出現     | `opacity 0→1` + `scale(0.5→1)`                       | 200ms ease-out |
| フォルダ展開         | トグル   | 子要素 `max-height` トランジション                   | 200ms ease-out |

## 7. レスポンシブ設計

| ブレークポイント | FileTreePanel | EditorPanel | ToolBar 配置         |
| ---------------- | ------------- | ----------- | -------------------- |
| >= 1024px        | 左 240px 固定 | flex-1      | 上部水平バー         |
| 768px〜1023px    | 左 200px 固定 | flex-1      | 上部水平バー         |
| < 768px          | ドロワー表示  | フル幅      | 上部（アイコンのみ） |

### モバイルドロワー

```css
.file-tree-drawer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  transform: translateX(-100%);
  transition: transform 250ms ease-out;
  z-index: var(--z-drawer);
}

.file-tree-drawer--open {
  transform: translateX(0);
}
```

## 8. IPC 連携

> IPC ハンドラーの詳細仕様は [task-020b-task-9a-skill-editor.md](../completed-task/task-020b-task-9a-skill-editor.md) を参照。

| 操作             | IPC チャネル          | 引数                                                       |
| ---------------- | --------------------- | ---------------------------------------------------------- |
| ファイル読み込み | `skill:readFile`      | `skillName: string, relativePath: string`                  |
| ファイル書き込み | `skill:writeFile`     | `skillName: string, relativePath: string, content: string` |
| ファイル作成     | `skill:createFile`    | `skillName: string, relativePath: string, content: string` |
| ファイル削除     | `skill:deleteFile`    | `skillName: string, relativePath: string`                  |
| バックアップ一覧 | `skill:listBackups`   | `skillName: string`                                        |
| バックアップ復元 | `skill:restoreBackup` | `skillName: string, backupPath: string`                    |

## 9. アクセシビリティ

| 要件                     | 実装                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| キーボードナビゲーション | `↑`/`↓` でファイルツリー移動、`Enter` で選択、`→`/`←` で展開/折りたたみ |
| フォーカス管理           | ファイル選択時にエディターへフォーカス移動                              |
| スクリーンリーダー       | `role="tree"` / `role="treeitem"` / `aria-expanded`                     |
| コントラスト             | 選択状態と非選択状態で 4.5:1 以上                                       |
| 保存ショートカット       | `Cmd+S` / `Ctrl+S` で即座に保存                                         |
| 読み取り専用表示         | `aria-readonly="true"` + ロックアイコン + テキスト「読み取り専用」      |

## 10. テスト構成

### テストファイル

```
apps/desktop/src/renderer/
└── views/SkillEditorView/__tests__/
    ├── SkillEditorView.test.tsx
    ├── FileTreePanel.test.tsx
    ├── FileTreeNode.test.tsx
    ├── EditorPanel.test.tsx
    ├── EditorToolBar.test.tsx
    ├── UnsavedChangesDialog.test.tsx
    ├── useSkillEditor.test.ts
    └── useFileTree.test.ts
```

### テスト方針

| テスト区分     | 対象                          | 方針                                     |
| -------------- | ----------------------------- | ---------------------------------------- |
| ユニットテスト | FileTreeNode, EditorStatusBar | Props 反映、アクセシビリティ属性         |
| フックテスト   | useSkillEditor, useFileTree   | ファイル読み書き、ツリー構築、未保存検出 |
| 統合テスト     | SkillEditorView               | ファイル選択→編集→保存フロー、未保存警告 |

### P31/P39/P40 対策

| Pitfall | 対策                                                  |
| ------- | ----------------------------------------------------- |
| **P31** | agentSlice からは個別セレクタ使用                     |
| **P39** | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止 |
| **P40** | テスト実行は `cd apps/desktop` から実行               |

## 11. 成果物

### プロダクションコード

```
apps/desktop/src/renderer/
└── views/SkillEditorView/
    ├── index.tsx
    ├── components/
    │   ├── FileTreePanel/
    │   │   ├── FileTreePanel.tsx
    │   │   └── FileTreeNode.tsx
    │   ├── EditorPanel/
    │   │   ├── EditorPanel.tsx
    │   │   └── EditorStatusBar.tsx
    │   ├── EditorToolBar.tsx
    │   ├── UnsavedChangesDialog.tsx
    │   └── BackupMenu.tsx
    └── hooks/
        ├── useSkillEditor.ts
        ├── useFileTree.ts
        └── useUnsavedWarning.ts
```

### 推定ファイル数

- プロダクションコード: 11 ファイル（うち hooks 3）
- テストコード: 8 ファイル
- 合計: 19 ファイル

## 12. 完了条件

### ファイルツリー

- [ ] ツールのファイル構造がツリー形式で表示される
- [ ] lucide-react アイコンでファイル種別が区別される
- [ ] フォルダの展開/折りたたみがアニメーション付きで動作する
- [ ] 選択ファイルにアクセントカラー背景 + 左ボーダーが表示される
- [ ] 未保存ファイルにドットマーカーが表示される
- [ ] キーボード（↑/↓/Enter/→/←）でナビゲーション可能

### コードエディター

- [ ] 選択ファイルの内容が textarea で表示・編集できる
- [ ] ファイル拡張子に応じた language 属性が設定される
- [ ] ステータスバーに行数・文字数・言語が表示される
- [ ] 読み取り専用ツールではロックアイコン + 編集無効化

### 保存・バックアップ

- [ ] 保存ボタンクリックでファイルが保存される（バックアップ自動作成）
- [ ] `Cmd+S` / `Ctrl+S` ショートカットで保存される
- [ ] 保存成功時に Toast が表示される
- [ ] バックアップ一覧が表示され、復元操作が可能

### 未保存変更警告

- [ ] 未保存変更がある状態でファイル切替時に警告ダイアログが表示される
- [ ] 「保存して移動」「保存せず移動」「キャンセル」の3選択肢が提供される

### レスポンシブ

- [ ] > = 1024px: 左右分割（FileTree 240px + Editor flex-1）
- [ ] 768px〜1023px: 左右分割（FileTree 200px + Editor flex-1）
- [ ] < 768px: FileTree がドロワー表示、Editor がフル幅

### 品質

- [ ] 全コンポーネントテストが PASS する
- [ ] 個別セレクタパターンを使用していること（P31 対策）
- [ ] happy-dom 環境で `fireEvent` を使用していること（P39 対策）
- [ ] テスト実行が `cd apps/desktop` から行われること（P40 対策）

## 13. 既知の落とし穴・教訓

| Pitfall | 該当箇所               | 対策                                                  |
| ------- | ---------------------- | ----------------------------------------------------- |
| **P31** | agentSlice セレクタ    | 個別セレクタ使用                                      |
| **P39** | テスト環境             | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止 |
| **P40** | テスト実行ディレクトリ | `cd apps/desktop` から実行                            |

## 14. 参照資料

| 資料                             | パス / タスク ID                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| デザイン基盤                     | TASK-UI-00 `00-ui-design-foundation.md`                                                          |
| UI アーキテクチャ                | TASK-UI-01 `01-store-ipc-architecture.md`                                                        |
| スキルセンター画面               | TASK-UI-05 `05-skill-center-view.md`                                                             |
| バックエンド仕様（IPC/サービス） | TASK-9A [task-020b-task-9a-skill-editor.md](../completed-task/task-020b-task-9a-skill-editor.md) |
| P31: Store Hook 無限ループ       | `.claude/rules/06-known-pitfalls.md#P31`                                                         |
| P39: happy-dom userEvent         | `.claude/rules/06-known-pitfalls.md#P39`                                                         |

## 15. 次の Phase

- TASK-UI-05（スキルセンター）完了後に実装開始が理想（DetailPanel からの遷移導線）
- TASK-9A（バックエンド）と **並列実装可能**（IPC 契約が合意済みのため）
- TASK-UI-05B（高度管理ビュー群）とも **並列実装可能**
