# 履歴UIコンポーネント仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [ui-ux-history-panel.md](./ui-ux-history-panel.md)

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|------------|----------|
| 2026-01-26 | v1.1.0 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |

---

## ファイル構成

### コンポーネント

| ファイル | パス | 責務 |
|----------|------|------|
| VersionHistory.tsx | apps/desktop/src/renderer/components/history/ | バージョン履歴一覧の表示 |
| VersionDetail.tsx | apps/desktop/src/renderer/components/history/ | 選択バージョンの詳細表示 |
| ConversionLogs.tsx | apps/desktop/src/renderer/components/history/ | 変換ログの一覧・フィルタ表示 |
| RestoreDialog.tsx | apps/desktop/src/renderer/components/history/ | バージョン復元の確認ダイアログ |
| types.ts | apps/desktop/src/renderer/components/history/ | 型定義 |

### カスタムフック

| ファイル | パス | 責務 |
|----------|------|------|
| useVersionHistory.ts | apps/desktop/src/renderer/hooks/ | バージョン履歴の取得・ページネーション |
| useVersionDetail.ts | apps/desktop/src/renderer/hooks/ | バージョン詳細の取得 |
| useConversionLogs.ts | apps/desktop/src/renderer/hooks/ | 変換ログの取得・フィルタ |
| useRestore.ts | apps/desktop/src/renderer/hooks/ | バージョン復元処理 |

---

## コンポーネント構成

### コンポーネント一覧

| コンポーネント | 種別     | 責務                           |
| -------------- | -------- | ------------------------------ |
| VersionHistory | Organism | バージョン履歴一覧の表示       |
| VersionDetail  | Organism | 選択バージョンの詳細表示       |
| ConversionLogs | Organism | 変換ログの一覧・フィルタ表示   |
| RestoreDialog  | Organism | バージョン復元の確認ダイアログ |

### コンポーネント階層

#### VersionHistory

| レベル | コンポーネント | 種別 | 説明 |
|--------|----------------|------|------|
| 1 | VersionHistory | Organism | ルートコンポーネント |
| 2 | VersionHistoryItem | Molecule | 各バージョンの行表示 |
| 3 | Badge | Atom | 「現在」表示用バッジ |
| 3 | Button | Atom | 詳細表示・復元ボタン |
| 2 | LoadingSkeleton | Molecule | 読み込み中スケルトン |
| 2 | ErrorDisplay | Molecule | エラー表示 |
| 2 | EmptyState | Molecule | データなし表示 |
| 2 | LoadMoreButton | Molecule | 追加読み込みボタン |

#### VersionDetail

| レベル | コンポーネント | 種別 | 説明 |
|--------|----------------|------|------|
| 1 | VersionDetail | Organism | ルートコンポーネント |
| 2 | RestoreButton | Atom | 復元実行ボタン |
| 2 | ConversionLogs | Organism | ログ表示領域 |
| 3 | LogLevelFilter | Molecule | ログレベル絞り込み |
| 4 | Select | Atom | ドロップダウン選択 |
| 3 | LogEntry | Molecule | 各ログエントリ表示 |
| 4 | Badge | Atom | ログレベル表示用バッジ |
| 3 | LoadMoreButton | Molecule | 追加読み込みボタン |

#### RestoreDialog

| レベル | コンポーネント | 種別 | 説明 |
|--------|----------------|------|------|
| 1 | RestoreDialog | Organism | ルートコンポーネント |
| 2 | DialogHeader | Molecule | ダイアログタイトル |
| 2 | VersionInfo | Molecule | 復元対象バージョン情報 |
| 2 | WarningText | Molecule | 警告メッセージ |
| 2 | ActionButtons | Molecule | 確認/キャンセルボタン群 |

---

## Props定義

### VersionHistoryProps

| プロパティ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| fileId | string | 必須 | 対象ファイルのID |
| onVersionSelect | (item: VersionHistoryItem) => void | 任意 | アイテム選択時のコールバック関数 |
| onRestore | (item: VersionHistoryItem) => void | 任意 | 復元ボタン押下時のコールバック関数 |

