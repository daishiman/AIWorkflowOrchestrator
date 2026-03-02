# Phase 4: テスト作成（TDD Red）— SkillEditorView

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW                        |
| Phase      | 4（テスト作成）                                      |
| 前提 Phase | Phase 3（設計レビュー）                              |
| 後続 Phase | Phase 5（実装）                                      |
| ステータス | 未着手                                               |
| 作成日     | 2026-03-01                                           |
| 機能名     | SkillEditorView（スキルエディタービュー）            |
| 依存タスク | TASK-UI-05-SKILL-CENTER-VIEW（SkillCenterView 実装） |

## 目的

SkillEditorView の全コンポーネント（6 個）および全カスタムフック（2 個）に対するテストを先に作成し、TDD の Red 状態を確立する。テストは happy-dom 環境で fireEvent を使用し、IPC 呼び出しはモック化する。全 64 テストケースが**失敗状態（Red）**であることを確認する。

## 背景

SkillEditorView はインポート済みスキルの SKILL.md およびサブリソース（agents/, references/ 等）を GUI で編集するためのエディタービューである。左ペインにファイルツリー、右ペインにコードエディターを配置し、ファイル操作とバックアップ機能を統合する。TDD サイクルの最初のステップとして、実装前にテストを作成することで、仕様を実行可能な形で定義する。

## 実行タスク

### タスク 1: テストデータファクトリ・モック設計

**目的**: 全テストで共有するテストデータファクトリと IPC モックを設計・作成する。

**実行手順**:

1. テストデータファクトリを作成する:
   - `FileNode` 型のファクトリ関数 `createFileNode(overrides?)` を定義する
   - ネストされたディレクトリ構造のサンプルデータ `sampleFileTree` を定義する（3 階層、ファイル 5 個、ディレクトリ 3 個）
   - サンプルファイルコンテンツ `sampleContent`（Markdown テキスト、50 行）を定義する
2. IPC モックを設計する:
   - `window.electronAPI.skill.readFile` → `vi.fn().mockResolvedValue(sampleContent)` で初期化
   - `window.electronAPI.skill.writeFile` → `vi.fn().mockResolvedValue({ success: true })` で初期化
   - `window.electronAPI.skill.createFile` → `vi.fn().mockResolvedValue({ success: true })` で初期化
   - `window.electronAPI.skill.deleteFile` → `vi.fn().mockResolvedValue({ success: true })` で初期化
   - `window.electronAPI.skill.listBackups` → `vi.fn().mockResolvedValue([])` で初期化
   - `window.electronAPI.skill.restoreBackup` → `vi.fn().mockResolvedValue({ success: true })` で初期化
   - `window.electronAPI.skill.getFileTree` → `vi.fn().mockResolvedValue({ tree: sampleFileTree })` で初期化
3. 全テストファイルの `beforeEach` で IPC モックをリセットする（`vi.clearAllMocks()`）
4. テストデータファクトリを `__tests__/helpers/test-factories.ts` に配置する

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/helpers/test-factories.ts`

### タスク 2: FileTreeNode テスト作成（7 ケース）

**目的**: 再帰ツリーノードコンポーネントの Props 反映、アイコン表示、アクセシビリティ属性を検証するテストを作成する。

**実行手順**:

1. テストファイル `FileTreeNode.test.tsx` を作成する
2. 以下の 7 テストケースを記述する:

| ケース ID | テスト名                                           | 検証内容                                                                       |
| --------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| FTN-01    | ファイルノードのファイル名を表示する               | `name="SKILL.md"` の場合、テキスト `SKILL.md` が DOM に存在する                |
| FTN-02    | ファイルノードにファイルアイコンを表示する         | `type="file"` の場合、`data-testid="file-icon"` が存在する                     |
| FTN-03    | ディレクトリノードにフォルダアイコンを表示する     | `type="directory"` の場合、`data-testid="folder-icon"` が存在する              |
| FTN-04    | ノードクリック時に onSelect コールバックを呼び出す | `fireEvent.click(node)` 後、`onSelect` が `path` 引数で 1 回呼び出される       |
| FTN-05    | 選択状態のノードにハイライトクラスを適用する       | `isSelected=true` の場合、ノード要素に選択ハイライト用の背景クラスが付与される |
| FTN-06    | ファイルノードに `role="treeitem"` を付与する      | `role="treeitem"` 属性が存在する                                               |
| FTN-07    | ネストレベルに応じたインデントを適用する           | `depth=2` の場合、`paddingLeft` が `depth * 16px`（= `32px`）に設定される      |

3. 全テストで `@testing-library/react` の `render` と `fireEvent` を使用する（`userEvent` は使用禁止: P39 対策）
4. `beforeEach` でモックをリセットする（P9 対策）

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/FileTreeNode.test.tsx`（7 ケース）

