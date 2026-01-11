# 履歴/ログ表示UI仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
> 実装タスク: CONV-05-03

---

## 概要

本ドキュメントは、ファイル変換履歴とログを表示するUIコンポーネントの設計仕様を定義する。
バージョン管理、詳細確認、バージョン復元機能を提供する。

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

```
VersionHistory
├── VersionHistoryItem (Molecule)
│   ├── Badge (Atom) - 「現在」表示
│   └── Button (Atom) - 詳細表示・復元
├── LoadingSkeleton (Molecule)
├── ErrorDisplay (Molecule)
├── EmptyState (Molecule)
└── LoadMoreButton (Molecule)

VersionDetail
├── RestoreButton (Atom)
└── ConversionLogs
    ├── LogLevelFilter (Molecule)
    │   └── Select (Atom)
    ├── LogEntry (Molecule)
    │   └── Badge (Atom) - ログレベル表示
    └── LoadMoreButton (Molecule)

RestoreDialog
├── DialogHeader
├── VersionInfo
├── WarningText
└── ActionButtons (確認/キャンセル)
```

### Props定義

#### VersionHistoryProps

```typescript
interface VersionHistoryProps {
  /** ファイルID */
  fileId: string;
  /** アイテム選択時コールバック */
  onVersionSelect?: (item: VersionHistoryItem) => void;
  /** 復元ボタン押下時コールバック */
  onRestore?: (item: VersionHistoryItem) => void;
}
```

#### VersionDetailProps

```typescript
interface VersionDetailProps {
  /** 変換ID */
  conversionId: string;
  /** 復元ボタン押下時コールバック */
  onRestore?: () => void;
  /** 戻るボタン押下時コールバック */
  onBack?: () => void;
}
```

#### ConversionLogsProps

```typescript
interface ConversionLogsProps {
  /** 変換ID */
  conversionId: string;
  /** ログレベルフィルタ変更時コールバック */
  onFilterChange?: (level: LogLevel | undefined) => void;
}
```

#### RestoreDialogProps

```typescript
interface RestoreDialogProps {
  /** 表示フラグ */
  isOpen: boolean;
  /** バージョン情報 */
  version: VersionHistoryItem;
  /** 復元処理中フラグ */
  isLoading?: boolean;
  /** エラー情報 */
  error?: Error | null;
  /** 確認ボタン押下時コールバック */
  onConfirm: () => void;
  /** キャンセルボタン押下時コールバック */
  onCancel: () => void;
}
```

---

## カスタムフック

### フック一覧

| フック名          | 責務                     | 状態管理                           |
| ----------------- | ------------------------ | ---------------------------------- |
| useVersionHistory | バージョン履歴の取得     | history, isLoading, error, hasMore |
| useVersionDetail  | バージョン詳細の取得     | version, logs, isLoading, error    |
| useConversionLogs | 変換ログの取得・フィルタ | logs, isLoading, error, hasMore    |
| useRestore        | バージョン復元処理       | isLoading, error, isSuccess        |

### フック詳細

#### useVersionHistory

```typescript
interface UseVersionHistoryReturn {
  /** 履歴データ */
  history: VersionHistoryItem[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 追加データの有無 */
  hasMore: boolean;
  /** 追加データ読み込み */
  loadMore: () => Promise<void>;
  /** データ再取得 */
  refresh: () => Promise<void>;
}

function useVersionHistory(fileId: string): UseVersionHistoryReturn;
```

#### useVersionDetail

```typescript
interface UseVersionDetailReturn {
  /** バージョン情報 */
  version: VersionHistoryItem | null;
  /** ログ一覧 */
  logs: ConversionLog[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
}

function useVersionDetail(conversionId: string): UseVersionDetailReturn;
```

#### useConversionLogs

```typescript
interface UseConversionLogsReturn {
  /** ログ一覧 */
  logs: ConversionLog[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 追加データの有無 */
  hasMore: boolean;
  /** 追加データ読み込み */
  loadMore: () => Promise<void>;
  /** フィルタ設定 */
  setFilter: (level: LogLevel | undefined) => void;
  /** 現在のフィルタ */
  filter: LogLevel | undefined;
}

function useConversionLogs(conversionId: string): UseConversionLogsReturn;
```

#### useRestore

```typescript
interface UseRestoreReturn {
  /** 復元実行 */
  restore: (fileId: string, conversionId: string) => Promise<void>;
  /** 処理中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 成功フラグ */
  isSuccess: boolean;
  /** 状態リセット */
  reset: () => void;
}

function useRestore(): UseRestoreReturn;
```

### 状態管理パターン

| パターン         | 説明                                   |
| ---------------- | -------------------------------------- |
| 状態コロケーション | フック内で状態を完結管理               |
| ローディング状態 | isLoading フラグで処理中を表現         |
| エラー状態       | error オブジェクトでエラー情報を保持   |
| ページネーション | hasMore/loadMore パターンで追加読み込み |

---

## データ型

### VersionHistoryItem

