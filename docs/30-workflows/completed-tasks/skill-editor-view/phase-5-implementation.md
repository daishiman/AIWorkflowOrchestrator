# Phase 5: 実装（TDD Green）— SkillEditorView

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW                        |
| Phase      | 5（実装）                                            |
| 前提 Phase | Phase 4（テスト作成）                                |
| 後続 Phase | Phase 6（テスト拡充）                                |
| ステータス | 未着手                                               |
| 作成日     | 2026-03-01                                           |
| 機能名     | SkillEditorView（スキルエディタービュー）            |
| 依存タスク | TASK-UI-05-SKILL-CENTER-VIEW（SkillCenterView 実装） |

## 目的

Phase 4 で作成した全 64 テストケースを Green にするために、SkillEditorView の全コンポーネント（7 個）および全カスタムフック（3 個）、メインレイアウト（1 個）を実装する。Apple HIG 準拠のデザインを適用し、IPC 経由のファイル操作を統合する。全 64 テストが**成功状態（Green）**であることを確認する。

## 背景

Phase 4 で定義された 64 テストケースは全て Red 状態である。本 Phase では TDD の Green ステップとして、テストを満たす最小限の実装を行う。実装は Atomic Design（atoms → molecules → organisms）に従い、下位コンポーネントから順に実装する。

## 実行タスク

### タスク 1: FileTreeNode 実装（atom）

**目的**: 再帰ツリーノードコンポーネントを実装し、FTN-01〜FTN-07 の 7 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/components/FileTreePanel/FileTreeNode.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `node: FileNode`, `depth: number`, `isSelected: boolean`, `onSelect: (path: string) => void`
   - ファイルノード: `lucide-react` の `File` アイコン（`data-testid="file-icon"`）を表示する
   - ディレクトリノード: `lucide-react` の `Folder` / `FolderOpen` アイコン（`data-testid="folder-icon"`）を表示する
   - `role="treeitem"` を付与する
   - ネストレベルに応じた `paddingLeft`（`depth * 16px`）を適用する
   - 選択状態でハイライト背景クラスを適用する（Apple HIG systemBlue: `bg-[var(--accent-color)]` + opacity）
   - クリック時に `onSelect(node.path)` を呼び出す
3. Apple HIG カラーパレットに準拠する:
   - テキスト: `text-[var(--text-primary)]`
   - 選択ハイライト: `bg-[var(--accent-color)]` + `bg-opacity-10`
   - ホバー: `hover:bg-[var(--bg-tertiary)]`

**Green 確認**: FTN-01〜FTN-07（7 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/components/FileTreePanel/FileTreeNode.tsx`

### タスク 2: FileTreePanel 実装（molecule）

**目的**: ファイルツリーパネルを実装し、FTP-01〜FTP-09 の 9 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/components/FileTreePanel/FileTreePanel.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `FileTreePanelProps`（skillName, fileTree, selectedFile, unsavedFiles, onSelectFile）
   - ルート要素に `role="tree"` を付与する
   - `FileNode[]` を再帰的にレンダリングする（`FileTreeNode` を使用）
   - 空ツリーで「ファイルがありません」を表示する
   - ディレクトリノードの展開/折りたたみを `useState` で管理する
   - ディレクトリノードに `aria-expanded` 属性を付与する
   - 未保存ファイルに未保存マーカー（ドット）を表示する
   - パネル幅を `w-[240px]` に固定する
3. Apple HIG カラーパレットに準拠する:
   - パネル背景: `bg-[var(--bg-secondary)]`
   - ボーダー: `border-r border-[var(--border-color)]`

**Green 確認**: FTP-01〜FTP-09（9 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/components/FileTreePanel/FileTreePanel.tsx`

### タスク 3: EditorStatusBar 実装（atom）

**目的**: エディターステータスバーを実装する。EP-05〜EP-07 テストの前提コンポーネントとなる。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/components/EditorPanel/EditorStatusBar.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `lineCount: number`, `charCount: number`, `language: string`
   - 行数表示: `{lineCount} 行`
   - 文字数表示: `{charCount} 文字`
   - 言語表示: 言語名を先頭大文字で表示（`markdown` → `Markdown`）
   - 各情報をセパレーター（`|`）で区切って横並びに表示する
