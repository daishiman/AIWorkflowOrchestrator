# 受入基準書 - TASK-UI-05A-SKILL-EDITOR-VIEW

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 1                             |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 作成日     | 2026-03-02                    |
| 前提 Phase | なし                          |
| 後続 Phase | Phase 2: 設計                 |

## 概要

本文書は、SkillEditorView の全機能要件（FR-1 〜 FR-8）に対応する受入基準を Gherkin 形式（Given/When/Then）で定義する。各受入基準は、Phase 4（テスト作成）および Phase 11（手動テスト）でのテストケースの基盤となる。

---

## AC-1: ファイルツリー表示

**対応機能要件**: FR-1（FR-1-1 〜 FR-1-7）

### 正常系

```gherkin
Given SkillEditorView が skillName="test-skill" isReadOnly=false で表示されたとき
When ファイルツリーが読み込まれる
Then test-skill のディレクトリ構造が再帰的にツリー表示される
And 各ファイルに拡張子対応のアイコンが表示される
  | 拡張子 | アイコン   |
  | .md    | FileText   |
  | .ts    | FileCode   |
  | フォルダ | Folder   |
And ディレクトリは展開/折りたたみ可能である
And ファイルツリーのルート要素が role="tree" を持つ
And 各ノードが role="treeitem" を持つ
```

### 展開状態の保持

```gherkin
Given ディレクトリ "agents/" を展開した状態で
When 別のファイルを選択して戻る
Then "agents/" ディレクトリは展開状態のまま表示される
```

### 未保存変更インジケーター

```gherkin
Given ファイル "SKILL.md" を編集して未保存変更がある状態で
When ファイルツリーを確認する
Then "SKILL.md" のノードに直径 6px の systemOrange ドットインジケーターが表示される

Given ファイル "SKILL.md" を保存した後
When ファイルツリーを確認する
Then "SKILL.md" のドットインジケーターは消去されている
```

---

## AC-2: ファイル選択と表示

**対応機能要件**: FR-1-4, FR-1-5, FR-2（FR-2-1 〜 FR-2-5）

### 正常系

```gherkin
Given ファイルツリーが表示されているとき
When ファイルノード "SKILL.md" をクリックする
Then 右ペインのエディターに "SKILL.md" のファイル内容が表示される
And 選択中のファイル "SKILL.md" が systemBlue 背景でハイライト表示される
And ステータスバーに行数・文字数・ファイル拡張子 ".md" が表示される
```

### エディター表示仕様

```gherkin
Given エディターにファイル内容が表示されているとき
Then 等幅フォント（monospace）でフォントサイズ 14px が適用されている
And 左側に行番号が表示されている
And エディター下部のステータスバーに以下が表示される:
  | 項目         | 表示例     |
  | 行数         | "42 行"    |
  | 文字数       | "1,234 文字" |
  | ファイル拡張子 | ".md"    |
```

### ファイル読み込みエラー

```gherkin
Given ファイルツリーが表示されているとき
When 存在しないファイルを選択する（skill:readFile が失敗する）
Then エラーダイアログにエラーコードとメッセージが表示される
And エディターは前の状態を維持する
```

---

## AC-3: ファイル保存

**対応機能要件**: FR-3（FR-3-1 〜 FR-3-5）

### ボタンによる保存

```gherkin
Given エディターでファイル内容を編集したとき
When ツールバーの「保存」ボタンをクリックする
Then skill:writeFile IPC チャネルで保存が実行される
And 保存成功時にトースト通知「保存しました」が 2 秒間表示される
And 未保存変更インジケーターが消去される
```

### キーボードショートカットによる保存

```gherkin
Given エディターでファイル内容を編集したとき
When Cmd+S（macOS）/ Ctrl+S（Windows/Linux）を押下する
Then skill:writeFile IPC チャネルで保存が実行される
And 保存成功時にトースト通知「保存しました」が 2 秒間表示される
And 未保存変更インジケーターが消去される
```

