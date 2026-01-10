# 履歴/ログ表示UIコンポーネント 実装ガイド

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |

---

## 概要

本ドキュメントは、履歴/ログ表示UIコンポーネントの実装詳細と使用方法を説明します。

### コンポーネント構成

```
components/history/
├── VersionHistory.tsx    # バージョン履歴一覧
├── VersionDetail.tsx     # バージョン詳細表示
├── ConversionLogs.tsx    # 変換ログ一覧
├── RestoreDialog.tsx     # 復元確認ダイアログ
├── types.ts              # 共有型定義
└── index.ts              # エクスポート
```

### フック構成

```
hooks/
├── useVersionHistory.ts    # 履歴一覧取得
├── useVersionDetail.ts     # 詳細取得
├── useConversionLogs.ts    # ログ取得
└── useRestore.ts           # 復元処理
```

---

## コンポーネント詳細

### VersionHistory

バージョン履歴の一覧を表示するコンポーネント。

#### 使用例

```tsx
import { VersionHistory } from "@/components/history";

function HistoryPage() {
  const handleSelectVersion = (conversionId: string) => {
    // バージョン選択時の処理
  };

  return (
    <VersionHistory fileId="file-123" onSelectVersion={handleSelectVersion} />
  );
}
```

#### Props

| Prop            | 型                             | 必須 | デフォルト | 説明                         |
| --------------- | ------------------------------ | ---- | ---------- | ---------------------------- |
| fileId          | string                         | ✅   | -          | 対象ファイルID               |
| onSelectVersion | (conversionId: string) => void | -    | -          | バージョン選択時コールバック |

#### 機能

- バージョン履歴の一覧表示
- 最新バージョンのバッジ表示
- ページネーション（追加読み込み）
- ローディング状態の表示
- エラーハンドリングと再試行

---

### VersionDetail

選択されたバージョンの詳細情報を表示するコンポーネント。

#### 使用例

```tsx
import { VersionDetail } from "@/components/history";

function DetailPanel({ conversionId }: { conversionId: string }) {
  const handleRestore = () => {
    // 復元ダイアログを表示
  };

  const handleClose = () => {
    // パネルを閉じる
  };

  return (
    <VersionDetail
      conversionId={conversionId}
      onRestore={handleRestore}
      onClose={handleClose}
    />
  );
}
```

#### Props

| Prop         | 型         | 必須 | デフォルト | 説明                   |
| ------------ | ---------- | ---- | ---------- | ---------------------- |
| conversionId | string     | ✅   | -          | 変換ID                 |
| onRestore    | () => void | -    | -          | 復元ボタンクリック時   |
| onClose      | () => void | -    | -          | 閉じるボタンクリック時 |

#### 機能

- バージョン詳細情報の表示
- 変換ログの表示
- 復元ボタン（最新バージョン時は無効）
- ローディング/エラー状態の表示

---

### ConversionLogs

変換ログの一覧を表示するコンポーネント。

#### 使用例

```tsx
import { ConversionLogs } from "@/components/history";

function LogViewer({ conversionId }: { conversionId: string }) {
  return <ConversionLogs conversionId={conversionId} />;
}
```

#### Props

| Prop         | 型     | 必須 | デフォルト | 説明   |
| ------------ | ------ | ---- | ---------- | ------ |
| conversionId | string | ✅   | -          | 変換ID |

#### 機能

- ログエントリの一覧表示
- ログレベルによるフィルタリング
- 詳細情報の展開/折りたたみ
- ページネーション

---

### RestoreDialog

バージョン復元の確認ダイアログ。

#### 使用例

```tsx
import { RestoreDialog } from "@/components/history";

function RestoreFeature() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetVersion, setTargetVersion] = useState(null);

  const handleConfirm = async () => {
    // 復元処理
    setIsOpen(false);
  };

  return (
    <RestoreDialog
      isOpen={isOpen}
      version={targetVersion}
      onConfirm={handleConfirm}
      onCancel={() => setIsOpen(false)}
    />
  );
}
```

#### Props

| Prop      | 型                 | 必須 | デフォルト | 説明                   |
| --------- | ------------------ | ---- | ---------- | ---------------------- |
| isOpen    | boolean            | ✅   | -          | ダイアログ表示状態     |
| version   | VersionHistoryItem | ✅   | -          | 復元対象バージョン情報 |
| onConfirm | () => void         | ✅   | -          | 確認ボタンクリック時   |
| onCancel  | () => void         | ✅   | -          | キャンセル時           |
| isLoading | boolean            | -    | false      | 復元処理中かどうか     |
| error     | Error \| null      | -    | null       | エラー情報             |

#### 機能

- モーダルダイアログ表示
- 復元確認メッセージ
- キーボード操作（Escapeで閉じる）
- フォーカストラップ

---

## 状態管理

### データフロー

```
window.historyAPI
       ↓
   Custom Hooks
       ↓
   Components (State)
       ↓
   UI Rendering
```

### 状態の種類

| 状態         | 管理場所          | 説明            |
| ------------ | ----------------- | --------------- |
| 履歴データ   | useVersionHistory | API取得データ   |
| 詳細データ   | useVersionDetail  | API取得データ   |
| ログデータ   | useConversionLogs | API取得データ   |
| ローディング | 各フック          | 非同期処理状態  |
| エラー       | 各フック          | エラー状態      |
| UI状態       | コンポーネント    | 展開/選択状態等 |

---

## エラーハンドリング

### エラー表示パターン

```tsx
// ErrorDisplayコンポーネントパターン
const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => (
  <div role="alert" className="bg-red-50 p-4 rounded">
    <p className="text-red-700">{error.message}</p>
    <button onClick={onRetry}>再試行</button>
  </div>
);
```

### エラー状態のフロー

1. API呼び出しでエラー発生
2. フックがエラー状態を設定
3. コンポーネントがエラー表示
4. ユーザーが再試行ボタンをクリック
5. フックが再フェッチを実行

---

## アクセシビリティ

### キーボード操作

| キー   | 動作                     |
| ------ | ------------------------ |
| Tab    | 次のフォーカス可能要素へ |
| Enter  | ボタンのクリック/選択    |
| Space  | ボタンのクリック/トグル  |
| Escape | ダイアログを閉じる       |

### ARIA属性

- `role="list"` / `role="listitem"` - リスト構造
- `role="dialog"` / `aria-modal` - ダイアログ
- `role="alert"` - エラーメッセージ
- `role="status"` - ローディング状態
- `aria-label` - ボタンの目的説明
- `aria-expanded` - 展開状態

---

## テスト

### テストファイル

```
__tests__/
├── VersionHistory.test.tsx
├── VersionDetail.test.tsx
├── ConversionLogs.test.tsx
└── RestoreDialog.test.tsx
```

### テスト実行

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのテスト
pnpm --filter @repo/desktop test VersionHistory

# カバレッジ付き
pnpm --filter @repo/desktop test --coverage
```

---

## 注意事項

1. **API依存**: `window.historyAPI` が必要
2. **Electron環境**: preloadスクリプトでAPIを公開
3. **非同期処理**: 全データ取得は非同期
4. **エラーハンドリング**: 必ず再試行UIを提供
