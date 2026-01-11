# コンポーネント設計書 - HistoryPage

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| 作成日     | 2026-01-11 |
| Phase      | 2          |
| ステータス | 完了       |

---

## 1. HistoryPage設計

### 1.1 コンポーネント概要

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 名前   | HistoryPage                                  |
| 配置先 | apps/desktop/src/renderer/pages/             |
| 責務   | 履歴画面のレイアウトと状態管理               |
| 依存   | VersionHistory, VersionDetail, RestoreDialog |

### 1.2 レイアウト設計

```
┌─────────────────────────────────────────────────────────────┐
│                        HistoryPage                          │
│  ┌─────────────────────┬───────────────────────────────────┐│
│  │                     │                                   ││
│  │   VersionHistory    │         VersionDetail             ││
│  │   (履歴一覧)        │         (詳細パネル)              ││
│  │   width: 1/3        │         width: 2/3                ││
│  │                     │                                   ││
│  │   [v3 (現在)]       │   conversionId: xxx               ││
│  │   [v2] [復元]       │   version: 2                      ││
│  │   [v1] [復元]       │   createdAt: 2026-01-11           ││
│  │                     │   size: 1.2 MB                    ││
│  │   [さらに読み込む]  │                                   ││
│  │                     │   ┌─────────────────────────────┐ ││
│  │                     │   │     ConversionLogs          │ ││
│  │                     │   │     (変換ログ)              │ ││
│  │                     │   │     [フィルタ: すべて ▼]     │ ││
│  │                     │   │     [INFO] 変換開始...      │ ││
│  │                     │   │     [WARN] メタデータ欠落   │ ││
│  │                     │   └─────────────────────────────┘ ││
│  │                     │                                   ││
│  │                     │   [このバージョンに復元]          ││
│  │                     │                                   ││
│  └─────────────────────┴───────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

※ RestoreDialogはモーダルオーバーレイとして表示
```

### 1.3 状態管理設計

```typescript
// HistoryPage.tsx

interface HistoryPageState {
  // 選択中のバージョン（詳細表示用）
  selectedVersion: VersionHistoryItem | null;

  // 復元対象バージョン（ダイアログ表示用）
  restoreTarget: VersionHistoryItem | null;
}

// useRestore フックから取得
interface RestoreState {
  restore: (fileId: string, conversionId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}
```

### 1.4 Props設計

```typescript
// 現状はPropsなし（将来的にfileIdをpropsで受け取る可能性あり）
export interface HistoryPageProps {
  // 現在はなし
}
```

### 1.5 イベントハンドラ設計

| ハンドラ名           | トリガー                   | 処理内容                              |
| -------------------- | -------------------------- | ------------------------------------- |
| handleVersionSelect  | 履歴アイテムクリック       | selectedVersionを更新                 |
| handleRestoreClick   | 復元ボタンクリック         | restoreTargetを設定                   |
| handleRestoreConfirm | 確認ダイアログの確認       | restore()実行、成功後ダイアログ閉じる |
| handleRestoreCancel  | 確認ダイアログのキャンセル | restoreTarget=null, reset()           |

---

## 2. 既存コンポーネント連携

### 2.1 VersionHistory

```typescript
import { VersionHistory } from '../components/history/VersionHistory';

<VersionHistory
  fileId={fileId}
  onVersionSelect={handleVersionSelect}
  onRestore={handleRestoreClick}
/>
```

### 2.2 VersionDetail

```typescript
import { VersionDetail } from '../components/history/VersionDetail';

{selectedVersion && (
  <VersionDetail
    conversionId={selectedVersion.conversionId}
    onRestore={() => handleRestoreClick(selectedVersion)}
    onBack={() => setSelectedVersion(null)}
  />
)}
```

### 2.3 RestoreDialog

```typescript
import { RestoreDialog } from '../components/history/RestoreDialog';

{restoreTarget && (
  <RestoreDialog
    isOpen={!!restoreTarget}
    version={restoreTarget}
    isLoading={isLoading}
    error={error}
    onConfirm={handleRestoreConfirm}
    onCancel={handleRestoreCancel}
  />
)}
```

---

## 3. ルーティング設計

### 3.1 ルート定義

| パス             | コンポーネント | 用途                     |
| ---------------- | -------------- | ------------------------ |
| /history         | HistoryPage    | 履歴画面（fileId未指定） |
| /history/:fileId | HistoryPage    | 履歴画面（fileId指定）   |

### 3.2 App.tsx変更

```typescript
// apps/desktop/src/renderer/App.tsx への追加

import { HistoryPage } from './pages/HistoryPage';

// Routes内に追加
<Route
  path="/history/:fileId?"
  element={
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <HistoryPage />
    </div>
  }
/>
```