### 保存失敗

```gherkin
Given エディターでファイル内容を編集したとき
When 保存操作を実行し skill:writeFile が失敗する
Then エラーダイアログにエラーコードとエラーメッセージが表示される
And 未保存変更インジケーターは消去されない
And エディター内容は編集状態のまま維持される
```

### 保存不要時

```gherkin
Given エディターに未保存変更がない状態で
Then ツールバーの「保存」ボタンは disabled 状態である
And Cmd+S を押下しても保存処理は実行されない
```

---

## AC-4: 未保存変更警告

**対応機能要件**: FR-4（FR-4-1 〜 FR-4-4）

### ファイル切り替え時の警告

```gherkin
Given エディターに未保存変更がある状態で
When 別のファイルをファイルツリーから選択する
Then UnsavedChangesDialog が表示される
And ダイアログに「保存して切り替え」「保存せず切り替え」「キャンセル」の 3 つの選択肢が表示される
```

### 「保存して切り替え」選択

```gherkin
Given UnsavedChangesDialog が表示されているとき
When 「保存して切り替え」を選択する
Then 現在のファイルが保存される
And 選択した別のファイルに切り替わる
And 未保存変更インジケーターが消去される
```

### 「保存せず切り替え」選択

```gherkin
Given UnsavedChangesDialog が表示されているとき
When 「保存せず切り替え」を選択する
Then 変更が破棄される
And 選択した別のファイルに切り替わる
And 未保存変更インジケーターが消去される
```

### 「キャンセル」選択

```gherkin
Given UnsavedChangesDialog が表示されているとき
When 「キャンセル」を選択する
Then ダイアログが閉じる
And 現在のファイルに留まる
And 未保存変更はそのまま維持される
```

### 未保存変更の検出ロジック

```gherkin
Given ファイルを読み込んだ初期状態の内容が "Hello World" であるとき
When エディター内容を "Hello World!" に変更する
Then 未保存変更が検出される（初期内容 !== 現在内容の文字列比較）

Given ファイルを読み込んだ初期状態の内容が "Hello World" であるとき
When エディター内容を変更せずそのまま保持する
Then 未保存変更は検出されない
```

---

## AC-5: 読み取り専用モード

**対応機能要件**: FR-2-4, FR-6-1, FR-7-2

### 正常系

```gherkin
Given SkillEditorView が isReadOnly=true で表示されたとき
Then エディターは編集不可（readonly）状態である
And ツールバーの「保存」ボタンは disabled 状態である
And 保存ボタンにツールチップ「読み取り専用ファイルです」が表示される
And ファイル作成・削除のコンテキストメニューは非表示である
```

### 読み取り専用モードでのキーボードショートカット

```gherkin
Given SkillEditorView が isReadOnly=true で表示されたとき
When Cmd+S / Ctrl+S を押下する
Then 保存処理は実行されない
```

### 編集可能モードとの切り替え

```gherkin
Given SkillEditorView が isReadOnly=false で表示されたとき
Then エディターは編集可能状態である
And ツールバーの「保存」ボタンは有効状態（未保存変更時）である
And ファイル作成・削除のコンテキストメニューが表示される
```

---

## AC-6: バックアップ操作

**対応機能要件**: FR-5（FR-5-1 〜 FR-5-5）

### バックアップ一覧表示

```gherkin
Given ツールバーの「バックアップ」メニューを開いたとき
When バックアップ一覧が skill:listBackups で取得される
Then バックアップが日時降順で表示される
And 各バックアップ項目にタイムスタンプが表示される
```

### バックアップ復元

```gherkin
Given バックアップ項目を選択したとき
Then 確認ダイアログ「現在の内容が上書きされます。復元しますか？」が表示される

Given 確認ダイアログで「復元」を選択したとき
When skill:restoreBackup でバックアップが復元される
Then 復元成功時にファイルツリーが再読み込みされる
And エディター内容がバックアップの内容に更新される
```