### タスク 3: FileTreePanel テスト作成（9 ケース）

**目的**: ファイルツリーパネルのツリー構築、選択、展開/折りたたみ、未保存マーカー表示を検証するテストを作成する。

**実行手順**:

1. テストファイル `FileTreePanel.test.tsx` を作成する
2. 以下の 9 テストケースを記述する:

| ケース ID | テスト名                                                  | 検証内容                                                                                      |
| --------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| FTP-01    | 空のファイルツリーで「ファイルがありません」を表示する    | `fileTree=[]` の場合、「ファイルがありません」テキストが表示される                            |
| FTP-02    | ファイルツリーの全ノードを再帰的にレンダリングする        | 3 階層のツリーデータで、全 8 ノード（ファイル 5 + ディレクトリ 3）が DOM に存在する           |
| FTP-03    | ファイルノードクリック時に onSelectFile を呼び出す        | ファイルノードの `fireEvent.click` 後、`onSelectFile` が `path` 引数で 1 回呼び出される       |
| FTP-04    | ディレクトリノードクリック時に展開/折りたたみをトグルする | ディレクトリの `fireEvent.click` 後、子ノードの表示/非表示が切り替わる                        |
| FTP-05    | 選択中ファイルにハイライトを適用する                      | `selectedFile="agents/agent-1.md"` の場合、該当ノードにハイライトクラスが適用される           |
| FTP-06    | 未保存ファイルに未保存マーカーを表示する                  | `unsavedFiles=new Set(["SKILL.md"])` の場合、該当ノードに未保存マーカー（ドット）が表示される |
| FTP-07    | パネルに `role="tree"` を付与する                         | ルート要素に `role="tree"` 属性が存在する                                                     |
| FTP-08    | ディレクトリノードに `aria-expanded` を付与する           | 展開時は `aria-expanded="true"`、折りたたみ時は `aria-expanded="false"` が設定される          |
| FTP-09    | パネル幅が 240px で固定される                             | パネルのルート要素に `width: 240px` または対応する Tailwind クラスが適用される                |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/FileTreePanel.test.tsx`（9 ケース）

### タスク 4: EditorPanel テスト作成（8 ケース）

**目的**: コードエディターパネルのコンテンツ表示、編集操作、読み取り専用モード、ステータスバー表示を検証するテストを作成する。

**実行手順**:

1. テストファイル `EditorPanel.test.tsx` を作成する
2. 以下の 8 テストケースを記述する:

| ケース ID | テスト名                                               | 検証内容                                                                                    |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| EP-01     | コンテンツを textarea に表示する                       | `content="# Hello"` の場合、textarea の value が `# Hello` である                           |
| EP-02     | 編集入力時に onChange コールバックを呼び出す           | `fireEvent.change(textarea, { target: { value: "new" } })` 後、`onChange("new")` が呼ばれる |
| EP-03     | 読み取り専用モードで textarea を無効化する             | `isReadOnly=true` の場合、textarea に `readOnly` 属性が設定される                           |
| EP-04     | ローディング中にスピナーを表示する                     | `isLoading=true` の場合、`data-testid="editor-loading"` が表示される                        |
| EP-05     | ステータスバーに行数を表示する                         | 50 行のコンテンツで、ステータスバーに「50 行」が表示される                                  |
| EP-06     | ステータスバーに文字数を表示する                       | 500 文字のコンテンツで、ステータスバーに「500 文字」が表示される                            |
| EP-07     | ステータスバーに言語名を表示する                       | `language="markdown"` の場合、ステータスバーに「Markdown」が表示される                      |
| EP-08     | 空コンテンツで「ファイルを選択してください」を表示する | `content=""` かつ未選択状態の場合、プレースホルダーテキストが表示される                     |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/EditorPanel.test.tsx`（8 ケース）

### タスク 5: EditorToolBar テスト作成（9 ケース）

**目的**: ツールバーの保存ボタン、キーボードショートカット、バックアップ操作の動作を検証するテストを作成する。

**実行手順**:

1. テストファイル `EditorToolBar.test.tsx` を作成する
2. 以下の 9 テストケースを記述する:

| ケース ID | テスト名                                                        | 検証内容                                                                      |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| ETB-01    | 選択中のファイル名をツールバーに表示する                        | `selectedFile="SKILL.md"` の場合、ツールバーに「SKILL.md」が表示される        |
| ETB-02    | 変更がある場合に保存ボタンを有効化する                          | `hasChanges=true` の場合、保存ボタンが `disabled=false` である                |
| ETB-03    | 変更がない場合に保存ボタンを無効化する                          | `hasChanges=false` の場合、保存ボタンが `disabled=true` である                |
| ETB-04    | 読み取り専用モードで保存ボタンを無効化する                      | `isReadOnly=true` の場合、保存ボタンが `disabled=true` である                 |
| ETB-05    | 保存ボタンクリック時に onSave を呼び出す                        | `fireEvent.click(saveButton)` 後、`onSave` が 1 回呼び出される                |
| ETB-06    | 保存中（isSaving=true）に保存ボタンを無効化しスピナーを表示する | `isSaving=true` の場合、保存ボタンが `disabled=true` かつスピナーが表示される |
| ETB-07    | 閉じるボタンクリック時に onClose を呼び出す                     | `fireEvent.click(closeButton)` 後、`onClose` が 1 回呼び出される              |
| ETB-08    | バックアップボタンクリック時に onOpenBackups を呼び出す         | `fireEvent.click(backupButton)` 後、`onOpenBackups` が 1 回呼び出される       |
| ETB-09    | 保存ボタンに `aria-label="保存"` を付与する                     | 保存ボタンに `aria-label="保存"` 属性が存在する                               |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/EditorToolBar.test.tsx`（9 ケース）