3. Apple HIG カラーパレットに準拠する:
   - テキスト: `text-[var(--text-secondary)]`
   - 背景: `bg-[var(--bg-tertiary)]`
   - フォントサイズ: `text-xs`（12px）

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/components/EditorPanel/EditorStatusBar.tsx`

### タスク 4: EditorPanel 実装（molecule）

**目的**: コードエディターパネルを実装し、EP-01〜EP-08 の 8 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/components/EditorPanel/EditorPanel.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `EditorPanelProps`（content, language, isLoading, isReadOnly, onChange）
   - `<textarea>` でコードエディターを実装する（monospace フォント）
   - 読み取り専用モード: `readOnly` 属性を設定する
   - ローディング中: `data-testid="editor-loading"` のスピナーを表示する
   - 空コンテンツ + 未選択: 「ファイルを選択してください」プレースホルダーを表示する
   - `EditorStatusBar` を下部に配置する（行数・文字数・言語表示）
   - `onChange` イベントで `onChange(event.target.value)` を呼び出す
3. 行数算出: `content.split("\n").length`
4. 文字数算出: `content.length`
5. Apple HIG カラーパレットに準拠する:
   - テキスト: `text-[var(--text-primary)]`
   - 背景: `bg-[var(--bg-primary)]`
   - フォント: `font-mono`

**Green 確認**: EP-01〜EP-08（8 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/components/EditorPanel/EditorPanel.tsx`

### タスク 5: EditorToolBar 実装（molecule）

**目的**: エディターツールバーを実装し、ETB-01〜ETB-09 の 9 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/components/EditorToolBar.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `EditorToolBarProps`（selectedFile, hasChanges, isSaving, isReadOnly, onSave, onClose, onOpenBackups）
   - 選択中ファイル名を表示する
   - 保存ボタン: `aria-label="保存"` 付き、`lucide-react` の `Save` アイコン
     - `hasChanges=false` または `isReadOnly=true` または `isSaving=true` で `disabled`
     - `isSaving=true` でスピナーアイコンを表示する
   - 閉じるボタン: `lucide-react` の `X` アイコン
   - バックアップボタン: `lucide-react` の `Archive` アイコン
   - 各ボタンにホバー・フォーカス状態のフィードバックを実装する
3. Apple HIG カラーパレットに準拠する:
   - ツールバー背景: `bg-[var(--bg-secondary)]`
   - ボーダー: `border-b border-[var(--border-color)]`
   - ボタンホバー: `hover:bg-[var(--bg-tertiary)]`

**Green 確認**: ETB-01〜ETB-09（9 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/components/EditorToolBar.tsx`

### タスク 6: UnsavedChangesDialog 実装（organism）

**目的**: 未保存変更警告ダイアログを実装し、UCD-01〜UCD-06 の 6 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/components/UnsavedChangesDialog.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `isOpen: boolean`, `fileName: string`, `onSaveAndContinue: () => void`, `onDiscardAndContinue: () => void`, `onCancel: () => void`
   - `isOpen=true` でダイアログを表示、`isOpen=false` で非表示にする
   - `role="alertdialog"` と `aria-modal="true"` を付与する
   - 3 つの選択肢ボタン:
     - 「保存して続行」: `onSaveAndContinue` を呼び出す
     - 「保存せず続行」: `onDiscardAndContinue` を呼び出す
     - 「キャンセル」: `onCancel` を呼び出す
   - オーバーレイ背景: `bg-black/50` で半透明オーバーレイ
3. Apple HIG カラーパレットに準拠する:
   - ダイアログ背景: `bg-[var(--bg-primary)]`
   - 角丸: `rounded-xl`（12px）
   - 影: `shadow-lg`
   - 破壊的操作ボタン（保存せず続行）: `text-[var(--status-error)]`

**Green 確認**: UCD-01〜UCD-06（6 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/components/UnsavedChangesDialog.tsx`

### タスク 7: BackupMenu 実装（molecule）

**目的**: バックアップ一覧・復元メニューを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/components/BackupMenu.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `isOpen: boolean`, `backups: BackupEntry[]`, `onRestore: (backupPath: string) => void`, `onClose: () => void`
   - `BackupEntry` 型: `{ path: string, createdAt: string, fileName: string }`
   - バックアップ一覧をリスト表示する（作成日時降順）
   - 各エントリに「復元」ボタンを配置する
   - 空の場合は「バックアップがありません」を表示する
   - `role="menu"` を付与する
