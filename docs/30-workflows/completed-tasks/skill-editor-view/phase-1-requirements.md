# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 1                             |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 作成日     | 2026-03-01                    |
| 前提 Phase | なし                          |
| 後続 Phase | Phase 2: 設計                 |

## 目的

SkillEditorView の機能要件（FR）・非機能要件（NFR）・受け入れ基準（AC）・スコープを明確化し、Phase 2 以降の設計・実装の基盤となる要件定義書を作成する。

## 背景

TASK-UI-05（SkillCenterView）でインポート済みツールの一覧表示・インポート・削除機能を実装した。SkillEditorView はその詳細パネルからの遷移先として、ツールの SKILL.md およびサブリソース（agents/, references/ 等）を GUI で直接編集する機能を提供する。バックエンドの SkillFileManager + IPC ハンドラ（TASK-9A）は実装済みであり、Renderer 側のエディター UI を新規構築する。

## 実行タスク

- **タスク 1**: 機能要件定義（ファイルツリー表示、エディター機能、保存・バックアップ、未保存変更警告、読み取り専用モード）
- **タスク 2**: 非機能要件定義（レスポンシブ対応、アクセシビリティ WCAG 2.1 AA、パフォーマンス目標）
- **タスク 3**: 受け入れ基準定義（完了条件の Gherkin 形式チェックリスト化）
- **タスク 4**: スコープ定義（対象範囲と除外範囲の明確化）

## 参照資料

| 参照資料              | パス                                                                                                     | 内容                         |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| タスク定義書          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-031a-ui-05a-skill-editor-view.md` | SkillEditorView タスク定義   |
| UI/UX 設計原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                           | Apple HIG 準拠の UI 設計原則 |
| UI コンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                | コンポーネントアーキテクチャ |
| Agent IPC 仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                     | skill:readFile 等の IPC 契約 |
| IPC セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                             | 4 層防御構造                 |
| 状態管理設計          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                             | Zustand/P31 対策             |
| SkillCenterView 仕様  | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-1-requirements.md`                 | 先行タスクの要件定義参照     |
| 抽出マトリクス        | `docs/30-workflows/skill-editor-view/aiworkflow-requirements-extraction-matrix.md`                       | 必要仕様抽出の正本           |

## aiworkflow-requirements 抽出トレーサビリティ

`indexes/resource-map.md` の「UI実装」「API設計」「セキュリティ実装」「テスト実装」を起点に、Phase 1 で必要な仕様を抽出する。

| SubAgent | 関心ごと     | 抽出元カテゴリ   | 参照仕様書                                                                             | このPhaseでの利用 |
| -------- | ------------ | ---------------- | -------------------------------------------------------------------------------------- | ----------------- |
| A        | UI要件       | UI実装           | `ui-ux-components.md`, `ui-ux-design-principles.md`, `arch-ui-components.md`           | FR/NFR 定義       |
| B        | IPC/API要件  | API設計          | `api-ipc-agent.md`, `api-endpoints.md`, `interfaces-agent-sdk-skill.md`                | IPC 連携要件      |
| C        | セキュリティ | セキュリティ実装 | `security-electron-ipc.md`, `security-skill-ipc.md`, `error-handling.md`               | P42/P45 条件      |
| D        | 品質/テスト  | テスト実装       | `quality-requirements.md`, `testing-component-patterns.md`, `testing-accessibility.md` | NFR/AC 定義       |