```typescript
interface VersionHistoryItem {
  /** 変換ID */
  conversionId: string;
  /** ファイルID */
  fileId: string;
  /** バージョン番号 */
  version: number;
  /** 作成日時 (ISO 8601形式) */
  createdAt: string;
  /** ファイルサイズ (bytes) */
  size: number;
  /** MIMEタイプ */
  mimeType: string;
  /** コンテンツハッシュ */
  hash: string;
  /** 最新バージョンフラグ */
  isLatest: boolean;
  /** メタデータ (オプション) */
  metadata?: Record<string, unknown>;
}
```

### ConversionLog

```typescript
type LogLevel = "info" | "warn" | "error" | "debug";

interface ConversionLog {
  /** タイムスタンプ (ISO 8601形式) */
  timestamp: string;
  /** ログレベル */
  level: LogLevel;
  /** ログメッセージ */
  message: string;
  /** 詳細情報 (オプション) */
  details?: Record<string, unknown>;
}
```

### API結果型

```typescript
interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: Error;
}

type Result<T> = SuccessResult<T> | ErrorResult;

interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
```

---

## データフロー

### IPC通信

| チャンネル                  | 方向            | 用途               |
| --------------------------- | --------------- | ------------------ |
| `history:getFileHistory`    | Renderer → Main | 履歴一覧取得       |
| `history:getVersionDetail`  | Renderer → Main | バージョン詳細取得 |
| `history:getConversionLogs` | Renderer → Main | 変換ログ取得       |
| `history:restoreVersion`    | Renderer → Main | バージョン復元     |

### History API (window.historyAPI)

```typescript
interface HistoryAPI {
  /** 履歴一覧取得 */
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>>;

  /** バージョン詳細取得 */
  getVersionDetail(conversionId: string): Promise<Result<VersionDetailData>>;

  /** 変換ログ取得 */
  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<Result<PaginatedResult<ConversionLog>>>;

  /** バージョン復元 */
  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem>>;
}
```

---

## UI設計

### レイアウト

| パネル       | 配置     | サイズ         |
| ------------ | -------- | -------------- |
| 履歴一覧     | 左サイド | 幅1/3（柔軟）  |
| 詳細パネル   | メイン   | 幅2/3（柔軟）  |
| 復元ダイアログ | オーバーレイ | 中央配置    |

### 表示要素

| 要素             | 表示内容                        |
| ---------------- | ------------------------------- |
| バージョン番号   | v1, v2, v3...（新しい順）       |
| 作成日時         | YYYY/MM/DD HH:mm形式            |
| ファイルサイズ   | 人間可読形式（KB, MB）          |
| 現在バージョン   | 「現在」バッジで識別            |
| ログレベル       | info/warn/error/debugのバッジ   |

### ユーティリティ関数

```typescript
// 日時フォーマット
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ファイルサイズフォーマット
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

---

## アクセシビリティ

### WCAG 2.1 AA準拠

| 要件                 | 実装方針                              |
| -------------------- | ------------------------------------- |
| キーボードナビゲーション | Tab, Enter, Space, Escapeで全操作可能 |
| スクリーンリーダー   | 適切なrole/aria属性を設定             |
| フォーカス管理       | ダイアログ表示時はフォーカストラップ  |
| 色に頼らない情報     | アイコン+テキストで状態を表現         |

### ARIA属性

| コンポーネント | 属性                               |
| -------------- | ---------------------------------- |
| VersionHistory | role="list"                        |
| VersionHistoryItem | role="listitem", aria-label    |
| RestoreDialog  | role="dialog", aria-modal="true"   |
| ConversionLogs | role="list"                        |
| LogEntry       | role="listitem"                    |
| LoadingSkeleton | role="status", aria-label="読み込み中" |
| ErrorDisplay   | role="alert"                       |

### 実装例

```tsx
// ローディングスケルトン
<div role="status" aria-label="読み込み中" className="space-y-3">
  {[1, 2, 3].map((i) => (
    <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" aria-hidden="true" />
  ))}
  <span className="sr-only">読み込み中...</span>
</div>

// 履歴アイテム
<button
  type="button"
  onClick={() => onSelect?.(item)}
  className="..."
  aria-label={`バージョン ${item.version}${item.isLatest ? " (最新)" : ""}`}
>
```

---

## エラーハンドリング

### エラー種別

| エラー種別     | 表示メッセージ                     |
| -------------- | ---------------------------------- |
| NetworkError   | 「通信エラーが発生しました」       |
| NotFoundError  | 「データが見つかりません」         |
| RestoreError   | 「復元に失敗しました」             |
| DBError        | 「データベースエラーが発生しました」|
| API未利用可能  | 「History API not available」      |

### エラー表示パターン

| 状態           | 表示方法                        |
| -------------- | ------------------------------- |
| 初期取得失敗   | 全体エラーメッセージ+再試行ボタン |
| 追加読み込み失敗 | インラインエラー+再試行ボタン   |
| 復元失敗       | ダイアログ内エラー表示          |

### 実装例

```tsx
function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-4 text-center">
      <p className="mb-3 text-red-700">エラーが発生しました: {message}</p>
      <button type="button" onClick={onRetry} className="...">再試行</button>
    </div>
  );
}
```

---

## パフォーマンス

### 目標値

| 指標             | 目標   |
| ---------------- | ------ |
| 初期レンダリング | <100ms |
| リスト表示       | <200ms |
| 追加読み込み     | <100ms |
| フィルタ変更     | <150ms |

### 最適化戦略

| 戦略             | 適用場面                  |
| ---------------- | ------------------------- |
| ページネーション | 20件ずつ段階的読み込み    |
| メモ化           | useMemo/useCallbackで再計算防止 |
| 仮想スクロール   | 将来対応（大量データ時）  |

### ページネーション設定

```typescript
const DEFAULT_LIMIT = 20;