### バックアップ復元のキャンセル

```gherkin
Given 確認ダイアログが表示されているとき
When 「キャンセル」を選択する
Then 復元処理は実行されない
And エディター内容は変更されない
```

### バックアップ一覧が空の場合

```gherkin
Given ツールバーの「バックアップ」メニューを開いたとき
When skill:listBackups が空のバックアップ一覧を返す
Then 「バックアップはありません」のメッセージが表示される
```

---

## AC-7: レスポンシブ対応

**対応機能要件**: NFR-13, NFR-14, NFR-15

### デスクトップレイアウト（>= 1024px）

```gherkin
Given ウィンドウ幅が 1024px 以上のとき
Then FileTreePanel が左 240px 固定で表示される
And EditorPanel が残り幅を占有する（flex-1）
And ToolBar が上部水平バーとしてテキスト付きボタンで表示される
```

### タブレットレイアウト（768px 〜 1023px）

```gherkin
Given ウィンドウ幅が 768px 以上 1024px 未満のとき
Then FileTreePanel が左 200px 固定で表示される
And EditorPanel が残り幅を占有する（flex-1）
And ToolBar が上部水平バーとしてテキスト付きボタンで表示される
```

### モバイルレイアウト（< 768px）

```gherkin
Given ウィンドウ幅が 768px 未満のとき
Then FileTreePanel がドロワー表示に切り替わる
And EditorPanel がフル幅で表示される
And ToolBar がアイコンのみ表示になる
```

---

## AC-8: アクセシビリティ

**対応機能要件**: NFR-1 〜 NFR-5

### ARIA 構造

```gherkin
Given SkillEditorView が表示されたとき
Then ファイルツリーのルート要素は role="tree" を持つ
And ファイルツリーの各ノードは role="treeitem" を持つ
And エディターは role="textbox" + aria-label="ファイルエディター" を持つ
```

### キーボードナビゲーション

```gherkin
Given SkillEditorView が表示されたとき
When Tab キーを押下する
Then フォーカスがファイルツリー → ツールバー → エディターの順に移動する

Given ファイルツリーにフォーカスがあるとき
When ArrowDown キーを押下する
Then 次のツリーアイテムにフォーカスが移動する

Given ファイルツリーにフォーカスがあるとき
When ArrowUp キーを押下する
Then 前のツリーアイテムにフォーカスが移動する

Given ファイルツリーの折りたたまれたディレクトリにフォーカスがあるとき
When ArrowRight キーを押下する
Then ディレクトリが展開される

Given ファイルツリーの展開されたディレクトリにフォーカスがあるとき
When ArrowLeft キーを押下する
Then ディレクトリが折りたたまれる
```

### コントラスト比

```gherkin
Given SkillEditorView が表示されたとき
Then すべてのテキスト要素のコントラスト比が 4.5:1 以上である
And すべてのインタラクティブ要素（ボタン、リンク）のコントラスト比が 4.5:1 以上である
```

---

## 受入基準と機能要件の対応表

| 受入基準 | 対応する機能要件         | 対応する非機能要件 |
| -------- | ------------------------ | ------------------ |
| AC-1     | FR-1-1 〜 FR-1-7         | NFR-1, NFR-6       |
| AC-2     | FR-1-4, FR-2-1 〜 FR-2-5 | NFR-7              |
| AC-3     | FR-3-1 〜 FR-3-5         | NFR-8              |
| AC-4     | FR-4-1 〜 FR-4-4         | -                  |
| AC-5     | FR-2-4, FR-6-1, FR-7-2   | -                  |
| AC-6     | FR-5-1 〜 FR-5-5         | -                  |
| AC-7     | -                        | NFR-13 〜 NFR-15   |
| AC-8     | -                        | NFR-1 〜 NFR-5     |