再現コマンド:

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ui-ux-components" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:readFile" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-electron-ipc" -C 2
```

## 実行手順

### タスク 1: 機能要件定義

1. タスク定義書からコンポーネント構成・Props 定義・インタラクション仕様を抽出する
2. IPC チャネル（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup, skill:getFileTree）の入出力仕様を確認する
3. 読み取り専用モード（`~/.claude/skills/` 配下）と編集可能モード（`~/.aiworkflow/skills/` 配下）の権限分離を定義する
4. 機能要件を FR-1 〜 FR-8 に分類して記述する

### タスク 2: 非機能要件定義

1. レスポンシブ対応の 3 段階ブレークポイント（>= 1024px, 768px〜1023px, < 768px）を定義する
2. WCAG 2.1 AA 準拠のアクセシビリティ要件を定義する
3. パフォーマンス目標（ファイルツリー初期表示 500ms 以下、ファイル読み込み 300ms 以下、保存操作 1s 以下）を定義する
4. NFR-1 〜 NFR-12 に分類して記述する

### タスク 3: 受け入れ基準定義

1. 各機能要件に対応する受け入れ基準を Gherkin 形式（Given/When/Then）で記述する
2. 境界値・異常系・エラーケースの受け入れ基準を追加する
3. AC-1 〜 AC-8 に分類する

### タスク 4: スコープ定義

1. 対象範囲（ファイルツリー表示、コードエディター、保存・バックアップ、未保存変更警告）を明示する
2. 除外範囲（シンタックスハイライトのカスタマイズ、リアルタイム共同編集、Git 統合、ファイルアップロード）を明示する
3. 依存タスク（TASK-UI-00, TASK-UI-01, TASK-UI-02, TASK-UI-05, TASK-9A）との境界を定義する

---

## 機能要件（FR）

### FR-1: ファイルツリー表示

| ID     | 要件                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| FR-1-1 | 指定された skillName のディレクトリ構造を再帰的にツリー表示する                                                                 |
| FR-1-2 | ファイルアイコンは lucide-react を使用し、拡張子に応じたアイコン（.md → FileText, .ts → FileCode, フォルダ → Folder）を表示する |
| FR-1-3 | ディレクトリは展開/折りたたみが可能で、展開状態はセッション中保持する                                                           |
| FR-1-4 | ファイル選択時に右ペインのエディターに該当ファイルの内容を表示する                                                              |
| FR-1-5 | 現在選択中のファイルはハイライト表示（Apple HIG systemBlue 背景）する                                                           |
| FR-1-6 | 未保存変更があるファイルにはドットインジケーター（直径 6px, systemOrange）を表示する                                            |
| FR-1-7 | ファイルツリーパネルの幅は >= 1024px で 240px、768px〜1023px で 200px、< 768px でドロワー表示とする                             |

### FR-2: コードエディター

| ID     | 要件                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| FR-2-1 | textarea ベースのコードエディターでファイル内容を編集可能にする                                             |
| FR-2-2 | 等幅フォント（monospace）を使用し、フォントサイズは 14px とする                                             |
| FR-2-3 | 行番号を左側に表示する                                                                                      |
| FR-2-4 | 読み取り専用モード（isReadOnly=true）の場合、エディターは編集不可とし、ツールバーの保存ボタンを非活性にする |
| FR-2-5 | エディター下部にステータスバーを表示し、現在の行数・文字数・ファイル拡張子を表示する                        |

### FR-3: ファイル保存

| ID     | 要件                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------- |
| FR-3-1 | ツールバーの「保存」ボタンまたは Cmd+S / Ctrl+S ショートカットでファイルを保存する                 |
| FR-3-2 | 保存操作は `skill:writeFile` IPC チャネルを使用し、skillName と relativePath と content を送信する |
| FR-3-3 | 保存成功時はトースト通知（「保存しました」、2 秒間表示）を表示する                                 |
| FR-3-4 | 保存失敗時はエラーダイアログ（エラーコード・メッセージ）を表示する                                 |
| FR-3-5 | 保存後、未保存変更インジケーターを消去する                                                         |

### FR-4: 未保存変更警告

| ID     | 要件                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| FR-4-1 | 未保存変更がある状態で別ファイルを選択する場合、UnsavedChangesDialog を表示する          |
| FR-4-2 | ダイアログは「保存して切り替え」「保存せず切り替え」「キャンセル」の 3 選択肢を提供する  |
| FR-4-3 | 未保存変更がある状態で onClose（エディタークローズ）する場合も同様にダイアログを表示する |
| FR-4-4 | 未保存変更の検出は初期読み込み時の内容と現在の内容を文字列比較（===）で判定する          |

### FR-5: バックアップ機能

| ID     | 要件                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| FR-5-1 | ツールバーに「バックアップ」ドロップダウンメニューを配置する                       |
| FR-5-2 | バックアップ一覧は `skill:listBackups` IPC チャネルで取得し、日時降順で表示する    |
| FR-5-3 | バックアップ項目選択時に `skill:restoreBackup` IPC チャネルで復元を実行する        |
| FR-5-4 | 復元前に確認ダイアログ（「現在の内容が上書きされます。復元しますか？」）を表示する |
| FR-5-5 | 復元成功時はファイルツリーとエディター内容を再読み込みする                         |

### FR-6: ファイル操作

| ID     | 要件                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| FR-6-1 | 読み取り専用モードではファイル作成・削除操作を非表示にする                                                   |
| FR-6-2 | 編集可能モードでファイルツリーのコンテキストメニューから「新規ファイル作成」「ファイル削除」を実行可能にする |
| FR-6-3 | ファイル作成は `skill:createFile` IPC チャネルを使用し、ファイル名入力ダイアログを表示する                   |
| FR-6-4 | ファイル削除は `skill:deleteFile` IPC チャネルを使用し、削除前に確認ダイアログを表示する                     |
| FR-6-5 | ファイル操作後はファイルツリーを再構築する                                                                   |

### FR-7: ツールバー

| ID     | 要件                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| FR-7-1 | エディター上部に EditorToolBar を配置し、「保存」「閉じる」「バックアップ」ボタンを表示する                |
| FR-7-2 | 読み取り専用モードでは「保存」ボタンを `disabled` にし、ツールチップ「読み取り専用ファイルです」を表示する |
| FR-7-3 | 未保存変更がない状態では「保存」ボタンを `disabled` にする                                                 |
| FR-7-4 | 「閉じる」ボタン押下時に未保存変更がある場合は UnsavedChangesDialog を表示する                             |

### FR-8: 閉じる操作

| ID     | 要件                                                                      |
| ------ | ------------------------------------------------------------------------- |
| FR-8-1 | 「閉じる」ボタン押下時に onClose コールバックを呼び出す                   |
| FR-8-2 | 未保存変更がある場合は FR-4 の警告フローを経由してから onClose を呼び出す |

---

## 非機能要件（NFR）

### アクセシビリティ

| ID    | 要件                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------- |
| NFR-1 | ファイルツリーは `role="tree"` + `role="treeitem"` の ARIA 構造を使用する                                |
| NFR-2 | エディターは `role="textbox"` + `aria-label="ファイルエディター"` を設定する                             |
| NFR-3 | Tab キーでファイルツリー → ツールバー → エディターの順にフォーカス移動可能にする                         |
| NFR-4 | ファイルツリー内の移動は ArrowUp/ArrowDown キーで行い、展開/折りたたみは ArrowRight/ArrowLeft で操作する |
| NFR-5 | すべてのインタラクティブ要素にコントラスト比 4.5:1 以上を確保する                                        |

### パフォーマンス

| ID    | 要件                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------- |
| NFR-6 | ファイルツリーの初期表示は 500ms 以下で完了する                                                           |
| NFR-7 | ファイル読み込み（skill:readFile）は 300ms 以下で完了する                                                 |
| NFR-8 | ファイル保存（skill:writeFile）は 1s 以下で完了する                                                       |
| NFR-9 | ファイルツリーのノード数が 200 以上の場合、仮想スクロールまたは遅延読み込みで描画パフォーマンスを維持する |

### テスト

| ID     | 要件                                                                                      |
| ------ | ----------------------------------------------------------------------------------------- |
| NFR-10 | Line Coverage 80% 以上、Branch Coverage 60% 以上、Function Coverage 80% 以上を達成する    |
| NFR-11 | テスト環境は happy-dom を使用し、fireEvent でインタラクションテストを実行する（P39 対策） |
| NFR-12 | テスト実行は `cd apps/desktop && pnpm vitest run` で行う（P40 対策）                      |

### レスポンシブ

| ID     | 要件                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| NFR-13 | >= 1024px: FileTreePanel 左 240px 固定 + EditorPanel flex-1 + ToolBar 上部水平バー      |
| NFR-14 | 768px〜1023px: FileTreePanel 左 200px 固定 + EditorPanel flex-1 + ToolBar 上部水平バー  |
| NFR-15 | < 768px: FileTreePanel ドロワー表示 + EditorPanel フル幅 + ToolBar 上部（アイコンのみ） |

---

## IPC 連携要件

| 操作               | IPC チャネル          | 引数                                                       | 戻り値                       | バリデーション（P42 準拠）                                   |
| ------------------ | --------------------- | ---------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| ファイル読み込み   | `skill:readFile`      | `skillName: string, relativePath: string`                  | `{ content: string }`        | 型チェック → 空文字列 → trim 空文字列                        |
| ファイル書き込み   | `skill:writeFile`     | `skillName: string, relativePath: string, content: string` | `{ success: boolean }`       | 型チェック → 空文字列 → trim 空文字列                        |
| ファイル作成       | `skill:createFile`    | `skillName: string, relativePath: string, content: string` | `{ success: boolean }`       | 型チェック → 空文字列 → trim 空文字列 + パストラバーサル検証 |
| ファイル削除       | `skill:deleteFile`    | `skillName: string, relativePath: string`                  | `{ success: boolean }`       | 型チェック → 空文字列 → trim 空文字列 + パストラバーサル検証 |
| バックアップ一覧   | `skill:listBackups`   | `skillName: string`                                        | `{ backups: BackupEntry[] }` | 型チェック → 空文字列 → trim 空文字列                        |
| バックアップ復元   | `skill:restoreBackup` | `skillName: string, backupPath: string`                    | `{ success: boolean }`       | 型チェック → 空文字列 → trim 空文字列 + パストラバーサル検証 |
| ファイルツリー取得 | `skill:getFileTree`   | `skillName: string`                                        | `{ tree: FileNode[] }`       | 型チェック → 空文字列 → trim 空文字列                        |

> **注記**: `skill:getFileTree` は未実装。UT-UI-05A-GETFILETREE-001 で対応予定。
> 指示書: `docs/30-workflows/skill-editor-view/unassigned-task/UT-UI-05A-GETFILETREE-001.md`

---

## 受け入れ基準（AC）

### AC-1: ファイルツリー表示

```gherkin
Given SkillEditorView が skillName="test-skill" isReadOnly=false で表示されたとき
When ファイルツリーが読み込まれる
Then test-skill のディレクトリ構造が再帰的にツリー表示される
And 各ファイルに拡張子対応のアイコンが表示される
And ディレクトリは展開/折りたたみ可能である
```

### AC-2: ファイル選択と表示

```gherkin
Given ファイルツリーが表示されているとき
When ファイルノードをクリックする
Then 右ペインのエディターに該当ファイルの内容が表示される
And 選択中のファイルがハイライト表示される
And ステータスバーに行数・文字数・ファイル拡張子が表示される
```

### AC-3: ファイル保存

```gherkin
Given エディターでファイル内容を編集したとき
When ツールバーの「保存」ボタンをクリックする
Then skill:writeFile IPC チャネルで保存が実行される
And 保存成功時にトースト通知「保存しました」が 2 秒間表示される
And 未保存変更インジケーターが消去される