### タスク 6: UnsavedChangesDialog テスト作成（6 ケース）

**目的**: 未保存変更警告ダイアログの 3 選択肢動作とダイアログ表示/非表示を検証するテストを作成する。

**実行手順**:

1. テストファイル `UnsavedChangesDialog.test.tsx` を作成する
2. 以下の 6 テストケースを記述する:

| ケース ID | テスト名                                                            | 検証内容                                                         |
| --------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| UCD-01    | isOpen=true の場合にダイアログを表示する                            | `isOpen=true` の場合、ダイアログ要素が DOM に存在する            |
| UCD-02    | isOpen=false の場合にダイアログを非表示にする                       | `isOpen=false` の場合、ダイアログ要素が DOM に存在しない         |
| UCD-03    | 「保存して続行」ボタンクリック時に onSaveAndContinue を呼び出す     | `fireEvent.click` 後、`onSaveAndContinue` が 1 回呼び出される    |
| UCD-04    | 「保存せず続行」ボタンクリック時に onDiscardAndContinue を呼び出す  | `fireEvent.click` 後、`onDiscardAndContinue` が 1 回呼び出される |
| UCD-05    | 「キャンセル」ボタンクリック時に onCancel を呼び出す                | `fireEvent.click` 後、`onCancel` が 1 回呼び出される             |
| UCD-06    | ダイアログに `role="alertdialog"` と `aria-modal="true"` を付与する | `role="alertdialog"` と `aria-modal="true"` が設定される         |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/UnsavedChangesDialog.test.tsx`（6 ケース）

### タスク 7: useSkillEditor フックテスト作成（10 ケース）

**目的**: ファイル読み書き、保存ロジック、IPC 呼び出しを検証するフックテストを作成する。

**実行手順**:

1. テストファイル `useSkillEditor.test.ts` を作成する
2. `@testing-library/react` の `renderHook` と `act` を使用する
3. 以下の 10 テストケースを記述する:

| ケース ID | テスト名                                                 | 検証内容                                                                                                      |
| --------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| USE-01    | 初期状態で content が空文字列、isLoading が false である | `renderHook` 直後、`result.current.content === ""` かつ `result.current.isLoading === false`                  |
| USE-02    | loadFile 呼び出し時に skill:readFile IPC を呼び出す      | `act(() => result.current.loadFile("SKILL.md"))` 後、`readFile` モックが `(skillName, "SKILL.md")` で呼ばれる |
| USE-03    | loadFile 成功時に content にファイル内容を設定する       | `readFile` モック成功後、`result.current.content` がモック戻り値と一致する                                    |
| USE-04    | loadFile 失敗時に error にエラーメッセージを設定する     | `readFile` モックが reject 後、`result.current.error` が非 null である                                        |
| USE-05    | saveFile 呼び出し時に skill:writeFile IPC を呼び出す     | `act(() => result.current.saveFile())` 後、`writeFile` モックが `(skillName, path, content)` で呼ばれる       |
| USE-06    | saveFile 成功時に hasChanges を false にリセットする     | `writeFile` モック成功後、`result.current.hasChanges === false`                                               |
| USE-07    | saveFile 失敗時に error にエラーメッセージを設定する     | `writeFile` モックが reject 後、`result.current.error` が非 null である                                       |
| USE-08    | updateContent 呼び出し時に hasChanges を true に設定する | `act(() => result.current.updateContent("new"))` 後、`result.current.hasChanges === true`                     |
| USE-09    | loadFile 中は isLoading が true である                   | `readFile` モックが pending 中、`result.current.isLoading === true`                                           |
| USE-10    | isReadOnly=true の場合に saveFile が実行されない         | `isReadOnly=true` で `renderHook` 後、`saveFile()` を呼んでも `writeFile` モックが呼ばれない                  |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useSkillEditor.test.ts`（10 ケース）

