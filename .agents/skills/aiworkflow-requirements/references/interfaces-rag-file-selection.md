# FileSelection API

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [interfaces-rag.md](./interfaces-rag.md)

ファイル選択機能のIPC通信インターフェース。ElectronのMain-Renderer間でファイル選択ダイアログ、メタデータ取得、パス検証を提供する。

---

## IPCチャンネル

| チャンネル                           | 方向            | 説明                         |
| ------------------------------------ | --------------- | ---------------------------- |
| FILE_SELECTION_OPEN_DIALOG           | Renderer → Main | ファイル選択ダイアログを開く |
| FILE_SELECTION_GET_METADATA          | Renderer → Main | 単一ファイルのメタデータ取得 |
| FILE_SELECTION_GET_MULTIPLE_METADATA | Renderer → Main | 複数ファイルのメタデータ取得 |
| FILE_SELECTION_VALIDATE_PATH         | Renderer → Main | ファイルパスの存在・種別検証 |

---

## リクエスト/レスポンス型

### OpenFileDialogRequest

| フィールド      | 型                 | 必須 | 説明                                              |
| --------------- | ------------------ | ---- | ------------------------------------------------- |
| filterCategory  | FileFilterCategory | 任意 | フィルターカテゴリ（all/office/text/media/image） |
| multiSelections | boolean            | 任意 | 複数選択を許可するか（デフォルト: true）          |

### GetFileMetadataRequest

| フィールド | 型     | 必須 | 説明                               |
| ---------- | ------ | ---- | ---------------------------------- |
| filePath   | string | 必須 | ファイルの絶対パス（1000文字以内） |

### GetMultipleFileMetadataRequest

| フィールド | 型       | 必須 | 説明                            |
| ---------- | -------- | ---- | ------------------------------- |
| filePaths  | string[] | 必須 | ファイルパスの配列（最大100件） |

### ValidateFilePathRequest

| フィールド | 型     | 必須 | 説明         |
| ---------- | ------ | ---- | ------------ |
| filePath   | string | 必須 | 検証対象パス |

---

## セキュリティ機能

| 機能                         | 説明                                               |
| ---------------------------- | -------------------------------------------------- |
| パストラバーサル防止         | `..` を含むパスを拒否                              |
| 送信元検証（SEC-M1）         | リクエストがフォーカス中のウィンドウから来たか検証 |
| 危険拡張子フィルタ（SEC-M2） | exe, bat, cmd等の危険な拡張子をダイアログから除外  |
| レート制限                   | 同一送信者からのリクエストを1秒間に10回まで制限    |

---

## UIコンポーネント

**FileSelector コンポーネント** (`apps/desktop/src/renderer/components/organisms/FileSelector/`):

| data-testid         | 要素             | 説明                       |
| ------------------- | ---------------- | -------------------------- |
| file-selector       | コンテナ         | FileSelectorのルート要素   |
| file-drop-zone      | ドロップゾーン   | ドラッグ&ドロップエリア    |
| file-select-button  | ボタン           | ファイル選択ダイアログ起動 |
| file-filter-select  | セレクトボックス | フィルターカテゴリ選択     |
| error-message       | アラート         | エラーメッセージ表示       |
| selected-files-list | リスト           | 選択済みファイル一覧       |
| selected-file-item  | リストアイテム   | 各ファイルエントリ         |
| file-delete-button  | ボタン           | ファイル削除               |
| file-count          | テキスト         | 選択ファイル数表示         |
| loading-spinner     | スピナー         | 読み込み中表示             |

---

## 実装場所

- IPC ハンドラー: `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`
- Preload API: `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/types.ts`
- Zodスキーマ: `packages/shared/schemas/file-selection.schema.ts`
- UIコンポーネント: `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.tsx`

---

## 関連ドキュメント

- [RAG・ファイル選択インターフェース](./interfaces-rag.md)
- [ファイルセレクターUI設計](./ui-ux-file-selector.md)
- [セキュリティガイドライン](./security-guidelines.md)
