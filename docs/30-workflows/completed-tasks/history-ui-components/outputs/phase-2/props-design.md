# Props設計書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |
| Phase      | 2                             |

---

## 型定義（共通）

### VersionHistoryItem

```typescript
/**
 * バージョン履歴の1件分を表す型
 */
interface VersionHistoryItem {
  /** 変換ID（一意識別子） */
  conversionId: string;
  /** ファイルID */
  fileId: string;
  /** バージョン番号（1から連番） */
  version: number;
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** MIMEタイプ */
  mimeType: string;
  /** ファイルハッシュ（SHA-256） */
  hash: string;
  /** 最新バージョンかどうか */
  isLatest: boolean;
  /** メタデータ（JSON形式） */
  metadata?: Record<string, unknown>;
}
```

### ConversionLog

```typescript
/**
 * ログレベルの種別
 */
type LogLevel = "info" | "warn" | "error";

/**
 * 変換ログの1件分を表す型
 */
interface ConversionLog {
  /** ログID（一意識別子） */
  id: string;
  /** ファイルID */
  fileId: string;
  /** ログレベル */
  level: LogLevel;
  /** ログメッセージ */
  message: string;
  /** タイムスタンプ（ISO 8601形式） */
  timestamp: string;
  /** 詳細情報（JSON形式） */
  details?: Record<string, unknown>;
}
```

### PaginatedResult

```typescript
/**
 * ページネーション結果を表す汎用型
 */
interface PaginatedResult<T> {
  /** データ配列 */
  items: T[];
  /** 総件数 */
  total: number;
  /** 追加データがあるかどうか */
  hasMore: boolean;
}
```

---

## Organisms Props

### VersionHistory

履歴一覧パネルコンポーネント。

```typescript
interface VersionHistoryProps {
  /**
   * 対象ファイルID
   * @required
   */
  fileId: string;

  /**
   * バージョン選択時のコールバック
   * @param item - 選択されたバージョン
   */
  onVersionSelect?: (item: VersionHistoryItem) => void;

  /**
   * 復元ボタンクリック時のコールバック
   * @param item - 復元対象のバージョン
   */
  onRestore?: (item: VersionHistoryItem) => void;

  /**
   * カスタムクラス名
   */
  className?: string;
}
```

| Props             | 型                                   | 必須 | デフォルト | 説明                       |
| ----------------- | ------------------------------------ | ---- | ---------- | -------------------------- |
| `fileId`          | `string`                             | ✓    | -          | 対象ファイルID             |
| `onVersionSelect` | `(item: VersionHistoryItem) => void` |      | -          | バージョン選択コールバック |
| `onRestore`       | `(item: VersionHistoryItem) => void` |      | -          | 復元ボタンコールバック     |
| `className`       | `string`                             |      | -          | カスタムクラス名           |

**使用例:**

```tsx
<VersionHistory
  fileId="file-123"
  onVersionSelect={(item) => setSelectedVersion(item)}
  onRestore={(item) => openRestoreDialog(item)}
/>
```

---

### VersionDetail

バージョン詳細パネルコンポーネント。

```typescript
interface VersionDetailProps {
  /**
   * 対象変換ID
   * @required
   */
  conversionId: string;

  /**
   * 閉じるボタンクリック時のコールバック
   */
  onClose?: () => void;

  /**
   * 復元ボタンクリック時のコールバック
   */
  onRestore?: () => void;

  /**
   * 最新バージョンかどうか（復元ボタンの表示制御）
   */
  isLatest?: boolean;

  /**
   * カスタムクラス名
   */
  className?: string;
}
```

| Props          | 型           | 必須 | デフォルト | 説明                               |
| -------------- | ------------ | ---- | ---------- | ---------------------------------- |
| `conversionId` | `string`     | ✓    | -          | 対象変換ID                         |
| `onClose`      | `() => void` |      | -          | 閉じるコールバック                 |
| `onRestore`    | `() => void` |      | -          | 復元コールバック                   |
| `isLatest`     | `boolean`    |      | `false`    | 最新バージョンなら復元ボタン非表示 |
| `className`    | `string`     |      | -          | カスタムクラス名                   |

**使用例:**