### タスク 8: useFileTree フックテスト作成（7 ケース）

**目的**: ファイルツリー構築ロジックと選択管理を検証するフックテストを作成する。

**実行手順**:

1. テストファイル `useFileTree.test.ts` を作成する
2. `@testing-library/react` の `renderHook` と `act` を使用する
3. 以下の 7 テストケースを記述する:

| ケース ID | テスト名                                                | 検証内容                                                                                                  |
| --------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| UFT-01    | refreshTree 実行時に `skill:getFileTree` を呼び出す     | `act(async () => await result.current.refreshTree())` 後、`getFileTree` モックが `(skillName)` で呼ばれる |
| UFT-02    | 空ツリー応答時に nodes が空配列になる                   | `getFileTree` が `{ tree: [] }` を返す場合、`result.current.nodes` が空配列になる                         |
| UFT-03    | ネストされた FileNode 応答を nodes に反映する           | `getFileTree` が nested `FileNode[]` を返す場合、`result.current.nodes` が同構造になる                    |
| UFT-04    | selectFile 呼び出し時に selectedPath を更新する         | `act(() => result.current.selectFile("SKILL.md"))` 後、`result.current.selectedPath === "SKILL.md"`       |
| UFT-05    | toggleExpand でディレクトリの展開状態をトグルする       | `act(() => result.current.toggleExpand("agents/"))` を 2 回呼ぶと、展開 → 折りたたみに切り替わる          |
| UFT-06    | refreshTree 失敗時に error を設定する                   | `getFileTree` モックが reject 後、`result.current.error` が非 null である                                 |
| UFT-07    | createFile/deleteFile 成功後に refreshTree を再実行する | `createFile` / `deleteFile` 完了後に `getFileTree` モックが再度呼び出される                               |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useFileTree.test.ts`（7 ケース）

### タスク 9: SkillEditorView 統合テスト作成（8 ケース）

**目的**: SkillEditorView 全体のファイル選択→編集→保存フローを統合的に検証するテストを作成する。

**実行手順**:

1. テストファイル `SkillEditorView.test.tsx` を作成する
2. 以下の 8 テストケースを記述する:

| ケース ID | テスト名                                                     | 検証内容                                                                                         |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| SEV-01    | 初期レンダリングでファイルツリーとエディターパネルを表示する | `FileTreePanel` と `EditorPanel` の両方が DOM に存在する                                         |
| SEV-02    | skillName を FileTreePanel に渡す                            | `skillName="my-skill"` で render 後、FileTreePanel に `skillName` が伝達される                   |
| SEV-03    | ファイルノードクリック時にエディターにコンテンツを表示する   | ファイルノードの `fireEvent.click` 後、readFile IPC が呼ばれ、エディターにコンテンツが表示される |
| SEV-04    | エディター編集後に保存ボタンが有効化される                   | textarea の `fireEvent.change` 後、保存ボタンの `disabled` が `false` になる                     |
| SEV-05    | 保存ボタンクリック時に writeFile IPC が呼び出される          | 保存ボタンの `fireEvent.click` 後、`writeFile` モックが正しい引数で呼ばれる                      |
| SEV-06    | 未保存変更がある状態で別ファイル選択時にダイアログを表示する | 変更後に別ファイルの `fireEvent.click` で `UnsavedChangesDialog` が表示される                    |
| SEV-07    | isReadOnly=true の場合に編集操作が無効化される               | `isReadOnly=true` で render 後、textarea が `readOnly`、保存ボタンが `disabled` である           |
| SEV-08    | onClose コールバックが閉じるボタンクリック時に呼び出される   | 閉じるボタンの `fireEvent.click` 後、`onClose` が 1 回呼び出される                               |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.test.tsx`（8 ケース）