Given エディターでファイル内容を編集したとき
When Cmd+S（macOS）/ Ctrl+S（Windows/Linux）を押下する
Then 同様に保存が実行される
```

### AC-4: 未保存変更警告

```gherkin
Given エディターに未保存変更がある状態で
When 別のファイルをファイルツリーから選択する
Then UnsavedChangesDialog が表示される
And 「保存して切り替え」選択時は保存後にファイルが切り替わる
And 「保存せず切り替え」選択時は変更を破棄してファイルが切り替わる
And 「キャンセル」選択時は現在のファイルに留まる
```

### AC-5: 読み取り専用モード

```gherkin
Given SkillEditorView が isReadOnly=true で表示されたとき
Then エディターは編集不可（readonly）状態である
And ツールバーの「保存」ボタンは disabled 状態である
And ファイル作成・削除メニューは非表示である
And ツールチップ「読み取り専用ファイルです」が保存ボタンに表示される
```

### AC-6: バックアップ操作

```gherkin
Given ツールバーの「バックアップ」メニューを開いたとき
When バックアップ一覧が skill:listBackups で取得される
Then バックアップが日時降順で表示される

Given バックアップ項目を選択したとき
When 確認ダイアログで「復元」を選択する
Then skill:restoreBackup でバックアップが復元される
And ファイルツリーとエディター内容が再読み込みされる
```

### AC-7: レスポンシブ対応

```gherkin
Given ウィンドウ幅が 1024px 以上のとき
Then FileTreePanel が左 240px 固定で表示される
And EditorPanel が残り幅を占有する