interface PaginationOptions {
  /** 取得件数 (デフォルト: 20) */
  limit?: number;
  /** オフセット (デフォルト: 0) */
  offset?: number;
}
```

---

## テストカバレッジ

### 達成済みカバレッジ

| カテゴリ | カバレッジ |
|----------|-----------|
| コンポーネント | 94.43% |
| フック | 94.43% |

### テストファイル

| ファイル | パス |
|----------|------|
| VersionHistory.test.tsx | apps/desktop/src/renderer/components/history/__tests__/ |
| VersionDetail.test.tsx | apps/desktop/src/renderer/components/history/__tests__/ |
| ConversionLogs.test.tsx | apps/desktop/src/renderer/components/history/__tests__/ |
| RestoreDialog.test.tsx | apps/desktop/src/renderer/components/history/__tests__/ |
| useVersionHistory.test.ts | apps/desktop/src/renderer/hooks/__tests__/ |
| useVersionDetail.test.ts | apps/desktop/src/renderer/hooks/__tests__/ |
| useConversionLogs.test.ts | apps/desktop/src/renderer/hooks/__tests__/ |
| useRestore.test.ts | apps/desktop/src/renderer/hooks/__tests__/ |

---

## 統合手順

### 前提条件

- CONV-05-01（履歴データ永続化）が完了していること
- CONV-05-02（履歴取得サービス）が完了していること

### 必要な統合作業

1. **preloadスクリプト更新**: `contextBridge.exposeInMainWorld`でhistoryAPI公開
2. **IPCハンドラー登録**: メインプロセスで4つのチャンネルを登録
3. **HistoryPage.tsx作成**: 履歴表示ページコンポーネント
4. **ルーティング設定**: 履歴ページへのルート追加

詳細は `docs/30-workflows/history-ui-integration/outputs/phase-12/implementation-guide.md` を参照。

---

## 統合ステータス

### 統合タスク: history-ui-integration

| 項目 | 内容 |
|------|------|
| タスクID | history-ui-integration |
| 統合日 | 2026-01-11 |
| ステータス | **完了**（HistoryServiceスタブ実装） |

### 実装済み項目

| カテゴリ | ファイル | ステータス |
|----------|----------|-----------|
| IPC チャンネル | `apps/desktop/src/preload/channels.ts` | 完了 |
| preload API | `apps/desktop/src/preload/index.ts` | 完了 |
| IPC ハンドラー | `apps/desktop/src/main/ipc/historyHandlers.ts` | 完了 |
| ページコンポーネント | `apps/desktop/src/renderer/pages/HistoryPage.tsx` | 完了 |
| ルーティング | `apps/desktop/src/renderer/App.tsx` | 完了 |
| サービス | `apps/desktop/src/main/services/HistoryService.ts` | スタブ実装 |

### テスト結果

| テストファイル | テスト数 | ステータス |
|---------------|----------|-----------|
| historyHandlers.test.ts | 22 | PASS |
| HistoryPage.test.tsx | 18 | PASS |
| RestoreDialog.test.tsx | 12 | PASS |
| **合計** | **52** | **全テスト成功** |

### 残課題

| 課題 | 依存関係 | 優先度 |
|------|----------|--------|
| HistoryService実DBに統合 | CONV-05-02 | 高 |
| validateDOMNesting警告修正 | CONV-05-03 | 低 |

詳細: `docs/30-workflows/unassigned-task/task-history-service-db-integration.md`

---

## 関連ドキュメント

| ドキュメント     | パス                              |
| ---------------- | --------------------------------- |
| コンポーネント設計 | ui-ux-components.md             |
| パネルUI設計     | ui-ux-panels.md                   |
| デザインシステム | ui-ux-design-system.md            |
| アクセシビリティ | ui-ux-advanced.md                 |
| ファイル変換アーキテクチャ | architecture-file-conversion.md |
| 統合実装ガイド | docs/30-workflows/history-ui-integration/outputs/phase-12/implementation-guide.md |
| 未タスク指示書 | docs/30-workflows/unassigned-task/task-history-service-db-integration.md |

---

## 変更履歴

| Version | Date       | Changes                      |
| ------- | ---------- | ---------------------------- |
| 1.2.0   | 2026-01-11 | 統合ステータスセクション追加（history-ui-integration完了） |
| 1.1.0   | 2026-01-10 | 実装詳細・型定義・テスト情報を追加 |
| 1.0.0   | 2026-01-10 | CONV-05-03で初版作成         |
