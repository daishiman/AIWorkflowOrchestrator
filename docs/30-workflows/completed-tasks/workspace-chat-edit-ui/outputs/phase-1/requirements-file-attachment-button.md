# FileAttachmentButton 要件定義

## 1. 概要

ファイル選択ダイアログを開くボタンコンポーネント。ユーザーがファイルシステムからファイルを選択し、workspace-chat-edit機能にコンテキストとして添付できるようにする。

## 2. 機能要件

### FR-001: ファイル選択ダイアログ起動

- ボタンクリックでElectronのファイル選択ダイアログを開く
- `window.electronAPI.fileSelection.openDialog()` を使用
- ダイアログタイトル: 「ファイルを選択」

### FR-002: 複数ファイル選択

- デフォルトで複数ファイル選択を許可
- `multiSelections` オプションを `true` に設定
- `multiple` Props で単一選択/複数選択を切り替え可能

### FR-003: ファイルフィルター

- `accept` Props で許可する拡張子を指定可能
- デフォルトは全ファイル許可 (`['*']`)
- 危険な拡張子（exe, bat等）は自動除外（セキュリティ）

### FR-004: 選択ファイルの添付

- 選択されたファイルパスごとに `useFileContext.attachFile()` を呼び出し
- IPC経由でMain Processにファイル読み込みリクエスト
- chatEditSliceにファイルコンテキストを追加

### FR-005: 最大ファイル数制限

- 最大10件までの添付を許可（`MAX_FILE_CONTEXTS`）
- 上限到達時はボタンを無効化
- `maxFiles` Props でカスタマイズ可能

### FR-006: 無効化状態

- `disabled` Props で明示的に無効化可能
- ローディング中は自動的に無効化
- 最大ファイル数到達時に無効化

### FR-007: コールバック通知

- `onFilesSelected` Props でファイル選択結果を通知
- 選択されたファイルパス配列を引数として渡す

## 3. 非機能要件

### NFR-001: パフォーマンス

- ダイアログ起動は100ms以内
- ファイル添付処理はプログレス表示不要（小規模ファイル想定）

### NFR-002: エラーハンドリング

- ダイアログキャンセル時は何もしない
- ファイル読み込みエラー時はエラーメッセージ表示
- useFileContextの `error` 状態を活用

### NFR-003: セキュリティ

- Preload API経由での安全なダイアログ呼び出し
- パストラバーサル防止はMain Process側で実施

## 4. IPC連携

### 使用するIPC API

| API                                      | 用途                         |
| ---------------------------------------- | ---------------------------- |
| `electronAPI.fileSelection.openDialog()` | ファイル選択ダイアログを開く |
| `useFileContext.attachFile(filePath)`    | ファイルをコンテキストに追加 |

### データフロー

```
[User Click]
  → [FileAttachmentButton]
  → [electronAPI.fileSelection.openDialog()]
  → [IPC: FILE_SELECTION_OPEN_DIALOG]
  → [Main Process: dialog.showOpenDialog()]
  → [Response: filePaths[]]
  → [useFileContext.attachFile(path)]
  → [IPC: chat-edit:read-file]
  → [chatEditSlice.addFileContext()]
```

## 5. Props仕様

| Prop            | 型                          | 必須 | デフォルト | 説明                       |
| --------------- | --------------------------- | ---- | ---------- | -------------------------- |
| onFilesSelected | `(paths: string[]) => void` | -    | -          | ファイル選択後コールバック |
| multiple        | `boolean`                   | -    | `true`     | 複数選択許可               |
| accept          | `string[]`                  | -    | `['*']`    | 許可する拡張子             |
| maxFiles        | `number`                    | -    | `10`       | 最大選択数                 |
| disabled        | `boolean`                   | -    | `false`    | 無効化フラグ               |
| className       | `string`                    | -    | -          | 追加CSSクラス              |

## 6. 状態管理連携

### 使用するZustand状態

- `fileContexts` - 現在の添付ファイル数確認
- `error` - エラー状態表示
- `canAddContext` - 追加可能判定

### 使用するフック

- `useFileContext` - attachFile, canAddContext, error

## 7. 完了条件

- [ ] ボタンクリックでファイル選択ダイアログが開く
- [ ] 複数ファイル選択が可能
- [ ] 選択されたファイルがchatEditSliceに追加される
- [ ] 最大数到達時にボタンが無効化される
- [ ] ダイアログキャンセル時にエラーが発生しない