### タスク 10: TDD Red 状態確認

**目的**: Phase 4 で作成した全 64 テストケースが失敗状態（Red）であることを確認する。

**実行手順**:

1. 以下のコマンドでテストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/
   ```
2. 全 64 テストが FAIL であることを確認する（実装が存在しないため）
3. テスト実行エラー（import エラー等）がある場合は、テストファイル側のモックやスタブを修正して「テスト実行は成功するがアサーションが失敗する」状態にする
4. 結果を `outputs/phase-4/test-red-confirmation.md` に記録する

**期待される成果物**:

- `outputs/phase-4/test-red-confirmation.md`（Red 状態確認レポート）

## テスト設計方針

### 環境・ツール

| 項目         | 選定内容                   | 理由                                        |
| ------------ | -------------------------- | ------------------------------------------- |
| テスト環境   | happy-dom                  | Vitest 標準、軽量 DOM シミュレーション      |
| イベント発火 | `fireEvent`                | P39 対策: happy-dom で `userEvent` は非互換 |
| フックテスト | `renderHook` + `act`       | カスタムフックの状態変化をテスト            |
| モック       | `vi.fn()` / `vi.mock()`    | IPC 呼び出しのモック化                      |
| テスト実行   | `cd apps/desktop` から実行 | P40 対策: vitest.config.ts の正しい読み込み |

### Pitfall 対策

| Pitfall ID | 対策内容                                                                |
| ---------- | ----------------------------------------------------------------------- |
| P9         | `beforeEach` で全モックをリセット（`vi.clearAllMocks()`）               |
| P39        | `fireEvent` のみ使用、`userEvent.setup()` は使用禁止                    |
| P40        | テスト実行は `cd apps/desktop && pnpm vitest run ...` で実行            |
| P47        | スタイルテストは variantStyles Record 定数を export/import して検証する |

## 参照資料

| 参照資料              | パス                                                                         | 内容                         |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義      | `docs/30-workflows/skill-editor-view/phase-1-requirements.md`                | 機能要件・受入基準           |
| Phase 2 設計          | `docs/30-workflows/skill-editor-view/phase-2-design.md`                      | コンポーネント・フック設計   |
| Phase 3 設計レビュー  | `docs/30-workflows/skill-editor-view/phase-3-design-review.md`               | レビュー結果・修正事項       |
| UI コンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | エディター統合パターン       |
| 状態管理設計          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand / P31 対策           |
| Agent IPC 仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         | skill:readFile 等の IPC 契約 |
| IPC セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 4 層防御構造                 |

## 成果物

| 成果物                      | パス                                                                                      | 説明                 |
| --------------------------- | ----------------------------------------------------------------------------------------- | -------------------- |
| テストデータファクトリ      | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/helpers/test-factories.ts`     | 共通テストデータ     |
| FileTreeNode テスト         | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/FileTreeNode.test.tsx`         | 7 ケース             |
| FileTreePanel テスト        | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/FileTreePanel.test.tsx`        | 9 ケース             |
| EditorPanel テスト          | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/EditorPanel.test.tsx`          | 8 ケース             |
| EditorToolBar テスト        | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/EditorToolBar.test.tsx`        | 9 ケース             |
| UnsavedChangesDialog テスト | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/UnsavedChangesDialog.test.tsx` | 6 ケース             |
| useSkillEditor テスト       | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useSkillEditor.test.ts`        | 10 ケース            |
| useFileTree テスト          | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useFileTree.test.ts`           | 7 ケース             |
| SkillEditorView テスト      | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.test.tsx`      | 8 ケース             |
| Red 状態確認レポート        | `docs/30-workflows/skill-editor-view/outputs/phase-4/test-red-confirmation.md`            | 全 64 テスト失敗確認 |

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                  | テストファイル             | 適用判断                             |
| ------------------ | ----------------------------------------- | -------------------------- | ------------------------------------ |
| IPC 接続           | readFile / writeFile チャンネルモック疎通 | `SkillEditorView.test.tsx` | 適用                                 |
| データフロー       | ファイル選択→読込→編集→保存の一連フロー   | `SkillEditorView.test.tsx` | 適用                                 |
| エラーハンドリング | IPC エラー時の UI 表示                    | `useSkillEditor.test.ts`   | 適用                                 |
| 認証連携           | 認証トークン検証                          | —                          | 対象外（本タスクは認証不要）         |
| 状態同期           | Zustand Store 同期検証                    | —                          | 対象外（useState / useReducer のみ） |
| ユーティリティ     | ファイルツリー構築 / 選択管理の入出力検証 | `useFileTree.test.ts`      | 適用                                 |
| アクセシビリティ   | ARIA 属性 / role 属性の付与確認           | 各コンポーネントテスト     | 適用                                 |