3. Apple HIG カラーパレットに準拠する:
   - メニュー背景: `bg-[var(--bg-primary)]`
   - ボーダー: `border border-[var(--border-color)]`
   - 角丸: `rounded-lg`（8px）
   - 影: `shadow-md`

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/components/BackupMenu.tsx`

### タスク 8: useSkillEditor フック実装

**目的**: ファイル読み書きと保存ロジックを実装し、USE-01〜USE-10 の 10 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/hooks/useSkillEditor.ts` を作成する
2. 以下の仕様を実装する:
   - 引数: `skillName: string`, `isReadOnly: boolean`
   - 戻り値:
     - `content: string` — 現在のファイル内容
     - `isLoading: boolean` — ファイル読み込み中フラグ
     - `hasChanges: boolean` — 未保存変更フラグ
     - `error: string | null` — エラーメッセージ
     - `loadFile: (relativePath: string) => Promise<void>` — ファイル読み込み
     - `saveFile: () => Promise<void>` — ファイル保存
     - `updateContent: (newContent: string) => void` — コンテンツ更新
   - `loadFile`: `window.electronAPI.skill.readFile(skillName, relativePath)` を呼び出す
     - 成功時: `content` を更新、`hasChanges` を `false` にリセット
     - 失敗時: `error` にエラーメッセージを設定
     - 実行中: `isLoading` を `true` に設定
   - `saveFile`: `window.electronAPI.skill.writeFile(skillName, currentPath, content)` を呼び出す
     - `isReadOnly=true` の場合は何も実行しない
     - 成功時: `hasChanges` を `false` にリセット
     - 失敗時: `error` にエラーメッセージを設定
   - `updateContent`: `content` を更新し、`hasChanges` を `true` に設定する
3. 状態管理: `useState` を使用する（Zustand Store は使用しない）

**Green 確認**: USE-01〜USE-10（10 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/hooks/useSkillEditor.ts`

### タスク 9: useFileTree フック実装

> **前提**: UT-UI-05A-GETFILETREE-001 完了後に実施。`skill:getFileTree` IPCチャネルが利用可能であること。

**目的**: ファイルツリー構築と選択管理を実装し、UFT-01〜UFT-07 の 7 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` を作成する
2. 以下の仕様を実装する:
   - 引数: `skillName: string`
   - 戻り値:
     - `fileTree: FileNode[]` — 構築されたファイルツリー
     - `selectedFile: string` — 選択中ファイルパス
     - `expandedDirs: Set<string>` — 展開中ディレクトリのパスセット
     - `selectFile: (path: string) => void` — ファイル選択
     - `toggleExpand: (path: string) => void` — ディレクトリ展開/折りたたみトグル
     - `refreshTree: () => Promise<void>` — ファイルツリー再読み込み
   - ファイルツリー構築ロジック:
     - `refreshTree()` で `window.electronAPI.skill.getFileTree(skillName)` を呼び出し、`FileNode[]` を取得する
     - ディレクトリがファイルより先にソートされる
     - 同一レベルのノードはアルファベット順にソートされる
   - `selectFile`: `selectedFile` を更新する
   - `toggleExpand`: `expandedDirs` の add/delete をトグルする
   - 初期化時に `refreshTree()` を自動実行する（`useEffect` + `skillName` 依存）
3. 状態管理: `useState` を使用する