```tsx
<VersionDetail
  conversionId="conv-456"
  onClose={() => setSelectedVersion(null)}
  onRestore={() => openRestoreDialog(selectedVersion)}
  isLatest={selectedVersion?.isLatest}
/>
```

---

### ConversionLogs

ログ一覧パネルコンポーネント。

```typescript
interface ConversionLogsProps {
  /**
   * 対象ファイルID（省略時は全ログ）
   */
  fileId?: string;

  /**
   * 初期フィルタレベル
   */
  initialLevelFilter?: LogLevel[];

  /**
   * 1回の取得件数
   */
  limit?: number;

  /**
   * カスタムクラス名
   */
  className?: string;
}
```

| Props                | 型           | 必須 | デフォルト                | 説明           |
| -------------------- | ------------ | ---- | ------------------------- | -------------- |
| `fileId`             | `string`     |      | -                         | 対象ファイルID |
| `initialLevelFilter` | `LogLevel[]` |      | `['info','warn','error']` | 初期フィルタ   |
| `limit`              | `number`     |      | `20`                      | 取得件数       |
| `className`          | `string`     |      | -                         | カスタムクラス |

**使用例:**

```tsx
<ConversionLogs
  fileId="file-123"
  initialLevelFilter={["warn", "error"]}
  limit={20}
/>
```

---

### RestoreDialog

復元確認ダイアログコンポーネント。

```typescript
interface RestoreDialogProps {
  /**
   * ダイアログの開閉状態
   * @required
   */
  isOpen: boolean;

  /**
   * 復元対象のバージョン情報
   * @required
   */
  version: VersionHistoryItem;

  /**
   * 復元確定時のコールバック
   * @required
   */
  onConfirm: () => void;

  /**
   * キャンセル時のコールバック
   * @required
   */
  onCancel: () => void;

  /**
   * 復元処理中かどうか
   */
  isRestoring?: boolean;
}
```

| Props         | 型                   | 必須 | デフォルト | 説明                   |
| ------------- | -------------------- | ---- | ---------- | ---------------------- |
| `isOpen`      | `boolean`            | ✓    | -          | 開閉状態               |
| `version`     | `VersionHistoryItem` | ✓    | -          | 復元対象バージョン     |
| `onConfirm`   | `() => void`         | ✓    | -          | 確定コールバック       |
| `onCancel`    | `() => void`         | ✓    | -          | キャンセルコールバック |
| `isRestoring` | `boolean`            |      | `false`    | 処理中フラグ           |

**使用例:**

```tsx
<RestoreDialog
  isOpen={isRestoreDialogOpen}
  version={selectedVersion}
  onConfirm={handleRestore}
  onCancel={() => setIsRestoreDialogOpen(false)}
  isRestoring={isRestoring}
/>
```

---

## Molecules Props

### VersionHistoryItem

履歴アイテム行コンポーネント。

```typescript
interface VersionHistoryItemProps {
  /**
   * バージョン情報
   * @required
   */
  item: VersionHistoryItem;

  /**
   * 選択状態かどうか
   */
  isSelected?: boolean;

  /**
   * クリック時のコールバック
   */
  onClick?: () => void;

  /**
   * 復元ボタンクリック時のコールバック
   */
  onRestore?: () => void;

  /**
   * カスタムクラス名
   */
  className?: string;
}
```

| Props        | 型                   | 必須 | デフォルト | 説明                 |
| ------------ | -------------------- | ---- | ---------- | -------------------- |
| `item`       | `VersionHistoryItem` | ✓    | -          | バージョン情報       |
| `isSelected` | `boolean`            |      | `false`    | 選択状態             |
| `onClick`    | `() => void`         |      | -          | クリックコールバック |
| `onRestore`  | `() => void`         |      | -          | 復元コールバック     |
| `className`  | `string`             |      | -          | カスタムクラス       |

**使用例:**

```tsx
<VersionHistoryItemComponent
  item={historyItem}
  isSelected={selectedVersion?.conversionId === historyItem.conversionId}
  onClick={() => onVersionSelect(historyItem)}
  onRestore={() => onRestore(historyItem)}
/>
```

---

### LogEntry

ログエントリ行コンポーネント。