Given ウィンドウ幅が 768px 未満のとき
Then FileTreePanel がドロワー表示に切り替わる
And EditorPanel がフル幅で表示される
And ToolBar がアイコンのみ表示になる
```

### AC-8: アクセシビリティ

```gherkin
Given SkillEditorView が表示されたとき
Then ファイルツリーは role="tree" + role="treeitem" の ARIA 構造を持つ
And Tab キーでファイルツリー → ツールバー → エディターの順にフォーカス移動可能
And ArrowUp/ArrowDown でツリー内移動、ArrowRight/ArrowLeft で展開/折りたたみが可能
And すべてのテキストのコントラスト比が 4.5:1 以上である
```

---

## 統合テスト連携

| 連携項目           | 検証内容                                                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC 接続           | skill:getFileTree, skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup の IPC 呼び出しが正常に動作する |
| 状態管理           | ファイル選択 → エディター表示 → 編集 → 保存の一連のフローで状態が正しく遷移する                                                                                |
| データフロー       | ファイルツリー選択 → IPC 読み込み → エディター表示 → 編集 → IPC 保存のデータフローが完結する                                                                   |
| エラーハンドリング | IPC 通信エラー時にエラーダイアログが表示され、UI が安全な状態に復帰する                                                                                        |

## 多角的チェック観点

| 観点                  | 確認内容                                                           |
| --------------------- | ------------------------------------------------------------------ |
| UI/UX                 | Apple HIG 準拠のカラーパレット・スペーシング・角丸が適用されている |
| アクセシビリティ      | WCAG 2.1 AA 準拠の ARIA 構造・キーボード操作・コントラスト比       |
| アーキテクチャ        | Atomic Design（atoms/molecules/organisms）の分類が適切             |
| パフォーマンス        | ファイルツリー・エディター・保存の応答時間目標が達成可能な設計     |
| エラーハンドリング    | IPC エラー・ファイル不存在・権限エラーの処理が定義されている       |
| Electron デスクトップ | Main-Renderer 間の IPC 通信が Preload Bridge 経由で設計されている  |

---

## スコープ定義

### 対象範囲

- ファイルツリー表示（再帰的ディレクトリ構造、アイコン、展開/折りたたみ）
- textarea ベースのコードエディター（行番号表示、等幅フォント）
- ファイル保存（Cmd+S ショートカット、IPC 連携）
- 未保存変更検出と警告ダイアログ
- バックアップ一覧表示と復元
- ファイル作成・削除（編集可能モードのみ）
- 読み取り専用モード対応
- レスポンシブデザイン（3 段階ブレークポイント）
- WCAG 2.1 AA 準拠のアクセシビリティ

### 除外範囲

- Monaco Editor 等のリッチエディターライブラリ統合（将来タスクとして検討）
- シンタックスハイライトのカスタマイズ（テーマ選択機能）
- リアルタイム共同編集機能
- Git 統合（差分表示、コミット操作）
- ファイルアップロード・ドラッグ＆ドロップによるファイル追加
- ファイル検索・置換機能
- マルチタブエディター（複数ファイル同時表示）

---

## 成果物

| 成果物                     | パス                                         | 内容                   |
| -------------------------- | -------------------------------------------- | ---------------------- |
| requirements-definition.md | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件書 |
| acceptance-criteria.md     | `outputs/phase-1/acceptance-criteria.md`     | 受け入れ基準書         |
| scope-definition.md        | `outputs/phase-1/scope-definition.md`        | スコープ定義書         |

## 完了条件

- [ ] FR-1 〜 FR-8 の全機能要件が ID 付きで記述されている
- [ ] NFR-1 〜 NFR-15 の全非機能要件が ID 付きで記述されている
- [ ] AC-1 〜 AC-8 の受け入れ基準が Gherkin 形式で記述されている
- [ ] IPC 連携要件が 7 チャネル分定義されている（P42 準拠バリデーション付き）
- [ ] スコープ定義（対象範囲・除外範囲）が明示されている
- [ ] レスポンシブ対応の 3 段階ブレークポイントが定義されている
- [ ] WCAG 2.1 AA アクセシビリティ要件が定義されている
- [ ] パフォーマンス目標が数値付きで定義されている
- [ ] 統合テスト連携項目が定義されている
- [ ] 曖昧語チェック（条件・数値・対象パスが明記されている）を満たしている

## Phase 末端アクション

1. `artifacts.json` の Phase 1 ステータスを `completed` に更新
2. Phase 1 成果物パスを `artifacts` 配列に追加
3. `index.md` の Phase 1 ステータスを `completed` に更新

## 次の Phase

Phase 2: 設計 → [phase-2-design.md](phase-2-design.md)