**Green 確認**: UFT-01〜UFT-07（7 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts`

### タスク 10: useUnsavedWarning フック実装

**目的**: 未保存変更の検出と警告ロジックを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/hooks/useUnsavedWarning.ts` を作成する
2. 以下の仕様を実装する:
   - 引数: `hasChanges: boolean`, `onSave: () => Promise<void>`
   - 戻り値:
     - `isDialogOpen: boolean` — ダイアログ表示フラグ
     - `pendingAction: (() => void) | null` — 保留中のアクション
     - `requestNavigation: (action: () => void) => void` — ナビゲーション要求
     - `handleSaveAndContinue: () => void` — 保存して続行
     - `handleDiscardAndContinue: () => void` — 保存せず続行
     - `handleCancel: () => void` — キャンセル
   - `requestNavigation`: `hasChanges` が `true` の場合にダイアログを開き、アクションを保留する。`hasChanges` が `false` の場合は直接アクションを実行する
   - `handleSaveAndContinue`: `onSave()` を呼び出し、成功後に保留中アクションを実行してダイアログを閉じる
   - `handleDiscardAndContinue`: 保留中アクションを実行してダイアログを閉じる
   - `handleCancel`: ダイアログを閉じ、保留中アクションを破棄する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/hooks/useUnsavedWarning.ts`

### タスク 11: SkillEditorView メインレイアウト実装（organism）

**目的**: メインレイアウトを実装し、SEV-01〜SEV-08 の 8 テストを Green にする。

**実行手順**:

1. `apps/desktop/src/renderer/views/SkillEditorView/index.tsx` を作成する
2. 以下の仕様を実装する:
   - Props: `SkillEditorViewProps`（skillName, isReadOnly, onClose）
   - 左右分割レイアウト:
     - 左ペイン: `FileTreePanel`（幅 240px 固定）
     - 右ペイン: `EditorToolBar` + `EditorPanel`（flex-1）
   - カスタムフックの統合:
     - `useFileTree` でファイルツリーを構築する
     - `useSkillEditor` でファイル読み書きを管理する
     - `useUnsavedWarning` で未保存変更警告を管理する
   - ファイル選択フロー: ファイルノードクリック → `useUnsavedWarning.requestNavigation` → `useSkillEditor.loadFile`
   - 保存フロー: 保存ボタンクリック → `useSkillEditor.saveFile`
   - Cmd+S / Ctrl+S キーボードショートカット: `useEffect` で `keydown` イベントを登録し、`saveFile` を呼び出す。アンマウント時にリスナーを解除する（P5 対策）
   - `UnsavedChangesDialog` を統合する
3. レスポンシブ設計:
   - `>= 1024px`: 左 240px 固定 + 右 flex-1
   - `768px〜1023px`: 左 200px 固定 + 右 flex-1
   - `< 768px`: FileTreePanel をドロワー表示、EditorPanel はフル幅
4. Apple HIG カラーパレットに準拠する:
   - 背景: `bg-[var(--bg-primary)]`
   - ボーダー: `border-[var(--border-color)]`
5. P31 対策: agentSlice からデータ取得が必要な場合は個別セレクタを使用する

**Green 確認**: SEV-01〜SEV-08（8 テスト）が PASS する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/index.tsx`

### タスク 12: 全テスト Green 確認

**目的**: 全 64 テストケースが Green 状態であることを確認する。

**実行手順**:

1. 以下のコマンドで全テストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/
   ```
2. 全 64 テストが PASS であることを確認する
3. FAIL が残っている場合は、該当する実装を修正して再実行する
4. ビルド確認:
   ```bash
   pnpm --filter @repo/desktop build
   ```
5. 結果を `outputs/phase-5/implementation-summary.md` に記録する

**期待される成果物**:

- `docs/30-workflows/skill-editor-view/outputs/phase-5/implementation-summary.md`

## 参照資料

| 参照資料              | パス                                                                         | 内容                         |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Phase 4 テスト仕様    | `docs/30-workflows/skill-editor-view/phase-4-test-creation.md`               | 全 64 テストケース定義       |
| Phase 1 要件定義      | `docs/30-workflows/skill-editor-view/phase-1-requirements.md`                | 機能要件・受入基準           |
| Phase 2 設計          | `docs/30-workflows/skill-editor-view/phase-2-design.md`                      | コンポーネント・フック設計   |
| UI コンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | エディター統合パターン       |
| 状態管理設計          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand / P31 対策           |
| Agent IPC 仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         | skill:readFile 等の IPC 契約 |
| IPC セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 4 層防御構造                 |

## 成果物

| 成果物               | パス                                                                                         | 説明                 |
| -------------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| FileTreeNode         | `apps/desktop/src/renderer/views/SkillEditorView/components/FileTreePanel/FileTreeNode.tsx`  | 再帰ツリーノード     |
| FileTreePanel        | `apps/desktop/src/renderer/views/SkillEditorView/components/FileTreePanel/FileTreePanel.tsx` | ファイルツリーパネル |
| EditorStatusBar      | `apps/desktop/src/renderer/views/SkillEditorView/components/EditorPanel/EditorStatusBar.tsx` | ステータスバー       |
| EditorPanel          | `apps/desktop/src/renderer/views/SkillEditorView/components/EditorPanel/EditorPanel.tsx`     | コードエディター     |
| EditorToolBar        | `apps/desktop/src/renderer/views/SkillEditorView/components/EditorToolBar.tsx`               | ツールバー           |
| UnsavedChangesDialog | `apps/desktop/src/renderer/views/SkillEditorView/components/UnsavedChangesDialog.tsx`        | 未保存変更警告       |
| BackupMenu           | `apps/desktop/src/renderer/views/SkillEditorView/components/BackupMenu.tsx`                  | バックアップメニュー |
| useSkillEditor       | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useSkillEditor.ts`                    | ファイル操作フック   |
| useFileTree          | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts`                       | ツリー構築フック     |
| useUnsavedWarning    | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useUnsavedWarning.ts`                 | 未保存警告フック     |
| SkillEditorView      | `apps/desktop/src/renderer/views/SkillEditorView/index.tsx`                                  | メインレイアウト     |
| 実装サマリー         | `docs/30-workflows/skill-editor-view/outputs/phase-5/implementation-summary.md`              | 実装結果レポート     |