## 完了条件

- [ ] テストデータファクトリ（FileNode / IPC モック）が作成されている
- [ ] FileTreeNode テスト（7 ケース）が作成されている
- [ ] FileTreePanel テスト（9 ケース）が作成されている
- [ ] EditorPanel テスト（8 ケース）が作成されている
- [ ] EditorToolBar テスト（9 ケース）が作成されている
- [ ] UnsavedChangesDialog テスト（6 ケース）が作成されている
- [ ] useSkillEditor フックテスト（10 ケース）が作成されている
- [ ] useFileTree フックテスト（7 ケース）が作成されている
- [ ] SkillEditorView 統合テスト（8 ケース）が作成されている
- [ ] 合計 64 テストケースが全て作成されている
- [ ] IPC モック（readFile / writeFile / createFile / deleteFile / listBackups / restoreBackup / getFileTree）が設定されている
- [ ] happy-dom 環境で fireEvent を使用している（userEvent 不使用: P39 対策）
- [ ] テスト実行は `cd apps/desktop` から実行している（P40 対策）
- [ ] `beforeEach` で全モックをリセットしている（P9 対策）
- [ ] すべてのテストが失敗状態（Red）であることを確認済み
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## Phase 末端アクション【必須】

1. 全完了条件のチェックボックスを確認する
2. `outputs/phase-4/test-red-confirmation.md` に Red 状態確認結果を記録する
3. テストケース数の集計を確認する（合計 64 ケース）

## 依存関係

| 方向 | Phase / タスク               | 内容                           |
| ---- | ---------------------------- | ------------------------------ |
| 入力 | Phase 3（設計レビュー）      | コンポーネント・フック設計確定 |
| 入力 | TASK-UI-05-SKILL-CENTER-VIEW | SkillCenterView 実装済み       |
| 出力 | Phase 5（実装）              | テスト仕様をもとに実装開始     |

## TDD 検証

### Red 確認手順

1. テスト実行コマンド:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/
   ```
2. 期待結果: 全 64 テストが FAIL
3. FAIL 理由: 実装ファイルが存在しないため import エラーまたはアサーション失敗
4. テスト実行自体がクラッシュする場合: モジュールスタブを追加して「テスト実行は成功するがアサーションが失敗する」状態にする

## 次の Phase

Phase 5（実装 — TDD Green）へ進む。Phase 4 で作成した全 64 テストを Green にするための実装を行う。