```typescript
interface LogEntryProps {
  /**
   * ログ情報
   * @required
   */
  log: ConversionLog;

  /**
   * 展開状態かどうか
   */
  isExpanded?: boolean;

  /**
   * 展開/折りたたみトグル時のコールバック
   */
  onToggleExpand?: () => void;

  /**
   * カスタムクラス名
   */
  className?: string;
}
```

| Props            | 型              | 必須 | デフォルト | 説明                   |
| ---------------- | --------------- | ---- | ---------- | ---------------------- |
| `log`            | `ConversionLog` | ✓    | -          | ログ情報               |
| `isExpanded`     | `boolean`       |      | `false`    | 展開状態               |
| `onToggleExpand` | `() => void`    |      | -          | 展開トグルコールバック |
| `className`      | `string`        |      | -          | カスタムクラス         |

**使用例:**

```tsx
<LogEntry
  log={logEntry}
  isExpanded={expandedLogId === logEntry.id}
  onToggleExpand={() => toggleExpand(logEntry.id)}
/>
```

---

### LoadMoreButton

ページネーション用ボタンコンポーネント。

```typescript
interface LoadMoreButtonProps {
  /**
   * クリック時のコールバック
   * @required
   */
  onClick: () => void;

  /**
   * 読み込み中かどうか
   */
  isLoading?: boolean;

  /**
   * 非表示にするかどうか（hasMore=falseの場合）
   */
  hidden?: boolean;

  /**
   * ボタンラベル
   */
  label?: string;

  /**
   * カスタムクラス名
   */
  className?: string;
}
```

| Props       | 型           | 必須 | デフォルト         | 説明                 |
| ----------- | ------------ | ---- | ------------------ | -------------------- |
| `onClick`   | `() => void` | ✓    | -                  | クリックコールバック |
| `isLoading` | `boolean`    |      | `false`            | 読み込み中           |
| `hidden`    | `boolean`    |      | `false`            | 非表示フラグ         |
| `label`     | `string`     |      | `'さらに読み込む'` | ボタンラベル         |
| `className` | `string`     |      | -                  | カスタムクラス       |

**使用例:**

```tsx
<LoadMoreButton
  onClick={loadMore}
  isLoading={isLoadingMore}
  hidden={!hasMore}
/>
```

---

## アクセシビリティProps

### 共通ARIA属性

```typescript
interface AccessibleProps {
  /** アクセシブルな名前 */
  "aria-label"?: string;
  /** 詳細な説明の参照ID */
  "aria-describedby"?: string;
  /** ライブリージョン設定 */
  "aria-live"?: "polite" | "assertive" | "off";
}
```

### リスト要素

```typescript
interface ListAccessibleProps extends AccessibleProps {
  /** role="list" */
  role: "list";
}

interface ListItemAccessibleProps extends AccessibleProps {
  /** role="listitem" */
  role: "listitem";
  /** 選択状態 */
  "aria-selected"?: boolean;
}
```

### ダイアログ要素

```typescript
interface DialogAccessibleProps extends AccessibleProps {
  /** role="dialog" */
  role: "dialog";
  /** モーダルかどうか */
  "aria-modal": boolean;
  /** タイトル要素の参照ID */
  "aria-labelledby": string;
}
```

---

## Props検証ルール

### 必須Props検証

| コンポーネント     | 必須Props                                    |
| ------------------ | -------------------------------------------- |
| VersionHistory     | `fileId`                                     |
| VersionDetail      | `conversionId`                               |
| ConversionLogs     | なし                                         |
| RestoreDialog      | `isOpen`, `version`, `onConfirm`, `onCancel` |
| VersionHistoryItem | `item`                                       |
| LogEntry           | `log`                                        |
| LoadMoreButton     | `onClick`                                    |

### 型検証

```typescript
// 開発時の型検証（TypeScript）
// 実行時の検証は不要（TypeScriptで保証）
```

---

## 関連ドキュメント

| 資料名           | パス                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| アーキテクチャ   | `outputs/phase-2/architecture-design.md`                                    |
| データフロー     | `outputs/phase-2/data-flow.md`                                              |
| フック設計       | `outputs/phase-2/hooks-design.md`                                           |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-converter.md` |