## 統合テスト連携【必須】

| 実装項目                 | 内容                                                | 検証方法                      |
| ------------------------ | --------------------------------------------------- | ----------------------------- |
| IPC readFile             | `window.electronAPI.skill.readFile` 呼び出し        | SEV-03, USE-02, USE-03 テスト |
| IPC writeFile            | `window.electronAPI.skill.writeFile` 呼び出し       | SEV-05, USE-05, USE-06 テスト |
| IPC getFileTree          | `window.electronAPI.skill.getFileTree` 呼び出し     | UFT-01〜UFT-07 テスト         |
| エラーハンドリング       | IPC エラーを UI エラーメッセージに変換              | USE-04, USE-07 テスト         |
| 状態管理                 | useState による content, hasChanges, isLoading 管理 | USE-01, USE-08, USE-09 テスト |
| ファイルツリー構築       | フラットパスからネスト構造への変換                  | UFT-01〜UFT-07 テスト         |
| 未保存変更警告           | ダイアログ表示と 3 選択肢の動作                     | UCD-01〜UCD-06, SEV-06 テスト |
| キーボードショートカット | Cmd+S / Ctrl+S による保存                           | 統合テスト（Phase 6 で拡充）  |
| アクセシビリティ         | role, aria-label, aria-expanded 属性の付与          | FTN-06, FTP-07, FTP-08 テスト |

## 完了条件

- [ ] FileTreeNode が実装され、7 テスト（FTN-01〜FTN-07）が PASS している
- [ ] FileTreePanel が実装され、9 テスト（FTP-01〜FTP-09）が PASS している
- [ ] EditorStatusBar が実装されている
- [ ] EditorPanel が実装され、8 テスト（EP-01〜EP-08）が PASS している
- [ ] EditorToolBar が実装され、9 テスト（ETB-01〜ETB-09）が PASS している
- [ ] UnsavedChangesDialog が実装され、6 テスト（UCD-01〜UCD-06）が PASS している
- [ ] BackupMenu が実装されている
- [ ] useSkillEditor フックが実装され、10 テスト（USE-01〜USE-10）が PASS している
- [ ] useFileTree フックが実装され、7 テスト（UFT-01〜UFT-07）が PASS している
- [ ] useUnsavedWarning フックが実装されている
- [ ] SkillEditorView メインレイアウトが実装され、8 テスト（SEV-01〜SEV-08）が PASS している
- [ ] 全 64 テストが Green 状態である
- [ ] `pnpm --filter @repo/desktop build` が成功する
- [ ] Apple HIG カラーパレットに準拠している
- [ ] アクセシビリティ属性（role, aria-label, aria-expanded, aria-modal）が付与されている
- [ ] Cmd+S / Ctrl+S ショートカットのリスナーがアンマウント時に解除されている（P5 対策）
- [ ] agentSlice 参照がある場合は個別セレクタを使用している（P31 対策）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## Phase 末端アクション【必須】

1. 全完了条件のチェックボックスを確認する
2. `outputs/phase-5/implementation-summary.md` に実装結果を記録する
3. テスト結果の集計を確認する（全 64 テスト Green）

## 依存関係

| 方向 | Phase / タスク               | 内容                     |
| ---- | ---------------------------- | ------------------------ |
| 入力 | Phase 4（テスト作成）        | 全 64 テストケース       |
| 入力 | TASK-UI-05-SKILL-CENTER-VIEW | SkillCenterView 実装済み |
| 出力 | Phase 6（テスト拡充）        | カバレッジ不足箇所の特定 |

## TDD 検証

### Green 確認手順

1. テスト実行コマンド:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/
   ```
2. 期待結果: 全 64 テストが PASS
3. FAIL が残っている場合: 実装を修正して再実行（テストの修正は行わない）
4. ビルド確認:
   ```bash
   pnpm --filter @repo/desktop build
   ```

## 次の Phase

Phase 6（テスト拡充）へ進む。Phase 5 の実装に対してカバレッジ不足箇所を特定し、追加テストを作成する。