### VersionDetailProps

| プロパティ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| conversionId | string | 必須 | 変換ID |
| onRestore | () => void | 任意 | 復元ボタン押下時のコールバック関数 |
| onBack | () => void | 任意 | 戻るボタン押下時のコールバック関数 |

### ConversionLogsProps

| プロパティ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| conversionId | string | 必須 | 変換ID |
| onFilterChange | (level: LogLevel または undefined) => void | 任意 | ログレベルフィルタ変更時のコールバック関数 |

### RestoreDialogProps

| プロパティ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| isOpen | boolean | 必須 | ダイアログの表示フラグ |
| version | VersionHistoryItem | 必須 | 復元対象のバージョン情報 |
| isLoading | boolean | 任意 | 復元処理中フラグ |
| error | Error または null | 任意 | エラー情報 |
| onConfirm | () => void | 必須 | 確認ボタン押下時のコールバック関数 |
| onCancel | () => void | 必須 | キャンセルボタン押下時のコールバック関数 |

---

## カスタムフック

### フック一覧

| フック名          | 責務                     | 状態管理                           |
| ----------------- | ------------------------ | ---------------------------------- |
| useVersionHistory | バージョン履歴の取得     | history, isLoading, error, hasMore |
| useVersionDetail  | バージョン詳細の取得     | version, logs, isLoading, error    |
| useConversionLogs | 変換ログの取得・フィルタ | logs, isLoading, error, hasMore    |
| useRestore        | バージョン復元処理       | isLoading, error, isSuccess        |

### useVersionHistory

**引数**: fileId (string) - 対象ファイルのID

**戻り値**:

| プロパティ | 型 | 説明 |
|------------|-----|------|
| history | VersionHistoryItem[] | 履歴データの配列 |
| isLoading | boolean | ローディング中フラグ |
| error | Error または null | エラー情報 |
| hasMore | boolean | 追加データの有無 |
| loadMore | () => Promise<void> | 追加データ読み込み関数 |
| refresh | () => Promise<void> | データ再取得関数 |

### useVersionDetail

**引数**: conversionId (string) - 変換ID

**戻り値**:

| プロパティ | 型 | 説明 |
|------------|-----|------|
| version | VersionHistoryItem または null | バージョン情報 |
| logs | ConversionLog[] | ログ一覧 |
| isLoading | boolean | ローディング中フラグ |
| error | Error または null | エラー情報 |

### useConversionLogs

**引数**: conversionId (string) - 変換ID

**戻り値**:

| プロパティ | 型 | 説明 |
|------------|-----|------|
| logs | ConversionLog[] | ログ一覧 |
| isLoading | boolean | ローディング中フラグ |
| error | Error または null | エラー情報 |
| hasMore | boolean | 追加データの有無 |
| loadMore | () => Promise<void> | 追加データ読み込み関数 |
| setFilter | (level: LogLevel または undefined) => void | フィルタ設定関数 |
| filter | LogLevel または undefined | 現在のフィルタ値 |

### useRestore

**引数**: なし

**戻り値**:

| プロパティ | 型 | 説明 |
|------------|-----|------|
| restore | (fileId: string, conversionId: string) => Promise<void> | 復元実行関数 |
| isLoading | boolean | 処理中フラグ |
| error | Error または null | エラー情報 |
| isSuccess | boolean | 成功フラグ |
| reset | () => void | 状態リセット関数 |

### 状態管理パターン

| パターン         | 説明                                   |
| ---------------- | -------------------------------------- |
| 状態コロケーション | フック内で状態を完結管理               |
| ローディング状態 | isLoading フラグで処理中を表現         |
| エラー状態       | error オブジェクトでエラー情報を保持   |
| ページネーション | hasMore/loadMore パターンで追加読み込み |

---

## 関連ドキュメント

- [履歴UIデータ型](./ui-history-data-types.md)
- [履歴UI設計](./ui-history-design.md)
- [履歴UI統合](./ui-history-integration.md)
