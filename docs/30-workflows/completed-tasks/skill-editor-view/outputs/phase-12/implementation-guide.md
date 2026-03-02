# SkillEditorView 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### SkillEditorView ってなに？

SkillEditorView は、**本棚から本を取り出してページを開き、中身を書き換えられるノート**のような仕組みです。

画面は2つに分かれています:

- **左側 = 本棚（ファイルツリー）**: パソコンのフォルダ構造と同じで、フォルダをクリックすると中身が見えます。選んだファイルは色が変わって「今ここを見ている」とわかります。
- **右側 = ノート（エディター）**: 選んだファイルの中身が表示され、自由に編集できます。

### 編集と保存のしくみ

ノートに書き込んだ状態は、まだ**鉛筆書き**の状態です。保存ボタンを押すと**ペンで清書**されて確定します。

保存していない変更があるファイルの横には、小さな**丸い点（ドットマーカー）**が付きます。これは「まだ保存してないよ」という目印です。

### バックアップ

書き直す前のノートは自動的にコピーが残ります（バックアップ）。万が一失敗しても、前の状態に戻せます。

### 未保存で別ファイルを開こうとしたとき

保存していない状態で別のファイルを開こうとすると、「保存する？しない？やめる？」という確認メッセージが出ます。大事な作業を失わないための安全装置です。

### 読み取り専用

図書館の本は読めるけど書き込めません。それと同じで、他の人が作ったツール（`~/.claude/skills/` 配下）は見るだけで編集できません。

---

## Part 2: 開発者向け技術詳細

### コンポーネントツリー構成

```
SkillEditorView (organism)
├── FileTreePanel (molecule)
│   └── FileTreeNode (atom) × N（再帰）
├── EditorToolBar (molecule)
├── EditorPanel (molecule)
│   └── EditorStatusBar (atom)
├── UnsavedChangesDialog (organism)
└── BackupMenu (molecule)
```

### 状態管理設計

3つのカスタムフックで責務を分離:

| フック              | 責務                             | 状態                                               |
| ------------------- | -------------------------------- | -------------------------------------------------- |
| `useSkillEditor`    | ファイル読込・編集・保存         | content, isLoading, hasChanges, error, currentPath |
| `useFileTree`       | ファイルツリー取得・選択         | fileTree, selectedFile, error                      |
| `useUnsavedWarning` | 未保存変更時のナビゲーション制御 | isDialogOpen, pendingPath                          |

#### P31対策: useEffect 依存配列

`useFileTree` の初期ロード useEffect では、`refreshTree`（useCallbackの戻り値）ではなく `skillName`（プリミティブ値）を依存配列に指定しています。これにより、refreshTree の依存関係が変化しても無限ループを防止します。

```typescript
// ✅ P31パターン対策
useEffect(() => {
  void refreshTree();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [skillName]); // refreshTreeではなくskillNameに依存
```

### ファイルツリーの非制御コンポーネントパターン

FileTreePanel は `expandedDirs` を内部状態として管理します（非制御コンポーネント）。親コンポーネント（SkillEditorView）からは `expandedDirs` を渡す必要がありません。

```typescript
// FileTreePanel 内部で管理
const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
```

### IPC連携

SkillEditorView は以下の IPC チャネルを利用します:

| チャネル              | 用途                 | 実装状態 |
| --------------------- | -------------------- | -------- |
| `skill:getFileTree`   | ファイルツリー取得   | 未実装   |
| `skill:readFile`      | ファイル内容読込     | 実装済   |
| `skill:writeFile`     | ファイル内容保存     | 実装済   |
| `skill:createFile`    | 新規ファイル作成     | 実装済   |
| `skill:deleteFile`    | ファイル削除         | 実装済   |
| `skill:listBackups`   | バックアップ一覧取得 | 実装済   |
| `skill:restoreBackup` | バックアップ復元     | 実装済   |

`skill:getFileTree` は未実装のため、`useFileTree` 内で `typeof` チェックと型アサーションで防御的に対応しています。

### テスト設計

| テストファイル                | テスト数 | カバー対象               |
| ----------------------------- | -------- | ------------------------ |
| SkillEditorView.test.tsx      | 12       | 統合テスト               |
| FileTreePanel.test.tsx        | 9        | ツリー表示・選択・展開   |
| FileTreeNode.test.tsx         | 7        | ノード表示・クリック     |
| EditorToolBar.test.tsx        | 8        | ツールバー操作           |
| EditorPanel.test.tsx          | 8        | エディター表示・編集     |
| UnsavedChangesDialog.test.tsx | 6        | ダイアログ操作           |
| useSkillEditor.test.ts        | 10       | ファイル読込・保存フック |
| useFileTree.test.ts           | 7        | ツリー取得・選択フック   |
| BackupMenu.test.tsx           | 6        | バックアップ一覧・復元   |
| useUnsavedWarning.test.ts     | 5        | 未保存警告フック         |
| expanded-tests.test.tsx       | 24       | 境界値・エラー・A11y     |
| **合計**                      | **99**   |                          |

**P39対策**: happy-dom 環境のため、全テストで `userEvent` ではなく `fireEvent` を使用。

**P40対策**: テスト実行は常に `apps/desktop` ディレクトリから実行。

### CSS デザイントークン

全コンポーネントは `tokens.css` のセマンティック変数を使用:

| 用途           | CSS変数            | Tailwind記法                     |
| -------------- | ------------------ | -------------------------------- |
| 背景（主）     | `--bg-primary`     | `bg-[var(--bg-primary)]`         |
| 背景（副）     | `--bg-secondary`   | `bg-[var(--bg-secondary)]`       |
| 背景（三）     | `--bg-tertiary`    | `bg-[var(--bg-tertiary)]`        |
| テキスト（主） | `--text-primary`   | `text-[var(--text-primary)]`     |
| テキスト（副） | `--text-secondary` | `text-[var(--text-secondary)]`   |
| アクセント     | `--status-primary` | `bg-[var(--status-primary)]`     |
| エラー         | `--status-error`   | `text-[var(--status-error)]`     |
| ボーダー       | `--border-default` | `border-[var(--border-default)]` |