### 3.3 ナビゲーション

| 遷移元        | 遷移先           | 方法                      |
| ------------- | ---------------- | ------------------------- |
| DashboardView | /history/:fileId | ファイルの履歴ボタン      |
| EditorView    | /history/:fileId | ファイルメニュー→履歴表示 |
| HistoryPage   | 戻る             | ブラウザバック or onBack  |

---

## 4. 実装コード設計

### 4.1 HistoryPage.tsx

```typescript
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { VersionHistory } from '../components/history/VersionHistory';
import { VersionDetail } from '../components/history/VersionDetail';
import { RestoreDialog } from '../components/history/RestoreDialog';
import { useRestore } from '../hooks/useRestore';
import type { VersionHistoryItem } from '../components/history/types';

export function HistoryPage(): JSX.Element {
  // URLパラメータからfileIdを取得
  const { fileId: paramFileId } = useParams<{ fileId?: string }>();
  const fileId = paramFileId || 'default-file-id'; // フォールバック

  // 状態管理
  const [selectedVersion, setSelectedVersion] = useState<VersionHistoryItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<VersionHistoryItem | null>(null);

  // 復元フック
  const { restore, isLoading, error, isSuccess, reset } = useRestore();

  // バージョン選択ハンドラ
  const handleVersionSelect = useCallback((item: VersionHistoryItem) => {
    setSelectedVersion(item);
  }, []);

  // 復元ボタンクリックハンドラ
  const handleRestoreClick = useCallback((item: VersionHistoryItem) => {
    setRestoreTarget(item);
  }, []);

  // 復元確認ハンドラ
  const handleRestoreConfirm = useCallback(async () => {
    if (!restoreTarget) return;

    await restore(restoreTarget.fileId, restoreTarget.conversionId);

    if (isSuccess) {
      setRestoreTarget(null);
      setSelectedVersion(null); // 詳細パネルも閉じる
    }
  }, [restoreTarget, restore, isSuccess]);

  // 復元キャンセルハンドラ
  const handleRestoreCancel = useCallback(() => {
    setRestoreTarget(null);
    reset();
  }, [reset]);

  return (
    <div className="flex h-full">
      {/* 履歴一覧 (左側 1/3) */}
      <div className="w-1/3 border-r border-gray-200 overflow-auto">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">バージョン履歴</h1>
          <VersionHistory
            fileId={fileId}
            onVersionSelect={handleVersionSelect}
            onRestore={handleRestoreClick}
          />
        </div>
      </div>

      {/* 詳細パネル (右側 2/3) */}
      <div className="w-2/3 overflow-auto">
        {selectedVersion ? (
          <VersionDetail
            conversionId={selectedVersion.conversionId}
            onRestore={() => handleRestoreClick(selectedVersion)}
            onBack={() => setSelectedVersion(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>バージョンを選択してください</p>
          </div>
        )}
      </div>

      {/* 復元確認ダイアログ */}
      {restoreTarget && (
        <RestoreDialog
          isOpen={!!restoreTarget}
          version={restoreTarget}
          isLoading={isLoading}
          error={error}
          onConfirm={handleRestoreConfirm}
          onCancel={handleRestoreCancel}
        />
      )}
    </div>
  );
}
```

---

## 5. アクセシビリティ設計

### 5.1 キーボードナビゲーション

| キー   | コンテキスト  | アクション       |
| ------ | ------------- | ---------------- |
| Tab    | 画面全体      | フォーカス移動   |
| Enter  | 履歴アイテム  | 詳細表示         |
| Space  | 履歴アイテム  | 詳細表示         |
| Escape | RestoreDialog | ダイアログ閉じる |

### 5.2 スクリーンリーダー対応

| 要素          | ARIA属性                                 |
| ------------- | ---------------------------------------- |
| 履歴一覧      | role="list", aria-label="バージョン履歴" |
| 履歴アイテム  | role="listitem"                          |
| RestoreDialog | role="dialog", aria-modal="true"         |
| エラー表示    | role="alert"                             |

---

## 確認結果

- [x] HistoryPageのレイアウトが定義されている
- [x] 状態管理が設計されている
- [x] 既存コンポーネントとの連携が設計されている
- [x] ルーティングが設計されている
- [x] アクセシビリティが考慮されている
- [x] 実装コードが設計されている

---

## 変更履歴

| Version | Date       | Changes       |
| ------- | ---------- | ------------- |
| 1.0.0   | 2026-01-11 | Phase 2で作成 |
