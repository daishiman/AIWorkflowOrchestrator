# 統合ガイド

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |

---

## 概要

本ドキュメントは、履歴/ログ表示UIコンポーネントをアプリケーションに
統合する手順を説明します。

---

## 前提条件

### 依存タスク

| タスクID   | 機能名           | 必要な成果物               |
| ---------- | ---------------- | -------------------------- |
| CONV-05-01 | 履歴データ永続化 | SQLiteスキーマ、リポジトリ |
| CONV-05-02 | 履歴取得サービス | HistoryService、IPC        |

### 必要な環境

- Electron メインプロセス
- preload スクリプト
- React レンダラープロセス

---

## 統合手順

### Step 1: ファイルの配置

コンポーネントとフックを適切なディレクトリに配置します。

```bash
# コンポーネント
apps/desktop/src/renderer/components/history/
├── VersionHistory.tsx
├── VersionDetail.tsx
├── ConversionLogs.tsx
├── RestoreDialog.tsx
├── types.ts
└── index.ts

# フック
apps/desktop/src/renderer/hooks/
├── useVersionHistory.ts
├── useVersionDetail.ts
├── useConversionLogs.ts
└── useRestore.ts
```

### Step 2: preloadスクリプトの設定

`preload.ts` でhistoryAPIを公開します。

```typescript
// apps/desktop/src/preload/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("historyAPI", {
  getFileHistory: (
    fileId: string,
    options: { limit: number; offset: number },
  ) => ipcRenderer.invoke("history:getFileHistory", fileId, options),

  getVersionDetail: (conversionId: string) =>
    ipcRenderer.invoke("history:getVersionDetail", conversionId),

  getConversionLogs: (
    conversionId: string,
    options: { limit: number; offset: number; level?: string },
  ) => ipcRenderer.invoke("history:getConversionLogs", conversionId, options),

  restoreVersion: (conversionId: string) =>
    ipcRenderer.invoke("history:restoreVersion", conversionId),
});
```

### Step 3: IPCハンドラーの登録

メインプロセスでIPCハンドラーを登録します。

```typescript
// apps/desktop/src/main/ipc/historyHandlers.ts
import { ipcMain } from "electron";
import { HistoryService } from "../services/HistoryService";

export function registerHistoryHandlers(historyService: HistoryService) {
  ipcMain.handle(
    "history:getFileHistory",
    async (_event, fileId: string, options) => {
      try {
        const result = await historyService.getFileHistory(fileId, options);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
  );

  ipcMain.handle(
    "history:getVersionDetail",
    async (_event, conversionId: string) => {
      try {
        const result = await historyService.getVersionDetail(conversionId);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
  );

  ipcMain.handle(
    "history:getConversionLogs",
    async (_event, conversionId: string, options) => {
      try {
        const result = await historyService.getConversionLogs(
          conversionId,
          options,
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
  );

  ipcMain.handle(
    "history:restoreVersion",
    async (_event, conversionId: string) => {
      try {
        await historyService.restoreVersion(conversionId);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
  );
}
```

### Step 4: 型定義の追加

グローバル型定義を追加します。

```typescript
// apps/desktop/src/renderer/types/global.d.ts
interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options: { limit: number; offset: number },
  ): Promise<APIResult<PaginatedResult<VersionHistoryItem>>>;

  getVersionDetail(
    conversionId: string,
  ): Promise<APIResult<{ version: VersionHistoryItem; logs: ConversionLog[] }>>;

  getConversionLogs(
    conversionId: string,
    options: { limit: number; offset: number; level?: string },
  ): Promise<APIResult<PaginatedResult<ConversionLog>>>;

  restoreVersion(conversionId: string): Promise<APIResult<void>>;
}

declare global {
  interface Window {
    historyAPI: HistoryAPI;
  }
}

export {};
```

### Step 5: コンポーネントの使用

アプリケーション内でコンポーネントを使用します。

```tsx
// apps/desktop/src/renderer/pages/HistoryPage.tsx
import { useState } from "react";
import {
  VersionHistory,
  VersionDetail,
  RestoreDialog,
} from "@/components/history";
import { useRestore } from "@/hooks/useRestore";

export function HistoryPage({ fileId }: { fileId: string }) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<VersionHistoryItem | null>(
    null,
  );
  const {
    restore,
    isLoading: isRestoring,
    error: restoreError,
    reset,
  } = useRestore();

  const handleSelectVersion = (conversionId: string) => {
    setSelectedVersion(conversionId);
  };

  const handleRestoreClick = (version: VersionHistoryItem) => {
    setRestoreTarget(version);
    setShowRestoreDialog(true);
  };

  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;
    try {
      await restore(restoreTarget.conversionId);
      setShowRestoreDialog(false);
      setRestoreTarget(null);
      // 成功通知
    } catch {
      // エラーはフック内で管理
    }
  };

  const handleCancelRestore = () => {
    setShowRestoreDialog(false);
    setRestoreTarget(null);
    reset();
  };

  return (
    <div className="flex h-full">
      {/* 履歴一覧 */}
      <div className="w-1/3 border-r">
        <VersionHistory fileId={fileId} onSelectVersion={handleSelectVersion} />
      </div>

      {/* 詳細パネル */}
      <div className="w-2/3">
        {selectedVersion ? (
          <VersionDetail
            conversionId={selectedVersion}
            onRestore={() => handleRestoreClick(/* version */)}
            onClose={() => setSelectedVersion(null)}
          />
        ) : (
          <div className="p-4 text-gray-500">バージョンを選択してください</div>
        )}
      </div>

      {/* 復元ダイアログ */}
      {restoreTarget && (
        <RestoreDialog
          isOpen={showRestoreDialog}
          version={restoreTarget}
          onConfirm={handleConfirmRestore}
          onCancel={handleCancelRestore}
          isLoading={isRestoring}
          error={restoreError}
        />
      )}
    </div>
  );
}
```

---

## 統合チェックリスト

### ファイル配置

- [ ] コンポーネントファイルを配置
- [ ] フックファイルを配置
- [ ] 型定義ファイルを配置

### preload設定

- [ ] historyAPIをcontextBridgeで公開
- [ ] IPCチャンネル名が一致していることを確認

### メインプロセス

- [ ] IPCハンドラーを登録
- [ ] HistoryServiceをインジェクト

### レンダラープロセス

- [ ] グローバル型定義を追加
- [ ] コンポーネントをインポートして使用

### 動作確認

- [ ] 履歴一覧が表示される
- [ ] 詳細が表示される
- [ ] ログが表示される
- [ ] フィルタが動作する
- [ ] ページネーションが動作する
- [ ] 復元ダイアログが表示される
- [ ] 復元処理が実行される

---

## トラブルシューティング

### historyAPIが undefined

**原因**: preloadスクリプトが正しく読み込まれていない

**解決策**:

1. BrowserWindow設定で `preload` パスを確認
2. `contextIsolation: true` を確認
3. `nodeIntegration: false` を確認

### IPCエラー

**原因**: チャンネル名の不一致またはハンドラー未登録

**解決策**:

1. preloadとmainのチャンネル名を照合
2. アプリ起動時にハンドラー登録を確認

### 型エラー

**原因**: グローバル型定義の不足

**解決策**:

1. `global.d.ts` を追加
2. tsconfig.json の include に追加

---

## 参考リンク

- [CONV-05-01: 履歴データ永続化](../../../conv-05-01/)
- [CONV-05-02: 履歴取得サービス](../../../conv-05-02/)
- [Electron IPC ドキュメント](https://www.electronjs.org/docs/latest/tutorial/ipc)
